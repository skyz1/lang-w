import { useEffect, useState } from 'react';
import CollapsibleComponent from './components/CollapsibleComponent';
import InputComponent from './components/InputComponent';
import IntermediateComponent from './components/IntermediateComponent';
import { Intermediate, Pipeline, pipeline, Result } from './lang-w/pipeline';

function App() {
  const [code, setCode] = useState<string>("")
  const [pipelineName, setPipelineName] = useState<string>("Interpreter");
  const [intermediates, setIntermediates] = useState<Array<Intermediate>>([]);
  const [result, setResult] = useState<Result>(new Map<string, number>());
  const [errorMessage, setErrorMessage] = useState<string|undefined>(undefined);

  useEffect(() => {
    if (pipelineName === "Interpreter" || pipelineName === "Abstract Machine") {
      const [interm, err] = pipeline(pipelineName).runPipeline(code);
      setErrorMessage(err);
      setIntermediates(interm);
      console.log(interm);
    } else {
      setErrorMessage(undefined);
      setIntermediates([]);
      setErrorMessage("Unsupported pipeline");
    }
    setResult(new Map<string, number>());
  }, [pipelineName, code]);

  var pl: Pipeline|undefined = undefined
  if (pipelineName === "Interpreter" || pipelineName === "Abstract Machine") {
    pl = pipeline(pipelineName);
  } else {
    setErrorMessage("Unsupported pipeline");
  }

  const runCode = () => {
    if (pl === undefined) {
      setErrorMessage("Unsupported pipeline");
      return;
    }

    try {
      setErrorMessage(undefined);
      setResult(pl.executionStep(intermediates[intermediates.length - 1]));
    } catch (e: any) {
      console.log(e);
      setErrorMessage(e.message);
    }
  }

  const resultElements: any = []
  result.forEach((value, key) => 
  resultElements.push( 
    <div key={"result-" + value} className={"flex flex-row"}>
      <span className='w-12'>{key}</span>
      <span className='flex-auto'>{value}</span>
    </div>)
  )

  const canRun = pl !== undefined && pl.compilationSteps.length === intermediates.length;

  const inputChanged = (code: string, pipeline: string) => { 
    setCode(code); 
    setPipelineName(pipeline); 
  }

  return (
    <div className='flex flex-col m-4 space-y-2'>
      <h1 className='text-3xl font-bold'>LangW</h1>
      <p>This websites provides some tools to work with the simple programming language LangW and to visualize basic compiler concepts.</p>
      <InputComponent code={code} pipeline={pipelineName} inputChanged={inputChanged}></InputComponent>
      <>
        { intermediates.map((intermediate, i) => 
          <CollapsibleComponent key={i} name={intermediate.type}>
            <IntermediateComponent intermediate={intermediate}></IntermediateComponent>
          </CollapsibleComponent>)}
      </>
      <button className={`mt-4 font-bold border-2 ${canRun ? "bg-green-600" : "bg-gray-400"} h-10 w-16`} onClick={runCode} disabled={!canRun}>Run</button>
      {
        result.size > 0 && <CollapsibleComponent name="Result">
          <div className='flex flex-col space-y-1'>
            {resultElements}
          </div>
        </CollapsibleComponent>
      }
      {
        errorMessage && <CollapsibleComponent name="Error">
          <div className='flex flex-col space-y-1'>
            <div className={"flex flex-row text-red-600"}>{errorMessage}</div>
          </div>
        </CollapsibleComponent>
      }
    </div>
  );
}

export default App;
