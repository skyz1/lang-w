import { Intermediate } from '../lang-w/pipeline';
import AstComponent from './AstComponent';
import OpcodeComponent from './OpcodeComponent';
import TokensComponent from './TokensComponent';

function IntermediateComponent({intermediate}: {intermediate: Intermediate}) {
  switch (intermediate.type) {
    case "Tokens":
      return <TokensComponent tokens={intermediate.value}></TokensComponent>
    case "AST":
      return <AstComponent root={intermediate.value}></AstComponent>
    case "Opcodes":
      return <OpcodeComponent program={intermediate.value.program}></OpcodeComponent>
  }
}

export default IntermediateComponent;