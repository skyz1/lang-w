import { useEffect, useMemo, useState } from 'react';
import CollapsibleComponent from './CollapsibleComponent';
import IntermediateComponent from './IntermediateComponent';
import { Intermediate, pipeline } from '../lang-w/pipeline';
import { Token } from '../lang-w/tokenize';

function PipelineComponent(props: {code: string, pipeline: string, onTokensGenerated: (tokens: Array<Token>) => void}) {
    const [runtimeError, setRuntimeError] = useState<string|undefined>(undefined);
    const [result, setResult] = useState<Array<{ variable: string, value: number }>>([]);
    
    const pl = useMemo(() => {
        if (props.pipeline === "Interpreter" || props.pipeline === "Abstract Machine" || props.pipeline === "WASM") {
            return pipeline(props.pipeline);
        }
    }, [props.pipeline]);
    
    const [intermediates, compilationError] = useMemo(() => {
        if (pl) {
            return pl.runPipeline(props.code);
        } else {
            return [[], "Unsupported pipeline"];
        }
    }, [props.code, pl]);

    useEffect(() => {
        intermediates.forEach(intermediate => {
            if (intermediate.type === "Tokens") {
                props.onTokensGenerated(intermediate.tokens);
            }
        });
    }, [intermediates]);

    var runCode = () => {}
    if (pl) {
        runCode = () => {
            pl.executionStep(intermediates[intermediates.length - 1]).then(res => {
                const newResult: Array<{ variable: string, value: number }> = [];
                res.forEach((value, variable) => {
                    newResult.push({variable, value});
                });
                setResult(newResult);
                setRuntimeError(undefined);
            }).catch(e => {
                console.log(e);
                setResult([]);
                setRuntimeError(e.message);
            });
        }
    }

    var lastResult = undefined;
    if (result.length > 0) {
        lastResult = (<table>
            <thead>
                <tr>
                    <th>Variable</th>
                    <th className='w-full'>Value</th>
                </tr>
            </thead>
            <tbody>
                {result.map(({variable, value}) => 
                    <tr key={value}>
                        <td>{variable}</td>
                        <td>{value}</td>
                    </tr>
                )}
            </tbody>
        </table>)
    } else if (runtimeError) {
        lastResult = <div className={"text-red-600"}>Runtime error: {runtimeError}</div>
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
        { lastResult && <CollapsibleComponent name="Last Result">{lastResult}</CollapsibleComponent> }
    </div>
}

export default PipelineComponent;
