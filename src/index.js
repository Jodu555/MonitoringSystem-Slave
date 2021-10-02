const fs = require('fs');
const startup = Date.now();
const { commandManager, Command } = require('./commandManager');

//Config Stuff
let config;
if (fs.existsSync('config.json')) {
    config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
} else {
    config = {
        coreIP: 'http://localhost:3000',
        key: 'INSERT-YOUR-KEY-HERE'
    };
    fs.writeFileSync('config.json', JSON.stringify(config, null, 3));
}

const CommandManager = new commandManager(process.stdin, process.stdout);

const socketManager = require('./socketManager');
const SocketManager = new socketManager(config, CommandManager);

CommandManager.registerCommand(new Command('uptime', 'uptime', 'Displays the second time the system is running!', async () => {
    const seconds = Math.round((Date.now() - startup) / 1000);
    const uptime = (await SocketManager.getChangeData()).uptime;
    return [
        'The System is running since ' + secondsToNiceString(seconds),
        'The Machine is ruinning since ' + secondsToNiceString(uptime),
    ]
}));

CommandManager.registerCommand(new Command('log', 'log -f', 'Displays the log -f means to follow the log', () => {

}));

CommandManager.registerCommand(new Command('info', 'info', 'Displays general informations over the system!', async () => {
    const seconds = Math.round((Date.now() - startup) / 1000);
    const uptime = (await SocketManager.getChangeData()).uptime;
    const persistentData = SocketManager.getPersistentData();
    return [
        'General Information:',
        'Hostname: ' + persistentData.host.hostname,
        'Platform: ' + persistentData.host.platform,
        'Home Directory: ' + persistentData.host.homedir,
        'Socket Connected: ' + (SocketManager.socket.connected ? 'Opened' : 'Closed'),
        'Socket Authenticated: ' + (SocketManager.auth ? 'Authenticated' : 'Unauthenticated'),
        'System Uptime: ' + secondsToNiceString(seconds),
        'Machine Uptime: ' + secondsToNiceString(uptime),
    ];
}));

CommandManager.registerCommand(new Command('set', 'set [authkey/key, coreip/ip]', 'Sets the Config value\'s!', (cmd, args) => {
    if (!args[1])
        return 'Please provide a key!';
    const key = args[1].toLowerCase();
    const value = args[2];
    if (!value)
        return 'Please provide a value!';
    if (key == 'authkey' || key == 'key') {
        config.key = value;
        SocketManager.configChange(config);
        fs.writeFileSync('config.json', JSON.stringify(config, null, 3));
        return 'Auth Key Set to: ' + value;
    }
    if (key == 'coreip' || key == 'ip') {
        config.coreIP = value;
        SocketManager.configChange(config);
        fs.writeFileSync('config.json', JSON.stringify(config, null, 3));
        return 'Core IP Set to: ' + value;
    }
    return 'The key dont exists!';
}));

function secondsToNiceString(seconds) {
    const obj = secondsStrippedInObject(seconds);
    return ((obj.days ? obj.days + ' Day' + (obj.days > 1 ? 's ' : ' ') : ' ') +
        (obj.hours ? obj.hours + ' Hour' + (obj.hours > 1 ? 's ' : ' ') : ' ') +
        (obj.minutes ? obj.minutes + ' Minute' + (obj.minutes > 1 ? 's ' : ' ') : ' ') +
        (obj.seconds ? obj.seconds + ' Second' + (obj.seconds > 1 ? 's ' : ' ') : ' ')).trim();
}

function secondsStrippedInObject(seconds) {
    seconds = parseInt(seconds, 10);
    const days = Math.floor(seconds / (3600 * 24));
    seconds -= days * 3600 * 24;
    const hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    return {
        days,
        hours,
        minutes,
        seconds
    }
}


