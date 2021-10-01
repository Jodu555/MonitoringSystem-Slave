//INFO: fixStdoutFor function from: https://stackoverflow.com/questions/10606814/readline-with-console-log-in-the-background

class Command {
    constructor(command, usage, description, callback) {
        this.command = command;
        this.usage = usage;
        this.description = description;
        this.callback = callback;
    }
}

class commandManager {
    constructor(streamIn, streamOut) {
        this.streamIn = streamIn;
        this.streamOut = streamOut;
        this.commands = new Map();
        this.init();
    }

    init() {
        const cli = require('readline').createInterface(this.streamIn, this.streamOut);
        this.fixStdoutFor(cli);
        cli.setPrompt("> ", 2);
        let backmessage;
        cli.on('line', (line) => {
            const command = line.split(' ')[0].toLowerCase().trim();
            if (this.commands.has(command))
                backmessage = this.commands.get(command).callback(command, line.split(' '), 'USER');
            if (backmessage) {
                Promise.resolve(backmessage).then((message) => {
                    if (Array.isArray(message))
                        message.forEach(msg => console.log(msg));
                    if (!Array.isArray(message))
                        console.log(message);
                })

            }
            cli.prompt();
        });
        cli.prompt();
        this.initializeDefaultCommands();
    }

    initializeDefaultCommands() {
        this.registerCommand(new Command('help', 'help', 'Description', (command, args, sender) => {
            console.log(' ------------------- HELP -------------------');
            console.log(' ');
            this.commands.forEach(command => {
                console.log('=> ' + command.command + ' : ' + command.usage + ' : ' + command.description);
            });
            console.log(' ');
            console.log(' ------------------- HELP -------------------');
        }))
    }

    fixStdoutFor(cli) {
        const oldStdout = process.stdout;
        const newStdout = Object.create(oldStdout);
        newStdout.write = function () {
            cli.output.write('\x1b[2K\r');
            const result = oldStdout.write.apply(
                this,
                Array.prototype.slice.call(arguments)
            );
            cli._refreshLine();
            return result;
        }
        process.__defineGetter__('stdout', function () { return newStdout; });
    }

    registerCommand(command) {
        this.commands.set(command.command.toLowerCase(), command);
    }
}

module.exports = { commandManager, Command }