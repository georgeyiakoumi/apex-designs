const axios = require('axios');

exports.handler = async (event) => {
  const { collection, tokenId } = event.queryStringParameters;
  const API_KEY = process.env.REACT_APP_ALCHEMY_API_KEY;
  const url = `https://eth-mainnet.alchemyapi.io/v2/${API_KEY}/getNFTMetadata`;

  try {
    const response = await axios.get(url, {
      params: { contractAddress: collection, tokenId },
    });
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch metadata' }),
    };
  }
};
