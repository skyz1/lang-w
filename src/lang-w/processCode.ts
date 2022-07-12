import { Token, tokenize } from './tokenize';
import { compile, Program } from './compile';
import { AstNode, parse } from './parse';
import { run } from './run';

export type VariableValue = { 
    variable: string, 
    value: number
}

export type CodeProcessingResults = {
    code: string,
    tokens: Array<Token>,
    ast?: AstNode,
    program?: Program,
    error?: string,
    run: () => Promise<Array<VariableValue>>
}

export const processCode = async (code: string) => {
    var tokens: Array<Token> = [];
    var ast;
    var error;
    try {
        tokens = tokenize(code);
        ast = parse(tokens);
        const [program, variables] = compile(ast);
        return {
            code: code,
            tokens: tokens,
            ast: ast,
            program: program,
            run: async () => {
                const variableValues: Array<VariableValue> = []
                run(program).forEach((value, address) => {
                    variableValues.push({variable: variables[address], value: value});
                });
                return variableValues;
            }
        }
    } catch (e: any) {
        error = e.message;
        console.log(e);
    }
    return {
        code: code,
        tokens: tokens,
        ast: ast,
        error: error,
        run: async () => []
    };
}