const machineInfo = require('./machineInfo');
const os = require('os');
const io = require("socket.io-client");

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Connected');
    socket.on('action', (msg) => {
        console.log('ACTION:', msg);
        if (msg == 'PERSISTENT_DATA') {
            socket.emit('data', {
                type: msg,
                ips: machineInfo.getRegisteredIPs(),
                host: machineInfo.getHostInfo(),
            });
        }

    })
});



// console.log('IPS: ', machineInfo.getRegisteredIPs());
// console.log('HOST: ', machineInfo.getHostInfo());
// console.log('LOAD-AVG: ', os.loadavg());
// console.log('UPTIME: ', machineInfo.getUptimeInSeconds());

// console.log('memory: ', machineInfo.getMemoryInfo());
// (async () => {
//     console.log('CPU: ', await machineInfo.getCPU());
// })();


