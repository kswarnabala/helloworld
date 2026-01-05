import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Activity, Droplet, Thermometer, Wind, Zap, AlertTriangle, CheckCircle,
    TrendingUp, FlaskConical, Settings, Sprout, Bell, Droplets, Sun,
    ChevronRight, Database, Table, Clock, Gauge, MapPin, BarChart3,
    CloudRain, Cloud, ArrowUp, ArrowDown, Shield, Leaf
} from 'lucide-react';
import LeafBackground from './components/LeafBackground';
import SwayingLeaf from './components/SwayingLeaf';
import Chatbot from './components/Chatbot';
import PhotoUpload from './components/PhotoUpload';
import {
    AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
    Legend, RadialBarChart, RadialBar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:5000/api';

const App = () => {
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [status, setStatus] = useState(null);
    const [history, setHistory] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [fields, setFields] = useState([]);
    const [crops, setCrops] = useState([]);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [cropData, setCropData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDropletAnimation, setShowDropletAnimation] = useState(true);

    const fetchData = async () => {
        try {
            const [statusRes, historyRes, analyticsRes, fieldsRes] = await Promise.all([
                axios.get(`${API_BASE}/status`),
                axios.get(`${API_BASE}/history?hours=24&limit=100`),
                axios.get(`${API_BASE}/analytics?days=7`),
                axios.get(`${API_BASE}/fields`)
            ]);

            setStatus(statusRes.data);
            setHistory(historyRes.data || []);
            setAnalytics(analyticsRes.data);
            setFields(fieldsRes.data || []);
            
            // Try to fetch crops endpoint with better error handling
            try {
                const cropsRes = await axios.get(`${API_BASE}/crops`, { 
                    timeout: 5000,
                    validateStatus: () => true // Accept all status codes
                });
                if (cropsRes.status === 200 && cropsRes.data && Array.isArray(cropsRes.data)) {
                    setCrops(cropsRes.data);
                } else {
                    // Fallback: extract crops from fields data
                    if (fieldsRes.data && Array.isArray(fieldsRes.data) && fieldsRes.data.length > 0) {
                        const uniqueCrops = [...new Set(fieldsRes.data.map(f => f.crop).filter(Boolean))];
                        setCrops(uniqueCrops.map(cropType => ({
                            cropType,
                            recordCount: 0,
                            latestData: null,
                            crop: null
                        })));
                    } else {
                        setCrops([]);
                    }
                }
            } catch (cropsErr) {
                // Silent fallback: extract crops from fields data
                if (fieldsRes.data && Array.isArray(fieldsRes.data) && fieldsRes.data.length > 0) {
                    const uniqueCrops = [...new Set(fieldsRes.data.map(f => f.crop).filter(Boolean))];
                    setCrops(uniqueCrops.map(cropType => ({
                        cropType,
                        recordCount: 0,
                        latestData: null,
                        crop: null
                    })));
                } else {
                    setCrops([]);
                }
            }
            
            setLoading(false);
            setError(null);
            
            // Hide droplet animation after data loads
            setTimeout(() => setShowDropletAnimation(false), 2000);
        } catch (err) {
            console.error("Fetch error:", err);
            const msg = err.response?.data?.error || "Cannot connect to backend. Ensure server is running on port 5000.";
            setError(msg);
            setLoading(false);
            setTimeout(() => setShowDropletAnimation(false), 2000);
        }
    };

    const fetchCropData = async (cropType) => {
        try {
            const res = await axios.get(`${API_BASE}/crops/${encodeURIComponent(cropType)}?hours=24&limit=100`, {
                validateStatus: () => true // Accept all status codes
            });
            if (res.status === 200 && res.data) {
                setCropData(res.data);
            } else {
                // Fallback: create empty data structure
                setCropData({
                    cropType,
                    crop: null,
                    data: [],
                    stats: {
                        totalRecords: 0,
                        avgMoisture: 0,
                        avgTemperature: 0,
                        avgNitrogen: 0,
                        avgPhosphorus: 0,
                        avgPotassium: 0
                    }
                });
            }
        } catch (err) {
            // Silent error handling - create empty structure
            setCropData({
                cropType,
                crop: null,
                data: [],
                stats: {
                    totalRecords: 0,
                    avgMoisture: 0,
                    avgTemperature: 0,
                    avgNitrogen: 0,
                    avgPhosphorus: 0,
                    avgPotassium: 0
                }
            });
        }
    };

    useEffect(() => {
        if (selectedCrop) {
            fetchCropData(selectedCrop);
        }
    }, [selectedCrop]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000); // Refresh every 15 seconds
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-agri-green-500 gap-4 relative overflow-hidden">
            {/* Droplet Animation Background */}
            {showDropletAnimation && (
                <>
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-blue-400/30"
                            initial={{ 
                                x: Math.random() * window.innerWidth,
                                y: -50,
                                rotate: 0
                            }}
                            animate={{
                                y: window.innerHeight + 50,
                                rotate: 360,
                            }}
                            transition={{
                                duration: 2 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        >
                            <Droplet size={20 + Math.random() * 20} />
                        </motion.div>
                    ))}
                </>
            )}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
            >
                <div className="w-16 h-16 border-4 border-agri-green-500/20 border-t-agri-green-500 rounded-full animate-spin"></div>
            </motion.div>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-black uppercase tracking-[0.3em] text-sm relative z-10"
            >
                Loading Precision Agriculture System...
            </motion.p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 text-center">
            <AlertTriangle size={64} className="text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">System Offline</h1>
            <p className="text-slate-500 max-w-md mb-8">{error}</p>
            <button
                onClick={() => { setLoading(true); fetchData(); }}
                className="bg-agri-green-500 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform active:scale-95"
            >
                Retry Connection
            </button>
        </div>
    );

    const sd = status?.sensorData;
    const recommendation = status?.recommendation;
    const alerts = status?.alerts || [];
    const waterSavings = status?.waterSavings || {};

    return (
        <div className="min-h-screen bg-[#050505] text-slate-100 flex font-sans relative">
            {/* Droplet Splash Animation on Load */}
            {showDropletAnimation && (
                <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 2, delay: 1 }}
                    className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
                >
                    <motion.div
                        initial={{ scale: 0, y: 0 }}
                        animate={{ scale: [0, 1.5, 2], y: [-100, -50, 0] }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="text-blue-400/80"
                    >
                        <Droplets size={120} className="droplet-splash" />
                    </motion.div>
                    {[...Array(15)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-blue-400/40"
                            initial={{
                                x: '50%',
                                y: '50%',
                                scale: 0,
                            }}
                            animate={{
                                x: `calc(50% + ${(Math.random() - 0.5) * 400}px)`,
                                y: `calc(50% + ${(Math.random() - 0.5) * 400}px)`,
                                scale: [0, 1, 0],
                                rotate: 360,
                            }}
                            transition={{
                                duration: 1.5,
                                delay: 0.3,
                                ease: "easeOut"
                            }}
                        >
                            <Droplet size={20 + Math.random() * 30} />
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Sidebar Navigation */}
            <nav className="w-24 lg:w-72 bg-[#080808] border-r border-white/5 p-6 lg:p-8 flex flex-col gap-8 z-30 sticky top-0 h-screen overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-4"
                >
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="bg-gradient-to-br from-agri-green-500 to-agri-green-600 p-3 rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                    >
                        <Droplets size={28} className="text-white" />
                    </motion.div>
                    <div className="hidden lg:block">
                        <h1 className="text-2xl font-black tracking-tighter text-white">AGRIWATER</h1>
                        <p className="text-[10px] font-black text-agri-green-500 uppercase tracking-widest">AI Irrigation System</p>
                    </div>
                </motion.div>

                <div className="flex flex-col gap-2">
                    {[
                        { id: 'Dashboard', icon: <Activity size={20} /> },
                        { id: 'Analytics', icon: <BarChart3 size={20} /> },
                        { id: 'Crops', icon: <Sprout size={20} /> },
                        { id: 'Fields', icon: <MapPin size={20} /> },
                        { id: 'Alerts', icon: <Bell size={20} /> },
                        { id: 'History', icon: <Table size={20} /> }
                    ].map((item, idx) => (
                        <motion.button
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setActiveTab(item.id);
                                if (item.id === 'Crops' && crops.length > 0 && !selectedCrop) {
                                    setSelectedCrop(crops[0].cropType);
                                }
                            }}
                            className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all ${
                                activeTab === item.id
                                    ? 'bg-agri-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                                    : 'text-slate-600 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {item.icon}
                            <span className="font-bold text-sm uppercase tracking-wider hidden lg:block">{item.id}</span>
                        </motion.button>
                    ))}
                </div>

                <div className="mt-auto bg-gradient-to-br from-agri-green-500/10 to-agri-blue-500/10 p-6 rounded-2xl border border-agri-green-500/20 text-center hidden lg:block">
                    <Shield size={24} className="mx-auto text-agri-green-500 mb-3" />
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">System Status</p>
                    <p className="text-xs font-bold text-agri-green-500 uppercase tracking-tighter">Operational</p>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[#050505]">
                {/* Background Gradient */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-agri-green-500/5 rounded-full blur-[150px] -z-10"></div>
                
                {/* Floating Falling Leaves Background */}
                <LeafBackground />
                
                {/* Floating Droplets Background */}
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-blue-400/10 pointer-events-none"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                        }}
                        animate={{
                            y: [null, Math.random() * window.innerHeight],
                            x: [null, Math.random() * window.innerWidth],
                        }}
                        transition={{
                            duration: 10 + Math.random() * 10,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "linear"
                        }}
                    >
                        <Droplet size={30 + Math.random() * 50} />
                    </motion.div>
                ))}

                <div className="p-6 lg:p-12 max-w-[1800px] mx-auto">
                    <AnimatePresence mode="wait">
                        {activeTab === 'Dashboard' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                {/* Header */}
                                <header className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8">
                                    <div>
                                        <div className="flex items-center gap-3 text-agri-green-500 text-xs font-black uppercase tracking-wider mb-3">
                                            <span className="w-2 h-2 rounded-full bg-agri-green-500 animate-pulse"></span>
                                            Live Monitoring Active
                                        </div>
                                        <motion.h2
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 1.2, ease: "easeOut" }}
                                            className="text-5xl lg:text-7xl font-black tracking-tighter text-white mb-3 uppercase flex items-center gap-4"
                                        >
                                            <SwayingLeaf size={48} />
                                            {sd?.cropType || 'Precision'} <span className="text-agri-green-500">Agriculture</span>
                                        </motion.h2>
                                        <motion.p
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3, duration: 0.8 }}
                                            className="text-slate-400 text-lg"
                                        >
                            AI-Powered Water Management System
                        </motion.p>
                                    </div>
                                    <div className="flex gap-4 flex-wrap">
                                        <StatPill label="Health Score" value={`${status?.yieldHealth || 0}%`} color="green" />
                                        <StatPill label="Temperature" value={`${sd?.weather?.temperature || 0}°C`} color="orange" />
                                        <StatPill label="Humidity" value={`${sd?.weather?.humidity || 0}%`} color="blue" />
                                    </div>
                                </header>

                                {/* Key Metrics Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                                    <MetricCard
                                        label="Soil Moisture"
                                        value={`${sd?.soil?.moisture?.toFixed(1) || 0}%`}
                                        icon={<Droplets />}
                                        color="blue"
                                        trend={getMoistureTrend(history)}
                                        optimal={sd?.crop?.idealMoistureRange}
                                        current={sd?.soil?.moisture}
                                    />
                                    <MetricCard
                                        label="Nitrogen"
                                        value={`${sd?.soil?.nitrogen || 0} mg/kg`}
                                        icon={<FlaskConical />}
                                        color="emerald"
                                    />
                                    <MetricCard
                                        label="Potassium"
                                        value={`${sd?.soil?.potassium || 0} mg/kg`}
                                        icon={<FlaskConical />}
                                        color="purple"
                                    />
                                    <MetricCard
                                        label="Phosphorus"
                                        value={`${sd?.soil?.phosphorus || 0} mg/kg`}
                                        icon={<FlaskConical />}
                                        color="indigo"
                                    />
                                </div>

                                {/* Main Content Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Irrigation Recommendation Card */}
                                    <IrrigationCard recommendation={recommendation} crop={sd?.cropType} />

                                    {/* Real-time Charts */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <ChartCard title="Soil Moisture Trend (24h)" data={history} dataKey="soil.moisture" color="#3b82f6" />
                                        <div className="grid grid-cols-2 gap-6">
                                            <ChartCard title="Temperature" data={history} dataKey="weather.temperature" color="#f59e0b" small />
                                            <ChartCard title="Humidity" data={history} dataKey="weather.humidity" color="#8b5cf6" small />
                                        </div>
                                    </div>
                                </div>

                                {/* Water Savings & Alerts */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <WaterSavingsCard savings={waterSavings} />
                                    <AlertsCard alerts={alerts} />
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'Analytics' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-8"
                            >
                                <h2 className="text-4xl font-black text-white uppercase tracking-tight">Analytics Dashboard</h2>
                                
                                {analytics && (
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <AnalyticsCard label="Avg Moisture" value={`${analytics.avgMoisture}%`} icon={<Droplets />} />
                                        <AnalyticsCard label="Avg Temperature" value={`${analytics.avgTemperature}°C`} icon={<Thermometer />} />
                                        <AnalyticsCard label="Irrigation Events" value={analytics.irrigationEvents} icon={<Droplets />} />
                                        <AnalyticsCard label="Efficiency" value={`${analytics.efficiency}%`} icon={<TrendingUp />} />
                                        </div>
                                )}

                                {history.length > 0 && (
                                    <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-8">
                                        <h3 className="text-xl font-black uppercase mb-6">Historical Trends</h3>
                                        <ResponsiveContainer width="100%" height={400}>
                                                <AreaChart data={history}>
                                                    <defs>
                                                    <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                                <XAxis dataKey="timestamp" tickFormatter={(val) => new Date(val).toLocaleTimeString()} stroke="#64748b" />
                                                <YAxis stroke="#64748b" />
                                                <Tooltip
                                                    contentStyle={{ background: '#0c0c0c', border: '1px solid #1e293b', borderRadius: '12px' }}
                                                    labelFormatter={(val) => new Date(val).toLocaleString()}
                                                />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="soil.moisture"
                                                        stroke="#3b82f6"
                                                    strokeWidth={3}
                                                    fill="url(#moistureGrad)"
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="weather.temperature"
                                                    stroke="#f59e0b"
                                                    strokeWidth={2}
                                                    fillOpacity={0}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'Crops' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-4xl font-black text-white uppercase tracking-tight">Crop Database</h2>
                                    <p className="text-slate-400 text-sm">Data segregated by crop type</p>
                                </div>

                                {/* Crop Type Selector */}
                                <div className="flex flex-wrap gap-4">
                                    {crops.map((crop, idx) => (
                                        <motion.button
                                            key={idx}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedCrop(crop.cropType)}
                                            className={`px-6 py-3 rounded-xl font-black uppercase text-sm transition-all ${
                                                selectedCrop === crop.cropType
                                                    ? 'bg-agri-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                                                    : 'bg-[#0c0c0c] text-slate-400 border border-white/5 hover:border-agri-green-500/50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Sprout size={18} />
                                                <span>{crop.cropType}</span>
                                                <span className="text-xs bg-white/10 px-2 py-1 rounded-full">
                                                    {crop.recordCount}
                                                </span>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Selected Crop Data View */}
                                {selectedCrop && cropData && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        {/* Crop Header */}
                                        <div className="bg-gradient-to-r from-agri-green-500/20 to-agri-blue-500/20 border border-agri-green-500/30 p-8 rounded-3xl">
                                            <div className="flex items-center justify-between mb-6">
                                                <div>
                                                    <h3 className="text-3xl font-black text-white uppercase mb-2">
                                                        {selectedCrop} Database
                                                    </h3>
                                                    <p className="text-slate-400">
                                                        {cropData.stats.totalRecords} records • Last updated: {
                                                            cropData.data.length > 0 
                                                                ? new Date(cropData.data[cropData.data.length - 1].timestamp).toLocaleString()
                                                                : 'N/A'
                                                        }
                                                    </p>
                                                </div>
                                                {cropData.crop && (
                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-500 uppercase mb-1">Optimal Range</p>
                                                        <p className="text-xl font-black text-agri-green-500">
                                                            {cropData.crop.idealMoistureRange.min}% - {cropData.crop.idealMoistureRange.max}%
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Statistics Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                <StatBox label="Avg Moisture" value={`${cropData.stats.avgMoisture.toFixed(1)}%`} color="blue" />
                                                <StatBox label="Avg Temp" value={`${cropData.stats.avgTemperature.toFixed(1)}°C`} color="orange" />
                                                <StatBox label="Avg Nitrogen" value={`${cropData.stats.avgNitrogen.toFixed(1)}`} color="emerald" />
                                                <StatBox label="Avg Phosphorus" value={`${cropData.stats.avgPhosphorus.toFixed(1)}`} color="indigo" />
                                                <StatBox label="Avg Potassium" value={`${cropData.stats.avgPotassium.toFixed(1)}`} color="purple" />
                                            </div>
                                        </div>

                                        {/* Crop Data Chart */}
                                        {cropData.data.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="relative bg-gradient-to-br from-[#0c0c0c] to-[#050505] border border-white/10 p-8 rounded-3xl overflow-hidden group"
                                            >
                                                {/* Shiny overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-agri-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                
                                                {/* Glow effect */}
                                                <div className="absolute -inset-1 bg-gradient-to-r from-agri-green-500/30 to-transparent rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                
                                                <h4 className="text-xl font-black uppercase mb-6 text-white relative z-10 flex items-center gap-3">
                                                    <div className="w-3 h-3 bg-agri-green-500 rounded-full animate-pulse"></div>
                                                    {selectedCrop} - Moisture Trend (24h)
                                                </h4>
                                                <div className="relative z-10">
                                                    <ResponsiveContainer width="100%" height={300}>
                                                        <AreaChart data={cropData.data}>
                                                            <defs>
                                                                <linearGradient id={`cropGrad-${selectedCrop}`} x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.5} />
                                                                    <stop offset="50%" stopColor="#22c55e" stopOpacity={0.3} />
                                                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                                                </linearGradient>
                                                                <filter id={`glow-green-${selectedCrop}`}>
                                                                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                                                                    <feMerge>
                                                                        <feMergeNode in="coloredBlur"/>
                                                                        <feMergeNode in="SourceGraphic"/>
                                                                    </feMerge>
                                                                </filter>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                                                            <XAxis 
                                                                dataKey="timestamp" 
                                                                tickFormatter={(val) => new Date(val).toLocaleTimeString()} 
                                                                stroke="#64748b"
                                                                tick={{ fill: '#94a3b8' }}
                                                            />
                                                            <YAxis 
                                                                stroke="#64748b"
                                                                tick={{ fill: '#94a3b8' }}
                                                            />
                                                            <Tooltip
                                                                contentStyle={{ 
                                                                    background: 'rgba(12, 12, 12, 0.95)', 
                                                                    border: '1px solid #22c55e', 
                                                                    borderRadius: '12px',
                                                                    boxShadow: '0 0 30px rgba(34, 197, 94, 0.3)'
                                                                }}
                                                                labelFormatter={(val) => new Date(val).toLocaleString()}
                                                            />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="soil.moisture"
                                                                stroke="#22c55e"
                                                                strokeWidth={4}
                                                                fill={`url(#cropGrad-${selectedCrop})`}
                                                                filter={`url(#glow-green-${selectedCrop})`}
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Crop Data Table */}
                                        <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl overflow-hidden">
                                            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                                <h4 className="text-xl font-black uppercase text-white">Recent Data</h4>
                                                <span className="text-xs font-black bg-white/5 px-4 py-2 rounded-full text-slate-500 uppercase">
                                                    {cropData.data.length} Records
                                                </span>
                                            </div>
                                            <div className="overflow-x-auto max-h-96 overflow-y-auto">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="sticky top-0 bg-[#0c0c0c]">
                                                        <tr className="border-b border-white/5">
                                                            <th className="p-4 font-black uppercase tracking-wider text-slate-500">Time</th>
                                                            <th className="p-4 font-black uppercase tracking-wider text-slate-500">Moisture</th>
                                                            <th className="p-4 font-black uppercase tracking-wider text-slate-500">Temp</th>
                                                            <th className="p-4 font-black uppercase tracking-wider text-slate-500">Humidity</th>
                                                            <th className="p-4 font-black uppercase tracking-wider text-slate-500">N-P-K</th>
                                                            <th className="p-4 font-black uppercase tracking-wider text-slate-500">Soil Type</th>
                                                            <th className="p-4 font-black uppercase tracking-wider text-slate-500">Fertilizer</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {cropData.data.slice(-50).reverse().map((row, i) => (
                                                            <motion.tr
                                                                key={i}
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ delay: i * 0.01 }}
                                                                className="hover:bg-white/5 transition-colors"
                                                            >
                                                                <td className="p-4 font-mono text-slate-400 text-xs">
                                                                    {new Date(row.timestamp).toLocaleTimeString()}
                                                                </td>
                                                                <td className="p-4">
                                                                    <span className="text-blue-400 font-black">{row.soil?.moisture?.toFixed(1)}%</span>
                                                                </td>
                                                                <td className="p-4 text-slate-300">{row.weather?.temperature?.toFixed(1)}°C</td>
                                                                <td className="p-4 text-slate-300">{row.weather?.humidity}%</td>
                                                                <td className="p-4">
                                                                    <span className="text-emerald-500">{row.soil?.nitrogen}</span>-
                                                                    <span className="text-indigo-500">{row.soil?.phosphorus}</span>-
                                                                    <span className="text-purple-500">{row.soil?.potassium}</span>
                                                                </td>
                                                                <td className="p-4 text-slate-400 uppercase text-xs">{row.soil?.soilType}</td>
                                                                <td className="p-4 text-slate-400 italic">{row.fertilizerName}</td>
                                                            </motion.tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {selectedCrop && !cropData && (
                                    <div className="text-center py-20">
                                        <div className="w-16 h-16 border-4 border-agri-green-500/20 border-t-agri-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-slate-400">Loading {selectedCrop} data...</p>
                                    </div>
                                )}

                                {!selectedCrop && (
                                    <div className="text-center py-20 bg-[#0c0c0c] border border-white/5 rounded-3xl">
                                        <Sprout size={64} className="mx-auto text-slate-600 mb-4" />
                                        <p className="text-slate-400 text-lg">Select a crop type to view its database</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'Fields' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <h2 className="text-4xl font-black text-white uppercase tracking-tight">Multi-Field Overview</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {fields.map((field, idx) => (
                                        <FieldCard key={idx} field={field} />
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'Alerts' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <h2 className="text-4xl font-black text-white uppercase tracking-tight">Anomaly Detection</h2>
                                <div className="space-y-4">
                                    {alerts.length > 0 ? (
                                        alerts.map((alert, idx) => (
                                            <AlertCard key={idx} alert={alert} />
                                        ))
                                    ) : (
                                        <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-12 text-center">
                                            <CheckCircle size={48} className="mx-auto text-agri-green-500 mb-4" />
                                            <p className="text-slate-400 text-lg">No active alerts. All systems operating normally.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'History' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-[#0c0c0c] border border-white/5 rounded-3xl overflow-hidden"
                            >
                                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                                    <h3 className="text-2xl font-black uppercase">Historical Data</h3>
                                    <span className="text-xs font-black bg-white/5 px-4 py-2 rounded-full text-slate-500 uppercase">
                                        Last 24 Hours
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-white/5 bg-white/5">
                                                <th className="p-4 font-black uppercase tracking-wider text-slate-500">Time</th>
                                                <th className="p-4 font-black uppercase tracking-wider text-slate-500">Crop</th>
                                                <th className="p-4 font-black uppercase tracking-wider text-slate-500">Moisture</th>
                                                <th className="p-4 font-black uppercase tracking-wider text-slate-500">Temp</th>
                                                <th className="p-4 font-black uppercase tracking-wider text-slate-500">Humidity</th>
                                                <th className="p-4 font-black uppercase tracking-wider text-slate-500">N-P-K</th>
                                                <th className="p-4 font-black uppercase tracking-wider text-slate-500">Fertilizer</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {history.slice(0, 50).map((row, i) => (
                                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-4 font-mono text-slate-400 text-xs">
                                                        {new Date(row.timestamp).toLocaleTimeString()}
                                                    </td>
                                                    <td className="p-4 font-bold text-white uppercase">{row.cropType}</td>
                                                    <td className="p-4">
                                                        <span className="text-blue-400 font-black">{row.soil?.moisture?.toFixed(1)}%</span>
                                                    </td>
                                                    <td className="p-4 text-slate-300">{row.weather?.temperature?.toFixed(1)}°C</td>
                                                    <td className="p-4 text-slate-300">{row.weather?.humidity}%</td>
                                                    <td className="p-4">
                                                        <span className="text-emerald-500">{row.soil?.nitrogen}</span>-
                                                        <span className="text-indigo-500">{row.soil?.phosphorus}</span>-
                                                        <span className="text-purple-500">{row.soil?.potassium}</span>
                                                    </td>
                                                    <td className="p-4 text-slate-400 italic">{row.fertilizerName}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Chatbot Component */}
            <Chatbot />
            
            {/* Photo Upload Component */}
            <PhotoUpload />
        </div>
    );
};

// Component: Metric Card with Trend and Growing Leaf Animation
const MetricCard = ({ label, value, icon, color, trend, optimal, current }) => {
    const colors = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    };

    const getStatusColor = () => {
        if (!optimal || !current) return 'text-slate-500';
        const { min, max } = optimal;
        if (current >= min && current <= max) return 'text-agri-green-500';
        if (current < min) return 'text-red-500';
        return 'text-yellow-500';
    };

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            whileHover={{ scale: 1.05 }}
            className="relative bg-[#0c0c0c] border border-white/5 p-6 rounded-2xl hover:border-white/20 transition-all overflow-hidden"
        >
            {/* Growing Leaf Glow Animation */}
            <motion.div
                className="absolute -top-10 -right-10 w-32 h-32 bg-agri-green-500/20 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
            />
            
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${colors[color]} shadow-lg relative z-10`}>
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 relative z-10">{label}</p>
            <h4 className={`text-4xl font-black mb-2 ${getStatusColor()} relative z-10`}>{value}</h4>
            {trend && (
                <div className="flex items-center gap-2 text-xs relative z-10">
                    {trend > 0 ? <ArrowUp size={14} className="text-green-500" /> : <ArrowDown size={14} className="text-red-500" />}
                    <span className="text-slate-500">{Math.abs(trend).toFixed(1)}%</span>
                </div>
            )}
        </motion.div>
    );
};

// Component: Irrigation Recommendation Card
const IrrigationCard = ({ recommendation, crop }) => {
    if (!recommendation) return null;

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Critical': return 'bg-red-500/20 border-red-500/50 text-red-400';
            case 'High': return 'bg-orange-500/20 border-orange-500/50 text-orange-400';
            case 'Medium': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
            default: return 'bg-agri-green-500/20 border-agri-green-500/50 text-agri-green-400';
        }
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'Irrigate': return <Droplets size={32} />;
            case 'Delay': return <Clock size={32} />;
            case 'Stop': return <AlertTriangle size={32} />;
            default: return <CheckCircle size={32} />;
        }
    };

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            whileHover={{ scale: 1.02 }}
            className={`relative bg-gradient-to-br from-white to-slate-100 text-black p-8 rounded-3xl border-2 ${getPriorityColor(recommendation.priority)} shadow-2xl overflow-hidden`}
        >
            {/* Growing Leaf Glow */}
            <motion.div
                className="absolute -top-10 -right-10 w-40 h-40 bg-agri-green-500/20 rounded-full blur-3xl"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 5, repeat: Infinity }}
            />
            <div className="flex items-center justify-between mb-6 relative z-10">
                <p className="text-xs font-black uppercase tracking-widest text-black/60">AI Recommendation</p>
                <motion.div
                    animate={{
                        rotate: [-5, 5, -5],
                        y: [0, -4, 0]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className={`p-3 rounded-xl ${getPriorityColor(recommendation.priority)}`}
                >
                    {getActionIcon(recommendation.action)}
                </motion.div>
            </div>
            
            <h3 className="text-4xl font-black uppercase mb-4 tracking-tight">{recommendation.action}</h3>
            <p className="text-sm font-bold text-black/70 mb-6 leading-relaxed">{recommendation.reason}</p>

            {recommendation.action === 'Irrigate' && (
                <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between p-3 bg-black/5 rounded-xl">
                        <span className="text-xs font-black uppercase text-black/60">Amount</span>
                        <span className="text-lg font-black">{recommendation.amount} L/m²</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-black/5 rounded-xl">
                        <span className="text-xs font-black uppercase text-black/60">Duration</span>
                        <span className="text-lg font-black">{recommendation.duration} min</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-black/5 rounded-xl">
                        <span className="text-xs font-black uppercase text-black/60">Best Time</span>
                        <span className="text-lg font-black">{recommendation.recommendedTime}</span>
                    </div>
                    {recommendation.hoursUntilNext && (
                        <div className="flex items-center justify-between p-3 bg-black/5 rounded-xl">
                            <span className="text-xs font-black uppercase text-black/60">Next Check</span>
                            <span className="text-lg font-black">{recommendation.hoursUntilNext}h</span>
                        </div>
                    )}
                </div>
            )}

            <button className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-wider text-xs hover:scale-105 transition-transform">
                {recommendation.action === 'Irrigate' ? 'Execute Irrigation' : 'View Details'}
            </button>
        </motion.div>
    );
};

// Component: Chart Card with Enhanced Shiny Design
const ChartCard = ({ title, data, dataKey, color, small = false }) => {
    if (!data || data.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-gradient-to-br from-[#0c0c0c] to-[#050505] border border-white/10 p-6 rounded-2xl overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
                <h3 className="text-sm font-black uppercase tracking-wider mb-4 text-slate-400 relative z-10">{title}</h3>
                <div className="h-[150px] flex items-center justify-center text-slate-500 relative z-10">
                    No data available
                </div>
            </motion.div>
        );
    }

    const chartData = data.map(item => {
        const keys = dataKey.split('.');
        let value = item;
        for (const key of keys) {
            value = value?.[key];
        }
        return {
            time: new Date(item.timestamp).toLocaleTimeString(),
            value: value || 0
        };
    });

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="relative bg-gradient-to-br from-[#0c0c0c] to-[#050505] border border-white/10 p-6 rounded-2xl overflow-hidden group"
        >
            {/* Shiny gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Glow effect */}
            <div className={`absolute -inset-1 bg-gradient-to-r ${color === '#3b82f6' ? 'from-blue-500/20' : color === '#f59e0b' ? 'from-orange-500/20' : 'from-purple-500/20'} to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            
            <h3 className="text-sm font-black uppercase tracking-wider mb-4 text-slate-400 relative z-10 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${color === '#3b82f6' ? 'bg-blue-500' : color === '#f59e0b' ? 'bg-orange-500' : 'bg-purple-500'} animate-pulse`}></div>
                {title}
            </h3>
            <div className="relative z-10">
                <ResponsiveContainer width="100%" height={small ? 150 : 250}>
                    <LineChart data={chartData}>
                        <defs>
                            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                                <stop offset="100%" stopColor={color} stopOpacity={0.1} />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                        <XAxis 
                            dataKey="time" 
                            stroke="#64748b" 
                            fontSize={10}
                            tick={{ fill: '#94a3b8' }}
                        />
                        <YAxis 
                            stroke="#64748b" 
                            fontSize={10}
                            tick={{ fill: '#94a3b8' }}
                        />
                        <Tooltip
                            contentStyle={{ 
                                background: 'rgba(12, 12, 12, 0.95)', 
                                border: `1px solid ${color}`, 
                                borderRadius: '12px',
                                boxShadow: `0 0 20px ${color}40`
                            }}
                            labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                            itemStyle={{ color: color }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={3}
                            fill={`url(#gradient-${color})`}
                            filter="url(#glow)"
                        />
                        <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke={color} 
                            strokeWidth={3}
                            dot={{ fill: color, r: 4 }}
                            activeDot={{ r: 6, fill: color }}
                            filter="url(#glow)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

// Component: Water Savings Card
const WaterSavingsCard = ({ savings }) => {
    if (!savings || savings.percentage === 0) return null;

    return (
        <div className="bg-gradient-to-br from-agri-green-500/10 to-agri-blue-500/10 border border-agri-green-500/20 p-8 rounded-3xl">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-agri-green-500/20 rounded-2xl flex items-center justify-center">
                    <TrendingUp size={32} className="text-agri-green-500" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-white uppercase">Water Savings</h3>
                    <p className="text-sm text-slate-400">vs Fixed Schedule</p>
                </div>
            </div>
            
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-slate-400">Saved</span>
                    <span className="text-3xl font-black text-agri-green-500">{savings.saved} L/m²</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-slate-400">Percentage</span>
                    <span className="text-2xl font-black text-white">{savings.percentage}%</span>
                </div>
                <div className="h-3 bg-black/20 rounded-full overflow-hidden mt-4">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${savings.percentage}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-gradient-to-r from-agri-green-500 to-agri-blue-500"
                    />
                </div>
            </div>
        </div>
    );
};

// Component: Alerts Card
const AlertsCard = ({ alerts }) => {
    const criticalAlerts = alerts.filter(a => a.severity === 'Critical' || a.priority === 'Critical');
    const highAlerts = alerts.filter(a => a.severity === 'High' || a.priority === 'High');

    return (
        <div className="bg-[#0c0c0c] border border-white/5 p-8 rounded-3xl">
            <div className="flex items-center gap-4 mb-6">
                <Bell size={24} className="text-yellow-500" />
                <h3 className="text-2xl font-black text-white uppercase">Active Alerts</h3>
                {alerts.length > 0 && (
                    <span className="bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full">
                        {alerts.length}
                    </span>
                )}
            </div>
            
            {alerts.length === 0 ? (
                <div className="text-center py-8">
                    <CheckCircle size={48} className="mx-auto text-agri-green-500 mb-4" />
                    <p className="text-slate-400">No active alerts</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                    {alerts.slice(0, 5).map((alert, idx) => (
                        <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="flex items-start justify-between mb-2">
                                <span className={`text-xs font-black uppercase px-2 py-1 rounded ${
                                    alert.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                                    alert.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                                    'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                    {alert.type}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {alert.confidence}% confidence
                                </span>
                            </div>
                            <p className="text-sm text-slate-300">{alert.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Component: Analytics Card
const AnalyticsCard = ({ label, value, icon }) => (
    <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded-2xl">
        <div className="flex items-center gap-4 mb-4">
            {React.cloneElement(icon, { size: 20, className: 'text-agri-green-500' })}
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</p>
        </div>
        <p className="text-3xl font-black text-white">{value}</p>
    </div>
);

// Component: Field Card
const FieldCard = ({ field }) => (
    <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={{ scale: 1.05 }}
        className="relative bg-[#0c0c0c] border border-white/5 p-6 rounded-2xl hover:border-agri-green-500/50 transition-all overflow-hidden"
    >
        {/* Growing Leaf Glow */}
        <motion.div
            className="absolute -top-8 -right-8 w-24 h-24 bg-agri-green-500/20 rounded-full blur-2xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
                <SwayingLeaf size={20} />
                {field.fieldName}
            </h3>
            <span className={`text-xs font-black px-3 py-1 rounded ${
                field.status === 'Critical' ? 'bg-red-500/20 text-red-400' :
                field.status === 'High' ? 'bg-orange-500/20 text-orange-400' :
                'bg-agri-green-500/20 text-agri-green-400'
            }`}>
                {field.status}
            </span>
        </div>
        <p className="text-sm text-slate-400 mb-4 relative z-10">Crop: {field.crop}</p>
        <div className="grid grid-cols-2 gap-4 relative z-10">
            <div>
                <p className="text-xs text-slate-500 mb-1">Moisture</p>
                <p className="text-2xl font-black text-blue-400">{field.moisture?.toFixed(1)}%</p>
            </div>
            <div>
                <p className="text-xs text-slate-500 mb-1">Health</p>
                <p className="text-2xl font-black text-agri-green-500">{field.yieldHealth}%</p>
            </div>
        </div>
    </motion.div>
);

// Component: Alert Card
const AlertCard = ({ alert }) => {
    const severityColors = {
        Critical: 'bg-red-500/20 border-red-500/50',
        High: 'bg-orange-500/20 border-orange-500/50',
        Medium: 'bg-yellow-500/20 border-yellow-500/50',
        Low: 'bg-blue-500/20 border-blue-500/50'
    };

    return (
        <div className={`border-2 rounded-2xl p-6 ${severityColors[alert.severity] || severityColors.Low}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <AlertTriangle size={24} className="text-red-400" />
                    <div>
                        <h3 className="font-black text-white uppercase">{alert.type}</h3>
                        <p className="text-xs text-slate-400">{alert.field}</p>
                    </div>
                </div>
                <span className="text-xs font-black bg-white/10 px-3 py-1 rounded-full">
                    {alert.confidence}% confidence
                </span>
            </div>
            <p className="text-slate-300 mb-2">{alert.message}</p>
            <p className="text-xs text-slate-500">
                {new Date(alert.timestamp).toLocaleString()}
            </p>
        </div>
    );
};

// Component: Stat Pill
const StatPill = ({ label, value, color }) => {
    const bg = color === 'green' ? 'bg-agri-green-500' : color === 'orange' ? 'bg-orange-500' : 'bg-blue-500';
    return (
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
            <div>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">{label}</p>
                <p className="text-xl font-black text-white">{value}</p>
            </div>
            <div className={`w-2 h-12 rounded-full ${bg} opacity-30`}></div>
        </div>
    );
};

// Component: Stat Box for Crop View
const StatBox = ({ label, value, color }) => {
    const colors = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    };
    
    return (
        <div className={`p-4 rounded-xl border ${colors[color] || colors.blue}`}>
            <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">{label}</p>
            <p className="text-2xl font-black">{value}</p>
        </div>
    );
};

// Helper: Get moisture trend
const getMoistureTrend = (history) => {
    if (!history || history.length < 2) return null;
    const recent = history.slice(-5).filter(h => h?.soil?.moisture != null);
    const older = history.slice(-10, -5).filter(h => h?.soil?.moisture != null);
    if (recent.length === 0 || older.length === 0) return null;
    const recentAvg = recent.reduce((sum, h) => sum + (h.soil.moisture || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, h) => sum + (h.soil.moisture || 0), 0) / older.length;
    return recentAvg - olderAvg;
};

export default App;
