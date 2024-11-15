import React, { useState, useRef } from 'react';
import { fetchNFTMetadata } from '../utils/api';
import { collections, specialMutantApeTokens } from '../utils/constants';
import { colorDistance } from '../utils/helpers';
import CanvasPreview from '../components/CanvasPreview';
import Loader from '../components/Loader';

function NFTGenerator() {
  const [nftID, setNftID] = useState('');
  const [collection, setCollection] = useState('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'); // Default to Bored Ape
  const [metadata, setMetadata] = useState(null);
  const [backgroundOption, setBackgroundOption] = useState('original');
  const [loading, setLoading] = useState(false);
  const twitterCanvasRef = useRef(null);
  const mobileCanvasRef = useRef(null);

  const handleGenerate = async () => {
    if (!collection || !nftID) {
      alert('Please select a collection and enter an NFT ID.');
      return;
    }

    setLoading(true);
    try {
      const data = await fetchNFTMetadata(collection, nftID);
      setMetadata(data);
      generateImage(data);
    } catch (error) {
      console.error('Error fetching metadata:', error);
      alert('Failed to fetch metadata. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateImage = (data) => {
    const twitterCanvas = twitterCanvasRef.current;
    const mobileCanvas = mobileCanvasRef.current;
    const twitterCtx = twitterCanvas.getContext('2d');
    const mobileCtx = mobileCanvas.getContext('2d');

    if (!data || !data.metadata?.image) {
      alert('No metadata or image available. Fetch metadata first!');
      return;
    }

    const imageURL =
      collection === '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'
        ? `https://ipfs.io/ipfs/QmQ6VgRFiVTdKbiebxGvhW3Wa3Lkhpe6SkWBPjGnPkTttS/${nftID}.png`
        : data.metadata.image.startsWith('ipfs://')
        ? data.metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')
        : data.metadata.image;

    const nftImage = new Image();
    nftImage.src = imageURL;
    nftImage.crossOrigin = 'Anonymous';

    nftImage.onload = () => {
      const offscreenCanvas = document.createElement('canvas');
      const offscreenCtx = offscreenCanvas.getContext('2d');
      offscreenCanvas.width = nftImage.width;
      offscreenCanvas.height = nftImage.height;

      offscreenCtx.drawImage(nftImage, 0, 0);

      // Process the NFT image and draw on canvases
      const drawOnCanvas = (canvas, ctx, width, height, fitToWidth, isTwitterCanvas = false) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const selectedBgColor = '#FFFFFF'; // Default background color for example

        ctx.fillStyle = selectedBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const logo = new Image();
        logo.src = '/apechain-logo-black.svg';
        logo.onload = () => {
          const logoWidth = isTwitterCanvas ? 800 : 300;
          const logoHeight = (294 / 859) * logoWidth;
          ctx.drawImage(logo, (width - logoWidth) / 2, (height - logoHeight) / 2, logoWidth, logoHeight);

          if (fitToWidth) {
            const scaleFactor = width / nftImage.width;
            const scaledWidth = width;
            const scaledHeight = nftImage.height * scaleFactor;
            ctx.drawImage(offscreenCanvas, 0, height - scaledHeight, scaledWidth, scaledHeight);
          } else {
            const scaleFactor = height / nftImage.height;
            const scaledWidth = nftImage.width * scaleFactor;
            const scaledHeight = height;
            ctx.drawImage(offscreenCanvas, width - scaledWidth, 0, scaledWidth, scaledHeight);
          }
        };
      };

      drawOnCanvas(twitterCanvas, twitterCtx, 1500, 500, false, true);
      drawOnCanvas(mobileCanvas, mobileCtx, 430, 932, true, false);
    };
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
        <CanvasPreview title="Twitter Banner Original" ref={twitterCanvasRef} width={1500} height={500} />
        <CanvasPreview title="Mobile Original" ref={mobileCanvasRef} width={430} height={932} />
      </div>

      <a
        href="https://www.x.com/iamsheftali"
        target="_blank"
        rel="noopener noreferrer"
        style={{ marginTop: '20px', display: 'block', textAlign: 'center' }}
      >
        Follow me on X
      </a>

      <style jsx>{`
        .canvas-container { display: flex; flex-direction: column; align-items: center; gap: 20px; margin-top: 20px; }
        .responsive-canvas { width: 100%; max-width: 500px; height: auto; border: 1px solid #000; }
      `}</style>
    </div>
  );
}

export default NFTGenerator;