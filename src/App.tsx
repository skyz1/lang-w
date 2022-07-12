import React, { useEffect, useState } from 'react';
import { compile, Program } from './lang-w/compile';
import { AstNode, parse } from './lang-w/parse';
import { Token, tokenize } from './lang-w/tokenize';

const AstTree = (props: {root: AstNode} ) => {
  const rootChildren = props.root.children();
  const [collapsed, setCollapsed] = useState(rootChildren.length === 1);

  const nodeToString = (node: AstNode): string => {
    const nodeChildren = node.children();
    return node.type + (nodeChildren.length === 0 ? "" : "(" + nodeChildren.map(child => nodeToString(child)).join(", ") + ")")
  }

  if (rootChildren.length === 0) {
    return <>
      <p className={'border-b border-gray-400'}>{props.root.type}</p>
    </>
  } else {
    return <>
      <p className={'border-b border-gray-400'} onClick={() => setCollapsed(c => !c)}>{(collapsed ?  nodeToString(props.root) : props.root.type)}</p>
      <div className='ml-2' hidden={collapsed}>
        {rootChildren.map((child, i) => <AstTree root={child} key={"child-" + i}></AstTree>)}
      </div>
    </>
  }
}

function App() {
  const [code, setCode] = useState<string>("")
  const [tokens, setTokens] = useState<Array<Token>>([])
  const [ast, setAst] = useState<AstNode|undefined>(undefined)
  const [program, setProgram] = useState<Program>([])

  useEffect(() => {
    const tokenList = tokenize(code);
    setTokens(tokenList);
    try {
      const astRoot = parse(tokens)
      setAst(astRoot);
      const opcodes = compile(astRoot)
      console.log(opcodes);
      setProgram(opcodes);
    } catch (e: any) {
      console.log(e);
      setAst(undefined);
      setProgram([]);
    }
  }, [code])

  return (
    <div className='flex flex-col m-4 space-y-2'>
      <h1 className='text-3xl font-bold'>LangW</h1>
      <p>This websites provides some tools to work with the simple programming language LangW and to visualize basic compiler concepts.</p>
      <p className='mt-4 font-bold'>Your code:</p>
      <textarea className='border-2 h-36' onChange={e => setCode(e.target.value)}></textarea>
      <p className='mt-4 font-bold'>Tokens:</p>
      <div className='border-2 p-2 overflow-y-scroll flex flex-col space-y-1 h-36'>
        {tokens.map((token, i) => 
          <div key={"token-" + i} className={"flex flex-row " + token.color}>
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
      {
        program.length > 0 && <>
          <p className='mt-4 font-bold'>Opcodes:</p>
          <div className='border-2 p-2 overflow-y-scroll flex flex-col space-y-1 h-36'>
            {program.map((instruction, i) => 
              <div key={"token-" + i} className={"flex flex-row"}>
                <span className='w-6'>{i}</span>
                <span className='w-16'>{instruction.opcode}</span>
                {instruction.arguments && <span className='flex-auto'>{instruction.arguments.join(", ")}</span>}
              </div>
            )}
          </div>
        </>
      }
    </div>
  );
}

export default App;
