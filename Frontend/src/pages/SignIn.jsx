import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import LogoImg from '../assets/logo.png';

const SignIn = () => {
    
    const navigate = useNavigate();
    const { login } = useAuth();    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    useEffect(() => {
        return () => {
        };
    }, []);

    const pageVariants = {
        initial: {
            opacity: 0,
            y: 20
        },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: {
                duration: 0.3
            }
        }
    };
      const handleSignIn = async (e) => {        
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const result = await login({ email, password });
            
            if (result.success) {
                navigate('/welcoming');
            } else {
                setError(result.message || 'Failed to sign in. Please try again.');
            }
        } catch (err) {
            console.error('Login error details:', err);
            setError('An unexpected error occurred. Please try again.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };    return (
        <motion.div
            className="min-h-screen bg-blue-50 mobile-container no-scroll-bounce"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
        >
            <Navbar userData={{ loggedIn: false }} />

            <div className="max-w-md mt-20 p-4 sm:p-6 bg-white rounded-lg shadow-lg mx-auto sm:mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-6 sm:mb-8 text-center"
                >
                    <img
                        src={LogoImg}
                        alt="YouMatter Logo"
                        className="mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-4"
                    />
                    <h2 className="text-xl sm:text-2xl font-bold text-indigo-900">Welcome Back!</h2>
                    <p className="text-gray-600 text-sm sm:text-base">Sign in to continue your mental wellness journey</p>
                </motion.div>                <form onSubmit={(e) => {
                    handleSignIn(e);
                }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="mb-4"
                    ><label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                            Email
                        </label>                        <input
                            id="email"
                            type="email"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mobile-input touch-target"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }}
                            required
                            placeholder="Enter your email"
                            autoComplete="email"
                            onFocus={() => console.log('')}
                        />
                    </motion.div>                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="mb-6"
                    >
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                            Password
                        </label>                        <input
                            id="password"
                            type="password"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mobile-input touch-target"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                            }}
                            required
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            onFocus={() => console.log('')}
                        />
                    </motion.div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm"
                        >
                            {error}
                        </motion.div>
                    )}                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-3 sm:py-4 bg-indigo-900 text-white rounded-full font-medium transition duration-300 flex justify-center min-h-[48px]"
                        disabled={isLoading}
                        onClick={(e) => {

                        }}
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            'Sign In'
                        )}
                    </motion.button>
                </form>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="mt-6 text-center"
                >
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <button
                            onClick={() => navigate('/signup')}
                            className="text-indigo-900 font-medium hover:underline"
                        >
                            Sign Up
                        </button>
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default SignIn;