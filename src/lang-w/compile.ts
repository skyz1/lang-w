import { parse } from 'path'
import { AstNode, SequenceNode, AssignmentNode, WhileNode, IfNode, LowPriorityOperationNode, HighPriorityOperationNode, NotNode, NumberNode, IdentifierNode, BooleanNode, ParenthesizedExpressionNode, ComparisonNode } from './parse'

export type Program = Array<Instruction>

export type Instruction = {
    opcode: string,
    arguments?: Array<number>
}

export const compile = (ast: AstNode): [Program, Array<string>] => {
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
                return (<SequenceNode>ast).statements.flatMap(statement => compileNode(statement));
            case "assignment":
                return [compileNode((<AssignmentNode>ast).expression), { opcode: "STORE", arguments: [getVariableAddress((<AssignmentNode>ast).identifier.identifier)] }].flat();
            case "skip":
                return [{ opcode: "NOOP" }];
            case "while":
                const head = compileNode((<WhileNode>ast).head);
                const body = compileNode((<WhileNode>ast).body);
                return [head, { opcode: "JZR", arguments: [body.length + 2] }, body, { opcode: "JMPR", arguments: [-(body.length + head.length + 1)] }].flat();
            case "if":
                const consequence = compileNode((<IfNode>ast).consequence);
                const alternative = compileNode((<IfNode>ast).alternative);
                return [compileNode((<IfNode>ast).condition), { opcode: "JZR", arguments: [consequence.length + 2] }, consequence, { opcode: "JMPR", arguments: [alternative.length + 1] }, alternative].flat();
            case "+":
                return [compileNode((<LowPriorityOperationNode>ast).right), compileNode((<LowPriorityOperationNode>ast).left), { opcode: "ADD" }].flat();
            case "-":
                return [compileNode((<LowPriorityOperationNode>ast).right), compileNode((<LowPriorityOperationNode>ast).left), { opcode: "SUB" }].flat();
            case "|":
                return [compileNode((<LowPriorityOperationNode>ast).right), compileNode((<LowPriorityOperationNode>ast).left), { opcode: "OR" }].flat();
            case "*":
                return [compileNode((<HighPriorityOperationNode>ast).right), compileNode((<HighPriorityOperationNode>ast).left), { opcode: "MULT" }].flat();
            case "/":
                return [compileNode((<HighPriorityOperationNode>ast).right), compileNode((<HighPriorityOperationNode>ast).left), { opcode: "DIV" }].flat();
            case "&":
                return [compileNode((<HighPriorityOperationNode>ast).right), compileNode((<HighPriorityOperationNode>ast).left), { opcode: "AND" }].flat();
            case "not":
                return [compileNode((<NotNode>ast).factor), { opcode: "NEG" }].flat();
            case "number":
                return [{ opcode: "PUSH", arguments: [(<NumberNode>ast).value] }];
            case "identifier":
                return [{ opcode: "FETCH", arguments: [getVariableAddress((<IdentifierNode>ast).identifier)] }];
            case "boolean":
                return [{ opcode: "PUSH", arguments: [(<BooleanNode>ast).value ? 1 : 0] }];
            case "parenthesized_expression":
                return compileNode((<ParenthesizedExpressionNode>ast).expression);
            case "<=":
                return [compileNode((<ComparisonNode>ast).right), compileNode((<ComparisonNode>ast).left), { opcode: "LE" }].flat();
            case ">=":
                return [compileNode((<ComparisonNode>ast).right), compileNode((<ComparisonNode>ast).left), { opcode: "GE" }].flat();
            case "<>":
                return [compileNode((<ComparisonNode>ast).right), compileNode((<ComparisonNode>ast).left), { opcode: "NEQ" }].flat();
            case "<":
                return [compileNode((<ComparisonNode>ast).right), compileNode((<ComparisonNode>ast).left), { opcode: "LT" }].flat();
            case ">":
                return [compileNode((<ComparisonNode>ast).right), compileNode((<ComparisonNode>ast).left), { opcode: "GT" }].flat();
            case "=":
                return [compileNode((<ComparisonNode>ast).right), compileNode((<ComparisonNode>ast).left), { opcode: "EQ" }].flat();
            default:
                return [];
        }
    }

    return [compileNode(ast), variableList];
}