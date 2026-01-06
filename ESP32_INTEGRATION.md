# ESP32 Integration Documentation

## Overview
The ESP32 integration allows the AgriWater AI system to send visual and audio alerts to a physical ESP32 device based on system status, alerts, and recommendations.

## How It Works

### Automatic Integration
When the `/api/status` endpoint is called (which happens every 2 minutes from the frontend), the system:

1. **Detects Alerts**: Analyzes sensor data and generates alerts
2. **Determines State**: Maps alerts to ESP32 states:
   - `critical` → Red LED + Buzzer (5 beeps)
   - `caution` → Blue LED + Buzzer (1 long beep)
   - `normal` → Green LED (no buzzer)
3. **Sends Signal**: Automatically sends HTTP request to ESP32
4. **Non-blocking**: ESP32 updates don't slow down API responses

### State Mapping Logic

```javascript
Critical State (Red LED + Buzzer):
- Critical severity alerts
- Critical priority recommendations
- Leak detection
- Critical dry stress

Caution State (Blue LED + Buzzer):
- High severity alerts
- High priority recommendations
- Medium priority recommendations
- Irrigation needed

Normal State (Green LED):
- No active alerts
- Low priority recommendations
- All systems operating normally
```

## ESP32 Hardware Setup

### Pin Configuration
- **Red LED**: GPIO 16
- **Blue LED**: GPIO 21
- **Green LED**: GPIO 5
- **Buzzer**: GPIO 23

### WiFi Requirements
- 2.4GHz network (ESP32 doesn't support 5GHz)
- Same network as backend server
- Static IP recommended (or use DHCP reservation)

## API Endpoints

### 1. Set ESP32 State (Manual Control)
```http
POST /api/esp32/set
Content-Type: application/json

{
  "state": "normal" | "caution" | "critical"
}
```

**Response:**
```json
{
  "success": true,
  "state": "critical",
  "message": "ESP32 state set to critical",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. Get ESP32 Configuration
```http
GET /api/esp32/config
```

**Response:**
```json
{
  "enabled": true,
  "ip": "192.168.1.100",
  "port": "80",
  "url": "http://192.168.1.100:80",
  "lastState": "caution"
}
```

### 3. Test ESP32 Connection
```http
GET /api/esp32/test
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "ESP32 is reachable",
  "url": "http://192.168.1.100:80/set?state=normal"
}
```

## Configuration

### Environment Variables
In `server/.env`:

```env
# ESP32 IP Address (required if enabled)
ESP32_IP=192.168.1.100

# ESP32 Port (default: 80)
ESP32_PORT=80

# Enable/Disable ESP32 Integration (default: true)
ESP32_ENABLED=true
```

### Disabling ESP32 Integration
Set `ESP32_ENABLED=false` in `.env` to disable without removing code.

## ESP32 Code Requirements

The ESP32 must implement the following endpoint:

```cpp
GET /set?state={normal|caution|critical}
```

**Expected Behavior:**
- `state=normal` → Green LED ON, others OFF, no buzzer
- `state=caution` → Blue LED ON, others OFF, 1 long beep (2 seconds, 400Hz)
- `state=critical` → Red LED ON, others OFF, 5 beeps (500ms each, 700Hz)

**Response:**
```
200 OK
OK
```

## Integration Points

### 1. Status Endpoint Integration
Located in `server/index.js`:
```javascript
// After generating alerts and recommendations
ESP32Service.updateFromStatus(statusData).catch(err => {
    console.warn('ESP32 update failed (non-critical):', err.message);
});
```

### 2. Service Implementation
Located in `server/services/esp32Service.js`:
- Handles HTTP communication with ESP32
- Maps alerts to states
- Caches last state to avoid duplicate requests
- Provides error handling and logging

## Error Handling

### Connection Failures
- ESP32 updates are **non-blocking**
- Failures are logged but don't affect API responses
- System continues to function even if ESP32 is offline

### Common Issues

**ESP32 Not Reachable:**
```
⚠️ ESP32 not reachable at 192.168.1.100. Is it connected?
```
**Solution:** Check WiFi connection, IP address, and network

**Timeout:**
```
❌ ESP32 communication error: timeout
```
**Solution:** Check ESP32 is running, increase timeout if needed

**Invalid State:**
```
Invalid state. Must be one of: normal, caution, critical
```
**Solution:** Use valid state values only

## Testing

### Manual Test
```bash
# Test ESP32 connection
curl http://localhost:5000/api/esp32/test

# Set state manually
curl -X POST http://localhost:5000/api/esp32/set \
  -H "Content-Type: application/json" \
  -d '{"state":"critical"}'

# Check configuration
curl http://localhost:5000/api/esp32/config
```

### Direct ESP32 Test
```bash
# Test ESP32 directly (bypass backend)
curl http://192.168.1.100/set?state=normal
```

## Monitoring

### Logs
ESP32 operations are logged:
- ✅ Success: `ESP32 state set to: critical`
- ⚠️ Warning: `ESP32 not reachable at...`
- ❌ Error: `ESP32 communication error: ...`

### State Caching
Last state is cached to prevent duplicate requests:
- Same state won't trigger multiple ESP32 calls
- Reduces network traffic
- Improves performance

## Best Practices

1. **Static IP**: Use DHCP reservation or static IP for ESP32
2. **Network**: Ensure ESP32 and backend are on same network
3. **Monitoring**: Check logs regularly for connection issues
4. **Testing**: Test ESP32 connection before deploying
5. **Fallback**: System works without ESP32 (graceful degradation)

## Troubleshooting Checklist

- [ ] ESP32 connected to WiFi
- [ ] ESP32 IP address correct in `.env`
- [ ] ESP32 and backend on same network
- [ ] ESP32 code uploaded and running
- [ ] Serial Monitor shows ESP32 IP
- [ ] Direct curl test works
- [ ] Backend can reach ESP32 IP
- [ ] ESP32_ENABLED=true in `.env`

## Future Enhancements

Potential improvements:
- Multiple ESP32 devices support
- Custom alert patterns
- MQTT integration
- WebSocket real-time updates
- Alert history tracking
- Device health monitoring

