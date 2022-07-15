import { useEffect, useState } from 'react';
import CollapsibleComponent from './CollapsibleComponent';
import IntermediateComponent from './IntermediateComponent';
import { Intermediate, Pipeline, pipeline } from '../lang-w/pipeline';

function PipelineComponent(props: {code: string, pipeline: string}) {
    const [runtimeError, setRuntimeError] = useState<string|undefined>(undefined);
    const [result, setResult] = useState<Array<{ variable: string, value: number }>>([]);

    var intermediates: Array<Intermediate> = [];
    var compilationError: string|undefined = undefined;

    var runCode = () => {}

    if (props.pipeline === "Interpreter" || props.pipeline === "Abstract Machine") {
        const pl = pipeline(props.pipeline);
        [intermediates, compilationError] = pl.runPipeline(props.code);
        runCode = () => {
            try {
                setRuntimeError(undefined);
                const res = pl.executionStep(intermediates[intermediates.length - 1]);
                const newResult: Array<{ variable: string, value: number }> = [];
                res.forEach((value, variable) => {
                    newResult.push({variable, value});
                });
                setResult(newResult);
            } catch (e: any) {
                setRuntimeError(e.message);
            }
        }
    } else {
        compilationError = "Unsupported pipeline";
    }

    return <div className='flex flex-col space-y-2'>
            <>
                { intermediates.map((intermediate, i) => 
                    <CollapsibleComponent key={i} name={intermediate.type}>
                        <IntermediateComponent intermediate={intermediate}></IntermediateComponent>
                    </CollapsibleComponent>) }
            </>
            { compilationError && <CollapsibleComponent name="Compilation Error">
                <div className={"text-red-600"}>{compilationError}</div>
            </CollapsibleComponent> }
            { !compilationError && <button className={`mt-4 font-bold border-2 bg-green-600 h-10 w-16`} onClick={runCode}>Run</button>}
            { result.length > 0 && <CollapsibleComponent name="Last Result">
                <div className='flex flex-col space-y-1'>
                    {result.map(({variable, value}) => 
                        <div key={"result-" + value} className={"flex flex-row"}>
                            <span className='w-12'>{variable}</span>
                            <span className='flex-auto'>{value}</span>
                        </div>)}
                </div>
            </CollapsibleComponent> }
            { runtimeError && <CollapsibleComponent name="Runtime Error">
                <div className={"text-red-600"}>{runtimeError}</div>
            </CollapsibleComponent> }
        </div>
}

export default PipelineComponent;
