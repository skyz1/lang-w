import { useEffect, useMemo, useState } from 'react';
import { Token } from '../lang-w/tokenize';

function InputComponent(props: { code: string, pipeline: string, tokens: Array<Token>, inputChanged: (code: string, pipeline: string) => void }) {
    const [coloredLines, setColoredLines] = useState<Array<Array<{text: string, color: string}>>>([[]]);

    useEffect(() => {
        if (props.tokens.length > 0) {
            const cl: Array<Array<{text: string, color: string}>> = [[]]
            var lastIndex = 0;
            props.tokens.forEach(token => {
                if (lastIndex < token.index) {
                    const lines = props.code.substring(lastIndex, token.index).split("\n");
                    lines.forEach((line, i, arr) => {
                        if (line !== "") {
                            cl[cl.length-1].push({text: line, color: "text-black"});
                        }
                        if (i < arr.length - 1) {
                            cl.push([]);
                        }
                        lastIndex = token.index;
                    });
                }
                cl[cl.length-1].push({text: token.text, color: token.color});
                lastIndex += token.text.length;
            });
            setColoredLines(cl);
        } else if (props.code.trim() === "") {
            setColoredLines([...props.code.split("\n").map(line => [{text: line, color: "text-black"}])]);
        }
    }, [props.code, props.tokens]);

    return <>
        <p className='mt-4 font-bold'>Your code:</p>
        <div className='border-2 h-fit w-full relative font-mono flex flex-row'>
            <div className='border-r relative bg-gray-100 select-none shrink-0'>
                {coloredLines.map((line, i, arr) => 
                    <div key={i} className={"leading-8 font-bold text-right px-2 select-none"}>{i}</div>
                )}
            </div>
            <div className='w-full z-0 relative overflow-y-auto'>
                <div className='h-fit w-fit min-w-full z-0 relative'>
                    <div className='h-fit w-fullresize-none z-10 relative select-none'>
                        {coloredLines.map((line, i, arr) => 
                            <div key={i} className={"leading-8 px-2"}>
                                <>{line.map((subline, j) => <span className={subline.color} key={i + "-" + j}>{subline.text}</span>)}</>
                                <br></br>
                            </div>
                        )}
                    </div>
                    <textarea className='text-transparent h-full w-full caret-black resize-none absolute bg-transparent px-2 leading-8 overflow-hidden absolute top-0 outline-0 z-50 selection:text-tranparent selection:bg-blue-700/25' 
                        onChange={e => props.inputChanged(e.target.value, props.pipeline)} value={props.code} spellCheck={false} wrap="off" autoCapitalize='off' autoComplete='off' autoCorrect='off'></textarea>
                </div>
            </div>
        </div>
        <div className='flex flex-row'>
            <span className='flex-none text-bold mr-4'>Pipeline: </span>
            <select className='flex-auto border-2' value={props.pipeline} onChange={e => props.inputChanged(props.code, e.target.value)}>
                <option value="Interpreter">Interpreter</option>
                <option value="Abstract Machine">Abstract Machine</option>
                <option value="WASM">WASM</option>
            </select>
        </div>
    </>
  }
  
  export default InputComponent;