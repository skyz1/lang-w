import React, { useEffect, useState } from 'react';
import { AstNode } from './lang-w/parse';
import { ExecutionStep, Intermediate, pipeline, Result } from './lang-w/pipeline';

const AstTree = (props: {root: AstNode} ) => {
  const rootChildren = props.root.children();

  const nodeToString = (node: AstNode): string|undefined => {
    const children = node.children();
    if (children.length === 0) {
      return node.type;
    } else if (children.length === 1) {
      const chain = nodeToString(children[0]);
      console.log(chain)
      if (chain !== undefined) {
        return node.type + " - " + chain;
      }
    }
    return undefined;
  }

  const [collapsed, setCollapsed] = useState(nodeToString(props.root) !== undefined);

  const compressed = nodeToString(props.root)

  if (rootChildren.length === 0) {
    return <>
      <span className={'flex-auto mt-2 p-1 border-2 border-black bg-blue-400 text-center'}>{props.root.type}</span>
    </>
  } else {
    return <span className={'flex-none w-fit'}>
      <div className={'border-gray-400 mt-2 p-1 border-2 border-black bg-blue-400 w-full text-center'} onClick={() => setCollapsed(c => !c)}>{(collapsed && compressed ? compressed : props.root.type)}</div>
      {collapsed || <span className='flex flex-nowrap w-full space-x-2'>
        {rootChildren.map((child, i) => <AstTree root={child} key={"child-" + i}></AstTree>)}
      </span>}
    </span>
  }
}

function App() {
  const [code, setCode] = useState<string>("")
  const [pipelineName, setPipelineName] = useState<string>("Interpreter");
  const [intermediates, setIntermediates] = useState<Array<Intermediate>>([]);
  const [result, setResult] = useState<Result>(new Map<string, number>());
  const [errorMessage, setErrorMessage] = useState<string|undefined>(undefined);

  useEffect(() => {
    if (pipelineName === "Interpreter" || pipelineName === "Abstract Machine") {
      try {
        setResult(new Map<string, number>());
        setErrorMessage(undefined);
        const pl = pipeline(pipelineName);
        setIntermediates(pl.runPipeline(code));
      } catch (e: any) {
        console.log(e);
        setErrorMessage(e.message);
      }
    } else {
      setErrorMessage("Unsupported pipeline");
    }
  }, [pipelineName, code]);

  const runCode = () => {
    if (pipelineName === "Interpreter" || pipelineName === "Abstract Machine") {
      try {
        setErrorMessage(undefined);
        const pl = pipeline(pipelineName);
        setResult(pl.executionStep(intermediates[intermediates.length - 1].value));
      } catch (e: any) {
        console.log(e);
        setErrorMessage(e.message);
      }
    } else {
      setErrorMessage("Unsupported pipeline");
    }
  }
  console.log(result);

  const resultElements: any = []
  result.forEach((value, key) => 
  resultElements.push( 
    <div key={"result-" + value} className={"flex flex-row"}>
      <span className='w-12'>{key}</span>
      <span className='flex-auto'>{value}</span>
    </div>)
  )

  return (
    <div className='flex flex-col m-4 space-y-2'>
      <h1 className='text-3xl font-bold'>LangW</h1>
      <p>This websites provides some tools to work with the simple programming language LangW and to visualize basic compiler concepts.</p>
      <p className='mt-4 font-bold'>Your code:</p>
      <textarea className='border-2 h-36' onChange={e => setCode(e.target.value)}></textarea>
      <div className='flex flex-row'>
        <span className='flex-none text-bold mr-4'>Pipeline: </span>
        <select className='flex-auto border-2' value={pipelineName} onChange={e => setPipelineName(e.target.value)}>
          <option value="Interpreter">Interpreter</option>
          <option value="Abstract Machine">Abstract Machine</option>
        </select>
      </div>
      { /*codeProcessingResults && <>
          <p className='mt-4 font-bold'>Tokens:</p>
          <div className='border-2 p-2 overflow-auto h-36'>
            {codeProcessingResults.tokens.map((token, i) => 
              <div key={"token-" + i} className={"flex flex-row " + token.color}>
                <span className='w-24'>{token.type}</span>
                <span className='flex-auto'>{token.text}</span>
                <span>{token.index}</span>
              </div>
            )}
          </div>
        </>
      }
      {
        codeProcessingResults?.ast && <>
          <p className='mt-4 font-bold'>Abstract syntax tree:</p>
          <div className='border-2 p-2 overflow-auto flex flex-col space-y-1 h-36'>
            <AstTree root={codeProcessingResults.ast}></AstTree>
          </div>
        </>
      }
      {
        codeProcessingResults?.program && <>
          <p className='mt-4 font-bold'>Opcodes:</p>
          <div className='border-2 p-2 overflow-auto flex flex-col space-y-1 h-36'>
            {codeProcessingResults.program.map((instruction, i) => 
              <div key={"token-" + i} className={"flex flex-row"}>
                <span className='w-8'>{i}</span>
                <span className='w-16'>{instruction.opcode}</span>
                <span className='flex-auto'>{ instruction.annotation || instruction.argument || "" }</span>
              </div>
            )}
          </div>
        </>*/
      }
      <button className='mt-4 font-bold border-2 bg-green-600 h-10 w-16' onClick={runCode}>Run</button>
      {
        result.size > 0 && <>
          <p className='mt-4 font-bold'>Result:</p>
          <div className='border-2 p-2 overflow-auto flex flex-col space-y-1 h-36'>
            {resultElements}
          </div>
        </>
      }
      {
        errorMessage && <>
          <p className='mt-4 font-bold'>Error:</p>
          <div className='border-2 p-2 overflow-auto flex flex-col space-y-1 h-36'>
            <div className={"flex flex-row text-red-600"}>{errorMessage}</div>
          </div>
        </>
      }
    </div>
  );
}

export default App;
