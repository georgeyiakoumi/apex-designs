/* eslint-disable no-unused-vars */

/* eslint-disable no-unused-vars */

import React, { useState, useRef } from 'react';
import CanvasPreview from '../components/CanvasPreview';
import Loader from '../components/Loader';

function NFTGenerator() {
  const [nftID, setNftID] = useState('');
  const [collection, setCollection] = useState('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'); // Default to BAYC
  const [loading, setLoading] = useState(false);
  const [backgroundOption, setBackgroundOption] = useState('original'); // Default background option
  const [metadata, setMetadata] = useState(null);
  const twitterCanvasRef = useRef([]);
  const mobileCanvasRef = useRef([]);

  const backgroundOptions = ['original', 'white', 'black', 'apechain'];

  const handleGenerate = async () => {
    if (!nftID || !collection) {
      alert('Please enter an NFT ID and select a collection.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/fetchNFTMetadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection, nftID }),
      });
      const data = await response.json();

      if (response.ok) {
        setMetadata(data);
        generateImages(data);
      } else {
        alert('Failed to fetch metadata. Check the NFT ID or collection address.');
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
      alert('An error occurred while fetching metadata.');
    } finally {
      setLoading(false);
    }
  };

  const generateImages = (data) => {
    const imageURL = data.metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
    const nftImage = new Image();
    nftImage.src = imageURL;
    nftImage.crossOrigin = 'Anonymous';

    nftImage.onload = () => {
      backgroundOptions.forEach((option, index) => {
        const twitterCtx = twitterCanvasRef.current[index].getContext('2d');
        const mobileCtx = mobileCanvasRef.current[index].getContext('2d');

        // Background and logo configurations based on selected option
        let selectedBgColor = '#FFFFFF';
        let logoSrc = '/apechain-logo-black.svg';

        if (option === 'white') {
          selectedBgColor = '#FFFFFF';
          logoSrc = '/apechain-logo-black.svg';
        } else if (option === 'black') {
          selectedBgColor = '#000000';
          logoSrc = '/apechain-logo-white.svg';
        } else if (option === 'apechain') {
          selectedBgColor = '#0054FA';
          logoSrc = '/apechain-logo-white.svg';
        } else if (option === 'original') {
          selectedBgColor = '#EDE9E6'; // Fallback for original background
          const backgroundAttribute = data.metadata.attributes.find(attr => attr.trait_type === 'Background');
          if (backgroundAttribute) {
            selectedBgColor = backgroundAttribute.value;
          }
        }

        const drawCanvas = (ctx, width, height) => {
          ctx.clearRect(0, 0, width, height);
          ctx.fillStyle = selectedBgColor;
          ctx.fillRect(0, 0, width, height);

          const logo = new Image();
          logo.src = logoSrc;
          logo.onload = () => {
            const logoWidth = 200;
            const logoHeight = 200;
            ctx.drawImage(logo, (width - logoWidth) / 2, 20, logoWidth, logoHeight);

            const scaleFactor = width / nftImage.width;
            const scaledWidth = nftImage.width * scaleFactor;
            const scaledHeight = nftImage.height * scaleFactor;
            ctx.drawImage(nftImage, (width - scaledWidth) / 2, height - scaledHeight, scaledWidth, scaledHeight);
          };
        };

        drawCanvas(twitterCtx, 1500, 500);
        drawCanvas(mobileCtx, 430, 932);
      });
    };
  };

  const downloadCanvas = (canvas, filename) => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = filename;
    link.click();
  };

  return (
    <div>
      <h1>NFT Generator</h1>
      <select value={collection} onChange={(e) => setCollection(e.target.value)}>
        <option value="0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D">Bored Ape Yacht Club</option>
        <option value="0x60E4d786628Fea6478F785A6d7e704777c86a7c6">Mutant Ape Yacht Club</option>
      </select>
      <input
        type="text"
        value={nftID}
        onChange={(e) => setNftID(e.target.value)}
        placeholder="Enter NFT ID"
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate'}
      </button>
      {loading && <Loader />}
      <div className="canvas-container">
        {backgroundOptions.map((option, index) => (
          <div key={option} className="canvas-wrapper">
            <CanvasPreview
              ref={(el) => {
                twitterCanvasRef.current[index] = el;
                mobileCanvasRef.current[index] = el;
              }}
              title={`Twitter (${option})`}
              width={1500}
              height={500}
            />
            <button
              onClick={() =>
                downloadCanvas(twitterCanvasRef.current[index], `twitter-${option}.png`)
              }
            >
              Download Twitter ({option})
            </button>
            <CanvasPreview
              ref={(el) => {
                twitterCanvasRef.current[index] = el;
                mobileCanvasRef.current[index] = el;
              }}
              title={`Mobile (${option})`}
              width={430}
              height={932}
            />
            <button
              onClick={() =>
                downloadCanvas(mobileCanvasRef.current[index], `mobile-${option}.png`)
              }
            >
              Download Mobile ({option})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NFTGenerator;