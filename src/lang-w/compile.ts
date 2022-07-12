import { parse } from 'path'
import { AstNode, SequenceNode, AssignmentNode, WhileNode, IfNode, LowPriorityOperationNode, HighPriorityOperationNode, NotNode, NumberNode, IdentifierNode, BooleanNode, ParenthesizedExpressionNode, ComparisonNode } from './parse'

export type Program = Array<Instruction>

export type Instruction = {
    opcode: string,
    variableName?: string,
    value?: number,
    program1?: Program,
    program2?: Program
}

export const compile = (ast: AstNode): Program => {
    switch (ast.type) {
        case "sequence":
            return (<SequenceNode>ast).statements.flatMap(statement => compile(statement));
        case "assignment":
            return [compile((<AssignmentNode>ast).expression), { opcode: "STORE", variableName: (<AssignmentNode>ast).identifier.identifier }].flat();
        case "skip":
            return [{ opcode: "NOOP" }];
        case "while":
            return [{ opcode: "LOOP", program1: compile((<WhileNode>ast).head), program2: compile((<WhileNode>ast).body) }];
        case "if":
            return [compile((<IfNode>ast).condition), { opcode: "BRANCH", program1: compile((<IfNode>ast).consequence), program2: compile((<IfNode>ast).alternative) }].flat();
        case "+":
            return [compile((<LowPriorityOperationNode>ast).left), compile((<LowPriorityOperationNode>ast).right), { opcode: "ADD" }].flat();
        case "-":
            return [compile((<LowPriorityOperationNode>ast).left), compile((<LowPriorityOperationNode>ast).right), { opcode: "SUB" }].flat();
        case "|":
            return [compile((<LowPriorityOperationNode>ast).left), compile((<LowPriorityOperationNode>ast).right), { opcode: "OR" }].flat();
        case "*":
            return [compile((<HighPriorityOperationNode>ast).left), compile((<HighPriorityOperationNode>ast).right), { opcode: "MULT" }].flat();
        case "/":
            return [compile((<HighPriorityOperationNode>ast).left), compile((<HighPriorityOperationNode>ast).right), { opcode: "DIV" }].flat();
        case "&":
            return [compile((<HighPriorityOperationNode>ast).left), compile((<HighPriorityOperationNode>ast).right), { opcode: "AND" }].flat();
        case "not":
            return [compile((<NotNode>ast).factor), { opcode: "NEG" }].flat();
        case "number":
            return [{ opcode: "PUSH", value: (<NumberNode>ast).value }];
        case "identifier":
            return [{ opcode: "FETCH", variableName: (<IdentifierNode>ast).identifier }];
        case "boolean":
            return [{ opcode: "PUSH", value: (<BooleanNode>ast).value ? 1 : 0 }];
        case "parenthesized_expression":
            return compile((<ParenthesizedExpressionNode>ast).expression);
        case "<=":
            return [compile((<ComparisonNode>ast).left), compile((<ComparisonNode>ast).right), { opcode: "LE" }].flat();
        case ">=":
            return [compile((<ComparisonNode>ast).left), compile((<ComparisonNode>ast).right), { opcode: "GE" }].flat();
        case "<>":
            return [compile((<ComparisonNode>ast).left), compile((<ComparisonNode>ast).right), { opcode: "NEQ" }].flat();
        case "<":
            return [compile((<ComparisonNode>ast).left), compile((<ComparisonNode>ast).right), { opcode: "LT" }].flat();
        case ">":
            return [compile((<ComparisonNode>ast).left), compile((<ComparisonNode>ast).right), { opcode: "GT" }].flat();
        case "=":
            return [compile((<ComparisonNode>ast).left), compile((<ComparisonNode>ast).right), { opcode: "EQ" }].flat();
        default:
            return [];
    }
}