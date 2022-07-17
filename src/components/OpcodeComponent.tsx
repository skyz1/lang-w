import { Program } from '../lang-w/compileBytecode';

const OpcodeComponent = (props: {program: Program} ) => {
    return <>
        {props.program.map((instruction, i) => 
            <div key={i} className={"flex flex-row"}>
            <span className='w-8 shrink-0'>{i}</span>
            <span className='w-16 shrink-0'>{instruction.opcode}</span>
            <span className='flex-auto'>{ instruction.annotation || instruction.argument || "" }</span>
            </div>
        )}
    </>
}
export default OpcodeComponent;