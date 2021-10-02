const machineInfo = require('./machineInfo');
const io = require("socket.io-client");

const PERSISTENT_DATA = 'PERSISTENT_DATA';
const CHANGE_DATA = 'CHANGE_DATA';


class socketManager {
    constructor(config, commandManager) {
        this.logScreen = false;
        this.logs = [];
        this.config = config;
        this.commandManager = commandManager;
        this.auth = false;
        this.setup();
    }
    msg(...msg) {
        this.logScreen ? console.log(...msg) : this.logs.push(...msg);
    }
    setup() {
        this.socket = io(this.config.coreIP);

        this.socket.on("connect_error", () => {
            this.msg('Socket Connection: Failed');
        });
        this.socket.on('disconnect', () => {
            this.msg('Socket Connection: Disconnected');
        });
        this.socket.on('auth', (data) => {
            this.auth = data;
            this.msg('Socket Connection: ' + 'Authentication:', data ? 'Success!' : 'Failed');
        });
        this.socket.on('action', async (msg) => {
            this.msg('Socket Usage Action:', msg)
            if (msg == PERSISTENT_DATA) {
                this.socket.emit('data', this.getPersistentData());
            } else if (msg == CHANGE_DATA) {
                const data = await this.getChangeData()
                this.socket.emit('data', data);
            }
        });
        this.socket.on('connect', () => {
            this.msg('Socket Connection: Connected');
            this.socket.emit('type', { type: 'slave' })
            this.socket.emit('auth', { auth_token: this.config.key });
        });


    }
    configChange(config) {
        this.auth = false;
        this.config = config;
        this.socket.disconnect();
        this.socket = null;
        this.setup();
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