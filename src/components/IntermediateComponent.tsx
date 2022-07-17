import { Intermediate } from '../lang-w/pipeline';
import AstComponent from './AstComponent';
import OpcodeComponent from './OpcodeComponent';
import TokensComponent from './TokensComponent';
import WasmComponent from './WasmComponent';

function IntermediateComponent({intermediate}: {intermediate: Intermediate}) {
  switch (intermediate.type) {
    case "Code":
      return <>{intermediate.code}</>
    case "Tokens":
      return <TokensComponent tokens={intermediate.tokens}></TokensComponent>
    case "AST":
      return <div className='mx-2 mb-2 flex'>
          <AstComponent root={intermediate.ast}></AstComponent>
        </div>
    case "Opcodes":
      return <OpcodeComponent program={intermediate.opcodes.program}></OpcodeComponent>
      case "WASM":
        return <WasmComponent wasm={intermediate.wasm.program}></WasmComponent>
  }
}

export default IntermediateComponent;