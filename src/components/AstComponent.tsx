import { useState } from 'react';
import { AstNode } from './../lang-w/parse';


const AstComponent = ({root}: {root: AstNode} ) => {
    const [collapsed, setCollapsed] = useState(false);
    
    const rootChildren = root.children();
    var text: string = root.type;
    switch (root.type) {
      case "number":
        text = String(root.value);
        break;
      case "boolean":
        text = String(root.value);
        break;
      case "identifier":
        text = root.identifier;
        break;
    }
  
    if (rootChildren.length === 0) {
      return <span className={'flex-auto mt-2 p-1 border border-black bg-blue-400 text-center h-fit'}>{text}</span>
    } else {
      return <span className={'flex-none w-fit h-fit'}>
        <div className={'mt-2 p-1 border border-black bg-blue-400 w-full text-center'} onClick={() => setCollapsed(c => !c)}>{text}</div>
        {collapsed || <span className='flex flex-nowrap w-full space-x-2'>
          {rootChildren.map((child, i) => <AstComponent root={child} key={i}></AstComponent>)}
        </span>}
      </span>
    }
}
export default AstComponent;