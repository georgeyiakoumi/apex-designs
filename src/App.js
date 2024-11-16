import React from 'react';
<<<<<<< HEAD
import NFTGenerator from './pages/NFTGenerator.js';
=======
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import NFTGenerator from './pages/NFTGenerator';
>>>>>>> parent of 0e4c870 (adding the build)

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nft-generator" element={<NFTGenerator />} />
      </Routes>
    </Router>
  );
}

export default App;