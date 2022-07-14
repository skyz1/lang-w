import { Token, tokenize } from './tokenize';
import { compile, Program } from './compile';
import { AstNode, parse } from './parse';
import { run } from './run';
import { interpret } from './interpret';

export type Pipeline = {
    compilationSteps: Array<CompilationStep>,
    executionStep: ExecutionStep,
    runPipeline: (code: string) => Array<Intermediate>
}

export type CompilationStep = (intermediate: any) => Intermediate
export type ExecutionStep = (executable: any) => Result

export type Intermediate = {
    type: "Tokens"|"AST"|"Opcodes"|"Result",
    value: any
}

export type Result = Map<string, number>

export const pipeline = (name: "Interpreter"|"Abstract Machine"): Pipeline => {
    var compilationSteps: Array<CompilationStep> = [];
    var executionStep: ExecutionStep = (executable: any) => new Map<string, number>();

    switch (name) {
        case "Interpreter":
            compilationSteps = [tokenize, parse]
            executionStep = interpret
            break;
        case "Abstract Machine":
            compilationSteps = [tokenize, parse, compile]
            executionStep = run
            break;
    }

    const runPipeline = (code: string): Array<Intermediate> => {
        const intermediates: Array<Intermediate> = [];
        compilationSteps.forEach(compilationStep => {
            intermediates.push(compilationStep(intermediates.length === 0 ? code : intermediates[intermediates.length - 1].value))
        });
        return intermediates;
    }

    return {
        compilationSteps: compilationSteps,
        executionStep: executionStep,
        runPipeline: runPipeline
    };
}