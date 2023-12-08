"use client"

import React from 'react'
import TextField from '@mui/material/TextField';
import { Box, Tab, Tabs } from '@mui/material';
import { useParams } from 'next/navigation';

const Page = () => {

  const { address: addressParam } = useParams();
  const [address, setAddress] = React.useState(addressParam || '');
  const [selectedTab, setSelectedTab] = React.useState(0);


  /** Custom Hooks */
  return (
    <div>
      <Box display={'flex'} width={'full'} mt={3}>
        <TextField className='w-[50vw] m-auto' value={address} onChange={(e) => setAddress(e.target.value)} label="Contract Address*" variant="outlined" />
      </Box>
      <Box mt={3}>
      <Tabs value={selectedTab} onChange={(e, v) => setSelectedTab(v)} centered>
        <Tab label="ABI" />
        <Tab label="Code" />
        <Tab label="Interact" />
      </Tabs>
      </Box>

    </div>
  )
}

export default Page