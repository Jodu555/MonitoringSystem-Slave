const machineInfo = require('./machineInfo');
const io = require("socket.io-client");

const PERSISTENT_DATA = 'PERSISTENT_DATA';
const CHANGE_DATA = 'CHANGE_DATA';


class socketManager {

    constructor(config) {
        this.config = config;
        this.auth = false;
        this.setup();
    }

    setup() {
        this.socket = io(this.config.coreIP);

        this.socket.on('disconnect', () => {
            console.log('Disconnected');
        });
        this.socket.on('auth', (data) => {
            this.auth = data;
            console.log('Authentication:', data ? 'Success!' : 'Failed');
        });
        this.socket.on('action', async (msg) => {
            console.log('ACTION:', msg);
            if (msg == PERSISTENT_DATA) {
                this.socket.emit('data', getPersistentData());
            } else if (msg == CHANGE_DATA) {
                const data = await getChangeData()
                this.socket.emit('data', data);
            }
        });

        this.socket.on('connect', () => {
            console.log('Connected');
            this.socket.emit('type', { type: 'slave' })
            this.socket.emit('auth', { auth_token: this.config.key });
        });


    }

    getPersistentData() {
        return {
            type: PERSISTENT_DATA,
            ips: machineInfo.getRegisteredIPs(),
            host: machineInfo.getHostInfo(),
        };
    }
    async getChangeData() {
        return {
            type: CHANGE_DATA,
            loadavg: machineInfo.getLoadAvarage(),
            uptime: machineInfo.getUptimeInSeconds(),
            memory: machineInfo.getMemoryInfo(),
            cpu: await machineInfo.getCPU(),
        };
    }
}

module.exports = socketManager;