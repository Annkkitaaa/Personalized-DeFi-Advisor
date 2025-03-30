import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserProfile } from '../../contexts/UserProfileContext';

const RiskProfiler = () => {
  const { profile, updateProfile, riskProfile } = useUserProfile();
  const [formData, setFormData] = useState({
    riskTolerance: profile.riskTolerance || 5,
    timeHorizon: profile.timeHorizon || 12,
    capital: profile.capital || 10000,
    experience: profile.experience || 'beginner'
  });
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'capital' ? parseFloat(value) : value
    });
  };

  const handleSliderChange = (e) => {
    setFormData({
      ...formData,
      riskTolerance: parseInt(e.target.value)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    navigate('/dashboard');
  };

  const getRiskLabel = (score) => {
    if (score <= 3) return 'Conservative';
    if (score <= 7) return 'Moderate';
    return 'Aggressive';
  };

  const getSliderColor = (score) => {
    if (score <= 3) return 'cyber-blue';
    if (score <= 7) return 'cyber-yellow';
    return 'cyber-pink';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-white font-cyber mb-2 text-sm">Risk Tolerance</label>
          <div className="mb-2">
            <input
              type="range"
              name="riskTolerance"
              min="1"
              max="10"
              step="1"
              value={formData.riskTolerance}
              onChange={handleSliderChange}
              className={`w-full h-2 rounded-md appearance-none cursor-pointer bg-gradient-to-r from-cyber-blue via-cyber-yellow to-cyber-pink`}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Conservative</span>
            <span className={`text-center font-cyber text-${getSliderColor(formData.riskTolerance)}`}>
              {getRiskLabel(formData.riskTolerance)} ({formData.riskTolerance}/10)
            </span>
            <span className="text-xs text-gray-400">Aggressive</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white font-cyber mb-2 text-sm">Investment Horizon (Months)</label>
            <input
              type="number"
              name="timeHorizon"
              value={formData.timeHorizon}
              onChange={handleChange}
              min="1"
              max="60"
              required
              className="input-cyber w-full"
            />
          </div>

          <div>
            <label className="block text-white font-cyber mb-2 text-sm">Capital to Invest (USD)</label>
            <input
              type="number"
              name="capital"
              value={formData.capital}
              onChange={handleChange}
              min="100"
              step="100"
              required
              className="input-cyber w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-white font-cyber mb-2 text-sm">DeFi Experience Level</label>
          <select
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            required
            className="input-cyber w-full"
          >
            <option value="none">None - Complete Beginner</option>
            <option value="beginner">Beginner - Basic Knowledge</option>
            <option value="intermediate">Intermediate - Some Experience</option>
            <option value="advanced">Advanced - Experienced User</option>
          </select>
        </div>

        <button
          type="submit"
          className="cyber-button w-full mt-8"
        >
          Generate Strategy
        </button>
      </form>
    </motion.div>
  );
};

export default RiskProfiler;