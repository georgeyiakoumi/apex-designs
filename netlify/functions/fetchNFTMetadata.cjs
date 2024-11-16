import fetch from 'node-fetch';

export const handler = async (event) => {
  try {
    console.log('Incoming event:', event);

    const { collection, nftID } = JSON.parse(event.body);
    console.log('Parsed collection:', collection);
    console.log('Parsed nftID:', nftID);

    if (!collection || !nftID) {
      console.log('Error: Missing collection or NFT ID');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Collection address and NFT ID are required.' }),
      };
    }

    const apiKey = process.env.ALCHEMY_API;
    console.log('Using Alchemy API key:', apiKey ? 'Loaded' : 'Not loaded');

    const url = `https://eth-mainnet.alchemyapi.io/v2/${apiKey}/getNFTMetadata?contractAddress=${collection}&tokenId=${nftID}`;
    console.log('Constructed Alchemy URL:', url);

    const response = await fetch(url);
    console.log('Alchemy API response status:', response.status);

    const data = await response.json();
    console.log('Alchemy API response data:', data);

    if (!response.ok) {
      console.log('Alchemy API request failed');
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
