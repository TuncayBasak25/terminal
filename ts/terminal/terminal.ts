import { ChildProcessWithoutNullStreams, spawn } from "child_process";

type Command = string | (() => void);

export default class Terminal {
    
    private static $main: Terminal;
    
    /**
     * Use this for rapidly using a common main terminal everywhere.
     */
    public static get main(): Terminal {
        if (!Terminal.$main) {
            Terminal.$main = new Terminal();
        }

        return Terminal.$main;
    }


    public static run(...commandList: Command[]): void {
        this.main.run(...commandList);
    }

    private process?: ChildProcessWithoutNullStreams;
    private commandList: Command[] = [];
    private onNewCommand(): void {}

    public constructor(public readonly cwd: string = process.cwd()) {
        this.listen();
    }

    private async listen(): Promise<void> {
        if (this.commandList.length === 0) {
            await new Promise<void>(resolve => this.onNewCommand = resolve);
        }

        const command = this.commandList.shift();

        if (typeof command === 'string') {
            await this.exec(command);
        }
        else if (command) {
            command();
        }

        this.listen();
    }

    public run(...commandList: Command[]): void {
        this.commandList.push(...commandList);

        this.onNewCommand();
    }

    public kill(): void {
        if (this.process) {
            this.process.kill();
        }
    }

    private async exec(expression: string): Promise<void> {
        let close = () => { };

        const argumentList = expression.split(" ");

        const command = argumentList.shift();

        if (!command) {
            throw new Error("Expression is empty");
        }

        this.process = spawn(command, argumentList, { cwd: this.cwd, shell: true });

        this.process.stdout.on('data', (data) => console.log(`stdout: ${data}`) );

        this.process.stderr.on('data', (data) => console.error(`stderr: ${data}`) );

        this.process.on('close', (code) => close() );

        return new Promise(resolve => close = resolve);
    }
}