import { Instruction, Program } from './compile'
import { Result } from './pipeline'

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

export const run = ({ program, variableList }: { program: Program, variableList: Array<string> }): Result => {
    const am = AbstractMachine(program);

    const performCalculation = (operation: (left: number, right: number) => number) => {
        const left = am.stack.pop();
        const right = am.stack.pop();
        if (left === undefined || right === undefined) {
            throw Error("Stack underflow");
        }
        am.stack.push(operation(left, right));
    }

    const getArgument = (instruction: Instruction): number => {
        if (instruction.argument === undefined) {
            throw Error(instruction.opcode + " instruction missing argument");
        }
        return instruction.argument
    }

    const popFromStack = (): number => {
        const value = am.stack.pop();
        if (value === undefined) {
            throw Error("Stack underflow");
        }
        return value;
    }

    const executeInstruction = (): boolean => {
        const currentInstruction = am.instructions[am.instructionPointer];
        const oldInstructionPointer = am.instructionPointer;
        switch (currentInstruction.opcode) {
            case "END":
                return true;
            case "NOOP":
                break;
            case "PUSH":
                am.stack.push(getArgument(currentInstruction));
                break;
            case "FETCH":
                {
                    const address = getArgument(currentInstruction);
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
                {
                    const address = getArgument(currentInstruction);
                    const value = popFromStack();
                    am.state.set(address, value);
                }
                break;
            case "JMP":
                {
                    const newInstructionPointer = am.instructionPointer + getArgument(currentInstruction);
                    if (newInstructionPointer < 0 || newInstructionPointer >= am.instructions.length) {
                        throw Error("Jump out of range");
                    }
                    am.instructionPointer = newInstructionPointer;
                }
                break;
            case "JZ":
                if (popFromStack() === 0) {
                    const newInstructionPointer = am.instructionPointer + getArgument(currentInstruction);
                    if (newInstructionPointer < 0 || newInstructionPointer >= am.instructions.length) {
                        throw Error("Jump out of range");
                    }
                    am.instructionPointer = newInstructionPointer;
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
                    return Math.floor(l / r);
                });
                break;
            case "AND":
                performCalculation((l, r) => ((l !== 0) && (r !== 0)) ? 1 : 0);
                break;
            case "NEG":
                am.stack.push(popFromStack() === 0 ? 1 : 0);
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

        return false;
    }

    var finished = false;
    do {
        finished = executeInstruction();
    } while (!finished);

    const finalState: Map<string, number> = new Map<string, number>();
    am.state.forEach((value, address) => finalState.set(variableList[address], value))
    return finalState;
}