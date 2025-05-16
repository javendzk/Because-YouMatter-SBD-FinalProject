import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// This is a placeholder for the Fill page that will be implemented by your friend
// It will collect information about how the user feels that day and then redirect to the Welcoming page

// Mood colors matching design system
const MOOD_COLORS = {
  awesome: "#FDDD6F", // Yellow
  good: "#46CD87",    // Green
  okay: "#FF8AA6",    // Pink
  bad: "#FF7D35",     // Orange
  terrible: "#9FC0FF"  // Light Blue
};

const Fill = () => {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState('');

  const handleSubmitMood = (e) => {
    e.preventDefault();
    // Navigate to the welcoming page with the selected mood
    navigate('/welcoming', { 
      state: { mood: selectedMood || 'good' } 
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-indigo-700">
          How are you feeling today?
        </h1>
        
        <p className="mb-6 text-center text-gray-600">
          Select your mood so we can personalize your experience.
        </p>
        
        {/* Display selected mood image if one is selected */}
        {selectedMood && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col items-center"
          >
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center mb-3"
              style={{ backgroundColor: `${MOOD_COLORS[selectedMood]}30` }}
            >
              <img 
                src={`/src/assets/emotions/${selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)}.png`}
                alt={selectedMood}
                className="w-16 h-16"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <p className="text-lg font-medium capitalize" style={{ color: MOOD_COLORS[selectedMood] }}>
              {selectedMood}
            </p>
          </motion.div>
        )}
        
        {/* Mood selection form */}
        <form onSubmit={handleSubmitMood}>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select your mood:
            </label>
            <select 
              className="w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              required
            >
              <option value="" disabled>Choose your mood...</option>
              <option value="awesome">Awesome</option>
              <option value="good">Good</option>
              <option value="okay">Okay</option>
              <option value="bad">Bad</option>
              <option value="terrible">Terrible</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 px-4 py-3 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            disabled={!selectedMood}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Fill;
