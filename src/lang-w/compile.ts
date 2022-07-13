import { parse } from 'path'
import { isIdentifier } from 'typescript'
import { AstNode, SequenceNode, AssignmentNode, WhileNode, IfNode, LowPriorityOperationNode, HighPriorityOperationNode, NotNode, NumberNode, IdentifierNode, BooleanNode, ParenthesizedExpressionNode, ComparisonNode } from './parse'

export type Program = Array<Instruction>

export type Instruction = {
    opcode: string,
    argument?: number,
    annotation?: string,
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
                {
                    const identifier = (<AssignmentNode>ast).identifier.identifier
                    return [compileNode((<AssignmentNode>ast).expression), { opcode: "STORE", argument: getVariableAddress(identifier), annotation: identifier }].flat();
                }
            case "skip":
                return [{ opcode: "NOOP" }];
            case "while":
                const head = compileNode((<WhileNode>ast).head);
                const body = compileNode((<WhileNode>ast).body);
                return [head, { opcode: "JZ", argument: body.length + 2 }, body, { opcode: "JMP", argument: -(body.length + head.length + 1) }].flat();
            case "if":
                const consequence = compileNode((<IfNode>ast).consequence);
                const alternative = compileNode((<IfNode>ast).alternative);
                return [compileNode((<IfNode>ast).condition), { opcode: "JZ", argument: consequence.length + 2 }, consequence, { opcode: "JMP", argument: alternative.length + 1 }, alternative].flat();
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
                return [{ opcode: "PUSH", argument: (<NumberNode>ast).value }];
            case "identifier":
                {
                    const identifier = (<IdentifierNode>ast).identifier
                    return [{ opcode: "FETCH", argument: getVariableAddress(identifier), annotation: identifier }];
                }
            case "boolean":
                return [{ opcode: "PUSH", argument: (<BooleanNode>ast).value ? 1 : 0 }];
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

    const program = compileNode(ast);
    program.push({opcode: "END"})

    // convert add annotation for absolute jump location since jumps are relative
    program.forEach((instruction, i) => {
        if ((instruction.opcode === "JMP" || instruction.opcode === "JZ") && instruction.argument) {
            instruction.annotation = String(i + instruction.argument)
        }
    })

    return [program, variableList];
}