/* eslint-disable no-unused-vars */
import React, { useState, useRef } from 'react';
import { fetchNFTMetadata } from '../utils/api';
import { collections, specialMutantApeTokens } from '../utils/constants';
import { colorDistance } from '../utils/helpers';
import Loader from '../components/Loader';

function NFTGenerator() {
  const [nftID, setNftID] = useState('');
  const [collection, setCollection] = useState(collections[0].address); // Default to first collection
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const twitterCanvasRefs = useRef({});
  const mobileCanvasRefs = useRef({});

  const backgroundOptions = [
    { name: "Original", value: "original" },
    { name: "White", value: "white", color: "#FFFFFF", logo: "/apechain-logo-black.svg" },
    { name: "Black", value: "black", color: "#000000", logo: "/apechain-logo-white.svg" },
    { name: "ApeChain Blue", value: "apechain", color: "#0054FA", logo: "/apechain-logo-white.svg" },
  ];

  const handleGenerate = async () => {
    if (!collection || !nftID) {
      alert("Please select a collection and enter an NFT ID.");
      return;
    }

    setLoading(true);
    try {
      const data = await fetchNFTMetadata(collection, nftID);
      setMetadata(data);
      backgroundOptions.forEach((option) => generateImage(data, option));
    } catch (error) {
      console.error('Error fetching metadata:', error);
      alert('Failed to fetch metadata. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateImage = (data, option) => {
    const twitterCanvas = twitterCanvasRefs.current[option.value];
    const mobileCanvas = mobileCanvasRefs.current[option.value];
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

    let selectedBgColor = option.color || '#FFFFFF'; // Default background color
    let logoSrc = option.logo || '/apechain-logo-black.svg';

    const nftImage = new Image();
    nftImage.src = imageURL;
    nftImage.crossOrigin = 'Anonymous';

    nftImage.onload = () => {
      const offscreenCanvas = document.createElement('canvas');
      const offscreenCtx = offscreenCanvas.getContext('2d');
      offscreenCanvas.width = nftImage.width;
      offscreenCanvas.height = nftImage.height;

      offscreenCtx.drawImage(nftImage, 0, 0);

      if (option.value === 'original') {
        const topMiddleColor = offscreenCtx.getImageData(nftImage.width / 2, 0, 1, 1).data;
        selectedBgColor = `#${((1 << 24) + (topMiddleColor[0] << 16) + (topMiddleColor[1] << 8) + topMiddleColor[2]).toString(16).slice(1)}`;
        const backgroundName = data.metadata.attributes.find(attr => attr.trait_type === 'Background')?.value;
        const useWhiteLogo = [
          'Purple', 'M1 Purple', 'M2 Purple', 'Army Green', 'New Punk Blue', 'M1 New Punk Blue', 'M2 New Punk Blue'
        ].includes(backgroundName);
        logoSrc = useWhiteLogo ? '/apechain-logo-white.svg' : '/apechain-logo-black.svg';
      }

      const [r, g, b] = offscreenCtx.getImageData(nftImage.width / 2, 0, 1, 1).data;
      const tolerance = (collection === '0x60E4d786628Fea6478F785A6d7e704777c86a7c6' && specialMutantApeTokens.includes(nftID))
        ? 80
        : 50;

      const imageData = offscreenCtx.getImageData(0, 0, nftImage.width, nftImage.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const pixelR = imageData.data[i];
        const pixelG = imageData.data[i + 1];
        const pixelB = imageData.data[i + 2];
        if (colorDistance(r, g, b, pixelR, pixelG, pixelB) < tolerance) {
          imageData.data[i + 3] = 0;
        }
      }
      offscreenCtx.putImageData(imageData, 0, 0);

      const drawOnCanvas = (canvas, ctx, width, height, fitToWidth, isTwitterCanvas = false) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (specialMutantApeTokens.includes(nftID) && option.value === 'original') {
          const gradient = ctx.createRadialGradient(width / 2, height / 2, width / 4, width / 2, height / 2, width / 2);
          gradient.addColorStop(0, '#a9fd01');
          gradient.addColorStop(1, '#7ad100');
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = selectedBgColor;
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const logo = new Image();
        logo.src = logoSrc;
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
        {collections.map((col) => (
          <option key={col.address} value={col.address}>
            {col.name}
          </option>
        ))}
      </select>

      <input type="text" value={nftID} onChange={(e) => setNftID(e.target.value)} placeholder="Enter NFT ID" />

      <button onClick={handleGenerate} disabled={loading}>{loading ? 'Generating...' : 'Generate'}</button>
      {loading && <Loader />}

      <div className="canvas-container">
        {backgroundOptions.map((option) => (
          <div key={option.value}>
            <h3>Twitter Banner ({option.name})</h3>
            <canvas
              ref={(el) => (twitterCanvasRefs.current[option.value] = el)}
              width={1500}
              height={500}
              className="responsive-canvas"
            ></canvas>
            <a
              href="#"
              download={`twitter-${option.value}.png`}
              onClick={(e) => {
                e.target.href = twitterCanvasRefs.current[option.value].toDataURL();
              }}
            >
              Download
            </a>
            <h3>Mobile ({option.name})</h3>
            <canvas
              ref={(el) => (mobileCanvasRefs.current[option.value] = el)}
              width={430}
              height={932}
              className="responsive-canvas"
            ></canvas>
            <a
              href="#"
              download={`mobile-${option.value}.png`}
              onClick={(e) => {
                e.target.href = mobileCanvasRefs.current[option.value].toDataURL();
              }}
            >
              Download
            </a>
          </div>
        ))}
      </div>

      <style jsx>{`
        .canvas-container { display: flex; flex-direction: column; align-items: center; gap: 20px; margin-top: 20px; }
        .responsive-canvas { width: 100%; max-width: 500px; height: auto; border: 1px solid #000; }
      `}</style>
    </div>
  );
}

export default NFTGenerator;