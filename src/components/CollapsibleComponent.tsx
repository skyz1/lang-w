import { PropsWithChildren, useState } from 'react';

function CollapsibleComponent(props: PropsWithChildren<{name: string}>) {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  return (
    <div className='border-2 bg-gray-100 p-2' onClick={() => { setCollapsed(c => !c) }}>
        <div className='flex flex-row select-none font-bold'>
            <div className='flex-auto'>{props.name}</div>
            <div className='flex-none'>{collapsed ? "+" : "-"}</div>
        </div>
        {!collapsed && 
        <div className='relative border-2 bg-white mt-2 h-fit max-h-36 overflow-auto flex flex-col space-y-1' onClick={e => e.stopPropagation()}>
            {props.children}
        </div>}
    </div>
  );
}

export default CollapsibleComponent;