# 🤖 ML-Powered Agriculture System - Complete Integration Guide

## 🎯 System Architecture

### **Data Flow:**
```
Sensor Data (every 15 min) → ML Prediction API → Predictions
Image Upload → Gemini API → Health Status → ML Prediction API → Predictions
User Query → Gemini Chatbot → Uses Predictions → Response
```

## 📋 Components Created

### 1. **ML Prediction Service** (`services/mlPrediction.js`)
- Integrates with FastAPI ML model at `http://127.0.0.1:5000/predict`
- Combines sensor data + image analysis
- Predicts:
  - Irrigation status (less/perfect/too_much/no_water_needed)
  - Health status (normal/caution/critical)
  - Water amount needed
  - Recommendations with fixes

### 2. **Gemini Service** (`services/geminiService.js`)
- **Image Analysis**: Detects crop health (healthy/rotten/dry/unhealthy)
- **Chatbot**: Intelligent responses based on ML predictions
- Uses API key: `AIzaSyD3DPnnd54Kb0JPC6T6y1E82zLrXVF-elo`

### 3. **Data Synthesis Service** (`services/dataSynthesis.js`)
- Generates synthetic sensor data every 15 minutes
- Maintains realistic patterns
- Crop-specific data generation

## 🔌 API Endpoints

### **POST `/api/predict`**
ML Prediction endpoint that combines sensor data + image analysis

**Request:**
```json
{
  "sensorData": {
    "weather": { "temperature": 25, "humidity": 60 },
    "soil": { "moisture": 35, "soilType": "Loamy", "nitrogen": 40 }
  },
  "imageAnalysis": {
    "healthStatus": "rotten",
    "confidence": 0.85,
    "issues": ["disease", "pest"]
  },
  "cropType": "Rice"
}
```

**Response:**
```json
{
  "success": true,
  "predictions": {
    "irrigation": {
      "status": "less",
      "message": "Water needed: 5.0 L/m²",
      "amount": 5.0
    },
    "health": {
      "status": "critical",
      "imageStatus": "rotten",
      "message": "CRITICAL: rotten condition detected"
    },
    "status": "critical",
    "recommendations": [
      "💧 Irrigate 5.0 L/m²",
      "🚨 CRITICAL: Immediate action required"
    ],
    "waterAmount": 5.0,
    "urgency": "critical"
  }
}
```

### **POST `/api/analyze-image`**
Gemini API image analysis

**Request:**
```json
{
  "image": "base64_encoded_image",
  "cropType": "Maize"
}
```

**Response:**
```json
{
  "success": true,
  "healthStatus": "rotten",
  "confidence": 0.92,
  "issues": ["disease", "pest damage"],
  "growthStage": "vegetative",
  "recommendations": ["Apply fungicide", "Check soil moisture"]
}
```

### **POST `/api/chatbot`**
Gemini-powered chatbot using ML predictions

**Request:**
```json
{
  "message": "Do I need to irrigate?",
  "cropType": "Rice",
  "context": {}
}
```

### **POST `/api/recommend-crops`**
Market demand-based crop recommendations

**Request:**
```json
{
  "soilData": { "moisture": 40, "soilType": "Sandy" },
  "weatherData": { "temperature": 25, "humidity": 60 }
}
```

## 🔄 How It Works

### **1. Field Selection (Crop-Specific)**
- User selects field/crop (e.g., "Rice")
- System filters sensor data for that crop only
- Image analysis focuses on that crop type
- ML predictions are crop-specific

### **2. Data Synthesis (Every 15 min)**
- Automatically generates synthetic sensor data
- Maintains realistic patterns
- Updates database with new readings
- Crop-specific if field is selected

### **3. Image Analysis Flow**
```
Upload Image → Gemini API → Health Status (rotten/healthy/dry) 
→ ML Prediction API → Combined Prediction → Display Results
```

### **4. ML Prediction Logic**
- **High Humidity (>70%)**: No irrigation needed
- **Low Moisture (<30%)**: Critical - irrigate immediately
- **High Moisture (>60%)**: Over-irrigation - reduce water
- **Image Status = Rotten**: Critical health status
- **Image Status = Dry**: Caution - increase irrigation

### **5. Status Indicators**
- **🟢 Normal**: Everything optimal
- **🟡 Caution**: Monitor closely, minor issues
- **🔴 Critical**: Immediate action required

## 🚀 Setup Instructions

### **1. Environment Variables**
Add to `.env`:
```env
GEMINI_API=AIzaSyD3DPnnd54Kb0JPC6T6y1E82zLrXVF-elo
ML_API_URL=http://127.0.0.1:5000/predict
```

### **2. Start Your FastAPI ML Server**
```bash
# Your ML model should be running on port 5000
# Expected endpoint: POST http://127.0.0.1:5000/predict
```

### **3. Start Express Server**
```bash
cd agri/server
npm start
```

The data synthesis service will automatically start generating data every 15 minutes.

## 📊 Frontend Integration

### **PhotoUpload Component**
- Now calls Gemini API for image analysis
- Then calls ML prediction API
- Displays health status and recommendations
- Shows status indicators (caution/normal/critical)

### **Chatbot Component**
- Uses Gemini API for intelligent responses
- Context includes ML predictions
- Provides suggestions based on system predictions

## 🎨 Display Format

### **Prediction Display:**
```
🟢 Normal | 🟡 Caution | 🔴 Critical

Irrigation: less/perfect/too_much/no_water_needed
Health: normal/caution/critical
Water Amount: X L/m²
Recommendations:
  • Fix 1
  • Fix 2
```

## ✅ Testing

1. **Test Image Analysis:**
   - Upload crop image
   - Check Gemini API response
   - Verify ML prediction integration

2. **Test Chatbot:**
   - Ask: "Do I need to irrigate?"
   - Should use ML predictions in response

3. **Test Data Synthesis:**
   - Check database every 15 min
   - Verify new sensor data appears

4. **Test Crop-Specific:**
   - Select "Rice" field
   - Upload rice image
   - Verify predictions are rice-specific

## 🔧 Troubleshooting

- **ML API not available**: System falls back to rule-based predictions
- **Gemini API fails**: Falls back to local analysis
- **No sensor data**: Uses default values for predictions

