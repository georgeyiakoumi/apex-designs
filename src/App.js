import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import NFTGenerator from './pages/NFTGenerator';

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