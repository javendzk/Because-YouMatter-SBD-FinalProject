import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import logService from '../services/logService';
import telegramService from '../services/telegramService';

const MOOD_COLORS = {
  awesome: "#FDDD6F", // Yellow
  good: "#46CD87",    // Green
  okay: "#FF8AA6",    // Pink
  bad: "#FF7D35",     // Orange
  terrible: "#9FC0FF"  // Light Blue
};

const Fill = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [selectedMood, setSelectedMood] = useState('awesome');  const [moodDescription, setMoodDescription] = useState('');
  const [animating, setAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [todayLog, setTodayLog] = useState(null);  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    
    
    if (location.state && location.state.fromTutorial) {
      
      if (location.state.mood) {
        setSelectedMood(location.state.mood);
      }
      
      if (location.state.description) {
        setMoodDescription(location.state.description);
      }
      
    }
    else if (location.state && location.state.isUpdateMode) {
      setIsUpdateMode(true);
      
      const fetchTodayLog = async () => {
        try {
          const todayLog = await logService.getTodayLog();
          
          if (todayLog) {
            setTodayLog(todayLog);
            setSelectedMood(todayLog.mood || 'awesome');
            setMoodDescription(todayLog.day_description || '');
          } 
        } catch (err) {
          console.error('Error fetching today\'s log:', err);
        }
      };
      
      fetchTodayLog();
    } 

    else {
      const checkTodayLog = async () => {
        try {
          const hasLoggedToday = await logService.hasLoggedToday();
          if (hasLoggedToday) {
            navigate('/dashboard');
          } 
        } catch (err) {
          console.error('Error checking today\'s log:', err);
        }
      };
      
      checkTodayLog();
    }
  }, [isAuthenticated, navigate, location.state]);

  const userData = {
    loggedIn: isAuthenticated,
    username: user?.username || '',
    profilePicture: user?.profilePicture || ''
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
  const handleSubmitMood = async () => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    
    if (isLoading) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const logData = {
        mood: selectedMood,
        day_description: moodDescription || ""
      };
      
      let response;
      let todayLogObj = todayLog;
      
      if (!todayLogObj && isUpdateMode) {
        todayLogObj = await logService.getTodayLog();
      }
      
      if (isUpdateMode && todayLogObj && todayLogObj.log_id) {
        response = await logService.updateDailyLog(todayLogObj.log_id, logData);
      } else {
        if (!isUpdateMode) {
          const hasLoggedToday = await logService.hasLoggedToday();
          if (hasLoggedToday) {
            const existingLog = await logService.getTodayLog();
            
            if (existingLog && existingLog.log_id) {
              response = await logService.updateDailyLog(existingLog.log_id, logData);
            } else {
              response = await logService.createDailyLog(logData);
            }
          } else {
            response = await logService.createDailyLog(logData);
          }
        } else {
          response = await logService.createDailyLog(logData);
        }
      }
      
      if (response && response.success) {
        try {
          await telegramService.sendLatestToTelegram();
        } catch (telegramErr) {
          console.error('Error sending Telegram notification:', telegramErr);
        }
        
        if (isUpdateMode) {
          navigate('/dashboard');
        } else {
          navigate('/welcoming', { 
            state: { 
              mood: selectedMood,
              description: moodDescription,
              alreadySubmitted: true 
            } 
          });
        }
      } else {
        console.error('Fill: Failed to submit daily log:', response ? response.message : 'No response');
        setError(response ? response.message : 'Failed to submit mood. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting mood:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      <Navbar userData={userData} />

      <div className="w-full max-w-lg px-4 mx-auto flex flex-col items-center mt-20">
        {error && (
          <div className="w-full p-3 mb-4 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
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
              src={`/src/assets/emotions/${selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)}.png`}
              alt={selectedMood}
              className="w-32 h-32 object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `/src/assets/emotions/${selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)}.png`;
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
          disabled={isLoading}
          className="w-full bg-black text-white rounded-full py-4 font-medium text-lg transition-all duration-300 hover:bg-gray-800 active:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Submitting...</span>
            </div>
          ) : (
            isUpdateMode ? 'Update mood' : 'Select mood'
          )}
        </button>
      </div>
    </div>
  );
};

export default Fill;
