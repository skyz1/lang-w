import { AstNode } from './parse'
import { Intermediate } from './pipeline'

export type Program = Array<Instruction>

export type Instruction = {
    opcode: string,
    argument?: number,
    annotation?: string,
}

export const compile = (intermediate: Intermediate): Intermediate => {
    if (intermediate.type !== "AST") {
        throw Error("Compiler expected ast but got " + intermediate.type);
    }
    const ast = intermediate.ast;

    const variableList: Array<string> = []

    const getVariableAddress = (variable: string) => {
        const index = variableList.indexOf(variable);
        if (index === -1) {
            return variableList.push(variable) - 1;
        }
        return index;
    }

    const compileNode = (ast: AstNode): Program => {
        switch (ast.type) {
            case "sequence":
                return ast.statements.flatMap(statement => compileNode(statement));
            case "assignment":
                {
                    const identifier = ast.identifier.identifier
                    return [compileNode(ast.calculation), { opcode: "STORE", argument: getVariableAddress(identifier), annotation: identifier }].flat();
                }
            case "skip":
                return [{ opcode: "NOOP" }];
            case "while":
                const head = compileNode(ast.head);
                const body = compileNode(ast.body);
                return [head, { opcode: "JZ", argument: body.length + 2 }, body, { opcode: "JMP", argument: -(body.length + head.length + 1) }].flat();
            case "if":
                const consequence = compileNode(ast.consequence);
                const alternative = compileNode(ast.alternative);
                return [compileNode(ast.condition), { opcode: "JZ", argument: consequence.length + 2 }, consequence, { opcode: "JMP", argument: alternative.length + 1 }, alternative].flat();
            case "+":
                return [compileNode(ast.right), compileNode(ast.left), { opcode: "ADD" }].flat();
            case "-":
                return [compileNode(ast.right), compileNode(ast.left), { opcode: "SUB" }].flat();
            case "|":
                return [compileNode(ast.right), compileNode(ast.left), { opcode: "OR" }].flat();
            case "*":
                return [compileNode(ast.right), compileNode(ast.left), { opcode: "MULT" }].flat();
            case "/":
                return [compileNode(ast.right), compileNode(ast.left), { opcode: "DIV" }].flat();
            case "&":
                return [compileNode(ast.right), compileNode(ast.left), { opcode: "AND" }].flat();
            case "not":
                return [compileNode(ast.factor), { opcode: "NEG" }].flat();
            case "number":
                return [{ opcode: "PUSH", argument: ast.value }];
            case "identifier":
                {
                    const identifier = ast.identifier
                    return [{ opcode: "FETCH", argument: getVariableAddress(identifier), annotation: identifier }];
                }
            case "boolean":
                return [{ opcode: "PUSH", argument: ast.value ? 1 : 0 }];
            case "parenthesized_calculation":
                return compileNode(ast.calculation);
            case "<=":
                return [compileNode(ast.right), compileNode(ast.left), { opcode: "LE" }].flat();
            case ">=":
                return [compileNode(ast.right), compileNode(ast.left), { opcode: "GE" }].flat();
            case "<>":
                return [compileNode(ast.right), compileNode(ast.left), { opcode: "NEQ" }].flat();
            case "<":
                return [compileNode(ast.right), compileNode(ast.left), { opcode: "LT" }].flat();
            case ">":
                return [compileNode(ast.right), compileNode(ast.left), { opcode: "GT" }].flat();
            case "=":
                return [compileNode(ast.right), compileNode(ast.left), { opcode: "EQ" }].flat();
            default:
                return [];
        }
    }

    const program = compileNode(ast);
    program.push({opcode: "END"})

    // convert add annotation for absolute jump location since jumps are relative
    program.forEach((instruction, i) => {
        if ((instruction.opcode === "JMP" || instruction.opcode === "JZ") && instruction.argument) {
            instruction.annotation = String(i + instruction.argument)
        }
    })

    return { type: "Opcodes", opcodes: { program, variableList } };
}