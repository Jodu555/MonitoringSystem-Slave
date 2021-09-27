class Command {
    constructor(command, usage, description, callback) {
        this.command = command;
        this.usage = usage;
        this.description = description;
        this.callback = callback;
    }
}


function fixStdoutFor(cli) {
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

const cli = require('readline').createInterface(process.stdin, process.stdout);
fixStdoutFor(cli);
cli.setPrompt("> ", 2);
cli.on('line', (line) => {
    const command = line.split(' ')[0].toLowerCase().trim();
    if (commands.has(command))
        commands.get(command).callback(command, line.split(' '), 'USER');
    cli.prompt();
});
cli.prompt();

const commands = new Map();

function registerCommand(command) {
    commands.set(command.command.toLowerCase(), command);
}

// Imagine on how the command system should work
registerCommand(new Command('help', 'help [all, tiny]', 'Description', (command, args, sender) => {
    console.log(' ------------------- HELP -------------------');
    console.log(' ');
    commands.forEach(command => {
        console.log('=> ' + command.command + ' : ' + command.usage + ' : ' + command.description);
    });
    console.log(' ');
    console.log(' ------------------- HELP -------------------');
}))

setInterval(() => { console.log("log message") }, 5000);

