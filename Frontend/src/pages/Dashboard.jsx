// Dashboard.jsx - Updated with backend integration
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Edit, ChevronDown, Calendar, X, Pencil, Filter, RefreshCcw } from "lucide-react";
import Navbar from "./Navbar";
import { motion, AnimatePresence } from "framer-motion";
import '../assets/styles/flameAnimation.css';
import MoodHistoryTimeline from "../components/MoodHistoryTimeline";
import { useAuth } from "../context/AuthContext";
import logService from "../services/logService";
import rewardService from "../services/rewardService";

// Mood color constants based on design
const MOOD_COLORS = {
    awesome: "#FDDD6F", // Yellow
    good: "#46CD87",    // Green
    okay: "#FF8AA6",    // Pink
    bad: "#FF7D35",     // Orange
    terrible: "#9FC0FF"  // Light Blue
};

export default function Dashboard() {    // Import React hooks at the top    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, updateProfile, updateProfileWithImage } = useAuth();
    const todayMood = location.state?.mood || null;
    
    // Helper state for month/year selection
    const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [editedProfile, setEditedProfile] = useState({
        fullName: "",
        username: "",
        email: "",
        birthday: "",
        gender: "",
        hobbies: "",
        user_image_url: ""
    });
    
    // New state for success message
    const [successMessage, setSuccessMessage] = useState(null);
    
    // Helper function to convert month name to month number (0-11)
    const getMonthNumber = (monthName) => {
        return new Date(Date.parse(`${monthName} 1, 2000`)).getMonth();
    };
    
    // Compute days in selected month
    const daysInSelectedMonth = new Date(
        parseInt(selectedYear),
        getMonthNumber(selectedMonth) + 1,
        0
    ).getDate();
    
    // Compute first day of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfSelectedMonth = new Date(
        parseInt(selectedYear),
        getMonthNumber(selectedMonth),
        1
    ).getDay();
    
    const [userData, setUserData] = useState({
        fullName: "",
        username: "",
        email: "",
        age: "",
        birthday: "",
        gender: "",
        interest: "",
        profilePicture: "/src/assets/placeholder.jpg",
        streakDays: 0,
        totalDays: 0,
        goodDays: 0,
        stressedDays: 0,
        loggedIn: true
    });

    const [moodHistory, setMoodHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);    const [error, setError] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteLogId, setDeleteLogId] = useState(null);
    const [selectedMood, setSelectedMood] = useState(null);
    const [editText, setEditText] = useState('');

    // Prepare weekly mood data for the chart
    const weeklyMoodData = [5, 7, 4, 8, 6, 9, 7];
    const maxMoodValue = Math.max(...weeklyMoodData);    // Check if user is authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            console.log('Dashboard: User not authenticated, redirecting to signin');
            navigate('/signin');
            return;
        }

        fetchUserData();
        fetchMoodHistory();
    }, [isAuthenticated, navigate]);// Fetch user data from backend
    const fetchUserData = async () => {
        try {
            console.log('=== FETCHING USER DATA ===');
            setIsLoading(true);
            
            // Set basic user data from auth context
            if (user) {
                console.log('User data from auth context:', user);
                // Calculate age from birthday if available
                let age = "";
                if (user.birthday) {
                    const birthDate = new Date(user.birthday);
                    const today = new Date();
                    age = today.getFullYear() - birthDate.getFullYear();
                    
                    // Adjust age if birthday hasn't occurred yet this year
                    const m = today.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                }
                
                setUserData(prev => ({
                    ...prev,
                    fullName: user.fullname || "",
                    username: user.username || "",
                    email: user.email || "",
                    birthday: user.birthday || "",
                    gender: user.gender || "",
                    interest: user.interest || "",
                    age: age.toString(),
                    profilePicture: user.user_image_url || "/src/assets/placeholder.jpg"
                }));
            }
            
            // Get streak information
            console.log('Fetching streak information...');
            const streakResponse = await rewardService.getUserStreak();
            console.log('Streak response:', streakResponse);
            
            if (streakResponse.success) {
                console.log('Setting streak days:', streakResponse.data.currentStreak);
                setUserData(prev => ({
                    ...prev,
                    streakDays: streakResponse.data.currentStreak || 0
                }));
            }
            
            // Get mood statistics
            console.log('Fetching mood statistics...');
            const statsResponse = await logService.calculateUserStats();
            console.log('Stats response:', statsResponse);
            
            setUserData(prev => ({
                ...prev,
                totalDays: statsResponse.data?.totalDays || 0,
                goodDays: statsResponse.data?.goodDays || 0,
                stressedDays: statsResponse.data?.stressedDays || 0
            }));
            
            console.log('User data updated:', userData);
            
        } catch (err) {
            console.error("Error fetching user data:", err);
            console.error("Error details:", {
                name: err.name,
                message: err.message,
                stack: err.stack
            });
            setError("Failed to load user data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };    // Initialize editedProfile with userData when it's loaded or updated
    useEffect(() => {
        if (user) {
            setEditedProfile({
                fullName: user.fullname || "",
                username: user.username || "",
                email: user.email || "",
                birthday: user.birthday || "",
                gender: user.gender || "",
                hobbies: user.interest || "",
                user_image_url: user.user_image_url || ""
            });
        }
    }, [user]);
      // Update editedProfile when showProfileEdit changes and userData is available
    useEffect(() => {
        if (showProfileEdit && userData) {
            setEditedProfile({
                fullName: userData.fullName || "",
                username: userData.username || "",
                email: userData.email || "",
                birthday: userData.birthday || "",
                gender: userData.gender || "",
                hobbies: userData.interest || "",
                user_image_url: userData.profilePicture || ""
            });
        }
    }, [showProfileEdit, userData]);

    // Fetch mood history
    const fetchMoodHistory = async () => {
        try {
            const response = await logService.getUserLogs();
            
            if (response.success) {
                // Transform logs data to match the expected format for MoodHistoryTimeline
                const formattedLogs = response.data.map(log => {
                    const date = new Date(log.date);
                    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    
                    // Format date components
                    const day = date.getDate();
                    const month = months[date.getMonth()].substring(0, 3);
                    const weekday = weekdays[date.getDay()];
                      // Format mood
                    const moodFormatted = log.mood.charAt(0).toUpperCase() + log.mood.slice(1);
                    
                    // Check if the log date is today
                    const today = new Date();
                    const isToday = date.toDateString() === today.toDateString();
                      // Extract tags directly from the log
                    console.log("Log data:", log);
                      // Extract tags and insights properly
                    const tags = log.tags || [];
                    // Debugging
                    console.log(`Log ${log.log_id} tags:`, tags);
                    console.log(`Log ${log.log_id} insight:`, log.insight);
                    console.log(`Log ${log.log_id} llm_response:`, log.llm_response);
                      return {
                        id: log.log_id,
                        day,
                        month,
                        weekday,
                        mood: moodFormatted,color: MOOD_COLORS[log.mood] || "#46CD87", // Default to green if mood color not found
                        imageSrc: `/src/assets/emotions/${moodFormatted}.png`,                        description: log.day_description || "No description provided.",
                        tags: Array.isArray(tags) ? tags : [], 
                        ai_insight: log.insight || "AI insight not available yet.",
                        web_message: log.llm_response?.webMessage || "AI is analyzing your mood pattern. Check back soon for insights!",
                        isToday,
                        date: log.date // Include date for calendar functionality
                    };
                });
                  setMoodHistory(formattedLogs);
                console.log("Formatted mood history logs:", formattedLogs);
            }
        } catch (err) {
            console.error("Error fetching mood history:", err);
            setError("Failed to load mood history. Please try again.");
        }
    };
    // Handle log deletion
    const handleDeleteLog = async (logId) => {
        setIsDeleting(true);
        setDeleteLogId(logId);
        
        try {
            const response = await logService.deleteLog(logId);
            
            if (response.success) {
                // Remove the deleted log from state
                setMoodHistory(prev => prev.filter(log => log.id !== logId));
                
                // Update user stats after deletion
                fetchUserData();
            } else {
                setError("Failed to delete log. Please try again.");
            }
        } catch (err) {
            console.error("Error deleting log:", err);
            setError("An error occurred while deleting the log.");
        } finally {
            setIsDeleting(false);
            setDeleteLogId(null);
        }
    };

    // Update mood history if we have today's mood from the welcoming page
    useEffect(() => {
        if (todayMood) {
            fetchMoodHistory(); // Refresh the mood history
        }
    }, [todayMood]);
    
    // Function to handle updating mood    
    const handleUpdateMood = () => {
        // Navigate to Fill page with query parameter to indicate update mode
        navigate('/fill', { state: { isUpdateMode: true } });
    };

    // Add a handler for saving edited mood
    const handleSaveEdit = async () => {
        if (!selectedMood || !selectedMood.logId) {
            console.error("Cannot save edit: No selected mood or log ID");
            setSelectedMood(null);
            return;
        }
        
        try {
            console.log(`Updating log with ID ${selectedMood.logId}`);
            // You would typically call your API here to update the log
            // const response = await logService.updateLog(selectedMood.logId, { description: editText });
            
            // For now, just close the modal and refresh data
            setSelectedMood(null);
            setEditText('');
            fetchMoodHistory();
        } catch (error) {
            console.error("Error updating mood:", error);
            setError("Failed to update mood. Please try again.");
        }
    };    // Handle profile image changes
    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Add handler for calendar day clicks - view only, no editing
    const handleCalendarClick = (day) => {
        // Find the mood for the selected day, if any
        const selectedDate = new Date(selectedYear, getMonthNumber(selectedMonth), day);
        const formattedDate = selectedDate.toISOString().split('T')[0];
        
        // Find if there's a log for this date
        const moodForDay = moodHistory.find(mood => {
            return new Date(mood.date).toISOString().split('T')[0] === formattedDate;
        });
        
        if (moodForDay) {
            // Just log info about the mood, no longer setting it for edit
            console.log(`Mood for ${formattedDate}: ${moodForDay.mood} - ${moodForDay.description}`);
            // We can optionally add a toast or alert to show the mood details
            alert(`${moodForDay.mood.charAt(0).toUpperCase() + moodForDay.mood.slice(1)}: ${moodForDay.description}`);
        } else {
            console.log(`No mood logged for ${formattedDate}`);
        }
    };    // Handle profile save
    const handleProfileSave = async () => {
        try {
            setIsLoading(true);
            setError(null);
            setSuccessMessage(null);
            console.log('Saving profile data:', editedProfile);
            
            // Prepare data for API
            const profileData = {
                fullname: editedProfile.fullName,
                username: editedProfile.username,
                email: editedProfile.email,
                birthday: editedProfile.birthday,
                gender: editedProfile.gender,
                interest: editedProfile.hobbies
            };
            
            // Use the updateProfileWithImage function to handle both profile data and image
            const result = await updateProfileWithImage(profileData, profileImage);
            
            if (result.success) {
                console.log('Profile updated successfully:', result.data);
                
                // Update local state with the returned data
                setUserData(prev => ({
                    ...prev,
                    fullName: result.data.fullname || editedProfile.fullName,
                    username: result.data.username || editedProfile.username,
                    email: result.data.email || editedProfile.email,
                    birthday: result.data.birthday || editedProfile.birthday,
                    gender: result.data.gender || editedProfile.gender,
                    hobbies: result.data.interest || editedProfile.hobbies,
                    profilePicture: result.data.user_image_url || result.data.profilePicture || prev.profilePicture
                }));
                  // Reset image states
                setProfileImage(null);
                setProfileImagePreview(null);
                
                // Set success message
                setSuccessMessage('Profile updated successfully!');
                
                // Close modal after a short delay to show success message
                setTimeout(() => {
                    setShowProfileEdit(false);
                    // Clear success message after modal is closed
                    setTimeout(() => setSuccessMessage(null), 500);
                }, 1500);
                
                // Set success message
                setSuccessMessage("Profile updated successfully!");
                
                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage(null);
                }, 3000);
            } else {
                setError('Failed to update profile: ' + result.message);
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('An unexpected error occurred while updating your profile');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Page transitions
    const pageVariants = {
        initial: {
            opacity: 0,
            y: 20
        },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4
            }
        },
        exit: {
            opacity: 0,
            y: -20,            transition: {
                duration: 0.3
            }
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-indigo-900 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    // Dummy data for today's mood preview section if needed
    const day = new Date().getDate();
    const currentDate = new Date();
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };
      // Get today's mood from mood history if available
    const getTodaysMood = () => {
        const today = new Date().toDateString();
        const todayEntry = moodHistory.find(entry => new Date(entry.date).toDateString() === today);
        
        if (todayEntry) {
            return {
                mood: todayEntry.mood,
                color: todayEntry.color,
                imageSrc: todayEntry.imageSrc,
                description: todayEntry.description,
                web_message: todayEntry.web_message
            };
        }
        
        // Default mood if no entry for today
        return {
            mood: todayMood || 'good',
            color: todayMood ? MOOD_COLORS[todayMood] : MOOD_COLORS.good,
            imageSrc: todayMood 
                ? `/src/assets/emotions/${todayMood.charAt(0).toUpperCase() + todayMood.slice(1)}.png` 
                : '/src/assets/emotions/Good.png',
            description: 'No mood logged for today yet. How are you feeling?',
            web_message: "Log your mood to get AI suggestions!"
        };
    };
      // Get the current mood
    const currentMood = getTodaysMood();

    // Helper function for web messages
    const getWebMessageForMood = (mood) => {
        if (mood === 'awesome') {
            return "Keep up the positive energy! Your excellent mood is a great foundation for your day.";
        } else if (mood === 'good') {
            return "You're doing well today. Remember to appreciate these good moments.";
        } else if (mood === 'okay') {
            return "It's okay to have average days. Take some time for self-care.";
        } else if (mood === 'bad') {
            return "Sorry to hear you're feeling down. Consider talking to someone you trust about your feelings.";
        } else if (mood === 'terrible') {
            return "I'm here for you during these difficult moments. Consider reaching out for support.";
        } else {
            return "I'm here to support you on your mental health journey.";
        }
    };

    return (
        <motion.div
            className="min-h-screen bg-blue-50 text-gray-800 font-sans mobile-container no-scroll-bounce"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
        >
            <Navbar userData={userData} />

            {/* Calendar Overlay */}<AnimatePresence>
                {showCalendar && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >                        <motion.div
                        className="bg-white rounded-3xl shadow-xl p-4 sm:p-8 w-full max-w-lg mx-4 sm:mx-auto relative"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    ><motion.button
                        onClick={() => setShowCalendar(false)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                                <X size={20} />
                            </motion.button>                            <h2 className="text-lg font-bold text-indigo-900 mb-2">Mood Calendar</h2>

                            {/* Month and Year selector */}                            <div className="flex justify-between items-center mb-4">
                                <div className="relative">
                                    <select
                                        className="appearance-none bg-blue-50 border border-blue-100 text-indigo-700 py-1.5 px-3 pr-8 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                    >
                                        <option value="January">January</option>
                                        <option value="February">February</option>
                                        <option value="March">March</option>
                                        <option value="April">April</option>
                                        <option value="May">May</option>
                                        <option value="June">June</option>
                                        <option value="July">July</option>
                                        <option value="August">August</option>
                                        <option value="September">September</option>
                                        <option value="October">October</option>
                                        <option value="November">November</option>
                                        <option value="December">December</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-indigo-600" />
                                </div>
                                <div className="relative">
                                    <select
                                        className="appearance-none bg-blue-50 border border-blue-100 text-indigo-700 py-1.5 px-3 pr-8 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                    >
                                        <option value="2023">2023</option>
                                        <option value="2024">2024</option>
                                        <option value="2025">2025</option>
                                        <option value="2026">2026</option>
                                        <option value="2027">2027</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-indigo-600" />
                                </div>
                            </div>

                            {/* Weekday headers */}
                            <div className="grid grid-cols-7 gap-1 sm:gap-3 text-center text-xs font-medium text-indigo-600 mb-2">
                                <div>Sun</div>
                                <div>Mon</div>
                                <div>Tue</div>
                                <div>Wed</div>
                                <div>Thu</div>
                                <div>Fri</div>
                                <div>Sat</div>
                            </div>
                            <div className="grid grid-cols-7 gap-1 sm:gap-3 text-center text-sm">
                                {/* Spacers for the first day offset */}
                                {Array.from({ length: firstDayOfSelectedMonth }).map((_, i) => (
                                    <div key={`empty-${i}`} className="w-10 h-10 sm:w-12 sm:h-12"></div>
                                ))}

                                {/* Days of the month */}
                                {Array.from({ length: daysInSelectedMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const mood = moodHistory.find((m) => m.day === day && m.month === selectedMonth);
                                    return (
                                        <motion.button
                                            key={day}
                                            className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-md flex items-center justify-center p-0 overflow-hidden"
                                            onClick={() => handleCalendarClick(day)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            title={mood ? `${mood.mood}: ${mood.description}` : 'No mood tracked'}
                                        >
                                            {mood ? (
                                                <>
                                                    <div
                                                        className="absolute inset-0"
                                                        style={{ backgroundColor: mood.color }}
                                                    />
                                                    {mood.imageSrc && (
                                                        <img
                                                            src={mood.imageSrc}
                                                            alt={mood.mood}
                                                            className="absolute top-0 left-0 w-full h-full object-contain p-1"
                                                        />
                                                    )}
                                                    <span className="absolute bottom-0 right-1 text-xs font-bold">{day}</span>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-semibold bg-blue-100 text-blue-800">
                                                    {day}
                                                </div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>            {/* Mood Edit Modal */}
            <AnimatePresence>
                {selectedMood && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.div
                            className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg w-full max-w-md mx-4 sm:mx-auto"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h3 className="text-lg font-bold text-indigo-900 mb-2">Edit Mood on Day {selectedMood.day}</h3>
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                rows={4}
                            />
                            <div className="mt-4 flex justify-end gap-2">
                                <motion.button
                                    onClick={() => setSelectedMood(null)}
                                    className="text-sm px-4 py-1 bg-gray-200 rounded"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    onClick={handleSaveEdit}
                                    className="text-sm px-4 py-1 bg-indigo-900 text-white rounded"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Save
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}            </AnimatePresence>

            {/* Profile Edit Modal */}
            <AnimatePresence>
                {showProfileEdit && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.div
                            className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h3 className="text-lg font-bold text-indigo-900 mb-4">Edit Your Profile</h3>

                            {/* Profile Image Upload */}
                            <div className="mb-6 flex flex-col items-center">
                                <div className="relative w-24 h-24 mb-3">
                                    <img 
                                        src={profileImagePreview || userData.profilePicture || '/src/assets/placeholder.jpg'}
                                        alt="Profile Preview" 
                                        className="w-full h-full rounded-full object-cover border-2 border-indigo-100"
                                    />
                                    <label htmlFor="profile-image-upload" className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-2 cursor-pointer shadow-md">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                            <circle cx="12" cy="13" r="4"></circle>
                                        </svg>
                                    </label>
                                    <input 
                                        id="profile-image-upload" 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden"
                                        onChange={handleProfileImageChange} 
                                    />
                                </div>
                                <p className="text-xs text-gray-500">Click the camera icon to change your profile picture</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editedProfile.fullName}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, fullName: e.target.value })}
                                        className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={editedProfile.username}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                                        className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={editedProfile.email}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                                        className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-2">
                                            Birthday
                                        </label>
                                        <input
                                            type="date"
                                            value={editedProfile.birthday}
                                            onChange={(e) => {
                                                // Calculate new age based on birthday
                                                const dob = new Date(e.target.value);
                                                const today = new Date();
                                                let age = today.getFullYear() - dob.getFullYear();
                                                const monthDiff = today.getMonth() - dob.getMonth();
                                                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                                                    age--;
                                                }

                                                setEditedProfile({
                                                    ...editedProfile,
                                                    birthday: e.target.value,
                                                    age: age.toString()
                                                });
                                            }}
                                            className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            max={new Date().toISOString().split('T')[0]} // Prevent future dates
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-2">
                                            Gender
                                        </label>
                                        <select
                                            value={editedProfile.gender}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, gender: e.target.value })}
                                            className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="non-binary">Non-binary</option>
                                            <option value="prefer-not-to-say">Prefer not to say</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Hobbies & Interests
                                    </label>
                                    <textarea
                                        value={editedProfile.hobbies}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, hobbies: e.target.value })}
                                        rows={3}
                                        className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>                                    <div className="mt-6 flex flex-col gap-3">                                {error && (
                                    <div className="text-red-500 text-sm bg-red-50 p-2 rounded-md">
                                        {error}
                                    </div>
                                )}
                                {successMessage && (
                                    <div className="text-green-500 text-sm bg-green-50 p-2 rounded-md">
                                        {successMessage}
                                    </div>
                                )}
                                {successMessage && (
                                    <div className="text-green-500 text-sm bg-green-50 p-2 rounded-md">
                                        {successMessage}
                                    </div>
                                )}
                                <div className="flex justify-end gap-3">
                                    <motion.button
                                        onClick={() => {
                                            setShowProfileEdit(false);
                                            setError(null);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        onClick={handleProfileSave}
                                        className={`px-4 py-2 rounded-lg text-white text-sm ${isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                        whileHover={isLoading ? {} : { scale: 1.03 }}
                                        whileTap={isLoading ? {} : { scale: 0.98 }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                <span>Saving...</span>
                                            </div>
                                        ) : 'Save Changes'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content with Proper Mobile Padding */}
            <div className="pt-20 px-4 sm:px-8 md:px-16 pb-10">
                {/* User profile section with responsive layout */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="relative"
                    >
                        <img
                            src={userData.profilePicture}
                            alt="Profile"
                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-md object-cover"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; e.target.onerror = null; }}
                        />
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowProfileEdit(true)}
                                className="w-8 h-8 flex items-center justify-center bg-indigo-100 rounded-full"
                            >
                                <Pencil size={14} className="text-indigo-700" />
                            </motion.button>
                        </div>
                    </motion.div>

                    <div className="text-center sm:text-left">
                        <motion.h1
                            className="text-2xl sm:text-3xl font-bold text-indigo-900"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            {userData.fullName}
                        </motion.h1>
                        <motion.p
                            className="text-gray-500 text-sm sm:text-base"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            @{userData.username}
                        </motion.p>
                    </div>

                    <div className="flex-grow"></div>

                    <motion.div
                        className="flex flex-col sm:flex-row items-center gap-4 mt-4 sm:mt-0"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                    >
                        {/* Streak card */}
                        <div className="bg-white rounded-xl shadow-sm p-4 w-full sm:w-auto flex items-center gap-3">
                            <div className="relative">
                                <div className="flame-container">
                                    <div className="flame-body"></div>
                                </div>
                                <div className="w-12 h-12 flex items-center justify-center bg-orange-100 rounded-full text-xl font-bold text-orange-500">
                                    {userData.streakDays}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Current streak</div>
                                <div className="text-xs text-gray-400">Keep it going!</div>
                            </div>
                        </div>

                        {/* Calendar button */}
                        <motion.button
                            className="w-full sm:w-auto bg-white rounded-xl shadow-sm p-3 px-4 flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowCalendar(true)}
                        >
                            <Calendar size={20} className="text-indigo-700" />
                            <span className="text-sm font-medium text-gray-600">Calendar View</span>
                        </motion.button>
                    </motion.div>
                </div>

                {/* User stats grid with responsive design */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 mb-8">
                    <motion.div
                        className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        <div className="text-2xl sm:text-3xl font-bold text-indigo-900">{userData.totalDays}</div>
                        <div className="text-xs sm:text-sm text-gray-500 mt-1">Total Days</div>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <div className="text-2xl sm:text-3xl font-bold text-green-500">{userData.goodDays}</div>
                        <div className="text-xs sm:text-sm text-gray-500 mt-1">Good Days</div>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                    >
                        <div className="text-2xl sm:text-3xl font-bold text-orange-500">{userData.stressedDays}</div>
                        <div className="text-xs sm:text-sm text-gray-500 mt-1">Stressed Days</div>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                    >
                        <div className="text-2xl sm:text-3xl font-bold text-purple-500">
                            {((userData.goodDays / userData.totalDays) * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 mt-1">Good Days %</div>
                    </motion.div>
                </div>

                {/* Mood Timeline header - more mobile friendly */}                <div className="mb-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg sm:text-xl font-bold text-indigo-900">Your Mood Timeline</h2>
                    </div>
                </div>

                {/* Main Section */}
                <main className="max-w-6xl mx-auto py-10 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <section className="space-y-6">
                        {/* Mood Today Card */}                    <div className="bg-white rounded-3xl shadow-md p-6 text-center">                            <h2 className="text-3xl font-bold text-indigo-900 mb-1">Day {day}!</h2>
                            <p className="text-sm text-gray-500 mb-4">May 2025</p><motion.div
                                className="mx-auto w-40 h-40 rounded-full overflow-hidden"
                                style={{ backgroundColor: currentMood.color }}
                                whileHover={{ scale: 1.05 }}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >                                <div className="w-full h-full flex items-center justify-center">
                                    <img
                                        src={currentMood.imageSrc}
                                        alt={currentMood.mood}
                                        className="w-28 h-28 object-contain"
                                        onError={(e) => {
                                            e.target.src = "/src/assets/placeholder.jpg";
                                        }}
                                    />
                                </div>
                            </motion.div>                            <p className="mt-3 text-sm text-gray-500">{formatDate(currentDate)}</p>
                            <p className="mt-4 text-gray-700 text-sm italic">"{currentMood.description}"</p>
                            <div className="mt-4 p-3 bg-[#F5F9FF] rounded-xl border border-[#CEDEFF] text-sm">
                                {currentMood.web_message}
                            </div>
                            
                            {/* Add button to update today's mood */}
                            <motion.button
                                className="mt-4 px-4 py-2 bg-indigo-600 rounded-full text-white text-sm hover:bg-indigo-700 flex items-center gap-1 mx-auto"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleUpdateMood}
                            >
                                <RefreshCcw size={16} /> Update Today's Mood
                            </motion.button>
                        </div>                    {/* Profile Section */}                    <div className="bg-white rounded-3xl shadow-md p-6">
                            <h3 className="text-lg font-bold text-indigo-900 mb-4">Your Profile</h3>
                            <div className="flex items-start gap-4">
                                <motion.img
                                    src={userData.profilePicture}
                                    alt="Profile"
                                    className="w-20 h-20 rounded-full border-2 border-[#CEDEFF] object-cover"
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                />
                                <div className="text-sm text-gray-700 space-y-1.5 flex-1">
                                    <p className="font-medium text-indigo-900">{userData.fullName}</p>
                                    <p className="flex items-center gap-1">
                                        <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">@{userData.username}</span>
                                    </p>
                                    <p>{userData.email}</p>
                                    <div className="flex gap-2 items-center">
                                        <p>{userData.age} years</p>
                                        <span className="text-gray-400">•</span>
                                        <p className="capitalize">{userData.gender}</p>
                                    </div>
                                    <p className="text-xs text-gray-500">Born on {userData.birthday ? new Date(userData.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</p>
                                </div>
                            </div>                            {/* Hobbies Section */}
                            <div className="mt-4 bg-indigo-50 p-3 rounded-lg">
                                <h4 className="text-xs font-semibold text-indigo-700 mb-1">Hobbies & Interests</h4>
                                <p className="text-xs text-gray-600">{userData.interest}</p>
                            </div><motion.button
                                className="mt-4 px-4 py-2 border rounded-full text-indigo-900 text-sm hover:bg-[#F5F9FF] transition flex items-center gap-1"
                                whileHover={{ scale: 1.05, backgroundColor: "#f9fafb" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setEditedProfile({
                                        fullName: userData.fullName || "",                                        username: userData.username || "",
                                        email: userData.email || "",
                                        birthday: userData.birthday || "",
                                        gender: userData.gender || "",
                                        hobbies: userData.interest || "",
                                        user_image_url: userData.profilePicture || ""
                                    });                                    setError(null);
                                    setSuccessMessage(null);
                                    setShowProfileEdit(true);
                                }}
                            >                                <Pencil size={14} /> Edit Profile
                            </motion.button>
                        </div>
                    </section>
                    
                    {/* Right Column */}
                    <section className="lg:col-span-2 space-y-6">
                        {/* Mood History Section */}<MoodHistoryTimeline
                            moodHistoryData={moodHistory}
                            onCalendarOpen={() => setShowCalendar(true)}
                            onDeleteLog={handleDeleteLog}
                            isDeleting={isDeleting}
                            deleteLogId={deleteLogId}
                        />

                        {/* Weekly Mood Tracker */}                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">                        
                            {/* Weekly Mood Overview Card */}
                            <div className="bg-white rounded-3xl shadow-md p-6">
                                <h4 className="text-center text-indigo-900 font-semibold mb-4">Weekly Mood Overview</h4>
                                <div className="flex justify-around text-center mb-4">
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <div className="text-2xl font-bold text-indigo-900">{userData.totalDays}</div>
                                        <div className="text-xs text-gray-500">Days Tracked</div>
                                    </motion.div>
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <div className="text-2xl font-bold text-green-500">{userData.goodDays}</div>
                                        <div className="text-xs text-gray-500">Good Days</div>
                                    </motion.div>
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <div className="text-2xl font-bold text-orange-500">{userData.stressedDays}</div>
                                        <div className="text-xs text-gray-500">Stressed Days</div>
                                    </motion.div>
                                </div>
                                <div className="h-32 bg-white rounded-xl flex items-end justify-around p-2">
                                    {weeklyMoodData.map((v, i) => (
                                        <motion.div
                                            key={i}
                                            className="w-4 bg-indigo-900 rounded-full rounded-b-none"
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(v / maxMoodValue) * 100}%` }}
                                            transition={{ duration: 0.8, delay: 0.2 + (i * 0.1), ease: "backOut" }}
                                        ></motion.div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Streak Card */}
                            <div className="bg-white rounded-3xl shadow-md p-6 text-center">
                                <h4 className="text-center text-indigo-900 font-semibold mb-3">Your Current Streak</h4>
                                <motion.div
                                    className="flame-wrapper py-2"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                                >
                                    <div className="fire">
                                        <div className="fire-left">
                                            <div className="main-fire"></div>
                                            <div className="particle-fire"></div>
                                        </div>
                                        <div className="fire-center">
                                            <div className="main-fire"></div>
                                            <div className="particle-fire"></div>
                                        </div>
                                        <div className="fire-right">
                                            <div className="main-fire"></div>
                                            <div className="particle-fire"></div>
                                        </div>
                                        <div className="fire-bottom">
                                            <div className="main-fire"></div>
                                        </div>
                                    </div>
                                    <span className="streak-number">
                                        {userData.streakDays}
                                    </span>
                                </motion.div>
                                  <div className="flex justify-center gap-2 sm:gap-5 mt-4 overflow-hidden">
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                        <motion.div
                                            key={`day-${i}`}
                                            className="flex flex-col items-center"
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.2 + (i * 0.1) }}
                                        >
                                            <div className="w-6 h-6 rounded-full bg-indigo-900 flex items-center justify-center text-white text-xs mb-1">
                                                {i + 1}
                                            </div>
                                            <div className="text-xs text-gray-500">{day}</div>
                                        </motion.div>
                                    ))}
                                </div>
                                
                                <div className="mt-6 py-2 bg-yellow-50 rounded-full px-4">
                                    <p className="text-sm text-amber-800 font-medium">
                                        🎉 Congratulations on your {userData.streakDays} streak!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            <footer className="bg-indigo-900 text-white py-6 text-center text-sm">
                <p>YouMatter — Taking care of your mental health</p>
                <p className="text-indigo-300">&copy; {new Date().getFullYear()} YouMatter. All rights reserved.</p>            </footer>
        </motion.div>
    );
}
