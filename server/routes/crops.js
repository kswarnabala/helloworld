const express = require('express');
const router = express.Router();
const SensorData = require('../models/SensorData');
const Crop = require('../models/Crop');

// Get All Crop Types with Summary
router.get('/', async (req, res) => {
    try {
        const cropTypes = await SensorData.distinct('cropType');
        
        if (!cropTypes || cropTypes.length === 0) {
            return res.json([]);
        }
        
        const cropSummaries = await Promise.all(cropTypes.map(async (cropType) => {
            try {
                const latest = await SensorData.findOne({ cropType }).sort({ timestamp: -1 });
                const count = await SensorData.countDocuments({ cropType });
                const crop = await Crop.findOne({ name: cropType });
                
                return {
                    cropType: cropType || 'Unknown',
                    crop: crop || null,
                    recordCount: count || 0,
                    latestData: latest || null,
                    lastUpdate: latest?.timestamp || null
                };
            } catch (err) {
                console.error(`Error processing crop ${cropType}:`, err);
                return {
                    cropType: cropType || 'Unknown',
                    crop: null,
                    recordCount: 0,
                    latestData: null,
                    lastUpdate: null
                };
            }
        }));

        res.json(cropSummaries.filter(c => c.cropType !== 'Unknown' && c.cropType !== null));
    } catch (err) {
        console.error('Crops API error:', err);
        res.status(500).json({ error: "Failed to fetch crops.", details: err.message });
    }
});

// Get Data Segregated by Crop Type
router.get('/:cropType', async (req, res) => {
    try {
        const { cropType } = req.params;
        
        if (!cropType) {
            return res.status(400).json({ error: "Crop type is required." });
        }
        
        const limit = parseInt(req.query.limit) || 100;
        const hours = parseInt(req.query.hours) || 24;
        
        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
        
        const cropData = await SensorData.find({
            cropType: cropType,
            timestamp: { $gte: cutoffTime }
        })
        .sort({ timestamp: -1 })
        .limit(limit);

        if (cropData.length === 0) {
            return res.json({
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

        // Get crop config
        const crop = await Crop.findOne({ name: cropType }) || await Crop.findOne();
        
        // Calculate statistics
        const stats = {
            totalRecords: cropData.length,
            avgMoisture: cropData.length > 0 ? cropData.reduce((sum, d) => sum + (d.soil?.moisture || 0), 0) / cropData.length : 0,
            avgTemperature: cropData.length > 0 ? cropData.reduce((sum, d) => sum + (d.weather?.temperature || 0), 0) / cropData.length : 0,
            avgNitrogen: cropData.length > 0 ? cropData.reduce((sum, d) => sum + (d.soil?.nitrogen || 0), 0) / cropData.length : 0,
            avgPhosphorus: cropData.length > 0 ? cropData.reduce((sum, d) => sum + (d.soil?.phosphorus || 0), 0) / cropData.length : 0,
            avgPotassium: cropData.length > 0 ? cropData.reduce((sum, d) => sum + (d.soil?.potassium || 0), 0) / cropData.length : 0,
        };

        res.json({
            cropType,
            crop,
            data: cropData.reverse(), // Chronological order
            stats
        });
    } catch (err) {
        console.error('Crop data API error:', err);
        res.status(500).json({ error: "Failed to fetch crop data.", details: err.message });
    }
});

module.exports = router;

