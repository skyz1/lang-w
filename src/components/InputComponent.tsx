function InputComponent(props: { code: string, pipeline: string, inputChanged: (code: string, pipeline: string) => void }) {
    return <>
        <p className='mt-4 font-bold'>Your code:</p>
        <div className='border-2 h-fit relative overflow-y-auto'>
            <div className='h-fit w-full font-mono resize-none z-10 relative'>
                {props.code.split("\n").map((line, i, arr) => 
                    <div key={i} className={"flex flex-row " + (i < arr.length-1 ? "leading-[30px] border-b-2" : "leading-[32px]")}>
                        <span className='pl-2 w-8 font-bold'>{i}</span>
                        <span className='pl-1 border-l'>{line}</span>
                    </div>
                )}
            </div>
            <textarea className='text-transparent h-full w-full caret-black font-mono resize-none absolute bg-transparent pl-9 leading-[32px] absolute top-0 outline-0 z-50' onChange={e => props.inputChanged(e.target.value, props.pipeline)} value={props.code}></textarea>
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