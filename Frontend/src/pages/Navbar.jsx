// Navbar.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar({ userData }) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <motion.header
            className="flex justify-between items-center px-4 sm:px-6 py-4 bg-white shadow-md relative z-50"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="flex items-center gap-2 sm:gap-3"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <motion.img
                    src="/src/assets/logo.png"
                    alt="logo"
                    className="w-8 h-8 sm:w-10 sm:h-10"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                />
                <h1 className="text-xl sm:text-2xl font-bold text-[#4F5D87]">YouMatter</h1>
            </motion.div>

            {/* Mobile menu button */}
            <div className="md:hidden">                <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-[#4F5D87] min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            </div>
            {/* Desktop menu */}
            <motion.nav
                className="hidden md:flex items-center gap-6"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <motion.a
                    className="text-[#4F5D87] font-medium hover:underline"
                    href="#"
                    whileHover={{ scale: 1.05, color: "#3730a3" }}
                    whileTap={{ scale: 0.95 }}
                >
                    Dashboard
                </motion.a>
                {userData.loggedIn ? (
                    <div className="flex items-center gap-2">
                        <img src={userData.profilePicture} alt="avatar" className="w-8 h-8 rounded-full" />
                        <span className="text-sm text-[#4F5D87] font-semibold">{userData.username}</span>
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

            {/* Mobile menu dropdown */}
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
                            </a>
                            {userData.loggedIn ? (
                                <div className="flex items-center gap-2 py-2">
                                    <img src={userData.profilePicture} alt="avatar" className="w-8 h-8 rounded-full" />
                                    <span className="text-sm text-[#4F5D87] font-semibold">{userData.username}</span>
                                </div>
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
