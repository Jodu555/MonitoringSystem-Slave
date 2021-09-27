const fs = require('fs');
const startup = Date.now();

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

const socketManager = require('./socketManager');
const SocketManager = new socketManager(config);




