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


var cli = require('readline').createInterface(process.stdin, process.stdout);
fixStdoutFor(cli);
cli.setPrompt("> ", 2);
cli.on('line', (line) => {
    console.log('Inserted:', line);
    cli.prompt();
});
cli.prompt();

//Imagine on how the command system should work
//registerCommand(new Command('help', 'Description', (command, args, sender) => { 
// 
// }))

setInterval(() => { console.log("log message") }, 1000);