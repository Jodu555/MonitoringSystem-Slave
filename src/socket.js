const machineInfo = require('./machineInfo');
const io = require("socket.io-client");

const PERSISTENT_DATA = 'PERSISTENT_DATA';
const CHANGE_DATA = 'CHANGE_DATA';

function setupSocket(config) {
    this.config = config;

    const socket = io(config.coreIP);

    socket.on('disconnect', () => {
        console.log('Disconnected');
    });
    socket.on('auth', (data) => {
        console.log('Authentication:', data ? 'Success!' : 'Failed');
    });
    socket.on('action', async (msg) => {
        console.log('ACTION:', msg);
        if (msg == PERSISTENT_DATA) {
            socket.emit('data', getPersistentData());
        } else if (msg == CHANGE_DATA) {
            const data = await getChangeData()
            socket.emit('data', data);
        }
    });

    socket.on('connect', () => {
        console.log('Connected');
        socket.emit('type', { type: 'slave' })
        socket.emit('auth', { auth_token: config.key });
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
}

module.exports = { setupSocket };