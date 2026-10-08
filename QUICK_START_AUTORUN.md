
# 🎯 Auto-Run K6 Performance Testing System - COMPLETE

## ✅ What's Been Delivered

```
🚀 AUTO-RUN SYSTEM
├── ⚙️  Daily Scheduled Execution
│   ├── Configurable schedule (daily, weekly, custom)
│   ├── Automatic retry on failure (up to 3 attempts)
│   └── Survives system restarts
│
├── 🏥 Self-Healing Capabilities
│   ├── Auto-restarts K6 if unavailable
│   ├── Clears disk space if low
│   ├── Retries network connectivity
│   └── Monitors CPU usage
│
├── 📡 MCP Server Integration
│   ├── 7 REST API endpoints
│   ├── Real-time metrics aggregation
│   ├── Health monitoring
│   ├── Alert generation
│   └── Historical trending
│
└── 📊 Live Web Dashboard
    ├── 5 tabs (Overview, Health, Tests, Metrics, Alerts)
    ├── Auto-refresh every 5 seconds
    ├── Real-time charts
    ├── Connection status indicator
    └── Alert notifications
```

---

## 📦 4 New Files Created

| File | Purpose | Type |
|------|---------|------|
| `auto-run-k6-with-healing.ps1` | Automated test runner with self-healing | PowerShell |
| `mcp-server.js` | Centralized monitoring server | Node.js |
| `mcp-dashboard.html` | Real-time performance dashboard | HTML/JavaScript |
| `AUTO_RUN_SETUP_GUIDE.md` | Comprehensive setup guide | Documentation |

---

## 🚀 Quick Start (3 Steps)

### 1️⃣ Start MCP Server
```powershell
npm run mcp:start
```
→ Server listens on http://localhost:5000

### 2️⃣ Open Live Dashboard
```
file:///c:\Users\lokesh.sharma\playwright-js-E2E-Automation\mcp-dashboard.html
```
→ Shows "Connected" status

### 3️⃣ Start Auto-Run Scheduler
```powershell
npm run k6:auto-run
```
→ Scheduled for daily 2 AM (configurable)

---

## 🔄 How It Works

```
SCHEDULED TIME (Daily 2 AM)
         ↓
   PHASE 1: HEALTH CHECK
   ├─ K6 available?
   ├─ Network OK?
   ├─ Disk space sufficient?
   └─ Send status to MCP
         ↓
   PHASE 2: AUTO-HEALING (if needed)
   ├─ Restart K6 if unavailable
   ├─ Clear disk if low
   └─ Retry network connectivity
         ↓
   PHASE 3: TEST EXECUTION
   ├─ Run K6 multi-stage test
   ├─ Monitor CPU usage
   └─ Retry on failure (max 3)
         ↓
   PHASE 4: RESULTS
   ├─ Parse metrics
   ├─ Update dashboard
   └─ Notify MCP server
         ↓
   Dashboard Updates in Real-Time
```

---

## 📊 Live Dashboard Features

### Overview Tab
```
┌─ Current System Status (Health, K6, Network)
├─ Test Status (Running, Total, Avg Response)
├─ Recent Alerts (Latest 3)
└─ Response Time Trend (Live Chart)
```

### Health Tab
```
├─ System Health Details
├─ K6 Status
├─ Network Status
├─ Disk Space Available
└─ System Uptime
```

### Tests Tab
```
└─ Recent Test Runs (Last 10)
```

### Metrics Tab
```
├─ Performance Metrics (p95, Trend)
└─ Cache Performance (Hit/Miss Rates)
```

### Alerts Tab
```
└─ Complete Alert History
```

---

## ⚙️ Configuration Examples

### Daily at 3 AM
```powershell
.\tests\features\performance\auto-run-k6-with-healing.ps1 `
  -Schedule daily -RunTime "03:00"
```

### Weekly
```powershell
.\tests\features\performance\auto-run-k6-with-healing.ps1 `
  -Schedule weekly
```

### Without MCP (if needed)
```powershell
.\tests\features\performance\auto-run-k6-with-healing.ps1 `
  -EnableMCP $false
```

---

## 🏥 Self-Healing Examples

| Issue | Detection | Action | Result |
|-------|-----------|--------|--------|
| K6 crashes | Version check fails | Kill orphans, reinitialize | Test resumes |
| Disk full | < 5GB space | Clear temp files | More space freed |
| Network down | Connection timeout | Retry (3x) with delays | Connectivity restored |
| Test stalls | Timeout exceeded | Kill process | Marked as failed, retried |

---

## 📡 MCP Server API

```
GET  /api/status       → Server uptime & health
GET  /api/health       → System health details
POST /api/health       → Receive health report
GET  /api/test-events  → Recent test summary
POST /api/test-events  → Receive test event
GET  /api/dashboard    → All data for dashboard
GET  /api/metrics      → Aggregated metrics
```

---

## 📈 What Gets Monitored

```
FROM K6 TESTS:
├─ Response times (p50, p95, p99)
├─ Success/error rates
├─ Cache hit rates
├─ Requests per second
└─ HTTP status codes

FROM AUTO-RUN:
├─ System health (K6, network, disk)
├─ CPU usage during test
├─ Test duration
├─ Retry attempts
└─ Healing actions

FROM MCP SERVER:
├─ Health history (last 1000)
├─ Test runs (last 100)
├─ Alerts generated
├─ Trend analysis
└─ Performance degradation
```

---

## 🎯 Key Commands

```powershell
# Start MCP server
npm run mcp:start

# Configure & start auto-run (daily)
npm run k6:auto-run

# Run K6 test manually
npm run k6:run-manual

# Check scheduled tasks
Get-ScheduledTask | Where-Object {$_.TaskName -like "*K6*"}

# View auto-run logs
Get-Content logs/auto-run/auto-run_*.log -Tail 50

# View MCP server logs
Get-Content mcp-logs/mcp-server-*.log -Tail 50
```

---

## ✅ Pre-Flight Checklist

- [ ] Node.js v14+ installed
- [ ] K6 installed and in PATH
- [ ] npm scripts working
- [ ] MCP server starts: `npm run mcp:start`
- [ ] Dashboard loads in browser
- [ ] Manual test runs: `npm run k6:run-manual`
- [ ] Auto-run registers: `npm run k6:auto-run`
- [ ] MCP server shows in dashboard

---

## 🚨 Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| Port 5000 in use | `netstat -ano \| findstr :5000` |
| Dashboard "Disconnected" | Check MCP server running |
| K6 auto-restart looping | Check K6 installation |
| Scheduled task not running | Verify Task Scheduler settings |
| High CPU usage | Check K6 test isn't overwhelming |

---

## 📚 Documentation Files

| Document | Purpose |
|----------|---------|
| `AUTO_RUN_SETUP_GUIDE.md` | Complete setup & troubleshooting |
| `AUTORUN_COMPLETE_SUMMARY.md` | System overview & architecture |
| `K6_MULTI_STAGE_GUIDE.md` | K6 test details |
| `QUICK_REFERENCE.md` | Quick reference card |
| `CPU_PERFORMANCE_CORRELATION.md` | How to analyze results |

---

## 🎉 You're All Set!

Your automated K6 performance testing infrastructure is ready to use:

```
✅ Runs automatically on schedule
✅ Self-heals when issues occur  
✅ Monitors in real-time via MCP
✅ Shows live dashboard
✅ Tracks historical trends
✅ Generates alerts
✅ Retries on failure
✅ No manual intervention needed
```

---

## 🚀 Next Steps

1. **Start MCP Server:**
   ```powershell
   npm run mcp:start
   ```

2. **Open Dashboard:**
   ```
   file:///c:\Users\lokesh.sharma\playwright-js-E2E-Automation\mcp-dashboard.html
   ```

3. **Configure Auto-Run:**
   ```powershell
   npm run k6:auto-run
   ```

4. **Verify Setup:**
   - Check dashboard shows "Connected"
   - Run manual test: `npm run k6:run-manual`
   - Confirm test appears in dashboard

5. **Monitor:**
   - Keep dashboard open
   - Check logs periodically
   - Adjust configuration as needed

---

**Your automated performance testing system is now live! 🎉**
