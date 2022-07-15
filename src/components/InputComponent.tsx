function InputComponent(props: { code: string, pipeline: string, inputChanged: (code: string, pipeline: string) => void }) {
    return <>
        <p className='mt-4 font-bold'>Your code:</p>
        <textarea className='border-2 h-36' onChange={e => props.inputChanged(e.target.value, props.pipeline)} value={props.code}></textarea>
        <div className='flex flex-row'>
            <span className='flex-none text-bold mr-4'>Pipeline: </span>
            <select className='flex-auto border-2' value={props.pipeline} onChange={e => props.inputChanged(props.code, e.target.value)}>
                <option value="Interpreter">Interpreter</option>
                <option value="Abstract Machine">Abstract Machine</option>
            </select>
        </div>
    </>
  }
  
  export default InputComponent;