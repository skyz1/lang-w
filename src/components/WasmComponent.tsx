import { WasmProgram } from '../lang-w/compileWasm';

const WasmComponent = ({wasm}: {wasm: WasmProgram} ) => {
    const instructions: Array<{bytes: string, text: string, index: number}> = []

    wasm.text.forEach(({index, text}, i, arr) => {
        const end = arr[i + 1] !== undefined ? arr[i + 1].index : wasm.bytes.length;
        var bytes = ""
        wasm.bytes.slice(index, end).forEach(b => bytes += Number(b).toString(16).padStart(2, '0') + " ")
        instructions.push({bytes, text, index})
    });

    const download = window.URL.createObjectURL(new Blob([wasm.bytes], { type: 'application/octet-stream' }))

    return <>
        <table>
            <thead>
                <tr>
                    <th>Index</th>
                    <th className="w-[20%]">Bytes</th>
                    <th className="w-full">Info</th>
                </tr>
            </thead>
            <tbody>
                {instructions.map((instruction, i) => 
                    <tr key={i}>
                        <td>{instruction.index}</td>
                        <td>{instruction.bytes}</td>
                        <td>{instruction.text}</td>
                    </tr>
                )}
            </tbody>
        </table>
        <div className='sticky bottom-0 w-full'>
            <a className='w-fit float-right px-1 m-2 bg-white border-2' href={download} download="code.wasm">Download</a>
        </div>
    </>
}
export default WasmComponent;