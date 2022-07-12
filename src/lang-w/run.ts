import { Program } from './compile'

type AbstractMachine = {
    instructions: Program,
    state: Map<number, number>,
    stack: Array<number>,
    instructionPointer: number
}

const AbstractMachine = (program: Program): AbstractMachine => {
    return {
        instructions: program,
        state: new Map<number, number>(),
        stack: [],
        instructionPointer: 0
    }
}

export const run = (program: Program) => {
    const am = AbstractMachine(program);

    const performCalculation = (operation: (left: number, right: number) => number) => {
        const left = am.stack.pop();
        const right = am.stack.pop();
        if (left === undefined || right === undefined) {
            throw Error("Stack underflow");
        }
        am.stack.push(operation(left, right));
    }

    const executeInstruction = () => {
        const currentInstruction = am.instructions[am.instructionPointer];
        const oldInstructionPointer = am.instructionPointer;
        switch (currentInstruction.opcode) {
            case "NOOP":
                break;
            case "PUSH":
                if (currentInstruction.arguments === undefined || currentInstruction.arguments.length !== 1) {
                    throw Error("PUSH instruction missing argument");
                }
                am.stack.push(currentInstruction.arguments[0]);
                break;
            case "FETCH":
                if (currentInstruction.arguments === undefined || currentInstruction.arguments.length !== 1) {
                    throw Error("FETCH instruction missing argument");
                }
                {
                    const address = currentInstruction.arguments[0];
                    const value = am.state.get(address);
                    if (value) {
                        am.stack.push(value);
                    } else {
                        am.state.set(address, 0);
                        am.stack.push(0);
                    }
                }
                break;
            case "STORE":
                if (currentInstruction.arguments === undefined || currentInstruction.arguments.length !== 1) {
                    throw Error("STORE instruction missing argument");
                }
                {
                    const value = am.stack.pop();
                    if (value === undefined) {
                        throw Error("Stack underflow");
                    }
                    am.state.set(currentInstruction.arguments[0], value);
                }
                break;
            case "JMPR":
                if (currentInstruction.arguments === undefined || currentInstruction.arguments.length !== 1) {
                    throw Error("JMPR instruction missing argument");
                }
                if (am.instructionPointer < -currentInstruction.arguments[0] 
                    && am.instructionPointer >= am.instructions.length - currentInstruction.arguments[0]) {
                    throw Error("Jump out of range");
                }
                am.instructionPointer += currentInstruction.arguments[0];
                break;
            case "JZR":
                if (currentInstruction.arguments === undefined || currentInstruction.arguments.length !== 1) {
                    throw Error("JZR instruction missing argument");
                }
                {
                    const value = am.stack.pop();
                    if (value === undefined) {
                        throw Error("Stack underflow");
                    }
                    if (value !== 0) {
                        break;
                    }
                    if (am.instructionPointer < -currentInstruction.arguments[0] 
                        && am.instructionPointer >= am.instructions.length - currentInstruction.arguments[0]) {
                        throw Error("Jump out of range");
                    }
                    am.instructionPointer += currentInstruction.arguments[0];
                }
                break;
            case "ADD":
                performCalculation((l, r) => l + r);
                break;
            case "SUB":
                performCalculation((l, r) => l - r);
                break;
            case "OR":
                performCalculation((l, r) => ((l !== 0) || (r !== 0)) ? 1 : 0);
                break;
            case "MULT":
                performCalculation((l, r) => l * r);
                break;
            case "DIV":
                performCalculation((l, r) => {
                    if (r === 0) {
                        throw Error("Division by zero");
                    }
                    return l / r;
                });
                break;
            case "AND":
                performCalculation((l, r) => ((l !== 0) && (r !== 0)) ? 1 : 0);
                break;
            case "NEG":
                {
                    const value = am.stack.pop();
                    if (value === undefined) {
                        throw Error("Stack underflow");
                    }
                    am.stack.push(value === 0 ? 1 : 0);
                }
                break;
            case "LE":
                performCalculation((l, r) => l <= r ? 1 : 0);
                break;
            case "GE":
                performCalculation((l, r) => l >= r ? 1 : 0);
                break;
            case "NEQ":
                performCalculation((l, r) => l !== r ? 1 : 0);
                break;
            case "LT":
                performCalculation((l, r) => l < r ? 1 : 0);
                break;
            case "GT":
                performCalculation((l, r) => l > r ? 1 : 0);
                break;
            case "EQ":
                performCalculation((l, r) => l === r ? 1 : 0);
                break;
            default:
                throw Error("Unsupported instruction");
        }

        // Dont increment instruction pointer after jump
        if (oldInstructionPointer === am.instructionPointer) {
            am.instructionPointer++;
        }
    }

    while (am.instructionPointer !== am.instructions.length) {
        executeInstruction();
    }
    return am.state
}