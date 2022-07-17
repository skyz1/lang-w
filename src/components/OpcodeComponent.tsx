import { Program } from '../lang-w/compileBytecode';

const OpcodeComponent = (props: {program: Program} ) => {
    return <table>
        <thead>
            <tr>
                <th>Index</th>
                <th>Opcode</th>
                <th className="w-full">Argument</th>
            </tr>
        </thead>
        <tbody>
            {props.program.map((instruction, i) => 
                <tr key={i}>
                    <td>{i}</td>
                    <td>{instruction.opcode}</td>
                    <td>{instruction.annotation || instruction.argument || ""}</td>
                </tr>
            )}
        </tbody>
    </table>
}
export default OpcodeComponent;