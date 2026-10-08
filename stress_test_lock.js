const { generateLeadFormReport } = require('./Utility/reportHelper');
const workerId = process.argv[2];
const count = 20;
for (let i = 0; i < count; i++) {
    generateLeadFormReport(
        `https://stress-test-${workerId}.example.com/`,
        `form-${workerId}-${i}`,
        'https://stress-test.example.com/form',
        true,
        `stress test row ${workerId}-${i}`
    );
}
console.log(`worker ${workerId} done`);
