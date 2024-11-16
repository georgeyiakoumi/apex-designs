import fetch from 'node-fetch';
import { collections } from '../../src/utils/constants.js';

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

    // Find the collection in constants.js
    const matchedCollection = collections.find(
      (col) => col.address.toLowerCase() === collection.toLowerCase()
    );

    if (!matchedCollection) {
      console.log('Error: Collection not found in constants.js');
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Collection not recognized.' }),
      };
    }

    const chain = matchedCollection.chain;
    console.log('Detected chain:', chain);

    // Construct the correct Alchemy URL based on the chain
    let baseUrl;
    if (chain === 'apechain-mainnet') {
      baseUrl = `https://apechain-mainnet.g.alchemy.com/v2/${apiKey}`;
    } else if (chain === 'eth-mainnet') {
      baseUrl = `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`;
    } else {
      console.log(`Error: Unsupported chain detected - ${chain}`);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Unsupported chain: ${chain}` }),
      };
    }

    const url = `${baseUrl}/getNFTMetadata?contractAddress=${collection}&tokenId=${nftID}`;
    console.log('Constructed Alchemy URL:', url);

    const response = await fetch(url);
    console.log('Alchemy API response status:', response.status);

    const rawResponse = await response.text();
    console.log('Raw Alchemy API response:', rawResponse);

    // Try to parse the JSON response
    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (error) {
      console.error('Failed to parse JSON response:', rawResponse);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Invalid response from Alchemy API.' }),
      };
    }

    if (!response.ok) {
      console.log('Alchemy API request failed');
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error || 'Failed to fetch metadata.' }),
      };
    }

    console.log('Alchemy API response data:', data);

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
