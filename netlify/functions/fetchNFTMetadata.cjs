const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    // Parse the incoming POST request body
    const { collection, nftID } = JSON.parse(event.body);

    // Validate input
    if (!collection || !nftID) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Collection address and NFT ID are required.' }),
      };
    }

    // Retrieve the API key from Netlify environment variables
    const apiKey = process.env.ALCHEMY_API_KEY;

    // Construct the Alchemy API URL
    const url = `https://eth-mainnet.alchemyapi.io/v2/${apiKey}/getNFTMetadata?contractAddress=${collection}&tokenId=${nftID}`;

    // Fetch data from the Alchemy API
    const response = await fetch(url);

    // Parse JSON response
    const data = await response.json();

    // Handle non-successful response
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to fetch metadata from Alchemy.' }),
      };
    }

    // Return the fetched metadata
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error in fetchNFTMetadata:', error);

    // Return a 500 Internal Server Error if something goes wrong
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error.' }),
    };
  }
};
