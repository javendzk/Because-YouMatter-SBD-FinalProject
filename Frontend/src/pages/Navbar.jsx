import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LogoImg from '../assets/logo.png';

export default function Navbar({ userData }) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <motion.header
            className="flex justify-between items-center px-4 sm:px-6 py-4 bg-white shadow-md relative z-50"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
        >            <motion.div
                className="flex items-center gap-2 sm:gap-3 cursor-pointer"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                onClick={() => navigate('/')}
            >
                <motion.img
                    src={LogoImg}
                    alt="logo"
                    className="w-8 h-8 sm:w-10 sm:h-10"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                />
                <h1 className="text-xl sm:text-2xl font-bold text-[#4F5D87]">YouMatter</h1>
            </motion.div>

            <div className="md:hidden">                <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-[#4F5D87] min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            </div>
            <motion.nav
                className="hidden md:flex items-center gap-6"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >                <motion.a
                    className="text-[#4F5D87] font-medium hover:underline cursor-pointer"
                    whileHover={{ scale: 1.05, color: "#3730a3" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/dashboard')}
                >
                    Dashboard
                </motion.a>{userData.loggedIn ? (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <img 
                                src={userData.profilePicture || LogoImg} 
                                alt="Profile" 
                                className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = LogoImg;
                                }}
                            />
                            <span className="text-sm text-[#4F5D87] font-semibold">{userData.username}</span>
                        </div>
                        <motion.button
                            className="flex items-center gap-1 text-red-500 hover:text-red-700"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                        >
                            <LogOut size={16} />
                            <span className="text-sm">Logout</span>
                        </motion.button>
                    </div>
                ) : (<motion.button
                    className="bg-[#CEDEFF] px-5 py-2 rounded-full text-[#4F5D87] border border-[#4F5D87] hover:bg-[#BBD4FF] transition min-h-[44px]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/signin')}
                >
                    Sign In
                </motion.button>
                )}
            </motion.nav>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        className="absolute top-full left-0 right-0 bg-white shadow-lg py-4 md:hidden z-50"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}                    >                        <div className="flex flex-col items-center gap-4">
                            <a
                                className="text-[#4F5D87] font-medium hover:underline py-2"
                                href="#"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    navigate('/dashboard');
                                }}
                            >
                                Dashboard
                            </a>                            {userData.loggedIn ? (
                                <>
                                    <div className="flex items-center gap-2 py-2">
                                        <img 
                                            src={userData.profilePicture || LogoImg} 
                                            alt="Profile" 
                                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = LogoImg;
                                            }}
                                        />
                                        <span className="text-sm text-[#4F5D87] font-semibold">{userData.username}</span>
                                    </div>
                                    <button
                                        className="flex items-center gap-2 text-red-500 hover:text-red-700 py-2"
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            handleLogout();
                                        }}
                                    >
                                        <LogOut size={16} />
                                        <span className="text-sm">Logout</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="bg-[#CEDEFF] px-5 py-2 rounded-full text-[#4F5D87] border border-[#4F5D87] hover:bg-[#BBD4FF] transition w-4/5 mx-auto"
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        navigate('/signin');
                                    }}
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
