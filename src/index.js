const fs = require('fs');
const machineInfo = require('./machineInfo');
const os = require('os');
const io = require("socket.io-client");

//Config Stuff
let config;
if (fs.existsSync('config.json')) {
    config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
} else {
    config = {
        coreIP: 'http://localhost:3000',
        key: 'INSERT-YOUR-KEY-HERE'
    };
    fs.writeFileSync('config.json', JSON.stringify(config));
}

const PERSISTENT_DATA = 'PERSISTENT_DATA';
const CHANGE_DATA = 'CHANGE_DATA';
const socket = io(config.coreIP);


socket.on('connect', () => {
    console.log('Connected');
    socket.on('disconnect', () => {
        console.log('Disconnected');
    });
    socket.emit('type', { type: 'slave' })
    socket.on('auth', (data) => {
        console.log('Authentication:', data ? 'Success!' : 'Failed');
    });
    socket.emit('auth', { auth_token: config.key });
    socket.on('action', async (msg) => {
        console.log('ACTION:', msg);
        if (msg == PERSISTENT_DATA) {
            socket.emit('data', getPersistentData());
        } else if (msg == CHANGE_DATA) {
            const data = await getChangeData()
            socket.emit('data', data);
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
        loadavg: machineInfo.getLoadAvarage(),
        uptime: machineInfo.getUptimeInSeconds(),
        memory: machineInfo.getMemoryInfo(),
        cpu: await machineInfo.getCPU(),
    };
}


