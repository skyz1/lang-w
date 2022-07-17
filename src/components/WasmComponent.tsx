import { WasmProgram } from '../lang-w/compileWasm';

const WasmComponent = ({wasm}: {wasm: WasmProgram} ) => {
    const instructions: Array<{bytes: string, text: string, index: number}> = []

    wasm.text.forEach(({index, text}, i, arr) => {
        const end = arr[i + 1] !== undefined ? arr[i + 1].index : wasm.bytes.length;
        var bytes = "0x"
        wasm.bytes.slice(index, end).forEach(b => bytes += Number(b).toString(16).padStart(2, '0'))
        instructions.push({bytes, text, index})
    });

    return <>
        {instructions.map((instruction, i) => 
            <div key={i} className={"flex flex-row"}>
                <span className='w-24'>{instruction.index}</span>
                <span className='w-32'>{instruction.text}</span>
                <span className='flex-auto'>{instruction.bytes}</span>
            </div>
        )}
    </>
}
export default WasmComponent;