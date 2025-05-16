import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

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

  // Dummy user data for Navbar
  const userData = {
    loggedIn: false,
    username: '',
    profilePicture: ''
  };

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
    navigate('/welcoming', { 
      state: { 
        mood: selectedMood,
        description: moodDescription 
      } 
    });
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Use the imported Navbar component */}
      <Navbar userData={userData} />

      <div className="w-full max-w-lg px-4 mx-auto flex flex-col items-center mt-20">
        <div className="bg-blue-50 rounded-lg p-8 mb-6 w-full flex flex-col items-center">
          <h2 className="text-gray-700 text-2xl mb-2 font-medium text-center">
            How are you feeling today?
          </h2>

          <p className="text-gray-600 mb-6 text-center">
            {selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)}
          </p>

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