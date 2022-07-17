import { useState } from 'react';
import InputComponent from './components/InputComponent';
import PipelineComponent from './components/PipelineComponent';
import { Token } from './lang-w/tokenize';

function App() {
  const [code, setCode] = useState<string>("")
  const [pipelineName, setPipelineName] = useState<string>("Interpreter");
  const [tokens, setTokens] = useState<Array<Token>>([]);

  const inputChanged = (code: string, pipeline: string) => { 
    setCode(code); 
    setPipelineName(pipeline); 
    setTokens([]);
  }

  const tokensGenerated = (tokens: Array<Token>) => { 
    setTokens(tokens); 
  }

  return (
    <div className='flex flex-col m-4 space-y-2'>
      <h1 className='text-3xl font-bold'>LangW</h1>
      <p>This websites provides some tools to work with the simple programming language LangW and to visualize basic compiler concepts.</p>
      <InputComponent code={code} pipeline={pipelineName} tokens={tokens} inputChanged={inputChanged}></InputComponent>
      <PipelineComponent code={code} pipeline={pipelineName} onTokensGenerated={tokensGenerated}></PipelineComponent>
    </div>
  );
}

export default App;
