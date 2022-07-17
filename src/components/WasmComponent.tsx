import { WasmProgram } from '../lang-w/compileWasm';

const WasmComponent = ({wasm}: {wasm: WasmProgram} ) => {
    const instructions: Array<{bytes: string, text: string, index: number}> = []

    wasm.text.forEach(({index, text}, i, arr) => {
        const end = arr[i + 1] !== undefined ? arr[i + 1].index : wasm.bytes.length;
        var bytes = ""
        wasm.bytes.slice(index, end).forEach(b => bytes += Number(b).toString(16).padStart(2, '0') + " ")
        instructions.push({bytes, text, index})
    });

    return <table>
        <thead>
            <tr>
                <th>Index</th>
                <th>Bytes</th>
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
}
export default WasmComponent;