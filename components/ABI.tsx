import React from 'react'
import { CodeBlock, CopyBlock, vs2015, atomOneLight } from 'react-code-blocks'

const ABI = ({ abi }) => {
  return (<div className='flex justify-center min-w-[70vw]'>
    {abi && <div className='min-w-[50vw] max-w-[80vw]'>
      <CopyBlock
        // codeBlock={true}
        codeContainerStyle={{ 'width': '100% !important', margin: 'auto' }}
        codeBlockStyle={{ 'minWidth': '100%', }}
        wrapLongLines={true}
        text={JSON.stringify(abi, null, "\t")}
        language={'json'}
        showLineNumbers={true}
        theme={atomOneLight}
      />
    </div>}
  </div>
  )
}

export default ABI