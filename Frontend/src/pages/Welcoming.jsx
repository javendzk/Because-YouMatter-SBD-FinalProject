import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../assets/styles/welcomingAnimation.css';
import '../assets/styles/flameAnimation.css';

// Mood color constants based on design (matching Dashboard)
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

const Welcoming = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loadingProgress, setLoadingProgress] = useState(0);

    // Get mood from state or default to 'good' if not provided
    const mood = location.state?.mood || 'good';
    const moodColor = MOOD_COLORS[mood] || MOOD_COLORS.good;
    const moodMessage = MOOD_MESSAGES[mood] || MOOD_MESSAGES.good;

    // Simulate loading process
    useEffect(() => {
        const timer = setTimeout(() => {
            // Navigate to dashboard after loading completes (4 seconds)
            navigate('/dashboard', {
                state: { mood: mood }
            });
        }, 4000);

        // Update progress animation
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
    }, [navigate, mood]);

    // Dynamic styles based on mood
    const gradientStyle = {
        background: `linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.6)), 
                 linear-gradient(to bottom, #f7fafc, ${moodColor}55)`
    };

    const progressBarStyle = {
        backgroundColor: moodColor
    };

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
                    Welcome to YouMatter
                </h1>

                {/* Add corresponding mood image right after welcome text */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="my-4"
                >
                    <img
                        src={`/src/assets/emotions/${mood.charAt(0).toUpperCase() + mood.slice(1)}.png`}
                        alt={`${mood} mood`}
                        className="w-24 h-24 mx-auto"
                        onError={(e) => {
                            // Fallback if image doesn't exist
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

                {/* Loading bar */}
                <div className="w-full max-w-md h-3 bg-gray-200 rounded-full overflow-hidden mx-auto">
                    <motion.div
                        style={progressBarStyle}
                        className="h-full shadow-inner"
                        initial={{ width: 0 }}
                        animate={{ width: `${loadingProgress}%` }}
                        transition={{ duration: 0.2 }}
                    />
                </div>

                <p className="mt-2 text-gray-500 text-sm">Preparing your dashboard... {loadingProgress}%</p>

                {/* Mood-specific animation and main logo container */}
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
                        {/* Main logo - centered */}
                        <img
                            src="/src/assets/logo.png"
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
