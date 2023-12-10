import React, { useEffect, useState } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Box, CircularProgress, IconButton, Typography } from '@mui/material';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useChainId } from 'wagmi';
import { DynamicForm } from './DynamicForm';
import { FaGasPump } from "react-icons/fa6";
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { GasFeeEstimate } from '@/lib/model';
import { Button } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';


import Modal from '@mui/material/Modal';

interface InteractABIProps {
  abi: any[],
  address: string
}

const GasCard = () => {
  const chainId = useChainId();
  const [loading, setLoading] = useState(false);
  const [gasDetails, setGasDetails] = useState(null)
  useEffect(() => {
    const fetchGasDetails = async () => {
      if (!chainId) return
      setLoading(true);
      await fetch('/fetchGasDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chainId })
      }).then(async (res) => {
        const data = await res.json();
        console.log(data);
        setGasDetails(data);
        return data
      })
        .finally(() => {
          setLoading(false);
        })
    }
    fetchGasDetails()
  }, [chainId])

  const renderGasFeeEstimateCard = (
    estimate: GasFeeEstimate,
    title: string
  ) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Max Priority Fee: {estimate.suggestedMaxPriorityFeePerGas}</p>
        <p>Max Fee Per Gas: {estimate.suggestedMaxFeePerGas}</p>
        <p>Min Wait Time: {estimate.minWaitTimeEstimate} seconds</p>
        <p>Max Wait Time: {estimate.maxWaitTimeEstimate} seconds</p>
      </CardContent>
    </Card>
  );

  return (
    <div>
      {!loading && <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gasDetails?.low &&
            renderGasFeeEstimateCard(gasDetails.low, "Low Gas Fee Estimate")}
          {gasDetails?.medium &&
            renderGasFeeEstimateCard(gasDetails.medium, "Medium Gas Fee Estimate")}
          {gasDetails?.high &&
            renderGasFeeEstimateCard(gasDetails.high, "High Gas Fee Estimate")}
        </div>
        <Card>
          <CardContent className='flex flex-row gap-3'>
            <div className='flex flex-col gap-2 w-[30%]'>
              <h2 className="font-semibold">Estimated Base Fee</h2>
              <p>Gas Price: {gasDetails?.estimatedBaseFee}</p>
            </div>
            <div className='flex flex-col gap-2 w-[30%]'>
              <h2 className="font-semibold">Network Congestion</h2>
              <p>{gasDetails?.networkCongestion}</p>
            </div>
            <div className='flex flex-col gap-2 w-[30%]'>
              <h2 className="font-semibold">Latest Priority Fee Range</h2>
              <p>{gasDetails?.latestPriorityFeeRange?.join(" - ")}</p>
            </div>
            <div className='flex flex-col gap-2 w-[30%]'>
              <h2 className="font-semibold">Historical Priority Fee Range</h2>
              <p>{gasDetails?.historicalPriorityFeeRange?.join(" - ")}</p>
            </div>
            <div className='flex flex-col gap-2 w-[30%]'>
              <h2 className="font-semibold">Historical Base Fee Range</h2>
              <p>{gasDetails?.historicalBaseFeeRange?.join(" - ")}</p>
            </div>
            <div className='flex flex-col gap-2 w-[30%]'>
              <h2 className="font-semibold">Historical Base Fee Range</h2>
              <p>{gasDetails?.historicalBaseFeeRange?.join(" - ")}</p>
            </div>
            <div className='flex flex-col gap-2 w-[30%]'>
              <h2 className="font-semibold">Priority Fee Trend</h2>
              <p>{gasDetails?.priorityFeeTrend}</p>
            </div>
            <div className='flex flex-col gap-2 w-[30%]'>
              <h2 className="font-semibold">Base Fee Trend</h2>
              <p>{gasDetails?.baseFeeTrend}</p>
            </div>
          </CardContent>
        </Card>
      </div>}
      {loading && <div className='flex justify-center m-4'>
        <CircularProgress color={'primary'} />
      </div>}

    </div>

  );
};

const Interact = ({ abi, address }: InteractABIProps) => {
  console.log(abi, address)
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <div className='w-[60%] m-auto'>
      <Button variant={'outlined'} className='flex gap-2' style={{ marginBottom: '10px', marginLeft: 'auto' }} onClick={handleOpen}><span>Estimate</span><FaGasPump /></Button>
      <Modal
        open={open}
        onClose={handleClose}
      >
        <Box m={'auto'} mt={5} borderRadius={2} className='bg-white w-[70%]'>
          <DialogTitle>
            Current Gas Prices (Source: Metamask SDK)
          </DialogTitle>

          <DialogContent>
            <GasCard />
          </DialogContent>
          <DialogActions>
            <Button variant='contained' onClick={handleClose}>Thanks</Button>
          </DialogActions>
        </Box>
      </Modal>
      {abi.filter(f => f?.type === 'function')?.map((a: any, i) => (
        <Accordion key={`${a.name}_${i}`}>
          <AccordionSummary
            expandIcon={<ChevronDownIcon />}
            aria-controls="panel1a-content"
          >
            {/* <Typography> */}
            <pre>{a.name}{`()`}{a.stateMutability === 'view' ? `:${a.outputs.map(o => o.type)}` : ''}</pre>
            {<span className="ml-auto bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
              {a.stateMutability === 'view' ? 'Read' : 'Write'}
            </span>
            }
            {/* </Typography> */}
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              <div className='flex flex-col gap-2 overflow-x-auto flex-wrap'>
                <DynamicForm contractFunction={a} contractData={{ abi, address }} />
              </div>
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  )
}

export default Interact