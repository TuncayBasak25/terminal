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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
class Terminal {
    static run(...commandList) {
        this.main.run(...commandList);
    }
    static chdir(cwd) {
        this.main.chdir(cwd);
    }
    onNewCommand() { }
    constructor() {
        this.commandList = [];
        this.cwd = process.cwd();
        this.listen();
    }
    listen() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.commandList.length === 0) {
                yield new Promise(resolve => this.onNewCommand = resolve);
            }
            const command = this.commandList.shift();
            if (typeof command === 'string') {
                yield this.exec(command);
            }
            else if (command) {
                command();
            }
            this.listen();
        });
    }
    run(...commandList) {
        this.commandList.push(...commandList);
        this.onNewCommand();
    }
    chdir(relativePath) {
        this.run(() => {
            const cwd = path_1.default.join(this.cwd, relativePath);
            if (!(0, fs_1.existsSync)(cwd)) {
                console.error(cwd + " is not an existing directory.");
            }
            this.cwd = cwd;
        });
    }
    cd(newPath) {
        this.run(() => {
            if (!(0, fs_1.existsSync)(newPath)) {
                console.error(newPath + " is not an existing directory.");
            }
            this.cwd = newPath;
        });
    }
    kill() {
        if (this.process) {
            this.process.kill();
        }
    }
    exec(expression) {
        return __awaiter(this, void 0, void 0, function* () {
            let close = () => { };
            const argumentList = expression.split(" ");
            const command = argumentList.shift();
            if (!command) {
                throw new Error("Expression is empty");
            }
            this.process = (0, child_process_1.spawn)(command, argumentList, { cwd: this.cwd, shell: true });
            this.process.stdout.on('data', (data) => console.log(`stdout: ${data}`));
            this.process.stderr.on('data', (data) => console.error(`stderr: ${data}`));
            this.process.on('close', (code) => close());
            return new Promise(resolve => close = resolve);
        });
    }
}
Terminal.main = new Terminal();
exports.default = Terminal;
