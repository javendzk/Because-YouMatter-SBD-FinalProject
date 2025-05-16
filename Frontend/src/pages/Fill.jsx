import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const [selectedMood, setSelectedMood] = useState('awesome');
  const [moodDescription, setMoodDescription] = useState('');
  const [animating, setAnimating] = useState(false);

  // Array of available moods in the order they appear in the UI
  const moods = ['awesome', 'good', 'okay', 'bad', 'terrible'];

  const handleMoodChange = (mood) => {
    if (mood !== selectedMood) {
      setAnimating(true);
      setTimeout(() => {
        setSelectedMood(mood);
        setTimeout(() => {
          setAnimating(false);
        }, 300);
      }, 150);
    }
  };

  const handleSubmitMood = () => {
    // Navigate to the welcoming page with the selected mood and description
    navigate('/welcoming', { 
      state: { 
        mood: selectedMood,
        description: moodDescription 
      } 
    });
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white">
      {/* Header with logo and sign in button */}
      <div className="fixed top-0 flex w-full justify-between items-center bg-white p-4">
        <div className="flex items-center">
          <span className="text-blue-600 font-bold transform -rotate-12 text-xs mr-1">BETA</span>
          <img 
            src="/assets/styles/logo.png" 
            alt="YouMatter Logo" 
            className="h-6"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              const textLogo = document.createElement('h1');
              textLogo.innerText = 'YouMatter';
              textLogo.className = 'text-blue-600 font-bold';
              e.target.parentNode.appendChild(textLogo);
            }}
          />
        </div>
        <button className="px-4 py-1 rounded-full border border-gray-300 text-gray-700 text-sm">
          Sign In
        </button>
      </div>
      
      {/* Main content - centered and maximized */}
      <div className="w-full max-w-lg px-4 flex flex-col items-center">
        {/* Mood selection area */}
        <div className="bg-blue-50 rounded-lg p-8 mb-6 w-full flex flex-col items-center">
          <h2 className="text-gray-700 text-2xl mb-2 font-medium text-center">
            How are you feeling today?
          </h2>
          
          <p className="text-gray-600 mb-6 text-center">
            {selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)}
          </p>
          
          {/* Mood emoji display with animation */}
          <div 
            className={`mb-8 transform transition-all duration-500 ease-in-out ${animating ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
            style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <img 
              src={`/src/assets/emotions/${selectedMood}.png`}
              alt={selectedMood}
              className="w-32 h-32 object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `/assets/emotions/${selectedMood}.png`;
              }}
            />
          </div>
          
          {/* Mood selector dots */}
          <div className="flex justify-center gap-4 mb-2">
            {moods.map(mood => (
              <button
                key={mood}
                className={`w-6 h-6 rounded-full transition-all duration-300 hover:scale-110 ${selectedMood === mood ? 'scale-125' : ''}`}
                style={{ 
                  backgroundColor: MOOD_COLORS[mood],
                  transform: selectedMood === mood ? 'scale(1.25)' : 'scale(1)',
                  boxShadow: selectedMood === mood ? '0 0 0 2px white' : 'none'
                }}
                onClick={() => handleMoodChange(mood)}
                aria-label={`Select ${mood} mood`}
              />
            ))}
          </div>
        </div>
        
        {/* Input area */}
        <div className="w-full mb-6">
          <p className="text-gray-700 mb-2">Tell us a little bit about your mood!</p>
          <textarea
            className="w-full p-4 border border-gray-200 rounded-lg resize-none"
            rows="5"
            placeholder="..."
            value={moodDescription}
            onChange={(e) => setMoodDescription(e.target.value)}
          />
        </div>
        
        {/* Submit button */}
        <button
          onClick={handleSubmitMood}
          className="w-full bg-black text-white rounded-full py-4 font-medium text-lg transition-all duration-300 hover:bg-gray-800 active:bg-gray-900"
        >
          Select mood
        </button>
      </div>
    </div>
  );
};

export default Fill;