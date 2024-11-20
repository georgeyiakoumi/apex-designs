import React, { useState, useRef } from 'react';
import { collections, specialMutantApeTokens } from '../utils/constants.js';
import { colorDistance } from '../utils/helpers.js';
import CanvasPreview from '../components/CanvasPreview.js';
import Loader from '../components/Loader.js';

function NFTGenerator() {
  const [nftID, setNftID] = useState('');
  const [collection, setCollection] = useState(collections[0].address); // Default to Bored Ape Yacht Club
  const [metadata, setMetadata] = useState(null); // eslint-disable-line no-unused-vars
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); // Track button state
  const canvasRefs = useRef({
    twitterOriginal: null,
    twitterWhite: null,
    twitterBlack: null,
    twitterApeChain: null,
    mobileOriginal: null,
    mobileWhite: null,
    mobileBlack: null,
    mobileApeChain: null,
  });
  const backgroundOptions = [
    { name: 'original', color: null, logo: null },
    { name: 'white', color: '#FFFFFF', logo: '/apechain-logo-black.svg' },
    { name: 'black', color: '#000000', logo: '/apechain-logo-white.svg' },
    { name: 'apechain', color: '#0054FA', logo: '/apechain-logo-white.svg' },
  ];

  const handleGenerate = async () => {
    if (!collection || !nftID) {
      alert('Please select a collection and enter an NFT ID.');
      return;
    }
  
    setLoading(true);
    setIsButtonDisabled(true); // Disable button after generating
  
    try {
      if (collection === '0xEdB61f74B0d09B2558F1eeb79B247c1F363Ae452') {
        // Gutter Cat Gang logic: Call fetchGutterCatImage function
        console.log('Gutter Cat Gang collection detected. Calling fetchGutterCatImage.');
        
        const response = await fetch(`/.netlify/functions/fetchGutterCatImage?nftID=${nftID}`, {
          method: 'GET',
        });
  
        console.log('Received response from fetchGutterCatImage:', response);
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Backend error response (fetchGutterCatImage):', errorData);
          throw new Error(errorData.error || 'Unknown error');
        }
  
        const base64Image = await response.text();
        console.log('Successfully fetched Gutter Cat Gang image.');
  
        // Create a mock metadata object to pass to generateImages
        const gutterMetadata = {
          metadata: {
            image: `data:image/png;base64,${base64Image}`, // Use base64 image
            attributes: [{ trait_type: 'Background', value: null }], // No background info for Gutter Cat Gang
          },
        };
  
        generateImages(gutterMetadata);
      } else {
        // Other collections: Call fetchNFTMetadata function
        console.log('Sending to backend fetchNFTMetadata:', { collection, nftID });
  
        const response = await fetch('/.netlify/functions/fetchNFTMetadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collection, nftID }),
        });
  
        console.log('Received response from fetchNFTMetadata:', response);
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Backend error response (fetchNFTMetadata):', errorData);
          throw new Error(errorData.error || 'Unknown error');
        }
  
        const data = await response.json();
        console.log('Successfully fetched metadata (fetchNFTMetadata):', data);
  
        setMetadata(data);
        generateImages(data);
      }
    } catch (error) {
      console.error('Error in handleGenerate:', error);
      alert('Failed to fetch metadata or image. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  

  const generateImages = (data) => {
    const imageURL = collection === '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'
      ? `https://ipfs.io/ipfs/QmQ6VgRFiVTdKbiebxGvhW3Wa3Lkhpe6SkWBPjGnPkTttS/${nftID}.png`
      : collection === '0xEdB61f74B0d09B2558F1eeb79B247c1F363Ae452'
        ? `https://gutter-cats-metadata.s3.us-east-2.amazonaws.com/metadata/images/${nftID}.png`
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
  
      const topMiddleColor = offscreenCtx.getImageData(nftImage.width / 2, 0, 1, 1).data;
      const defaultBgColor = `#${((1 << 24) + (topMiddleColor[0] << 16) + (topMiddleColor[1] << 8) + topMiddleColor[2]).toString(16).slice(1)}`;
      const [r, g, b] = topMiddleColor;
  
      const backgroundName = data.metadata.attributes.find(attr => attr.trait_type === 'Background')?.value;
      const useWhiteLogo = [
        'Purple', 'M1 Purple', 'M2 Purple', 'Army Green', 'New Punk Blue', 'M1 New Punk Blue', 'M2 New Punk Blue'
      ].includes(backgroundName);
  
      const backgroundToleranceMap = {
        Yellow: 10,
        Blue: 10,
        Purple: 10,
        Orange: 10,
        Green: 10,
        Grey: 10,
        Aquamarine: 10,
        'Army Green': 10,
        'New Punk Blue': 10,
      };
  
      const tolerance = (collection === '0x60E4d786628Fea6478F785A6d7e704777c86a7c6' && specialMutantApeTokens.includes(nftID))
        ? 80
        : backgroundToleranceMap[backgroundName] || 50;
  
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
  
      backgroundOptions.forEach(option => {
        let logoSrc = option.logo;
  
        // Override logo selection only for the original background
        if (option.name === 'original') {
          logoSrc = useWhiteLogo ? '/apechain-logo-white.svg' : '/apechain-logo-black.svg';
        }
  
        drawOnCanvas('twitter', option, canvasRefs.current[`twitter${capitalize(option.name)}`], 1500, 500, defaultBgColor, nftImage, offscreenCanvas, logoSrc);
        drawOnCanvas('mobile', option, canvasRefs.current[`mobile${capitalize(option.name)}`], 430, 932, defaultBgColor, nftImage, offscreenCanvas, logoSrc);
      });
    };
  
    nftImage.onerror = () => {
      console.error('Failed to load image:', imageURL);
      alert('Failed to load NFT image. Please check the NFT ID or collection.');
    };
  };
  

  const drawOnCanvas = (type, option, canvas, width, height, defaultBgColor, nftImage, offscreenCanvas, logoSrc) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const selectedBgColor = option.color || defaultBgColor;

    if (specialMutantApeTokens.includes(nftID) && option.name === 'original') {
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
      const logoWidth = type === 'twitter' ? 800 : 300;
      const logoHeight = (294 / 859) * logoWidth;
      ctx.drawImage(logo, (width - logoWidth) / 2, (height - logoHeight) / 2, logoWidth, logoHeight);
      const fitToWidth = type === 'mobile';
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

  const downloadCanvas = (canvas, filename) => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = filename;
    link.click();
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const handleNftIdChange = (e) => {
    setNftID(e.target.value);
    setIsButtonDisabled(false); // Enable button when user interacts with text field
  };

  return (
    <div className="generator-container">
      <div className="left-column">
        <header><h1>APECHAIN Banner Generator</h1></header>
        <p>
          Enter your Ape ID then select from any of the export variants below.
          Works for mutants, too (Mega's included).<br /><br />
          - <a href="https://x.com/iamsheftali" aria-label="Sheftali on X" target="blank">@iamsheftali</a>
        </p>
        <select value={collection} onChange={(e) => setCollection(e.target.value)}>
          <option value="">Select Collection</option>
          {collections.map((col) => (
            <option key={col.address} value={col.address}>
              {col.name}
            </option>
          ))}
        </select>
        <input className="ape-id" type="text" value={nftID} onChange={handleNftIdChange} placeholder="Enter Ape ID" />
        <button onClick={handleGenerate} disabled={loading || isButtonDisabled}>
          {loading ? 'Generating...' : 'Generate'}
        </button>
        {loading && <Loader />}
      </div>
      <div className="right-column">
        <div className="canvas-container">
          <div className="twitter-canvases">
            {backgroundOptions.map(option => (
              <div key={`${option.name}-twitter`} className="canvas-item">
                <CanvasPreview
                  title={`Twitter - ${capitalize(option.name)}`}
                  ref={el => canvasRefs.current[`twitter${capitalize(option.name)}`] = el}
                  width={1500}
                  height={500}
                />
                <button onClick={() => downloadCanvas(canvasRefs.current[`twitter${capitalize(option.name)}`], `twitter-${option.name}.png`)}>
                  Download Twitter - {capitalize(option.name)}
                </button>
              </div>
            ))}
          </div>
          <div className="mobile-canvases">
            {backgroundOptions.map(option => (
              <div key={`${option.name}-mobile`} className="canvas-item">
                <CanvasPreview
                  title={`Mobile - ${capitalize(option.name)}`}
                  ref={el => canvasRefs.current[`mobile${capitalize(option.name)}`] = el}
                  width={430}
                  height={932}
                />
                <button onClick={() => downloadCanvas(canvasRefs.current[`mobile${capitalize(option.name)}`], `mobile-${option.name}.png`)}>
                  Download Mobile - {capitalize(option.name)}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  
}

export default NFTGenerator;