import { IfNode, WhileNode, AstNode } from './parse';
import { Intermediate, Result } from './pipeline';

export const interpret = (intermediate: Intermediate): Result => {
    if (intermediate.type !== "AST") {
        throw Error("Interpreter expected ast but got " + intermediate.type);
    }
    const ast = intermediate.ast;

    const state: Map<string, number> = new Map<string, number>();

    const getVariableValue = (variable: string): number => {
        const value = state.get(variable);
        if (!value) {
            state.set(variable, 0)
            return 0;
        } 
        return value;
    } 

    const interpretNodeWithResult = (ast: AstNode): number => {
        const value = interpretNode(ast);
        if (value === undefined) {
            throw Error("No result from calculation");
        }
        return value;
    } 

    const interpretNode = (ast: AstNode): number|undefined => {
        switch (ast.type) {
            case "sequence":
                ast.statements.forEach(statement => {
                    interpretNode(statement);
                });
                return;
            case "assignment":
                state.set(ast.identifier.identifier, interpretNodeWithResult(ast.calculation));
                return;
            case "skip":
                return;
            case "while":
                while (interpretNodeWithResult((<WhileNode>ast).head) !== 0) {
                    interpretNode((<WhileNode>ast).body);
                }
                return;
            case "if":
                if (interpretNodeWithResult((<IfNode>ast).condition) !== 0) {
                    interpretNode((<IfNode>ast).consequence);
                } else {
                    interpretNode((<IfNode>ast).alternative);
                }
                return;
            case "+":
                return interpretNodeWithResult(ast.left) + interpretNodeWithResult(ast.right);
            case "-":
                return interpretNodeWithResult(ast.left) - interpretNodeWithResult(ast.right);
            case "|":
                return interpretNodeWithResult(ast.left) !== 0 || interpretNodeWithResult(ast.right) !== 0 ? 1 : 0;
            case "*":
                return interpretNodeWithResult(ast.left) * interpretNodeWithResult(ast.right);
            case "/":
                {
                    const left = interpretNodeWithResult(ast.left);
                    const right = interpretNodeWithResult(ast.right);
                    if (right === 0) {
                        throw Error("Division with zero");
                    } else {
                        return Math.floor(left/right);
                    }
                }
            case "&":
                return interpretNodeWithResult(ast.left) !== 0 && interpretNodeWithResult(ast.right) !== 0 ? 1 : 0;
            case "not":
                return interpretNodeWithResult(ast.factor) === 0 ? 1 : 0;
            case "number":
                return ast.value;
            case "identifier":
                return getVariableValue(ast.identifier);
            case "boolean":
                return ast.value ? 1 : 0;
            case "parenthesized_calculation":
                return interpretNodeWithResult(ast.calculation);
            case "<=":
                return interpretNodeWithResult(ast.left) <= interpretNodeWithResult(ast.right) ? 1 : 0;
            case ">=":
                return interpretNodeWithResult(ast.left) >= interpretNodeWithResult(ast.right) ? 1 : 0;
            case "<>":
                return interpretNodeWithResult(ast.left) !== interpretNodeWithResult(ast.right) ? 1 : 0;
            case "<":
                return interpretNodeWithResult(ast.left) < interpretNodeWithResult(ast.right) ? 1 : 0;
            case ">":
                return interpretNodeWithResult(ast.left) > interpretNodeWithResult(ast.right) ? 1 : 0;
            case "=":
                return interpretNodeWithResult(ast.left) === interpretNodeWithResult(ast.right) ? 1 : 0;
            default:
                return;
        }
    }

    interpretNode(ast);

    return state;
}