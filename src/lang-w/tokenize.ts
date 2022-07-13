type TokenType = {
    type: string,
    regex: RegExp,
    color: string,
    ignore?: boolean
}

const tokenTypes: Array<TokenType> = [
    {
        type: "keyword",
        regex: /;|:=|skip|while|do|end|if|then|else/,
        color: "text-fuchsia-700"
    },
    {
        type: "parenthesis",
        regex: /\(|\)/,
        color: "text-lime-700"
    },
    {
        type: "operator",
        regex: /\+|-|\||\*|\/|&|!/,
        color: "text-lime-700"
    },
    {
        type: "comparator",
        regex: /<=|>=|<>|<|>|=/,
        color: "text-lime-700"
    },
    {
        type: "boolean",
        regex: /true|false/,
        color: "text-green-900"
    },
    {
        type: "number",
        regex: /[0-9]+/,
        color: "text-green-700"
    },
    {
        type: "identifier",
        regex: /[a-zA-Z_]+/,
        color: "text-sky-900"
    },
    {
        type: "whitespace",
        regex: /\s+/,
        color: "text-black",
        ignore: true
    }
]

export type Token = {
    text: string,
    type?: string,
    color: string,
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
                        color: tokenType.color,
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
                type: "unknown",
                color: "text-red-500",
                index: i
            });
            i++;
        }
    }

    tokens.push({
        text: "",
        type: "eof",
        color: "black",
        index: i
    })

    return tokens;
}