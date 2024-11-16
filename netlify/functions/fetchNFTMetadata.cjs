// Using ES Modules syntax for node-fetch
import fetch from 'node-fetch';

export const handler = async (event) => {
  try {
    const { collection, nftID } = JSON.parse(event.body);

    if (!collection || !nftID) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Collection address and NFT ID are required.' }),
      };
    }

    const apiKey = process.env.REACT_APP_ALCHEMY_API_KEY; // Use the secret stored in Netlify
    const url = `https://eth-mainnet.alchemyapi.io/v2/${apiKey}/getNFTMetadata?contractAddress=${collection}&tokenId=${nftID}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to fetch metadata.' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error in fetchNFTMetadata:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error.' }),
    };
  }
};
