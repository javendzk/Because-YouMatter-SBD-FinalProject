import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../assets/styles/welcomingAnimation.css';
import '../assets/styles/flameAnimation.css';
import { useAuth } from '../context/AuthContext';
import logService from '../services/logService';
import userService from '../services/userService';
import AwesomeImg from '../assets/emotions/Awesome.png';
import GoodImg from '../assets/emotions/Good.png';
import OkayImg from '../assets/emotions/Okay.png';
import BadImg from '../assets/emotions/Bad.png';
import TerribleImg from '../assets/emotions/Terrible.png';
import LogoImg from '../assets/logo.png';

const MOOD_COLORS = {
    awesome: "#FDDD6F", // Yellow
    good: "#46CD87",    // Green
    okay: "#FF8AA6",    // Pink
    bad: "#FF7D35",     // Orange
    terrible: "#9FC0FF"  // Light Blue
};

const MOOD_MESSAGES = {
    awesome: "We're thrilled you're feeling awesome!",
    good: "Great to hear you're doing well!",
    okay: "Taking things one step at a time - that's okay!",
    bad: "It's alright to have bad days - we're here for you.",
    terrible: "We're here to support you through difficult times."
};

const MOOD_IMAGES = {
  awesome: AwesomeImg,
  good: GoodImg,
  okay: OkayImg,
  bad: BadImg,
  terrible: TerribleImg,
};

const Welcoming = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isNewUser, setIsNewUser] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const mood = location.state?.mood || 'good';
    const moodDescription = location.state?.description || '';
    const moodColor = MOOD_COLORS[mood] || MOOD_COLORS.good;
    const moodMessage = MOOD_MESSAGES[mood] || MOOD_MESSAGES.good;  
    useEffect(() => {
        const checkUserStatus = async () => {
            if (!isAuthenticated) {
                navigate('/signin');
                return;
            }

            try {
                const userProfile = await userService.getProfile();
                const hasLoggedToday = await logService.hasLoggedToday();
                const isFirstTime = await userService.isFirstTimeUser();
                
                const logsResponse = await logService.getUserLogs();
                if (logsResponse.success && logsResponse.data.length > 0) {
                    setIsNewUser(false);
                } else {
                    setIsNewUser(isFirstTime);
                }                
            } catch (error) {
                console.error('Error checking user status:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkUserStatus();
    }, [navigate, isAuthenticated, mood, moodDescription, location.state]);
    useEffect(() => {
        if (isLoading) return;
        
        const timer = setTimeout(async () => {
            if (isNewUser) {
                navigate('/tutorial', { state: { mood } });
            } else {
                try {
                    const hasLoggedToday = await logService.hasLoggedToday();
                    
                    if (hasLoggedToday) {
                        navigate('/dashboard', { state: { mood } });
                    } else {
                        navigate('/fill');
                    }
                } catch (error) {
                    console.error('Error checking if user has logged today:', error);
                    navigate('/fill');
                }
            }
        }, 4000);

        const interval = setInterval(() => {
            setLoadingProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 3;
            });
        }, 120);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [navigate, mood, isNewUser, isLoading]);

    const gradientStyle = {
        background: `linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.6)), 
                 linear-gradient(to bottom, #f7fafc, ${moodColor}55)`
    };

    const progressBarStyle = {
        backgroundColor: moodColor
    };
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-indigo-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                    <p className="mt-4 text-indigo-900">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col items-center justify-center min-h-screen p-4"
            style={gradientStyle}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-xl w-full"
            >
                <h1 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-2">
                    {user ? `Welcome, ${user.username}` : 'Welcome to YouMatter'}
                </h1>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="my-4"
                >
                    <img
                        src={MOOD_IMAGES[mood]}
                        alt={`${mood} mood`}
                        className="w-24 h-24 mx-auto"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="mb-6"
                >
                    <p className="text-xl text-gray-700">
                        {moodMessage}
                    </p>
                    <p className="mt-2 text-lg text-gray-600">
                        We're preparing your personalized experience...
                    </p>
                </motion.div>

                <div className="w-full max-w-md h-3 bg-gray-200 rounded-full overflow-hidden mx-auto">
                    <motion.div
                        style={progressBarStyle}
                        className="h-full shadow-inner"
                        initial={{ width: 0 }}
                        animate={{ width: `${loadingProgress}%` }}
                        transition={{ duration: 0.2 }}
                    />
                </div>

                <p className="mt-2 text-gray-500 text-sm">
                    {isNewUser ? 'Preparing your tutorial...' : 'Preparing your dashboard...'} {loadingProgress}%
                </p>

                <div className="mt-8 mb-6">
                    <div className="relative w-56 h-56 mx-auto p-5 rounded-full bg-white shadow-lg flex items-center justify-center pulse-glow">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{
                                duration: 0.5,
                                type: "spring",
                                stiffness: 100
                            }}
                            className="absolute inset-0"
                        />
                        <img
                            src={LogoImg}
                            alt="YouMatter Logo"
                            className="w-32 h-32 float-animation"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-center space-x-2">
                    <span className="loading-dot dot-1"></span>
                    <span className="loading-dot dot-2"></span>
                    <span className="loading-dot dot-3"></span>
                </div>
            </motion.div>
        </div>
    );
};

export default Welcoming;
