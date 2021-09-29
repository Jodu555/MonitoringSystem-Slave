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
    console.log(startup - Date.now() * 1000);
}))





