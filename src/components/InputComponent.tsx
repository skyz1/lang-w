import { Token } from '../lang-w/tokenize';

function InputComponent(props: { code: string, pipeline: string, tokens: Array<Token>, inputChanged: (code: string, pipeline: string) => void }) {
    const coloredLines: Array<Array<{text: string, color: string}>> = [[]]
    var lastIndex = 0;

    props.tokens.forEach(token => {
        if (lastIndex < token.index) {
            const lines = props.code.substring(lastIndex, token.index).split("\n");
            lines.forEach((line, i, arr) => {
                if (line !== "") {
                    coloredLines[coloredLines.length-1].push({text: line, color: "text-black"});
                }
                if (i < arr.length - 1) {
                    coloredLines.push([]);
                }
                lastIndex = token.index;
            });
        }
        coloredLines[coloredLines.length-1].push({text: token.text, color: token.color});
        lastIndex += token.text.length;
    });

    return <>
        <p className='mt-4 font-bold'>Your code:</p>
        <div className='border-x-2 border-t-2 h-fit relative overflow-y-auto'>
            <div className='h-fit w-fit min-w-full z-0 relative'>
                <div className='h-fit w-full font-mono resize-none z-10 relative'>
                    {coloredLines.map((line, i, arr) => <div key={i} className={"flex flex-row leading-[30px] border-b-2"}>
                            <span className='pr-2 w-11 font-bold border-r mr-1 text-right flex-shrink-0'>{i}</span>
                            <>{line.map(subline => <span className={subline.color}>{subline.text}</span>)}</>
                        </div>
                    )}
                </div>
                <textarea className='text-transparent h-full w-full caret-black font-mono resize-none absolute bg-transparent pl-12 leading-[32px] overflow-y-hidden absolute top-0 outline-0 z-50 selection:text-tranparent selection:bg-blue-700/25' 
                    onChange={e => props.inputChanged(e.target.value, props.pipeline)} value={props.code} spellCheck={false} wrap="off" autoCapitalize='off' autoComplete='off' autoCorrect='off'></textarea>
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