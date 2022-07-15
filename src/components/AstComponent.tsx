import { useState } from 'react';
import { AstNode } from './../lang-w/parse';


const AstComponent = (props: {root: AstNode} ) => {
    const rootChildren = props.root.children();
  
    const nodeToString = (node: AstNode): string|undefined => {
      const children = node.children();
      if (children.length === 0) {
        return node.type;
      } else if (children.length === 1) {
        const chain = nodeToString(children[0]);
        console.log(chain)
        if (chain !== undefined) {
          return node.type + " - " + chain;
        }
      }
      return undefined;
    }
  
    const [collapsed, setCollapsed] = useState(nodeToString(props.root) !== undefined);
  
    const compressed = nodeToString(props.root)
  
    if (rootChildren.length === 0) {
      return <>
        <span className={'flex-auto mt-2 p-1 border-2 border-black bg-blue-400 text-center'}>{props.root.type}</span>
      </>
    } else {
      return <span className={'flex-none w-fit'}>
        <div className={'border-gray-400 mt-2 p-1 border-2 border-black bg-blue-400 w-full text-center'} onClick={() => setCollapsed(c => !c)}>{(collapsed && compressed ? compressed : props.root.type)}</div>
        {collapsed || <span className='flex flex-nowrap w-full space-x-2'>
          {rootChildren.map((child, i) => <AstComponent root={child} key={"child-" + i}></AstComponent>)}
        </span>}
      </span>
    }
}
export default AstComponent;