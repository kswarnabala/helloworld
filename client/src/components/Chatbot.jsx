import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm your AI Agriculture Assistant. I can help you with irrigation recommendations, crop health, and water management. How can I assist you today?",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate bot response (you can integrate with your backend API)
        setTimeout(() => {
            const botResponse = generateBotResponse(input);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: botResponse,
                sender: 'bot',
                timestamp: new Date()
            }]);
            setIsTyping(false);
        }, 1000);
    };

    const generateBotResponse = (userInput) => {
        const lowerInput = userInput.toLowerCase();

        if (lowerInput.includes('irrigation') || lowerInput.includes('water')) {
            return "Based on current soil moisture and weather conditions, I recommend checking the irrigation schedule. Optimal irrigation timing is usually early morning (6-7 AM) to minimize evaporation. Would you like me to check your current irrigation recommendations?";
        }

        if (lowerInput.includes('moisture') || lowerInput.includes('soil')) {
            return "Soil moisture levels are critical for crop health. The ideal range varies by crop type - for example, Wheat needs 30-50% moisture, while Rice needs 40-70%. Check your dashboard for real-time moisture readings and recommendations.";
        }

        if (lowerInput.includes('crop') || lowerInput.includes('health')) {
            return "Crop health depends on multiple factors: soil moisture, NPK levels (Nitrogen, Phosphorus, Potassium), temperature, and humidity. Your dashboard shows a comprehensive health score. Would you like specific recommendations for improving crop health?";
        }

        if (lowerInput.includes('fertilizer') || lowerInput.includes('nutrient')) {
            return "NPK levels are essential for crop growth. Nitrogen promotes leaf growth, Phosphorus supports root development, and Potassium enhances overall plant health. Check your analytics tab for nutrient trends and recommendations.";
        }

        if (lowerInput.includes('anomaly') || lowerInput.includes('alert') || lowerInput.includes('problem')) {
            return "I can help you understand alerts and anomalies. Common issues include: dry stress (moisture too low), over-irrigation (moisture too high), and potential leaks (sudden moisture drops). Check the Alerts tab for detailed information.";
        }

        if (lowerInput.includes('savings') || lowerInput.includes('efficiency')) {
            return "Water savings are calculated by comparing optimized irrigation schedules with fixed schedules. Our AI system typically saves 30-45% water by irrigating only when needed, based on real-time soil and weather data.";
        }

        if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
            return "Hello! I'm here to help with your precision agriculture needs. You can ask me about irrigation, crop health, soil moisture, fertilizers, alerts, or water savings.";
        }

        return "I understand you're asking about: " + userInput + ". For detailed information, please check your dashboard tabs: Dashboard (overview), Analytics (trends), Crops (crop-specific data), Fields (multi-field view), and Alerts (anomaly detection). How else can I help?";
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Chatbot Toggle Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-agri-green-500 text-white rounded-full shadow-[0_0_30px_rgba(34,197,94,0.5)] flex items-center justify-center z-50 hover:bg-agri-green-600 transition-colors"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </motion.button>

            {/* Chatbot Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-24 right-6 w-96 h-[600px] bg-[#0c0c0c] border border-agri-green-500/30 rounded-3xl shadow-[0_0_50px_rgba(34,197,94,0.3)] flex flex-col z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-agri-green-500/20 to-agri-blue-500/20 p-4 border-b border-agri-green-500/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-agri-green-500 rounded-full flex items-center justify-center">
                                    <Bot size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-black text-white text-sm uppercase">AI Assistant</h3>
                                    <p className="text-xs text-slate-400">Precision Agriculture Helper</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {message.sender === 'bot' && (
                                        <div className="w-8 h-8 bg-agri-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Bot size={16} className="text-agri-green-500" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[75%] rounded-2xl p-3 ${
                                            message.sender === 'user'
                                                ? 'bg-agri-green-500 text-white'
                                                : 'bg-white/5 text-slate-200 border border-white/10'
                                        }`}
                                    >
                                        <p className="text-sm leading-relaxed">{message.text}</p>
                                        <p className="text-xs mt-1 opacity-60">
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    {message.sender === 'user' && (
                                        <div className="w-8 h-8 bg-agri-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                            <User size={16} className="text-agri-green-500" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3 justify-start"
                                >
                                    <div className="w-8 h-8 bg-agri-green-500/20 rounded-full flex items-center justify-center">
                                        <Bot size={16} className="text-agri-green-500" />
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                                        <div className="flex gap-1">
                                            <motion.div
                                                className="w-2 h-2 bg-agri-green-500 rounded-full"
                                                animate={{ y: [0, -8, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                            />
                                            <motion.div
                                                className="w-2 h-2 bg-agri-green-500 rounded-full"
                                                animate={{ y: [0, -8, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                            />
                                            <motion.div
                                                className="w-2 h-2 bg-agri-green-500 rounded-full"
                                                animate={{ y: [0, -8, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask about irrigation, crops, moisture..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-agri-green-500/50"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleSend}
                                    className="w-12 h-12 bg-agri-green-500 text-white rounded-xl flex items-center justify-center hover:bg-agri-green-600 transition-colors"
                                >
                                    <Send size={18} />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chatbot;

