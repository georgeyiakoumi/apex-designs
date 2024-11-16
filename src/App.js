import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.js';
import NFTGenerator from './pages/NFTGenerator.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apechain-banner-generator" element={<NFTGenerator />} />
      </Routes>
    </Router>
  );
}

export default App;