const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const Crop = require('./models/Crop');
const SensorData = require('./models/SensorData');
const Alert = require('./models/Alert');
const Recommendation = require('./models/Recommendation');
const IntelligenceService = require('./services/intelligence');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection - Pure Atlas Mode
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ ERROR: MONGO_URI missing in .env');
    process.exit(1);
}

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
}).then(() => {
    console.log(`✅ DATABASE LINKED: ${mongoose.connection.name}`);
    console.log(`📊 Database ready for queries`);
}).catch(err => {
    console.error('❌ DATABASE CONNECTION FAILED:', err.message);
    console.error('⚠️  Server will continue but database operations will fail.');
    console.error('💡 TIP: Check your MONGO_URI in .env file');
    console.error('💡 TIP: Ensure MongoDB Atlas allows your IP address');
    // Don't exit - allow server to run without DB for testing routes
});

// --- COMPREHENSIVE API ENDPOINTS ---

// 1. Get Live Status with Enhanced Intelligence
app.get('/api/status', async (req, res) => {
    try {
        const latestData = await SensorData.findOne().sort({ timestamp: -1 });

        if (!latestData) {
            return res.status(404).json({
                error: "Database is empty. No historical or live data found in Atlas.",
                solution: "Run 'node seed.js' in the server folder to import your 8,000 JSON records."
            });
        }

        // Fetch recent history for anomaly detection
        const recentHistory = await SensorData.find()
            .sort({ timestamp: -1 })
            .limit(50);

        // Enhance weather data with real-time API
        const enhancedWeather = await IntelligenceService.fetchWeatherData();
        latestData.weather = { ...latestData.weather, ...enhancedWeather };

        const crop = await Crop.findOne({ name: latestData.cropType }) || await Crop.findOne();
        
        // Generate advanced recommendation
        const recommendation = await IntelligenceService.generateRecommendation(
            latestData, 
            crop, 
            recentHistory
        );

        // Detect anomalies
        const anomalies = await IntelligenceService.detectAnomalies(recentHistory, latestData, crop);
        
        // Calculate water savings
        const waterSavings = await IntelligenceService.calculateWaterSavings(recentHistory, recommendation);
        
        // Predict yield health
        const yieldHealth = await IntelligenceService.predictYieldHealth(latestData, crop);

        // Get existing alerts from DB
        const dbAlerts = await Alert.find({ status: 'Active' }).sort({ timestamp: -1 }).limit(5);
        
        // Merge detected anomalies with DB alerts
        const allAlerts = [...anomalies.map(a => ({
            ...a,
            _id: a.type + Date.now()
        })), ...dbAlerts];

        res.json({
            sensorData: latestData,
            recommendation,
            alerts: allAlerts,
            crop,
            yieldHealth,
            waterSavings,
            weather: enhancedWeather
        });
    } catch (err) {
        console.error('API /status error:', err);
        res.status(500).json({ error: "Internal Server Error fetching from Atlas." });
    }
});

// 2. Get Historical Data for Charts
app.get('/api/history', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const hours = parseInt(req.query.hours) || 24;
        
        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
        
        const history = await SensorData.find({
            timestamp: { $gte: cutoffTime }
        })
        .sort({ timestamp: -1 })
        .limit(limit);
        
        res.json(history.reverse()); // Reverse for chronological order
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch dataset history." });
    }
});

// 3. Get Analytics Summary
app.get('/api/analytics', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const cutoffTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        
        const history = await SensorData.find({
            timestamp: { $gte: cutoffTime }
        }).sort({ timestamp: 1 });

        if (history.length === 0) {
            return res.json({
                avgMoisture: 0,
                avgTemperature: 0,
                irrigationEvents: 0,
                anomalies: 0,
                efficiency: 0
            });
        }

        // Calculate averages
        const avgMoisture = history.reduce((sum, h) => sum + (h.soil?.moisture || 0), 0) / history.length;
        const avgTemperature = history.reduce((sum, h) => sum + (h.weather?.temperature || 0), 0) / history.length;

        // Detect irrigation events (moisture increases)
        let irrigationEvents = 0;
        for (let i = 1; i < history.length; i++) {
            if (history[i].soil?.moisture > history[i-1].soil?.moisture + 5) {
                irrigationEvents++;
            }
        }

        // Calculate efficiency (time in optimal moisture range)
        const latest = history[history.length - 1];
        const crop = await Crop.findOne({ name: latest?.cropType }) || await Crop.findOne();
        const { min, max } = crop?.idealMoistureRange || { min: 30, max: 60 };
        const optimalCount = history.filter(h => {
            const m = h.soil?.moisture || 0;
            return m >= min && m <= max;
        }).length;
        const efficiency = (optimalCount / history.length) * 100;

        res.json({
            avgMoisture: Math.round(avgMoisture * 10) / 10,
            avgTemperature: Math.round(avgTemperature * 10) / 10,
            irrigationEvents,
            anomalies: 0, // Will be calculated separately
            efficiency: Math.round(efficiency * 10) / 10,
            dataPoints: history.length
        });
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ error: "Failed to fetch analytics." });
    }
});

// 4. Get Irrigation Recommendations History
app.get('/api/recommendations', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const recommendations = await Recommendation.find()
            .sort({ timestamp: -1 })
            .limit(limit);
        res.json(recommendations);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch recommendations." });
    }
});

// 5. Get Field Status (Multi-field support)
app.get('/api/fields', async (req, res) => {
    try {
        const latestByCrop = await SensorData.aggregate([
            { $sort: { timestamp: -1 } },
            { $group: {
                _id: "$cropType",
                latest: { $first: "$$ROOT" }
            }}
        ]);

        const fields = await Promise.all(latestByCrop.map(async (item) => {
            const data = item.latest;
            const crop = await Crop.findOne({ name: data.cropType }) || await Crop.findOne();
            const recommendation = await IntelligenceService.generateRecommendation(data, crop);
            const yieldHealth = await IntelligenceService.predictYieldHealth(data, crop);
            
            return {
                fieldId: data.cropType,
                fieldName: `Field ${data.cropType}`,
                crop: data.cropType,
                moisture: data.soil?.moisture || 0,
                temperature: data.weather?.temperature || 0,
                recommendation,
                yieldHealth,
                status: recommendation.priority || 'Low'
            };
        }));

        res.json(fields);
    } catch (err) {
        console.error('Fields API error:', err);
        res.status(500).json({ error: "Failed to fetch fields." });
    }
});

// 6. Crop Routes - Using router for better organization
try {
    const cropsRouter = require('./routes/crops');
    app.use('/api/crops', cropsRouter);
    console.log('✅ Crop routes loaded successfully');
} catch (error) {
    console.error('❌ ERROR loading crop routes:', error.message);
    // Fallback route if crops.js doesn't exist
    app.get('/api/crops', (req, res) => {
        res.status(500).json({ error: 'Crop routes not available', details: error.message });
    });
}

// 7. Chatbot Routes - AI-powered dynamic chatbot
try {
    const chatbotRouter = require('./routes/chatbot');
    app.use('/api/chatbot', chatbotRouter);
    console.log('✅ Chatbot routes loaded successfully');
} catch (error) {
    console.error('❌ ERROR loading chatbot routes:', error.message);
}


// Test route to verify server is running
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// Debug: List all registered routes
app.get('/api/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods)
            });
        }
    });
    res.json({ routes, total: routes.length });
});

// Health check
app.get('/api/health', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
        const cropCount = await Crop.countDocuments();
        const dataCount = await SensorData.countDocuments();
        
        res.json({
            status: 'ok',
            database: dbStatus,
            crops: cropCount,
            sensorData: dataCount,
            endpoints: [
                '/api/status',
                '/api/history',
                '/api/analytics',
                '/api/fields',
                '/api/crops',
                '/api/crops/:cropType'
            ]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Verify routes are loaded
app.get('/api/routes-debug', (req, res) => {
    const routes = [];
    function findRoutes(layer, path = '') {
        if (layer.route) {
            routes.push({
                path: path + layer.route.path,
                methods: Object.keys(layer.route.methods)
            });
        } else if (layer.name === 'router') {
            layer.handle.stack.forEach((stackItem) => {
                findRoutes(stackItem, path + (layer.regexp.source.replace('\\/?', '').replace('(?=\\/|$)', '').replace(/\\\//g, '/') || ''));
            });
        }
    }
    app._router.stack.forEach((layer) => {
        findRoutes(layer);
    });
    res.json({ routes, total: routes.length });
});

// Handle port conflicts gracefully
const server = app.listen(PORT, () => {
    console.log(`----------------------------------------------------`);
    console.log(`🚀 AGRI-AI SERVER RUNNING ON PORT ${PORT}`);
    console.log(`🌿 MODE: PURE DATABASE MIRROR (NO MOCK DATA)`);
    console.log(`📡 Available endpoints:`);
    console.log(`   GET /api/status`);
    console.log(`   GET /api/history`);
    console.log(`   GET /api/analytics`);
    console.log(`   GET /api/fields`);
    console.log(`   GET /api/crops          ← Crop list`);
    console.log(`   GET /api/crops/:cropType ← Crop data`);
    console.log(`   POST /api/chatbot       ← AI Chatbot`);
    console.log(`   GET /api/health`);
    console.log(`   GET /api/routes-debug    ← Debug routes`);
    console.log(`----------------------------------------------------`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ ERROR: Port ${PORT} is already in use!`);
        console.error(`\n🔧 SOLUTION:`);
        console.error(`   1. Find and kill the process using port ${PORT}:`);
        console.error(`      Windows: netstat -ano | findstr :${PORT}`);
        console.error(`      Then: taskkill /PID <PID> /F`);
        console.error(`   2. OR use a different port by setting PORT environment variable`);
        console.error(`      Example: set PORT=5001 && npm start\n`);
        process.exit(1);
    } else {
        console.error(`\n❌ Server error:`, err);
        process.exit(1);
    }
});
