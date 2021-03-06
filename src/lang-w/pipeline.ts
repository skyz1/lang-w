import { Token, tokenize } from './tokenize';
import { compileBytecode, Program } from './compileBytecode';
import { AstNode, parse } from './parse';
import { runBytecode } from './runBytecode';
import { interpret } from './interpret';
import { compileWasm, WasmProgram } from './compileWasm';
import { runWasm } from './runWasm';

export type Pipeline = {
    compilationSteps: Array<CompilationStep>,
    executionStep: ExecutionStep,
    runPipeline: (code: string) => [Array<Intermediate>, string|undefined]
}

export type CompilationStep = (intermediate: Intermediate) => Intermediate
export type ExecutionStep = (executable: Intermediate) => Promise<Result>

export type Intermediate = CodeIntermediate|TokenIntermediate|AstIntermediate|OpcodeIntermediate|WasmIntermediate

type CodeIntermediate = {
    type: "Code",
    code: string
}

type TokenIntermediate = {
    type: "Tokens",
    tokens: Array<Token>
}

type AstIntermediate = {
    type: "AST",
    ast: AstNode
}

type OpcodeIntermediate = {
    type: "Opcodes",
    opcodes: { program: Program, variableList: Array<string> }
}

type WasmIntermediate = {
    type: "WASM",
    wasm: { program: WasmProgram, variableList: Array<string> }
}

export type Result = Map<string, number>

export const pipeline = (name: "Interpreter"|"Abstract Machine"|"WASM"): Pipeline => {
    var compilationSteps: Array<CompilationStep> = [];
    var executionStep: ExecutionStep = async (executable: any) => new Map<string, number>();

    switch (name) {
        case "Interpreter":
            compilationSteps = [tokenize, parse]
            executionStep = interpret
            break;
        case "Abstract Machine":
            compilationSteps = [tokenize, parse, compileBytecode]
            executionStep = runBytecode
            break;
            case "WASM":
                compilationSteps = [tokenize, parse, compileWasm]
                executionStep = runWasm
                break;
    }

    const runPipeline = (code: string): [Array<Intermediate>, string|undefined] => {
        const intermediates: Array<Intermediate> = [];
        try {
            compilationSteps.forEach(compilationStep => {
                intermediates.push(compilationStep(intermediates.length === 0 ? { type: "Code", code: code} : intermediates[intermediates.length - 1]))
            });
            return [intermediates, undefined];
        } catch (e: any) {
            return [intermediates, e.message];
        }
    }

    return {
        compilationSteps: compilationSteps,
        executionStep: executionStep,
        runPipeline: runPipeline
    };
}