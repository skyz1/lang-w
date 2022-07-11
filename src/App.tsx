import React from 'react';
import logo from './logo.svg';

function App() {
  return (
    <div className='flex flex-col m-4 space-y-2'>
      <h1 className='text-3xl text-bold'>LangW</h1>
      <p>This websites provides some tools to work with the simple programming language W and to visualize basic compiler concepts.</p>
      <p className='mt-4'>Your code:</p>
      <textarea className='border-2 h-36'></textarea>
      <p className='mt-4'>Compiler output:</p>
      <div className='border-2 p-2 overflow-y-scroll h-36'>No output</div>
    </div>
  );
}

export default App;
