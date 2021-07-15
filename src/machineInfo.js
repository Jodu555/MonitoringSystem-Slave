const os = require("os");

function cpuAverage() {
    var totalIdle = 0, totalTick = 0;
    var cpus = os.cpus();
    for (var i = 0, len = cpus.length; i < len; i++) {
        var cpu = cpus[i];
        for (type in cpu.times) {
            totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
    }

    return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
}

function getCPU() {
    return new Promise((resolve, reject) => {
        var startMeasure = cpuAverage();
        setTimeout(() => {
            var endMeasure = cpuAverage();
            var idleDifference = endMeasure.idle - startMeasure.idle;
            var totalDifference = endMeasure.total - startMeasure.total;
            var percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);
            resolve(percentageCPU);
        }, 100);
    });
}

function getMemoryInfo() {
    var freeMem = os.freemem();
    var totalMem = os.totalmem();

    const memoryInfo = {
        current: ((totalMem - freeMem) / 1024 / 1024 / 1024).toFixed(1),
        total: (totalMem / 1024 / 1024 / 1024).toFixed(0)
    }
    return memoryInfo;
}

function getUptimeInSeconds() {
    return os.uptime();
}

function getLoadAvarage() {
    return os.loadavg();
}

function getRegisteredIPs() {
    let ifaces = os.networkInterfaces();
    return Object.keys(ifaces).reduce((result, value) => {
        return result.concat(ifaces[value].reduce((res, val) => {
            return res.concat(val.family === 'IPv4' && !val.internal ? [val] : []);
        }, []));
    }, []);
}

function getHostInfo() {
    const hostInfo = {
        hostname: os.hostname(),
        platform: os.platform(),
        platformType: os.type(),
        homedir: os.userInfo().homedir,
        username: os.userInfo().username
    };
    return hostInfo;
}

module.exports = {
    getCPU,
    getMemoryInfo,
    getUptimeInSeconds,
    getLoadAvarage,
    getHostInfo,
    getRegisteredIPs
}