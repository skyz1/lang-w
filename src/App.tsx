import React, { useEffect, useState } from 'react';
import { Token, tokenize } from './lang-w/tokenize';
import logo from './logo.svg';

function App() {
  const [code, setCode] = useState<string>("")
  const [tokens, setTokens] = useState<Array<Token>>([])

  useEffect(() => {
    setTokens(tokenize(code))
  }, [code])

  return (
    <div className='flex flex-col m-4 space-y-2'>
      <h1 className='text-3xl text-bold'>LangW</h1>
      <p>This websites provides some tools to work with the simple programming language W and to visualize basic compiler concepts.</p>
      <p className='mt-4'>Your code:</p>
      <textarea className='border-2 h-36' onChange={e => setCode(e.target.value)}></textarea>
      <p className='mt-4'>Tokens:</p>
      <div className='border-2 p-2 overflow-y-scroll flex flex-col space-y-1 h-36'>
        {tokens.map((token, i) => 
          <div key={"token-" + i} className={"flex flex-row " + (token.type === undefined ? "text-red-600" : "")}>
            <span className='w-24'>{token.type}</span>
            <span className='flex-auto'>{token.text}</span>
            <span>{token.index}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
