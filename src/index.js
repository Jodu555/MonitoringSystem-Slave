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

CommandManager.registerCommand(new Command('uptime', 'uptime', 'Displays the second time the system is running!', () => {
    const seconds = Math.round((Date.now() - startup) / 1000);
    console.log('The system is running since ' + seconds + ' second' + (seconds > 1 ? 's' : '') + '!');
}));

CommandManager.registerCommand(new Command('set', 'set [authkey/key, coreip/ip]', 'Sets the Config value\'s!', (cmd, args) => {
    const key = args[1].toLowerCase();
    const value = args[2];
    if (key == 'authkey' || key == 'key') {
        config.key = value;
        console.log('Auth Key Set to: ' + value);
    }
    if (key == 'coreip' || key == 'ip') {
        config.coreIP = value;
        console.log('Core IP Set to: ' + value);
    }

    fs.writeFileSync('config.json', JSON.stringify(config, null, 3));
    console.log('The key dont exists!');
}));





