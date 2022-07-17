import { Token } from '../lang-w/tokenize';

const TokensComponent = (props: {tokens: Array<Token>} ) => {
    return <>
        {props.tokens.map((token, i) => 
            <div key={i} className={"flex flex-row " + token.color}>
                <span className='w-24 shrink-0'>{token.type}</span>
                <span className='flex-auto'>{token.text}</span>
                <span className='shrink-0'>{token.index}</span>
            </div>
        )}
    </>
}
export default TokensComponent;