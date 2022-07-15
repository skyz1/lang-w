import { Intermediate } from './pipeline'
import { Token } from './tokenize'

export type AstNode = SequenceNode|StatementNode|CalculationNode

export type Children = {
    children: () => Array<AstNode>
}

export type SequenceNode = {
    type: "sequence",
    statements: Array<StatementNode>
} & Children

const SequenceNode = (statements: Array<StatementNode>): SequenceNode => {
    return {
        type: "sequence",
        statements: statements,
        children: () => statements
    }
}

export type StatementNode = AssignmentNode | SkipNode | WhileNode | IfNode

export type AssignmentNode = {
    type: "assignment",
    identifier: IdentifierNode,
    calculation: CalculationNode
} & Children

const AssignmentNode = (identifier: IdentifierNode, calculation: CalculationNode): AssignmentNode => ({
    type: "assignment",
    identifier: identifier,
    calculation: calculation,
    children: () => [identifier, calculation]
})

export type SkipNode = { 
    type: "skip"
} & Children

const SkipNode = (): SkipNode => {
    return {
        type: "skip",
        children: () => []
    }
}

export type WhileNode = {
    type: "while",
    head: CalculationNode,
    body: SequenceNode,
} & Children

const WhileNode = (head: CalculationNode, body: SequenceNode): WhileNode => ({
    type: "while",
    head: head,
    body: body,
    children: () => [head, body]
})

export type IfNode = {
    type: "if",
    condition: CalculationNode,
    consequence: SequenceNode,
    alternative: SequenceNode
} & Children

const IfNode = (condition: CalculationNode, consequence: SequenceNode, alternative: SequenceNode): IfNode => ({
    type: "if",
    condition: condition,
    consequence: consequence,
    alternative: alternative,
    children: () => [condition, consequence, alternative]
})

export type CalculationNode = ExpressionNode | ComparisonNode

export type ComparisonNode = {
    type: "<="|">="|"<>"|"<"|">"|"=",
    left: ExpressionNode,
    right: ExpressionNode
} & Children

const ComparisonNode = (left: ExpressionNode, comparator: "<="|">="|"<>"|"<"|">"|"=", right: ExpressionNode): ComparisonNode => ({
    type: comparator,
    left: left,
    right: right,
    children: () => [left, right]
})

export type ExpressionNode = TermNode | LowPriorityOperationNode

export type LowPriorityOperationNode = {
    type: "+"|"-"|"|",
    left: ExpressionNode,
    right: TermNode
} & Children

const LowPriorityOperationNode = (left: ExpressionNode, operator: "+"|"-"|"|", right: TermNode): LowPriorityOperationNode => ({
    type: operator,
    left: left,
    right: right,
    children: () => [left, right]
})

export type TermNode = FactorNode | HighPriorityOperationNode

export type HighPriorityOperationNode = {
    type: "*"|"/"|"&",
    left: TermNode,
    right: FactorNode
} & Children

const HighPriorityOperationNode = (left: TermNode, operator: "*"|"/"|"&", right: FactorNode): HighPriorityOperationNode => ({
    type: operator,
    left: left,
    right: right,
    children: () => [left, right]
})

export type FactorNode = NotNode | NumberNode | IdentifierNode | BooleanNode | ParenthesizedCalculationNode

export type NotNode = {
    type: "not",
    factor: FactorNode
} & Children

const NotNode = (factor: FactorNode): NotNode => ({
    type: "not",
    factor: factor,
    children: () => [factor]
})

export type NumberNode = {
    type: "number",
    value: number
} & Children

const NumberNode = (value: number): NumberNode => ({
    type: "number",
    value: value,
    children: () => []
})

export type IdentifierNode = {
    type: "identifier",
    identifier: string
} & Children

const IdentifierNode = (identifier: string): IdentifierNode => ({
    type: "identifier",
    identifier: identifier,
    children: () => []
})

export type BooleanNode = {
    type: "boolean",
    value: boolean
} & Children

const BooleanNode = (value: boolean): BooleanNode => ({
    type: "boolean",
    value: value,
    children: () => []
})

export type ParenthesizedCalculationNode = {
    type: "parenthesized_calculation",
    calculation: CalculationNode
} & Children

const ParenthesizedCalculationNode = (calculation: CalculationNode): ParenthesizedCalculationNode => ({
    type: "parenthesized_calculation",
    calculation: calculation,
    children: () => [calculation]
})

export const parse = (intermediate: Intermediate): Intermediate => {
    if (intermediate.type !== "Tokens") {
        throw Error("Parser expected tokens but got " + intermediate.type);
    }
    const tokens = intermediate.tokens;

    var i = 0

    const currentToken = (): Token => tokens[i];

    const matches = (type?: string, text?: string): boolean => {
        const current = currentToken();
        return Boolean((!text || current.text === text) && (!type || (current.type && current.type === type)))
    }

    const nextToken = (): void => {
        if (!matches("eof")) {
            i++;
        }
    }

    const consume = (type?: string, text?: string): void => {
        if (matches(type, text)) {
            nextToken();
        } else {
            throw Error("Unexpected " + currentToken().type + " token " + currentToken().text + " at " + currentToken().index);
        }
    }

    const parseNot = (): NotNode => {
        consume("operator", "!");
        return NotNode(parseFactor());
    }

    const parseNumber = (): NumberNode => {
        const numberstring = currentToken().text;
        consume("number");
        return NumberNode(Number(numberstring));
    }

    const parseIdentifier = (): IdentifierNode => {
        const identifier = currentToken().text;
        consume("identifier");
        return IdentifierNode(identifier);
    }

    const parseBoolean = (): BooleanNode => {
        const booleanString = currentToken().text;
        consume("boolean");
        if (booleanString === "true") {
            return BooleanNode(true);
        } else if (booleanString === "false") {
            return BooleanNode(false);
        } else {
            throw Error("Boolean token was neither true or false");
        }
    }

    const parseParenthesizedCalculation = (): ParenthesizedCalculationNode => {
        consume("parenthesis", "(");
        const calculation = parseCalculation();
        consume("parenthesis", ")");
        return ParenthesizedCalculationNode(calculation);
    }

    const parseFactor = (): FactorNode => {
        switch (currentToken().type) {
            case "operator":
                return parseNot();
            case "number":
                return parseNumber();
            case "identifier":
                return parseIdentifier();
            case "boolean":
                return parseBoolean();
            case "parenthesis":
                return parseParenthesizedCalculation();
            default:
                throw Error("Unexpected " + currentToken().type + " token " + currentToken().text + " at " + currentToken().index);
        }
    }

    const parseTerm = (left?: TermNode): TermNode => {
        if (left) {
            const operator = currentToken().text;
            if (operator === "*" || operator === "/" || operator === "&") {
                consume("operator");
                return parseTerm(HighPriorityOperationNode(left, operator, parseFactor()));
            } else {
                return left;
            }
        }

        return parseTerm(parseFactor());
    }

    const parseExpression = (left?: ExpressionNode): ExpressionNode => {
        if (left) {
            const operator = currentToken().text;
            if (operator === "+" || operator === "-" || operator === "|") {
                consume("operator");
                return parseExpression(LowPriorityOperationNode(left, operator, parseTerm()));
            } else {
                return left;
            }
        }

        return parseExpression(parseTerm());
    }

    const parseCalculation = (): CalculationNode => {
        const left = parseExpression();
        const comparator = currentToken().text;
        if (comparator === "<=" || comparator === ">=" || comparator === "<>" ||
            comparator === "<" || comparator === ">" || comparator === "=") {
            consume("comparator")
            const right = parseExpression();
            return ComparisonNode(left, comparator, right);
        } else {
            return left;
        }
    }

    const parseSkip = (): SkipNode => {
        consume("keyword", "skip");
        return SkipNode();
    }

    const parseWhile = (): WhileNode => {
        consume("keyword", "while");
        const head = parseCalculation();
        consume("keyword", "do");
        const body = parseSequence();
        consume("keyword", "end");
        return WhileNode(head, body);
    }

    const parseIf = (): IfNode => {
        consume("keyword", "if");
        const condition = parseCalculation();
        consume("keyword", "then");
        const consequence = parseSequence();
        let alternative: SequenceNode;
        if (matches("keyword", "else")) {
            consume("keyword", "else");
            alternative = parseSequence();
        } else {
            alternative = SequenceNode([SkipNode()]);
        }
        consume("keyword", "end");
        return IfNode(condition, consequence, alternative)
    }

    const parseAssignment = (): AssignmentNode => {
        const identifier = parseIdentifier();
        consume("keyword", ":=");
        const expression = parseCalculation();
        return AssignmentNode(identifier, expression);
    }

    const parseStatement = (): StatementNode => {
        if (matches("keyword")) {
            switch (currentToken().text) {
                case "skip":
                    return parseSkip();
                case "while":
                    return parseWhile();
                case "if":
                    return parseIf();
                default:
                    throw Error("Unexpected token");
            }
        } else {
            return parseAssignment();
        }
    }

    const parseSequence = (): SequenceNode => {
        const statements: Array<StatementNode> = []
        while (true) {
            statements.push(parseStatement());
            if (matches("eof") || matches("keyword", "else") || matches("keyword", "end")) {
                return SequenceNode(statements);
            }
            consume("keyword", ";")
        }
    }

    return { type: "AST", ast: parseSequence() };
}