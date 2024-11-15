import axios from 'axios';

const API_BASE_URL = 'https://eth-mainnet.alchemyapi.io/v2';

// Log the API key to confirm it's being accessed
console.log('Alchemy API Key:', process.env.REACT_APP_ALCHEMY_API_KEY);

export const fetchNFTMetadata = async (collection, tokenId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${process.env.REACT_APP_ALCHEMY_API_KEY}/getNFTMetadata`, {
      params: {
        contractAddress: collection,
        tokenId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    throw new Error('Failed to fetch metadata');
  }
};
