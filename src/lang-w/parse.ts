import { Token } from './tokenize'

export type AstNode = {
    type: string,
    children: () => Array<AstNode>
}

const AstNode = (value: string) => ({ type: value, children: () => [] })

export type SequenceNode = {
    type: "sequence",
    statements: Array<StatementNode>
} & AstNode

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
    expression: ExpressionNode
} & AstNode

const AssignmentNode = (identifier: IdentifierNode, expression: ExpressionNode): AssignmentNode => ({
    type: "assignment",
    identifier: identifier,
    expression: expression,
    children: () => [identifier, expression]
})

export type SkipNode = { 
    type: "skip"
} & AstNode

const SkipNode = (): SkipNode => {
    return {
        type: "skip",
        children: () => []
    }
}

export type WhileNode = {
    type: "while",
    head: ExpressionNode,
    body: SequenceNode,
} & AstNode

const WhileNode = (head: ExpressionNode, body: SequenceNode): WhileNode => ({
    type: "while",
    head: head,
    body: body,
    children: () => [head, body]
})

export type IfNode = {
    type: "if",
    condition: ExpressionNode,
    consequence: SequenceNode,
    alternative: SequenceNode
} & AstNode

const IfNode = (condition: ExpressionNode, consequence: SequenceNode, alternative: SequenceNode): IfNode => ({
    type: "if",
    condition: condition,
    consequence: consequence,
    alternative: alternative,
    children: () => [condition, consequence, alternative]
})

export type ExpressionNode = TermNode | LowPriorityOperationNode

export type LowPriorityOperationNode = {
    type: "+"|"-"|"|",
    left: ExpressionNode,
    right: TermNode
} & AstNode

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
} & AstNode

const HighPriorityOperationNode = (left: TermNode, operator: "*"|"/"|"&", right: FactorNode): HighPriorityOperationNode => ({
    type: operator,
    left: left,
    right: right,
    children: () => [left, right]
})

export type FactorNode = NotNode | NumberNode | IdentifierNode | BooleanNode | ParenthesizedExpressionNode | ComparisonNode

export type NotNode = {
    type: "not",
    factor: FactorNode
} & AstNode

const NotNode = (factor: FactorNode): NotNode => ({
    type: "not",
    factor: factor,
    children: () => [factor]
})

export type NumberNode = {
    type: "number",
    value: number
} & AstNode

const NumberNode = (value: number): NumberNode => ({
    type: "number",
    value: value,
    children: () => [AstNode(String(value))]
})

export type IdentifierNode = {
    type: "identifier",
    identifier: string
} & AstNode

const IdentifierNode = (identifier: string): IdentifierNode => ({
    type: "identifier",
    identifier: identifier,
    children: () => [AstNode(identifier)]
})

export type BooleanNode = {
    type: "boolean",
    value: boolean
} & AstNode

const BooleanNode = (value: boolean): BooleanNode => ({
    type: "boolean",
    value: value,
    children: () => [AstNode(String(value))]
})

export type ParenthesizedExpressionNode = {
    type: "parenthesized_expression",
    expression: ExpressionNode
} & AstNode

const ParenthesizedExpressionNode = (expression: ExpressionNode): ParenthesizedExpressionNode => ({
    type: "parenthesized_expression",
    expression: expression,
    children: expression.children
})

export type ComparisonNode = {
    type: "<="|">="|"<>"|"<"|">"|"=",
    left: ExpressionNode,
    right: ExpressionNode
} & AstNode

const ComparisonNode = (left: ExpressionNode, comparator: "<="|">="|"<>"|"<"|">"|"=", right: ExpressionNode): ComparisonNode => ({
    type: comparator,
    left: left,
    right: right,
    children: () => [left, right]
})

export const parse = (tokens: Array<Token>): SequenceNode => {
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
        const booleanstring = currentToken().text;
        consume("boolean");
        return BooleanNode(Boolean(booleanstring));
    }

    const parseParenthesizedExpression = (): ParenthesizedExpressionNode => {
        consume("parenthesis", "(");
        const expression = parseExpression();
        consume("parenthesis", ")");
        return ParenthesizedExpressionNode(expression);
    }

    const parseComparison = (): ComparisonNode => {
        const left = parseExpression();
        const comparator = currentToken().text;
        consume("comparator");
        if (comparator === "<=" || comparator === ">=" || comparator === "<>" ||
            comparator === "<" || comparator === ">" || comparator === "=") {
            const right = parseExpression();
            return ComparisonNode(left, comparator, right);
        } else {
            throw Error("Unexpected comparator " + comparator);
        }
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
                return parseParenthesizedExpression();
            default:
                // FIXME: This is not working
                return parseComparison();
        }
    }

    const parseTerm = (left?: TermNode): TermNode => {
        if (left) {
            if (["*", "/", "&"].some(operator => matches("operator", operator))) {
                const operator = currentToken().text;
                if (operator === "*" || operator === "/" || operator === "&") {
                    consume("operator");
                    return parseTerm(HighPriorityOperationNode(left, operator, parseFactor()));
                } else {
                    throw Error("Unexpected operator " + operator);
                }
            } else {
                return left;
            }
        }

        return parseTerm(parseFactor());
    }

    const parseExpression = (left?: ExpressionNode): ExpressionNode => {
        if (left) {
            if (["+", "-", "|"].some(operator => matches("operator", operator))) {
                const operator = currentToken().text;
                if (operator === "+" || operator === "-" || operator === "|") {
                    consume("operator");
                    return parseExpression(LowPriorityOperationNode(left, operator, parseTerm()));
                } else {
                    throw Error("Unexpected operator " + operator);
                }
            } else {
                return left;
            }
        }

        return parseExpression(parseTerm());
    }

    const parseSkip = (): SkipNode => {
        consume("keyword", "skip");
        return SkipNode();
    }

    const parseWhile = (): WhileNode => {
        consume("keyword", "while");
        const head = parseExpression();
        consume("keyword", "do");
        const body = parseSequence();
        consume("keyword", "end");
        return WhileNode(head, body);
    }

    const parseIf = (): IfNode => {
        consume("keyword", "if");
        const condition = parseExpression();
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
        const expression = parseExpression();
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

    return parseSequence();
}