import { colorDistance } from '../utils/helpers.js';

export const generateImages = (data, canvasRefs, backgroundOptions, collection, nftID, specialMutantApeTokens) => {
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

    const topMiddleColor = offscreenCtx.getImageData(nftImage.width / 2, 0, 1, 1).data;
    const defaultBgColor = `#${((1 << 24) + (topMiddleColor[0] << 16) + (topMiddleColor[1] << 8) + topMiddleColor[2]).toString(16).slice(1)}`;
    const [r, g, b] = topMiddleColor;

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

    backgroundOptions.forEach((option) => {
      const twitterCanvas = canvasRefs.current[`twitter${capitalize(option.name)}`];
      const mobileCanvas = canvasRefs.current[`mobile${capitalize(option.name)}`];
      drawOnCanvas('twitter', option, twitterCanvas, 1500, 500, defaultBgColor, nftImage, offscreenCanvas);
      drawOnCanvas('mobile', option, mobileCanvas, 430, 932, defaultBgColor, nftImage, offscreenCanvas);
    });
  };
};

const drawOnCanvas = (type, option, canvas, width, height, defaultBgColor, nftImage, offscreenCanvas) => {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const selectedBgColor = option.color || defaultBgColor;
  const logoSrc = option.logo || '/apechain-logo-black.svg';

  if (option.name === 'original') {
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

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
