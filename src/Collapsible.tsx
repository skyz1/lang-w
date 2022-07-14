import React, { PropsWithChildren, useEffect, useState } from 'react';
import { AstNode } from './lang-w/parse';
import { ExecutionStep, Intermediate, pipeline, Result } from './lang-w/pipeline';

function Collapsible(props: PropsWithChildren<{name: string}>) {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  return (
    <div className='border-2 bg-gray-100 p-2' onClick={() => { setCollapsed(c => !c) }}>
        <div className='flex flex-row'>
            <div className='flex-auto font-bold select-none'>{props.name}</div>
            <div className='flex-none font-bold select-none'>{collapsed ? "+" : "-"}</div>
        </div>
        {!collapsed && 
        <div className='border-2 bg-white mt-2 p-2 h-fit max-h-36 overflow-auto'>
            {props.children}
        </div>}
    </div>
  );
}

export default Collapsible;