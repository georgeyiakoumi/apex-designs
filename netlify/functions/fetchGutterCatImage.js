exports.handler = async (event) => {
  try {
    const { nftID } = event.queryStringParameters;

    if (!nftID) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'NFT ID is required.' }),
      };
    }

    const imageUrl = `https://gutter-cats-metadata.s3.us-east-2.amazonaws.com/metadata/images/${nftID}.png`;
    console.log('Fetching image from:', imageUrl);

    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    console.log('Successfully fetched Gutter Cat image.');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png',
        'Access-Control-Allow-Origin': '*', // Enable CORS
      },
      body: Buffer.from(imageBuffer).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('Error fetching Gutter Cat image:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch the Gutter Cat image.' }),
    };
  }
};
