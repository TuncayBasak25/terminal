"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
class Terminal {
    static open(name) {
        if (Terminal.instances[name])
            return Terminal.instances[name];
        const terminal = new Terminal(name);
        Terminal.instances[name] = terminal;
        return terminal;
    }
    constructor(name) {
        this.name = name;
        this.cwd = process.cwd();
        this.commandList = [];
    }
    run(...commandList) {
        return __awaiter(this, void 0, void 0, function* () {
            this.commandList.push(...commandList);
            if (this.commmandRunning) {
                yield this.commmandRunning;
                return;
            }
            let commandsEnded = () => { };
            this.commmandRunning = new Promise(res => commandsEnded = res);
            while (this.commandList.length > 0) {
                const command = this.commandList.shift();
                if (typeof command === 'string') {
                    yield this.exec(command);
                }
                else if (command) {
                    yield command();
                }
                yield new Promise(res => setTimeout(res, 10));
            }
            commandsEnded();
            this.commmandRunning = undefined;
        });
    }
    kill() {
        if (this.process) {
            this.process.kill();
        }
    }
    exec(expression) {
        let close = () => { };
        const argumentList = expression.split(" ");
        const command = argumentList.shift();
        if (!command) {
            throw new Error("Expression is empty");
        }
        this.process = (0, child_process_1.spawn)(command, argumentList, { cwd: this.cwd, shell: true });
        this.process.stdout.on('data', (data) => console.log(`${this.name}_stdout: ${data}`));
        this.process.stderr.on('data', (data) => console.error(`${this.name}_stderr: ${data}`));
        this.process.on('close', (code) => close());
        return new Promise(resolve => close = resolve);
    }
}
Terminal.instances = {};
exports.default = Terminal;
