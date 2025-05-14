import { useState, useRef, useEffect } from "react";

const App = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [startX, setStartX] = useState(null);
  const [mood, setMood] = useState("Awesome");
  const sliderRef = useRef(null);
  
  // Mock images for demo purposes
  const mockImages = {
    logo: "/api/placeholder/40/40",
    macbook: "/api/placeholder/800/500",
    moodImage: "/api/placeholder/300/300",
    emotionsImage: "/api/placeholder/400/320"
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
    { name: "Sad", emoji: "😢", color: "bg-pink-300" },
    { name: "Stressed", emoji: "😫", color: "bg-orange-400" }
  ];
  
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleContinue = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      alert("Welcome to YouMatter! Starting your journey...");
    }
  };
  
  const handleSkip = () => {
    alert("Skipped onboarding. Welcome to YouMatter!");
  };
  
  // Mood selection component
  const MoodSelector = () => (
    <div className="flex flex-col items-center justify-center mt-10 rounded-lg w-full h-full">
      <img src="src\assets\image 22.png"/>
    </div>
  );
  
  // Dashboard preview component
  const DashboardPreview = () => (
    <div className="flex flex-col items-center justify-center bg-blue-50 p-6 rounded-lg w-full h-full">
      <h3 className="text-lg font-medium text-gray-700 mb-4">Your Mood Dashboard</h3>
      
      <div className="w-full flex justify-around mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-900">12</div>
          <div className="text-xs text-gray-500">Days Tracked</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">8</div>
          <div className="text-xs text-gray-500">Good Days</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-500">4</div>
          <div className="text-xs text-gray-500">Stressed Days</div>
        </div>
      </div>
      
      <div className="w-full h-32 bg-white rounded-lg flex items-end justify-around p-2">
        {[30, 50, 20, 60, 40, 70, 30].map((height, i) => (
          <div key={i} className="w-4 bg-indigo-900 rounded-t-sm" style={{height: `${height}%`}}></div>
        ))}
      </div>
      
      <p className="text-xs text-gray-500 mt-4">Weekly Mood Overview</p>
    </div>
  );
  
  // Streak preview component
  const StreakPreview = () => (
    <div className="flex flex-col items-center justify-center bg-blue-50 p-6 rounded-lg w-full h-full">
      <h3 className="text-lg font-medium text-gray-700 mb-4">Your Current Streak</h3>
      
      <div className="text-6xl font-bold text-indigo-900 mb-2">7</div>
      <p className="text-sm text-gray-600 mb-6">days in a row!</p>
      
      <div className="w-full flex justify-around mb-4">
        {[1,2,3,4,5,6,7].map(day => (
          <div key={day} className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center text-white text-xs mb-1">
              {day}
            </div>
            <div className="text-xs text-gray-500">{['M','T','W','T','F','S','S'][day-1]}</div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 px-4 py-2 bg-yellow-100 rounded-lg text-sm text-yellow-800">
        🎉 Congratulations on your weekly streak!
      </div>
    </div>
  );
  
  // Emotions group component for final slide
  const EmotionsGroup = () => (
    <div className="flex flex-col items-center justify-center bg-blue-50 p-6 rounded-lg w-full h-full">
      <img src="src\assets\emotions.png" alt="YouMatter Logo" className="" />
    </div>
  );
  
  // Function to render the appropriate content based on current slide
  const renderSlideContent = () => {
    switch(currentSlide) {
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
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="w-full py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src={mockImages.logo}
            alt="YouMatter Logo" 
            className="w-10 h-10 mr-3"
          />
          <h1 className="text-2xl font-bold text-indigo-900">YouMatter</h1>
        </div>
        <div className="flex items-center">
          <button className="text-lg font-medium text-indigo-900 mr-4">Dashboard</button>
          <button className="px-4 py-1 text-md font-medium text-indigo-900 border-2 border-blue-400 rounded-full">
            Sign In
          </button>
        </div>
      </header>
      
      {/* Content Area */}
      <main className="py-4 px-4" ref={sliderRef}>
        {/* Device Frame */}
        <div className="max-w-4xl mx-auto">
          {/* Laptop Mockup Frame */}
          <div className="relative w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center p-6 shadow-xl">
            {/* Laptop Top Part */}
            <div className="w-full h-full bg-gray-800 rounded-lg overflow-hidden flex flex-col relative">
              {/* Camera Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-lg z-10"></div>
              
              {/* Screen Content Area */}
              <div className="w-full h-full bg-[#F5F9FF] p-1 flex flex-col items-center justify-center">
                {/* This is where the slide content displays properly inside the MacBook */}
                <div className="w-full h-full max-w-md mx-auto">
                  {renderSlideContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Welcome Text Section */}
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-indigo-900">{slides[currentSlide].title}</h2>
          {slides[currentSlide].subtitle && (
            <h3 className="text-xl font-bold text-gray-500 mb-2">{slides[currentSlide].subtitle}</h3>
          )}
          <p className="text-md text-gray-600 max-w-md mx-auto mb-6">
            {slides[currentSlide].description}
          </p>
        </div>
        
        {/* Navigation Dots */}
        <div className="flex justify-center mt-4 space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-8 h-2 rounded-full ${index === currentSlide ? 'bg-indigo-900' : 'bg-gray-300'}`}
            />
          ))}
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-center space-x-6 mt-6">
          {currentSlide < 3 ? (
            <>
              <button 
                onClick={handleSkip}
                className="px-8 py-3 text-md font-medium text-gray-600 bg-white rounded-full shadow"
              >
                Skip
              </button>
              <button 
                onClick={handleContinue}
                className="px-8 py-3 text-md font-medium text-white bg-indigo-900 rounded-full shadow"
              >
                Continue
              </button>
            </>
          ) : (
            <button 
              onClick={handleContinue}
              className="px-12 py-3 text-md font-medium text-white bg-indigo-900 rounded-full shadow w-64"
            >
              Get Started!
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;