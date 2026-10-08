/**
 * K6 Performance Testing MCP Server
 *
 * Provides:
 * - Health monitoring and reporting
 * - Test event notifications
 * - Auto-healing triggers
 * - Performance analytics
 * - Dashboard data aggregation
 */

const http = require('http');
const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');

// ============================================================
// CONFIGURATION
// ============================================================

const config = {
  port: 5000,
  host: 'localhost',
  dataDir: path.join(process.cwd(), 'mcp-data'),
  logsDir: path.join(process.cwd(), 'mcp-logs'),
  alertThresholds: {
    maxP95ResponseTime: 3000,  // ms
    minCacheHitRate: 50,        // %
    maxErrorRate: 5,            // %
    maxCPUUsage: 90,            // %
    maxMemoryUsage: 2048        // MB
  }
};

// Ensure directories exist
[config.dataDir, config.logsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ============================================================
// LOGGING
// ============================================================

class Logger {
  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    console.log(logMessage, data || '');

    const logFile = path.join(config.logsDir, `mcp-server-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, `${logMessage} ${data ? JSON.stringify(data) : ''}\n`);
  }

  info(message, data) { this.log('INFO', message, data); }
  warn(message, data) { this.log('WARN', message, data); }
  error(message, data) { this.log('ERROR', message, data); }
  debug(message, data) { this.log('DEBUG', message, data); }
}

const logger = new Logger();

// ============================================================
// HEALTH MONITORING
// ============================================================

class HealthMonitor extends EventEmitter {
  constructor() {
    super();
    this.healthHistory = [];
    this.currentState = {
      status: 'unknown',
      lastUpdated: null,
      checks: {}
    };
    this.alerts = [];
  }

  updateHealth(healthData) {
    logger.info('Health update received', { status: healthData.status });

    this.currentState = {
      ...healthData,
      lastUpdated: new Date()
    };

    this.healthHistory.push({
      ...this.currentState,
      timestamp: new Date()
    });

    // Keep only last 1000 records
    if (this.healthHistory.length > 1000) {
      this.healthHistory = this.healthHistory.slice(-1000);
    }

    // Check for issues
    this.checkHealthThresholds(healthData);

    this.emit('health-updated', this.currentState);
  }

  checkHealthThresholds(healthData) {
    const newAlerts = [];

    if (healthData.checks.diskSpace && healthData.checks.diskSpace.freeGB < 5) {
      newAlerts.push({
        type: 'LOW_DISK_SPACE',
        severity: 'warning',
        message: `Low disk space: ${healthData.checks.diskSpace.freeGB}GB remaining`,
        timestamp: new Date()
      });
    }

    if (healthData.checks.k6 && healthData.checks.k6.status === 'error') {
      newAlerts.push({
        type: 'K6_UNAVAILABLE',
        severity: 'critical',
        message: 'K6 is not available',
        timestamp: new Date()
      });
    }

    if (healthData.checks.network && healthData.checks.network.status === 'warning') {
      newAlerts.push({
        type: 'NETWORK_ISSUE',
        severity: 'warning',
        message: 'Network connectivity issue detected',
        timestamp: new Date()
      });
    }

    this.alerts.push(...newAlerts);
    newAlerts.forEach(alert => {
      logger.warn(`Alert: ${alert.type}`, alert);
      this.emit('alert', alert);
    });
  }

  getHealthSummary() {
    const recent = this.healthHistory.slice(-10);
    return {
      current: this.currentState,
      recent,
      alerts: this.alerts.slice(-20),
      uptime: this.calculateUptime()
    };
  }

  calculateUptime() {
    if (this.healthHistory.length === 0) return 'N/A';

    const first = this.healthHistory[0].timestamp;
    const last = this.healthHistory[this.healthHistory.length - 1].timestamp;
    const diff = (last - first) / 1000 / 60; // minutes

    return `${Math.round(diff)} minutes`;
  }
}

// ============================================================
// TEST EVENT PROCESSOR
// ============================================================

class TestEventProcessor extends EventEmitter {
  constructor() {
    super();
    this.testRuns = [];
    this.currentTest = null;
  }

  processTestStart(event) {
    logger.info('Test started', {
      script: event.testScript,
      expectedDuration: event.expectedDuration
    });

    this.currentTest = {
      id: `test-${Date.now()}`,
      startTime: new Date(event.timestamp),
      testScript: event.testScript,
      expectedDuration: event.expectedDuration,
      status: 'running',
      metrics: {}
    };

    this.emit('test-started', this.currentTest);
  }

  processTestComplete(event) {
    logger.info('Test completed', event.results);

    if (this.currentTest) {
      this.currentTest.endTime = new Date();
      this.currentTest.status = 'completed';
      this.currentTest.results = event.results;
      this.currentTest.duration = (this.currentTest.endTime - this.currentTest.startTime) / 1000; // seconds

      // Validate results against thresholds
      this.validateResults(event.results);

      this.testRuns.push(this.currentTest);

      // Keep only last 100 test runs
      if (this.testRuns.length > 100) {
        this.testRuns = this.testRuns.slice(-100);
      }

      this.emit('test-completed', this.currentTest);
      this.currentTest = null;
    }
  }

  validateResults(results) {
    const issues = [];

    if (results.p95ResponseTime > config.alertThresholds.maxP95ResponseTime) {
      issues.push({
        type: 'HIGH_RESPONSE_TIME',
        value: results.p95ResponseTime,
        threshold: config.alertThresholds.maxP95ResponseTime,
        severity: 'warning'
      });
    }

    if (results.cacheHitRate < config.alertThresholds.minCacheHitRate) {
      issues.push({
        type: 'LOW_CACHE_HIT_RATE',
        value: results.cacheHitRate,
        threshold: config.alertThresholds.minCacheHitRate,
        severity: 'warning'
      });
    }

    if (results.errorCount > config.alertThresholds.maxErrorRate) {
      issues.push({
        type: 'HIGH_ERROR_RATE',
        value: results.errorCount,
        threshold: config.alertThresholds.maxErrorRate,
        severity: 'critical'
      });
    }

    issues.forEach(issue => {
      logger.warn(`Validation issue: ${issue.type}`, issue);
      this.emit('validation-issue', issue);
    });

    return issues;
  }

  getTestSummary() {
    const recent = this.testRuns.slice(-10);
    const avgP95 = recent.length > 0
      ? recent.reduce((sum, t) => sum + (t.results?.p95ResponseTime || 0), 0) / recent.length
      : 0;

    return {
      totalRuns: this.testRuns.length,
      recentRuns: recent,
      averageP95ResponseTime: Math.round(avgP95),
      currentTest: this.currentTest,
      trend: this.calculateTrend()
    };
  }

  calculateTrend() {
    if (this.testRuns.length < 2) return 'insufficient_data';

    const recent = this.testRuns.slice(-5);
    const older = this.testRuns.slice(-10, -5);

    if (older.length === 0) return 'insufficient_data';

    const recentAvg = recent.reduce((sum, t) => sum + (t.results?.p95ResponseTime || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, t) => sum + (t.results?.p95ResponseTime || 0), 0) / older.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (change > 10) return 'degrading';
    if (change < -10) return 'improving';
    return 'stable';
  }
}

// ============================================================
// API ROUTES
// ============================================================

const healthMonitor = new HealthMonitor();
const testProcessor = new TestEventProcessor();

const routes = {
  // Health report endpoint
  '/api/health': {
    POST: (req, data) => {
      healthMonitor.updateHealth(data.systemHealth);
      return { status: 'ok', message: 'Health report received' };
    },
    GET: () => {
      return healthMonitor.getHealthSummary();
    }
  },

  // Test events endpoint
  '/api/test-events': {
    POST: (req, data) => {
      if (data.type === 'test_start') {
        testProcessor.processTestStart(data);
      } else if (data.type === 'test_complete') {
        testProcessor.processTestComplete(data);
      }
      return { status: 'ok', message: 'Event processed' };
    },
    GET: () => {
      return testProcessor.getTestSummary();
    }
  },

  // Dashboard data endpoint
  '/api/dashboard': {
    GET: () => {
      return {
        health: healthMonitor.getHealthSummary(),
        tests: testProcessor.getTestSummary(),
        timestamp: new Date()
      };
    }
  },

  // Status endpoint
  '/api/status': {
    GET: () => {
      return {
        server: 'running',
        uptime: process.uptime(),
        health: healthMonitor.currentState.status,
        currentTest: testProcessor.currentTest?.status || 'none',
        alerts: healthMonitor.alerts.length,
        timestamp: new Date()
      };
    }
  },

  // Metrics endpoint
  '/api/metrics': {
    GET: () => {
      const health = healthMonitor.getHealthSummary();
      const tests = testProcessor.getTestSummary();

      return {
        health: {
          status: health.current.status,
          k6Available: health.current.checks.k6?.status === 'ok',
          networkOk: health.current.checks.network?.status !== 'error',
          diskSpaceGB: health.current.checks.diskSpace?.freeGB || 0
        },
        performance: {
          averageP95: tests.averageP95ResponseTime,
          trend: tests.trend,
          totalTests: tests.totalRuns,
          recentSuccessRate: tests.recentRuns.length > 0
            ? (tests.recentRuns.filter(t => !t.results?.errorCount).length / tests.recentRuns.length * 100).toFixed(2)
            : 0
        },
        alerts: {
          total: healthMonitor.alerts.length,
          recent: healthMonitor.alerts.slice(-5)
        }
      };
    }
  },

  // Self-healing metrics endpoint
  '/api/selfheal-metrics': {
    GET: () => {
      try {
        // Try to get self-healing stats from the selfHeal fixture
        const selfHeal = require('../Utility/selfHealFixture');
        const reporting = require('../Setup/reportingFixture');
        
        const selfHealStats = selfHeal.getStats();
        const reportStats = reporting.getAggregateStats();
        
        return {
          selfHealing: {
            totalEvents: selfHealStats.total,
            successes: selfHealStats.successes,
            failures: selfHealStats.failures,
            successRate: selfHealStats.successRate,
            byAction: selfHealStats.byAction
          },
          testRuns: {
            totalRuns: reportStats.totalRuns || 0,
            totalSteps: reportStats.totalSteps || 0,
            passRate: reportStats.passRate || 0,
            selfHealSuccessRate: reportStats.selfHealSuccessRate || 0
          },
          timestamp: new Date()
        };
      } catch (err) {
        logger.error('Failed to get self-healing metrics', err);
        return {
          error: 'Failed to retrieve self-healing metrics',
          message: err.message
        };
      }
    }
  },
  
  // Self-healing report endpoint
  '/api/selfheal-report': {
    GET: () => {
      try {
        const reporting = require('../Setup/reportingFixture');
        const reportPath = reporting.generateSelfHealReport();
        
        return {
          status: 'ok',
          reportPath,
          message: 'Self-healing report generated'
        };
      } catch (err) {
        logger.error('Failed to generate self-healing report', err);
        return {
          status: 'error',
          message: err.message
        };
      }
    }
  }
};

// ============================================================
// HTTP SERVER
// ============================================================

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'] || 'unknown'
  });

  const route = routes[req.url];

  if (!route) {
    logger.warn('Route not found', { method: req.method, url: req.url });
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Route not found' }));
    return;
  }

  const handler = route[req.method];

  if (!handler) {
    logger.warn('Method not allowed', { method: req.method, url: req.url });
    res.writeHead(405);
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // Parse request body for POST
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const result = handler(req, data);
        res.writeHead(200);
        res.end(JSON.stringify(result));
      } catch (err) {
        logger.error('Request processing error', err);
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
  } else {
    // GET request
    try {
      const result = handler(req);
      res.writeHead(200);
      res.end(JSON.stringify(result));
    } catch (err) {
      logger.error('Request processing error', err);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Server error' }));
    }
  }
});

// ============================================================
// EVENT LISTENERS
// ============================================================

healthMonitor.on('alert', (alert) => {
  logger.warn(`Health Alert: ${alert.type}`, alert);
});

testProcessor.on('test-completed', (test) => {
  logger.info('Test run completed', {
    id: test.id,
    duration: test.duration,
    status: test.status
  });
});

testProcessor.on('validation-issue', (issue) => {
  logger.warn(`Validation Issue: ${issue.type}`, issue);
});

// ============================================================
// SERVER STARTUP
// ============================================================

server.listen(config.port, config.host, () => {
  logger.info(`MCP Server started on http://${config.host}:${config.port}`);
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  K6 Performance Testing MCP Server                    ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  Server: http://${config.host}:${config.port}`);
  console.log('║  Endpoints:                                            ║');
  console.log('║  • GET  /api/health       - Get health status          ║');
  console.log('║  • POST /api/health       - Report health              ║');
  console.log('║  • GET  /api/test-events  - Get test summary           ║');
  console.log('║  • POST /api/test-events  - Report test event          ║');
  console.log('║  • GET  /api/dashboard    - Get dashboard data         ║');
  console.log('║  • GET  /api/metrics      - Get aggregated metrics     ║');
  console.log('║  • GET  /api/status       - Get server status          ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`✓ Ready to receive K6 health reports and test events`);
  console.log(`✓ Data directory: ${config.dataDir}`);
  console.log(`✓ Logs directory: ${config.logsDir}`);
  console.log('');
});

process.on('SIGTERM', () => {
  logger.info('Server shutting down...');
  server.close(() => {
    logger.info('Server stopped');
    process.exit(0);
  });
});

module.exports = { server, healthMonitor, testProcessor, logger };
