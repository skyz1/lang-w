type TokenType = {
    type: string,
    regex: RegExp,
    ignore?: boolean
}

const tokenTypes: Array<TokenType> = [
    {
        type: "keyword",
        regex: /;|:=|skip|while|do|end|if|then|else/
    },
    {
        type: "parenthesis",
        regex: /\(|\)/
    },
    {
        type: "operator",
        regex: /\+|-|\||\*|\/|&|!/
    },
    {
        type: "comparator",
        regex: /<=|>=|<>|<|>|=/
    },
    {
        type: "boolean",
        regex: /true|false/
    },
    {
        type: "number",
        regex: /[0-9]+/
    },
    {
        type: "identifier",
        regex: /[a-zA-Z_]+/
    },
    {
        type: "whitespace",
        regex: /\s+/,
        ignore: true
    }
]

export type Token = {
    text: string,
    type?: string,
    index: number
}

export const tokenize = (code: string): Array<Token> => {
    const tokens: Array<Token> = [];
    var i = 0;

    while (i < code.length) {
        const remainingCode = code.substring(i)

        const matched = tokenTypes.some(tokenType => {
            const match = tokenType.regex.exec(remainingCode)
            if (match && match.index === 0 && match[0].length > 0) {
                if (!tokenType.ignore) {
                    tokens.push({
                        text: match[0],
                        type: tokenType.type,
                        index: i
                    });
                }
                i += match[0].length
                return true;
            }
            return false;
        });

        if (!matched) {
            tokens.push({
                text: code[i],
                index: i
            });
            i++;
        }
    }

    tokens.push({
        text: "",
        type: "eof",
        index: i
    })

    return tokens;
}