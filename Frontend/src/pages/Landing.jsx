// Modified Landing component with fixed footer
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";

const Landing = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [startX, setStartX] = useState(null);
  const [mood, setMood] = useState("Awesome");
  const sliderRef = useRef(null);

  // Mock images for demo purposes
  const mockImages = {
    logo: "/src/assets/logo.png",
    macbook: "/api/placeholder/800/500",
    moodImage: "/api/placeholder/300/300",
    emotionsImage: "/api/placeholder/400/320"
  };
  // Mock user data (not logged in)
  const userData = {
    loggedIn: false
  };

  // Development function for easy dashboard access
  const accessDashboard = () => {
    navigate('/dashboard');
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

  // Slide transitions
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: (direction) => ({
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: "easeIn"
      }
    })
  };

  const slides = [
    {
      title: "Welcome to YouMatter",
      subtitle: "Track Your Daily Moods!",
      description: "Easily log your emotions and activities every day to gain valuable insights on your mental wellbeing.",
      imagePlaceholder: "mood-selector",
      showMoodTracker: true
    },
    {
      title: "Gain Valuable Mood Insights",
      subtitle: "",
      description: "Monitor your progress with mood counts, activity counts, etc to enhance your mood.",
      imagePlaceholder: "dashboard",
      showMoodTracker: false
    },
    {
      title: "Stay Motivated with Achievements!",
      subtitle: "",
      description: "Earn streaks as you track your mood, making your journey to better mental health more engaging.",
      imagePlaceholder: "streak",
      showMoodTracker: false
    },
    {
      title: "Join YouMatter Today",
      subtitle: "",
      description: "Start your journey to better mental health with daily tracking and insights.",
      imagePlaceholder: "emotions-group",
      showMoodTracker: false,
      finalSlide: true
    }
  ];

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (startX === null) return;

    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;

    // Prevent default to stop page scrolling
    if (Math.abs(diff) > 5) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e) => {
    if (startX === null) return;

    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    // Swipe threshold
    if (diff > 50 && currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else if (diff < -50 && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }

    setStartX(null);
  };

  const handleDragStart = (e) => {
    setStartX(e.clientX);
  };

  const handleDragEnd = (e) => {
    if (startX === null) return;

    const endX = e.clientX;
    const diff = startX - endX;

    // Swipe threshold
    if (diff > 50 && currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else if (diff < -50 && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }

    setStartX(null);
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    slider.addEventListener('touchstart', handleTouchStart, { passive: false });
    slider.addEventListener('touchmove', handleTouchMove, { passive: false });
    slider.addEventListener('touchend', handleTouchEnd);

    slider.addEventListener('mousedown', handleDragStart);
    slider.addEventListener('mouseup', handleDragEnd);

    return () => {
      slider.removeEventListener('touchstart', handleTouchStart);
      slider.removeEventListener('touchmove', handleTouchMove);
      slider.removeEventListener('touchend', handleTouchEnd);
      slider.removeEventListener('mousedown', handleDragStart);
      slider.removeEventListener('mouseup', handleDragEnd);
    };
  }, [currentSlide, startX]);

  // Mood options
  const moods = [
    { name: "Awesome", emoji: "😊", color: "bg-yellow-300" },
    { name: "Good", emoji: "🙂", color: "bg-green-300" },
    { name: "Okay", emoji: "😐", color: "bg-blue-200" },
    { name: "Bad", emoji: "😢", color: "bg-pink-300" },
    { name: "Terrible", emoji: "😫", color: "bg-orange-400" }
  ];

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };  
  
  const handleContinue = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Navigate to dashboard instead of showing alert
      navigate('/dashboard');
    }
  };

  const handleSkip = () => {
    // Navigate to fill page to input mood first when skipping the onboarding
    navigate('/signin');
  };

  const handleSignIn = () => {
    // Navigate to sign in page or open sign in modal
    navigate('/signin');
  };

  // Mood selection component with animation
  const MoodSelector = () => (
    <motion.div
      className="flex flex-col items-center justify-center rounded-lg w-full h-full overflow-hidden"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <img
        src="/src/assets/image 22.png"
        alt="Mood Selection"
        className="object-contain w-full h-full max-h-[90%] hover:scale-105 transition-transform duration-300"
      />
    </motion.div>
  );

  // Dashboard preview component with animation
  const DashboardPreview = () => (
    <motion.div
      className="flex flex-col items-center justify-center bg-blue-50 p-3 rounded-lg w-full h-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="text-lg font-medium text-gray-700 mb-2">Your Mood Dashboard</h3>

      <div className="w-full flex justify-around mb-2">
        <motion.div
          className="text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-2xl font-bold text-indigo-900">12</div>
          <div className="text-xs text-gray-500">Days Tracked</div>
        </motion.div>
        <motion.div
          className="text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-2xl font-bold text-green-500">8</div>
          <div className="text-xs text-gray-500">Good Days</div>
        </motion.div>
        <motion.div
          className="text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-2xl font-bold text-orange-500">4</div>
          <div className="text-xs text-gray-500">Stressed Days</div>
        </motion.div>
      </div>

      <div className="w-full h-24 bg-white rounded-lg flex items-end justify-around p-2">
        {[30, 50, 20, 60, 40, 70, 30].map((height, i) => (
          <motion.div
            key={i}
            className="w-3 bg-indigo-900 rounded-t-sm"
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ duration: 0.8, delay: 0.2 + (i * 0.1), ease: "backOut" }}
          ></motion.div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-2">Weekly Mood Overview</p>
    </motion.div>
  );

  // Streak preview component with animation
  const StreakPreview = () => (
    <motion.div
      className="flex flex-col items-center justify-center bg-blue-50 p-3 rounded-lg w-full h-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-medium text-gray-700 mb-2">Your Current Streak</h3>

      <motion.div
        className="text-5xl font-bold text-indigo-900 mb-1"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
      >7</motion.div>
      <p className="text-sm text-gray-600 mb-3">days in a row!</p>

      <div className="w-full flex justify-around mb-2">
        {[1, 2, 3, 4, 5, 6, 7].map((day, i) => (
          <motion.div
            key={day}
            className="flex flex-col items-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + (i * 0.1) }}
          >
            <div className="w-6 h-6 rounded-full bg-indigo-900 flex items-center justify-center text-white text-xs mb-1">
              {day}
            </div>
            <div className="text-xs text-gray-500">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][day - 1]}</div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-2 px-4 py-1 bg-yellow-100 rounded-lg text-xs text-yellow-800"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.0 }}
      >
        🎉 Congratulations on your weekly streak!
      </motion.div>
    </motion.div>
  );  
  
  // Emotions group component for final slide with animation
  const EmotionsGroup = () => (
    <motion.div
      className="flex flex-col items-center justify-center w-full h-full overflow-hidden"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.img
        src="/src/assets/emotions.png"
        alt="YouMatter Mascots"
        className="object-contain w-auto h-auto max-w-full max-h-full px-4"
        whileHover={{ rotate: [0, -5, 5, -5, 0], transition: { duration: 0.5 } }}
      />
    </motion.div>
  );

  // Function to render the appropriate content based on current slide
  const renderSlideContent = () => {
    switch (currentSlide) {
      case 0:
        return <MoodSelector />;
      case 1:
        return <DashboardPreview />;
      case 2:
        return <StreakPreview />;
      case 3:
        return <EmotionsGroup />;
      default:
        return <MoodSelector />;
    }
  }; 
  
  return (
    <motion.div
      className="min-h-screen bg-blue-50 mobile-container no-scroll-bounce overflow-x-hidden flex flex-col"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {/* Using the common Navbar component */}
      <Navbar userData={userData} />

      {/* Content Area */}
      <main className="py-2 px-2 sm:py-4 sm:px-4 pt-20 flex-grow pb-24" ref={sliderRef}>
        {/* Device Frame */}
        <div className="max-w-4xl mx-auto">
          {/* Laptop Mockup Frame */}
          <motion.div
            className="relative w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center p-2 sm:p-4 md:p-6 shadow-xl"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* Laptop Top Part */}
            <div className="w-full h-full bg-gray-800 rounded-lg overflow-hidden flex flex-col relative">
              {/* Camera Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 sm:w-32 h-4 sm:h-6 bg-black rounded-b-lg z-10"></div>

              {/* Screen Content Area */}
              <div className="w-full h-full bg-[#F5F9FF] p-1 flex flex-col items-center justify-center">
                {/* This is where the slide content displays properly inside the MacBook */}
                <div className="w-full h-full max-w-md mx-auto flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      custom={currentSlide}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="h-full w-full p-2 flex items-center justify-center"
                    >
                      {renderSlideContent()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Below Screen */}
          <div className="mt-6 sm:mt-10 px-4">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <h2 className="text-xl sm:text-3xl font-bold text-indigo-900 mb-2 sm:mb-3">
                {slides[currentSlide].title}
              </h2>
              {slides[currentSlide].subtitle && (
                <p className="text-base sm:text-xl text-indigo-700 mb-1 sm:mb-2">
                  {slides[currentSlide].subtitle}
                </p>
              )}
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8">
                {slides[currentSlide].description}
              </p>
            </motion.div>

            {/* Navigation Dots */}
            <motion.div
              className="flex justify-center gap-2 sm:gap-3 mb-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full touch-target ${currentSlide === index ? 'bg-indigo-900' : 'bg-indigo-200'
                    }`}
                  style={{ minHeight: 20, minWidth: 20 }}
                />
              ))}
            </motion.div>
            
            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              {/* Back button (only shown after first slide) */}
              {currentSlide > 0 ? (
                <motion.button
                  className="text-sm sm:text-base text-indigo-800 px-4 py-2 sm:px-6 sm:py-2 rounded-full hover:bg-indigo-50 touch-target"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentSlide(currentSlide - 1)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ minHeight: 44 }}
                >
                  Back
                </motion.button>
              ) : (
                <div></div> // Empty div to maintain layout
              )}

              <div className="flex gap-2 sm:gap-3">
                {/* Only show Skip button if not on final slide */}
                {!slides[currentSlide].finalSlide && (
                  <motion.button
                    className="text-sm sm:text-base text-gray-500 px-4 py-2 sm:px-6 sm:py-2 rounded-full hover:bg-gray-100 touch-target"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSkip}
                    style={{ minHeight: 44 }}
                  >
                    Skip
                  </motion.button>
                )}
                
                {/* Show either Continue or Sign In button based on slide */}
                <motion.button
                  className="text-sm sm:text-base bg-indigo-900 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-full hover:bg-indigo-800 touch-target min-h-[44px]"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={slides[currentSlide].finalSlide ? handleSignIn : handleContinue}
                  style={{ minHeight: 44 }}
                >
                  {slides[currentSlide].finalSlide ? 'Sign In' : 'Continue'}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Fixed footer at the bottom */}
      <footer className="bg-indigo-900 text-white py-6 text-center text-sm fixed bottom-0 left-0 w-full">
        <p>YouMatter — Taking care of your mental health</p>
        <p className="text-indigo-300">&copy; {new Date().getFullYear()} YouMatter. All rights reserved.</p>
      </footer>
    </motion.div>
  );
};

export default Landing;