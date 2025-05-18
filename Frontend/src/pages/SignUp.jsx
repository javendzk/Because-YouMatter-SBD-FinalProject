// SignUp.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

const SignUp = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [telegramId, setTelegramId] = useState('');
    const [interest, setInterest] = useState('');
    const [gender, setGender] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [birthday, setBirthday] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [ageError, setAgeError] = useState('');
    const [generalError, setGeneralError] = useState('');

    // Calculate age from birthday
    const calculateAge = (birthDate) => {
        if (!birthDate) return '';
        
        const dob = new Date(birthDate);
        const today = new Date();
        
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        
        // Adjust age if birthday hasn't occurred yet this year
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        
        return age.toString();
    };    
    
    // Handle birthday change and update age automatically
    const handleBirthdayChange = (e) => {
        const birthDate = e.target.value;
        setBirthday(birthDate);
        const calculatedAge = calculateAge(birthDate);
        
        // Validate age when birthday is changed
        const userAge = parseInt(calculatedAge);
        if (isNaN(userAge) || userAge < 13) {
            setAgeError('You must be at least 13 years old to register');
        } else {
            setAgeError('');
        }
    };
    
    // Validate password
    const validatePassword = () => {
        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return false;
        }
        if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
            return false;
        }
        setPasswordError('');
        return true;
    };
    
    // Handle sign up submission
    const handleSignUp = async (e) => {
        e.preventDefault();
        
        // Reset errors
        setPasswordError('');
        setAgeError('');
        setGeneralError('');
        
        // Validate form
        if (!validatePassword()) {
            return;
        }
        
        // Validate age
        const userAge = parseInt(calculateAge(birthday));
        if (isNaN(userAge) || userAge < 13) {
            setAgeError('You must be at least 13 years old to register');
            return;
        }
        
        setIsLoading(true);
        
        try {
            // Prepare user data for registration
            const userData = {
                username,
                password,
                email,
                fullname: fullName,
                birthday,
                gender: gender || undefined,
                interest: interest || undefined,
                telegram_id: telegramId ? parseInt(telegramId) : undefined
            };
            
            // Call the register function from our auth context
            const result = await register(userData);
            
            if (result.success) {
                // Registration successful, navigate to login page
                navigate('/signin', { 
                    state: { message: 'Account created successfully. Please log in.' } 
                });
            } else {
                // Display error message
                setGeneralError(result.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setGeneralError('An unexpected error occurred. Please try again.');
            console.error('Registration error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // User data for navbar
    const userData = {
        loggedIn: false
    };

    // Page transition
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

    return (
        <motion.div
            className="min-h-screen bg-blue-50 mobile-container no-scroll-bounce ios-viewport-fix"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
        >
            {/* Using the common Navbar component */}
            <Navbar userData={userData} />

            <div className="max-w-md mx-4 sm:mx-auto mt-16 sm:mt-20 p-4 sm:p-6 bg-white rounded-lg shadow-lg mb-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-6 text-center"
                >
                    <img
                        src="/src/assets/logo.png"
                        alt="YouMatter Logo"
                        className="mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-3"
                    />
                    <h2 className="text-xl sm:text-2xl font-bold text-indigo-900">Create Your Account</h2>
                    <p className="text-gray-600 text-sm sm:text-base">Start your mental wellness journey today</p>
                </motion.div>

                {generalError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                        {generalError}
                    </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="fullName">
                            Full Name
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mobile-input min-h-[44px]"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            placeholder="Enter your full name"
                            autoComplete="name"
                        />
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.5 }}
                    >
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mobile-input min-h-[44px]"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Choose a username"
                            autoComplete="username"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mobile-input min-h-[44px]"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                            autoComplete="email"
                        />
                    </motion.div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45, duration: 0.5 }}
                        >
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="birthday">
                                Birthday
                            </label>
                            <input
                                id="birthday"
                                type="date"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mobile-input min-h-[44px]"
                                value={birthday}
                                onChange={handleBirthdayChange}
                                required
                                placeholder="Select your birth date"
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45, duration: 0.5 }}
                        >
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="gender">
                                Gender
                            </label>
                            <select 
                                id="gender"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px] mobile-input"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="non-binary">Non-binary</option>
                                <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
                        </motion.div>
                    </div>

                    {ageError && <p className="text-red-500 text-sm">{ageError}</p>}
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="interest">
                            Hobbies & Interests
                        </label>
                        <textarea 
                            id="interest"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] mobile-input"
                            value={interest}
                            onChange={(e) => setInterest(e.target.value)}
                            placeholder="What do you enjoy doing?"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="telegramId">
                            Telegram ID (Optional)
                        </label>
                        <input 
                            id="telegramId"
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mobile-input min-h-[44px]"
                            value={telegramId}
                            onChange={(e) => setTelegramId(e.target.value)}
                            placeholder="Enter your Telegram ID"
                        />
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55, duration: 0.5 }}
                    >
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                            Password
                        </label>
                        <input 
                            id="password"
                            type="password"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mobile-input min-h-[44px]"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Create a password"
                            autoComplete="new-password"
                        />
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                    >
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <input 
                            id="confirmPassword"
                            type="password"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mobile-input min-h-[44px]"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Confirm your password"
                            autoComplete="new-password"
                        />                    
                    </motion.div>
                    
                    {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                    
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65, duration: 0.5 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-3 sm:py-4 bg-indigo-900 text-white rounded-full font-medium transition duration-300 flex justify-center min-h-[48px] touch-target"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Creating Account...</span>
                            </div>
                        ) : (
                            'Sign Up'
                        )}
                    </motion.button>
                </form>
                
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="mt-6 text-center"
                >
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link
                            to="/signin"
                            className="text-indigo-900 font-medium hover:underline touch-target"
                        >
                            Sign In
                        </Link>
                    </p>
                </motion.div>                
                
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="mt-6 text-center text-xs text-gray-500"
                >
                    <p>
                        By signing up, you agree to our{' '}
                        <a href="#" className="text-indigo-600 hover:underline touch-target">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-indigo-600 hover:underline touch-target">
                            Privacy Policy
                        </a>
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default SignUp;