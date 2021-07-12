const machineInfo = require('./machineInfo');
const os = require('os');
const io = require("socket.io-client");

const PERSISTENT_DATA = 'PERSISTENT_DATA';
const CHANGE_DATA = 'CHANGE_DATA';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Connected');
    socket.on('action', async (msg) => {
        console.log('ACTION:', msg);
        if (msg == PERSISTENT_DATA) {
            socket.emit('data', getPersistentData());
        } else if (msg == CHANGE_DATA) {
            socket.emit('data', await getChangeData());
        }
    });
});

function getPersistentData() {
    return {
        type: PERSISTENT_DATA,
        ips: machineInfo.getRegisteredIPs(),
        host: machineInfo.getHostInfo(),
    };
}

async function getChangeData() {
    return {
        type: CHANGE_DATA,
        loadavg: os.loadavg(),
        uptime: machineInfo.getUptimeInSeconds(),
        memory: machineInfo.getMemoryInfo(),
        cpu: await machineInfo.getCPU(),
    };
}

// console.log('IPS: ', machineInfo.getRegisteredIPs());
// console.log('HOST: ', machineInfo.getHostInfo());
// console.log('LOAD-AVG: ', os.loadavg());
// console.log('UPTIME: ', machineInfo.getUptimeInSeconds());
// console.log('memory: ', machineInfo.getMemoryInfo());
// (async () => {
//     console.log('CPU: ', await machineInfo.getCPU());
// })();


