import { Intermediate } from '../lang-w/pipeline';
import AstComponent from './AstComponent';
import OpcodeComponent from './OpcodeComponent';
import TokensComponent from './TokensComponent';

function IntermediateComponent({intermediate}: {intermediate: Intermediate}) {
  switch (intermediate.type) {
    case "Code":
      return <>{intermediate.code}</>
    case "Tokens":
      return <TokensComponent tokens={intermediate.tokens}></TokensComponent>
    case "AST":
      return <AstComponent root={intermediate.ast}></AstComponent>
    case "Opcodes":
      return <OpcodeComponent program={intermediate.opcodes.program}></OpcodeComponent>
  }
}

export default IntermediateComponent;