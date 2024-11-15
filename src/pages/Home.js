import React from 'react';

import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Welcome to My Side Project</h1>
      <Link to="/nft-generator">Go to NFT Generator</Link>
    </div>
  );
}

export default Home;