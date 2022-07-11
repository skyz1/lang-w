import React, { useEffect, useState } from 'react';
import { AstNode, parse } from './lang-w/parse';
import { Token, tokenize } from './lang-w/tokenize';
import logo from './logo.svg';

const AstTree = (props: {root: AstNode} ) => {
  const rootChildren = props.root.children();
  const [collapsed, setCollapsed] = useState(rootChildren.length === 1);

  const nodeToString = (node: AstNode): string => {
    const nodeChildren = node.children();
    return node.type + (nodeChildren.length === 0 ? "" : "(" + nodeChildren.map(child => nodeToString(child)).join(", ") + ")")
  }

  if (rootChildren.length === 0) {
    return <>
      <p className={'border-b'}>{props.root.type}</p>
    </>
  } else {
    return <>
      <p className={'border-b'} onClick={() => setCollapsed(c => !c)}>{(collapsed ?  nodeToString(props.root) : props.root.type)}</p>
      <div className='ml-2' hidden={collapsed}>
        {rootChildren.map(child => <AstTree root={child}></AstTree>)}
      </div>
    </>
  }
}

function App() {
  const [code, setCode] = useState<string>("")
  const [tokens, setTokens] = useState<Array<Token>>([])
  const [ast, setAst] = useState<AstNode|undefined>(undefined)

  useEffect(() => {
    const tokens = tokenize(code);
    setTokens(tokens);
    try {
      setAst(parse(tokens));
    } catch (e: any) {
      console.log(e);
    }
  }, [code])

  return (
    <div className='flex flex-col m-4 space-y-2'>
      <h1 className='text-3xl font-bold'>LangW</h1>
      <p>This websites provides some tools to work with the simple programming language W and to visualize basic compiler concepts.</p>
      <p className='mt-4 font-bold'>Your code:</p>
      <textarea className='border-2 h-36' onChange={e => setCode(e.target.value)}></textarea>
      <p className='mt-4 font-bold'>Tokens:</p>
      <div className='border-2 p-2 overflow-y-scroll flex flex-col space-y-1 h-36'>
        {tokens.map((token, i) => 
          <div key={"token-" + i} className={"flex flex-row " + (token.type === undefined ? "text-red-600" : "")}>
            <span className='w-24'>{token.type}</span>
            <span className='flex-auto'>{token.text}</span>
            <span>{token.index}</span>
          </div>
        )}
      </div>
      {
        ast && <>
          <p className='mt-4 font-bold'>Abstract syntax tree:</p>
          <div className='border-2 p-2 overflow-y-scroll flex flex-col space-y-1 h-36'>
            <AstTree root={ast}></AstTree>
          </div>
        </>
      }
    </div>
  );
}

export default App;
