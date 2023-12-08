"use client"

import React from 'react'
import TextField from '@mui/material/TextField';
import { Box } from '@mui/material';
import { useParams } from 'next/navigation';

const Page = () => {
  const { address: addressParam } = useParams();
  const [address, setAddress] = React.useState(addressParam || '');
  return (
    <Box m={'auto'} width={'full'}>
      <TextField value={address} onChange={(e) => setAddress(e.target.value)} label="Contract Address*" variant="outlined" />
    </Box>
  )
}

export default Page