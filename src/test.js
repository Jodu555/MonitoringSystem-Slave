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
        cli.on('line', (line) => {
            const command = line.split(' ')[0].toLowerCase().trim();
            if (this.commands.has(command))
                this.commands.get(command).callback(command, line.split(' '), 'USER');
            cli.prompt();
        });
        cli.prompt();
        this.initializeDefaultCommands();
    }

    initializeDefaultCommands() {
        this.registerCommand(new Command('help', 'help [all, tiny]', 'Description', (command, args, sender) => {
            console.log(' ------------------- HELP -------------------');
            console.log(' ');
            CommandManager.commands.forEach(command => {
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

const CommandManager = new commandManager(process.stdin, process.stdout);

// Imagine on how the command system should work

setInterval(() => { console.log("log message") }, 5000);

