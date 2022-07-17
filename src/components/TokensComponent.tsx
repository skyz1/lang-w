import { Token } from '../lang-w/tokenize';

const TokensComponent = (props: {tokens: Array<Token>} ) => {
    return <table>
        <thead>
            <tr>
                <th>Position</th>
                <th>Type</th>
                <th className="w-full">Text</th>
            </tr>
        </thead>
        <tbody>
            {props.tokens.map((token, i) => 
                <tr key={i} className={token.color}>
                    <td>{token.index}</td>
                    <td>{token.type}</td>
                    <td>{token.text}</td>
                </tr>
            )}
        </tbody>
    </table>
}
export default TokensComponent;