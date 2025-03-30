import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { UserProfileProvider } from './contexts/UserProfileContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Strategy from './pages/Strategy';
import './styles/global.css';

function App() {
  return (
    <WalletProvider>
      <UserProfileProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-gradient-to-b from-dark-bg to-cyber-black overflow-x-hidden">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/strategy" element={<Strategy />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </UserProfileProvider>
    </WalletProvider>
  );
}

export default App;