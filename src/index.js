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

// SocketManager.socket.io._readyState == 'open'

CommandManager.registerCommand(new Command('uptime', 'uptime', 'Displays the second time the system is running!', async () => {
    const seconds = Math.round((Date.now() - startup) / 1000);
    const uptime = (await SocketManager.getChangeData()).uptime;
    return [
        'The system is running since ' + seconds + ' second' + (seconds > 1 ? 's' : '') + '!',
        'The Machine is ruinning since ' + uptime + ' second' + (uptime > 1 ? 's' : '') + '!'
    ]
}));

CommandManager.registerCommand(new Command('info', 'info', 'Displays general informations over the system!', async () => {
    const seconds = Math.round((Date.now() - startup) / 1000);
    const uptime = (await SocketManager.getChangeData()).uptime;
    return [
        'General Information:',
        'Socket Connected: ' + (SocketManager.socket.io._readyState == 'open' ? 'Opened' : 'Closed'),
        'System Uptime: ' + seconds + ' second' + (seconds > 1 ? 's' : '') + '!',
        'Machine Uptime: ' + uptime + ' second' + (uptime > 1 ? 's' : '') + '!',
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





