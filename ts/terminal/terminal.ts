import { ChildProcessWithoutNullStreams, spawn } from "child_process";

type Command = string | (() => void) | (() => Promise<void>);

export default class Terminal {
    
    public static readonly instances: { [key: string]: Terminal } = {};

    public static open(name: string): Terminal {
        if (Terminal.instances[name]) return Terminal.instances[name];

        const terminal = new Terminal(name);

        Terminal.instances[name] = terminal;

        return terminal;
    }

    public readonly cwd: string = process.cwd();
    public constructor(public readonly name: string) {}
    
    private commandList: Command[] = [];
    private commmandRunning?: Promise<void>;
    
    public async run(...commandList: Command[]): Promise<void> {
        this.commandList.push(...commandList);
        
        if (this.commmandRunning) {
            await this.commmandRunning;

            return;
        }
        
        let commandsEnded: () => void = () => {};
        this.commmandRunning = new Promise(res => commandsEnded = res);
        while (this.commandList.length > 0) {
            const command = this.commandList.shift();
            
            if (typeof command === 'string') {
                await this.exec(command);
            }
            else if (command) {
                await command();
            }
            
            await new Promise(res => setTimeout(res, 10));
        }
        
        commandsEnded();
        this.commmandRunning = undefined;
    }
    
    private process?: ChildProcessWithoutNullStreams;
    
    public kill(): void {
        if (this.process) {
            this.process.kill();
        }
    }

    private exec(expression: string): Promise<void> {
        let close = () => { };

        const argumentList = expression.split(" ");

        const command = argumentList.shift();

        if (!command) {
            throw new Error("Expression is empty");
        }

        this.process = spawn(command, argumentList, { cwd: this.cwd, shell: true });

        this.process.stdout.on('data', (data) => console.log(`${this.name}_stdout: ${data}`) );

        this.process.stderr.on('data', (data) => console.error(`${this.name}_stderr: ${data}`) );

        this.process.on('close', (code) => close() );

        return new Promise(resolve => close = resolve);
    }
}