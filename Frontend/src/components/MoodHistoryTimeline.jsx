import { useState } from 'react';
import { Calendar, Filter, Edit, ChevronDown, ExternalLink, Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import the same mood colors from Dashboard
const MOOD_COLORS = {
    awesome: "#FDDD6F", // Yellow
    good: "#46CD87",    // Green
    okay: "#FF8AA6",    // Pink
    bad: "#FF7D35",     // Orange
    terrible: "#9FC0FF"  // Light Blue
};

export default function MoodHistoryTimeline({ moodHistoryData, onCalendarOpen, onDeleteLog, isDeleting, deleteLogId }) {
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
      // Log the incoming data
    console.log("MoodHistoryTimeline received data:", moodHistoryData);
    console.log("MoodHistoryTimeline checking tags and insights:", 
        moodHistoryData.map(mood => ({
            id: mood.id,
            tags: mood.tags, 
            tags_type: Array.isArray(mood.tags) ? 'array' : typeof mood.tags,
            ai_insight: mood.ai_insight
        }))
    );

    // Group moods by month
    const groupByMonth = () => {
        const months = Array.from(new Set(moodHistoryData.map(mood => mood.month)));
        return months.map(month => ({
            month,
            moods: moodHistoryData.filter(mood => mood.month === month)
        }));
    };

    const groupedMoods = groupByMonth();    // Handle delete log
    const handleDelete = (e, logId) => {
        e.stopPropagation();
        setConfirmDelete(logId);
    };

    // Confirm delete
    const confirmDeleteLog = (logId) => {
        if (onDeleteLog) {
            onDeleteLog(logId);
        }
        setConfirmDelete(null);
    };

    return (
        <div className="bg-white rounded-3xl shadow-md p-6">
            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {confirmDelete && (
                    <motion.div 
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className="bg-white rounded-xl p-5 m-4 max-w-sm w-full shadow-lg"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-red-100 p-2 rounded-full">
                                    <AlertTriangle className="text-red-500 w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Delete Mood Log</h3>
                            </div>
                            <p className="text-gray-600 mb-5">Are you sure you want to delete this mood log? This action cannot be undone.</p>
                            <div className="flex justify-end gap-3">
                                <button 
                                    onClick={() => setConfirmDelete(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => confirmDeleteLog(confirmDelete)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex justify-between items-center mb-5">
                <div>
                    <h3 className="text-xl font-bold text-indigo-800">Mood History</h3>
                    <p className="text-sm text-gray-500 mt-1">Track your journeys</p>
                </div>                <div className="flex gap-3">          
                    <button
                        onClick={onCalendarOpen}
                        className="flex items-center text-sm text-indigo-600 border border-blue-100 px-4 py-1.5 rounded-full"
                    >
                        <Calendar size={16} className="mr-1.5" /> Calendar
                    </button>
                </div>
            </div>

            {/* Empty state when no mood data available */}
            {moodHistoryData.length === 0 && (
                <div className="text-center py-10">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar size={24} className="text-indigo-500" />
                    </div>
                    <h4 className="text-lg font-medium text-indigo-900">No mood logs yet</h4>
                    <p className="text-gray-500 mt-2 max-w-xs mx-auto">
                        Your mood history will appear here once you start logging your daily moods.
                    </p>
                </div>
            )}

            {/* Timeline */}
            {moodHistoryData.length > 0 && (
                <div className="relative px-2 py-6 mt-4">
                    {/* Timeline line */}
                    <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-blue-100 to-blue-200"></div>

                    {groupedMoods.map((group, groupIndex) => (
                        <div key={group.month}>
                            {/* Month divider (except for first month) */}
                            {groupIndex > 0 && (
                                <div className="text-center py-6 my-8 relative">
                                    <div className="flex items-center justify-center">
                                        <div className="h-px bg-blue-100 w-20"></div>
                                        <div className="text-indigo-600 font-semibold text-center text-lg px-4">
                                            {group.month} 2025
                                        </div>
                                        <div className="h-px bg-blue-100 w-20"></div>
                                    </div>
                                </div>
                            )}

                            {/* Moods for this month */}
                            {group.moods.map((mood, index) => (
                                <div key={`${mood.id || `${mood.month}-${mood.day}-${index}`}`} className="flex items-start mb-16 relative">
                                    {/* Date indicator with blurry circle backdrop */}
                                    <div className="flex flex-col items-center w-14 mr-4 relative z-10">
                                        <div className="absolute w-16 h-16 rounded-full bg-white shadow-sm filter blur-[6px] opacity-90"></div>
                                        <div className="text-4xl font-bold leading-none relative" style={{ color: mood.textColor || mood.color }}>{mood.day}</div>
                                        <div className="text-sm font-medium mt-0.5 relative" style={{ color: `${mood.textColor || mood.color}99` }}>{mood.weekday}</div>
                                    </div>

                                    {/* Mood emoji circle */}
                                    <div className="relative mr-4 z-10">
                                        <div
                                            className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm overflow-hidden"
                                            style={{ backgroundColor: mood.color }}
                                        >
                                            <img
                                                src={mood.imageSrc}
                                                alt={mood.mood}
                                                className="w-11 h-11 object-contain"
                                                onError={(e) => {
                                                    e.target.src = "/src/assets/placeholder.jpg";
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Mood card */}
                                    <motion.div
                                        className="flex-1 rounded-3xl p-5 relative ml-1 shadow-sm"
                                        style={{ backgroundColor: `${mood.color}30` }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-semibold text-base text-indigo-900">{mood.mood}</h4>
                                                <p className="text-sm text-gray-600 mt-0.5">"{mood.description}"</p>
                                            </div>
                                            <div className="flex items-center">
                                                <button
                                                    onClick={(e) => handleDelete(e, mood.id)}
                                                    disabled={isDeleting && deleteLogId === mood.id}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors relative"
                                                    title="Delete this log"
                                                >
                                                    {isDeleting && deleteLogId === mood.id ? (
                                                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors"
                                                >
                                                    <ChevronDown
                                                        size={16}
                                                        className={`${expandedIndex === index ? 'rotate-180' : ''} transition-transform duration-300`}
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded view */}
                                        {expandedIndex === index && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="mt-4 text-sm overflow-hidden"
                                            >
                                                <div className="bg-white bg-opacity-70 p-4 rounded-2xl">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="h-1 w-1 rounded-full bg-indigo-400"></div>
                                                        <span className="text-indigo-800 font-medium">Tags</span>
                                                    </div>                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {Array.isArray(mood.tags) && mood.tags.length > 0 ? (
                                                            mood.tags.map((tag, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="px-3 py-1 bg-white rounded-full text-xs text-indigo-600 font-medium shadow-sm"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-500">No tags available</span>
                                                        )}                                                    </div>                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="h-1 w-1 rounded-full bg-indigo-400"></div>
                                                        <span className="text-indigo-800 font-medium">AI Insight</span>
                                                    </div>                                                    <p className="text-gray-600">
                                                        {mood.ai_insight ? mood.ai_insight : "AI insight is being generated. Check back soon!"}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
