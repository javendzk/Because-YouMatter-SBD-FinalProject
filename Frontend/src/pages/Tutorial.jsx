import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import AwesomeImg from '../assets/emotions/Awesome.png';
import GoodImg from '../assets/emotions/Good.png';
import OkayImg from '../assets/emotions/Okay.png';
import BadImg from '../assets/emotions/Bad.png';
import TerribleImg from '../assets/emotions/Terrible.png';

const MOOD_COLORS = {
  awesome: "#FDDD6F", // Yellow
  good: "#46CD87",    // Green
  okay: "#FF8AA6",    // Pink
  bad: "#FF7D35",     // Orange
  terrible: "#9FC0FF"  // Light Blue
};

const MOOD_IMAGES = {
  awesome: AwesomeImg,
  good: GoodImg,
  okay: OkayImg,
  bad: BadImg,
  terrible: TerribleImg,
};

const Tutorial = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMood, setSelectedMood] = useState('awesome');
  const [moodDescription, setMoodDescription] = useState('');
  const [animating, setAnimating] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const [tutorialComplete, setTutorialComplete] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  
  const textareaRef = useRef(null);
  const buttonRef = useRef(null);
  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Tutorial: User not authenticated, redirecting to signin');
      navigate('/signin');
    }
    
    // If we have mood data from previous screen, use it
    if (location.state?.mood) {
      setSelectedMood(location.state.mood);
    }
  }, [isAuthenticated, navigate, location.state]);

  // User data for Navbar
  const userData = {
    loggedIn: isAuthenticated,
    username: user?.username || '',
    profilePicture: user?.profilePicture || ''
  };

  // Array of available moods
  const moods = ['awesome', 'good', 'okay', 'bad', 'terrible'];

  // Tutorial steps content
  const tutorialSteps = [
    {
      title: `Welcome to YouMatter${user ? `, ${user.username}` : ''}!`,
      content: "Let's learn how to track your mood. This quick tutorial will show you how to use our app.",
      highlightElement: null
    },
    {
      title: "Step 1: Select your mood",
      content: "Click on one of these colored dots to choose how you're feeling today.",
      highlightElement: ".mood-dots"
    },
    {
      title: "Step 2: See your mood",
      content: "The mood emoji will change to match how you're feeling.",
      highlightElement: ".mood-emoji"
    },
    {
      title: "Step 3: Tell us more",
      content: "Write a few words about what's making you feel this way in the text box.",
      highlightElement: ".mood-textarea"
    },
    {
      title: "Step 4: Save your mood",
      content: "Click the 'Select mood' button to save your entry.",
      highlightElement: ".mood-button"
    },    {
      title: "You're all set!",
      content: "Now you know how to track your mood. Let's record your first mood entry!",
      highlightElement: null
    }
  ];
  
  const handleMoodChange = (mood) => {
    if (mood !== selectedMood) {
      setAnimating(true);
      setTimeout(() => {
        setSelectedMood(mood);
        setTimeout(() => {
          setAnimating(false);
        }, 300);
      }, 150);
      
      if (currentStep === 1) {
        setTimeout(() => {
          nextStep();
        }, 1000);
      }
    }
  };
  
  useEffect(() => {
    if (currentStep === 2) {
      const timer = setTimeout(() => {
        if (currentStep === 2) nextStep();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);
  
  useEffect(() => {
    if (currentStep === 3 && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current.focus();
      }, 500);
    }
    
    if (tutorialSteps[currentStep]?.highlightElement) {
      setShowHighlight(true);
    } else {
      setShowHighlight(false);
    }
  }, [currentStep]);
  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setTutorialComplete(true);
      setFadeOut(true);
      setTimeout(() => {
        navigateToWelcoming();
      }, 1500);
    }
  };
  const navigateToWelcoming = () => {
    navigate('/fill', { 
      state: { 
        mood: selectedMood,
        description: moodDescription,
        fromTutorial: true
      } 
    });
  };
  
  const handleTextInput = (e) => {
    setMoodDescription(e.target.value);
    
    if (currentStep === 3 && e.target.value.length >= 10 && !tutorialComplete) {
      setTimeout(() => {
        nextStep();
      }, 500);
    }
  };
  
  const handleSelectMood = () => {
    setFadeOut(true);
    setTimeout(() => {
      navigateToWelcoming();
    }, 500);
  };
  
  const getHighlightStyle = (elementSelector) => {
    if (showHighlight && tutorialSteps[currentStep]?.highlightElement === elementSelector) {
      return {
        position: "relative",
        zIndex: 10,
        boxShadow: "0 0 0 4px rgba(99, 102, 241, 0.4)",
        animation: "pulse 2s infinite"
      };
    }
    return {};
  };

  return (
    <div className={`flex h-screen flex-col bg-white transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <Navbar userData={userData} />
      
      <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-20 pointer-events-none" />
      
      <div className="w-full max-w-lg px-4 mx-auto flex flex-col items-center z-30 mt-20">
        <div className="bg-white rounded-lg p-4 mb-6 w-full shadow-lg border-l-4 border-indigo-500 transform transition-all duration-500">
          <h2 className="text-indigo-600 text-xl font-bold mb-2">
            {tutorialSteps[currentStep].title}
          </h2>
          <p className="text-gray-700 mb-4">
            {tutorialSteps[currentStep].content}
          </p>
          {currentStep < 1 && (
            <button
              onClick={nextStep}
              className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors"
            >
              Start Tutorial
            </button>
          )}
        </div>
        
        <div className="bg-blue-50 rounded-lg p-8 mb-6 w-full flex flex-col items-center">
          <h2 className="text-gray-700 text-2xl mb-2 font-medium text-center">
            How are you feeling today?
          </h2>
          
          <p className="text-gray-600 mb-6 text-center">
            {selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)}
          </p>
          
          <div 
            className={`mood-emoji mb-8 transform transition-all duration-500 ease-in-out ${animating ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
            style={{ 
              height: '140px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              ...getHighlightStyle('.mood-emoji')
            }}
          >
            <img 
              src={MOOD_IMAGES[selectedMood]}
              alt={selectedMood}
              className="w-32 h-32 object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = AwesomeImg;
              }}
            />
          </div>
          
          <div 
            className="mood-dots flex justify-center gap-4 mb-2"
            style={getHighlightStyle('.mood-dots')}
          >
            {moods.map(mood => (
              <button
                key={mood}
                className={`w-6 h-6 rounded-full transition-all duration-300 hover:scale-110 ${selectedMood === mood ? 'scale-125' : ''} ${currentStep === 1 ? 'animate-bounce' : ''}`}
                style={{ 
                  backgroundColor: MOOD_COLORS[mood],
                  transform: selectedMood === mood ? 'scale(1.25)' : 'scale(1)',
                  boxShadow: selectedMood === mood ? '0 0 0 2px white' : 'none',
                  animationDelay: `${moods.indexOf(mood) * 0.1}s`,
                  animationDuration: '1s'
                }}
                onClick={() => handleMoodChange(mood)}
                aria-label={`Select ${mood} mood`}
                disabled={currentStep !== 1 && tutorialComplete}
              />
            ))}
          </div>
        </div>
        
        <div 
          className="w-full mb-6"
          style={getHighlightStyle('.mood-textarea')}
        >
          <p className="text-gray-700 mb-2">Tell us a little bit about your mood!</p>
          <textarea
            ref={textareaRef}
            className="mood-textarea w-full p-4 border border-gray-200 rounded-lg resize-none"
            rows="5"
            placeholder={currentStep === 3 ? "Start typing here..." : "..."}
            value={moodDescription}
            onChange={handleTextInput}
            disabled={currentStep !== 3 && tutorialComplete}
          />
        </div>
        
        <div 
          className="w-full"
          style={getHighlightStyle('.mood-button')}
        >
          <button
            ref={buttonRef}
            onClick={handleSelectMood}
            className={`mood-button w-full bg-black text-white rounded-full py-4 font-medium text-lg transition-all duration-300 
              ${currentStep === 4 ? 'animate-pulse' : ''} 
              hover:bg-gray-800 active:bg-gray-900`}          >
            Track Your First Mood
          </button>
        </div>
      </div>
      
      <div style={{ width: 0, height: 0, overflow: 'hidden', position: 'absolute' }}>
        <img src={AwesomeImg} alt="" width={1} height={1} style={{ opacity: 0 }} />
        <img src={GoodImg} alt="" width={1} height={1} style={{ opacity: 0 }} />
        <img src={OkayImg} alt="" width={1} height={1} style={{ opacity: 0 }} />
        <img src={BadImg} alt="" width={1} height={1} style={{ opacity: 0 }} />
        <img src={TerribleImg} alt="" width={1} height={1} style={{ opacity: 0 }} />
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Tutorial;