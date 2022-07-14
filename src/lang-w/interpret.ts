import { AssignmentNode, AstNode, BooleanNode, ComparisonNode, HighPriorityOperationNode, IdentifierNode, IfNode, LowPriorityOperationNode, NotNode, NumberNode, ParenthesizedCalculationNode, SequenceNode, WhileNode } from './parse';

export const interpret = (ast: AstNode): {[variable: string]: number} => {
    const state: {[variable: string]: number} = {}

    const getVariableValue = (variable: string): number => {
        const value = state[variable];
        if (!value) {
            state[variable] = 0
            return 0;
        } 
        return value;
    } 

    const interpretNodeWithResult = (ast: AstNode): number => {
        const value = interpretNode((<AssignmentNode>ast).calculation);
        if (!value) {
            throw Error("No result from calculation");
        }
        return value;
    } 

    const interpretNode = (ast: AstNode): number|undefined => {
        switch (ast.type) {
            case "sequence":
                (<SequenceNode>ast).statements.forEach(statement => {
                    interpretNode(statement);
                });
                return;
            case "assignment":
                state[(<AssignmentNode>ast).identifier.identifier] = interpretNodeWithResult((<AssignmentNode>ast).calculation);
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
                return interpretNodeWithResult((<LowPriorityOperationNode>ast).left) + interpretNodeWithResult((<LowPriorityOperationNode>ast).right);
            case "-":
                return interpretNodeWithResult((<LowPriorityOperationNode>ast).left) - interpretNodeWithResult((<LowPriorityOperationNode>ast).right);
            case "|":
                return interpretNodeWithResult((<LowPriorityOperationNode>ast).left) !== 0 || interpretNodeWithResult((<LowPriorityOperationNode>ast).right) !== 0 ? 1 : 0;
            case "*":
                return interpretNodeWithResult((<HighPriorityOperationNode>ast).left) * interpretNodeWithResult((<HighPriorityOperationNode>ast).right);
            case "/":
                {
                    const left = interpretNodeWithResult((<HighPriorityOperationNode>ast).left);
                    const right = interpretNodeWithResult((<HighPriorityOperationNode>ast).right);
                    if (right === 0) {
                        throw Error("Division with zero");
                    } else {
                        return Math.floor(left/right);
                    }
                }
            case "&":
                return interpretNodeWithResult((<HighPriorityOperationNode>ast).left) !== 0 && interpretNodeWithResult((<HighPriorityOperationNode>ast).right) !== 0 ? 1 : 0;
            case "not":
                return interpretNodeWithResult((<NotNode>ast).factor) === 0 ? 1 : 0;
            case "number":
                return (<NumberNode>ast).value;
            case "identifier":
                return getVariableValue((<IdentifierNode>ast).identifier);
            case "boolean":
                return (<BooleanNode>ast).value ? 1 : 0;
            case "parenthesized_calculation":
                return interpretNodeWithResult((<ParenthesizedCalculationNode>ast).calculation);
            case "<=":
                return interpretNodeWithResult((<ComparisonNode>ast).left) <= interpretNodeWithResult((<ComparisonNode>ast).right) ? 1 : 0;
            case ">=":
                return interpretNodeWithResult((<ComparisonNode>ast).left) >= interpretNodeWithResult((<ComparisonNode>ast).right) ? 1 : 0;
            case "<>":
                return interpretNodeWithResult((<ComparisonNode>ast).left) !== interpretNodeWithResult((<ComparisonNode>ast).right) ? 1 : 0;
            case "<":
                return interpretNodeWithResult((<ComparisonNode>ast).left) < interpretNodeWithResult((<ComparisonNode>ast).right) ? 1 : 0;
            case ">":
                return interpretNodeWithResult((<ComparisonNode>ast).left) > interpretNodeWithResult((<ComparisonNode>ast).right) ? 1 : 0;
            case "=":
                return interpretNodeWithResult((<ComparisonNode>ast).left) === interpretNodeWithResult((<ComparisonNode>ast).right) ? 1 : 0;
            default:
                return;
        }
    }

    interpretNode(ast);

    return state
}