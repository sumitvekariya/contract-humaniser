import React, { useEffect, useState } from 'react'
import { Input } from './ui/input';
import { Accordion, AccordionDetails, AccordionSummary, CircularProgress, IconButton, Typography } from '@mui/material';
import { ChevronUpIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import { useAccount, useChainId, useContractWrite, usePrepareContractWrite, useWalletClient } from 'wagmi';
import { createPublicClient, createWalletClient, custom } from 'viem';
import { DynamicForm } from './DynamicForm';
import { RiGasStationLine } from "react-icons/ri";
import { FaGasPump } from "react-icons/fa6";
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { GasFeeEstimate } from '@/lib/model';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface InteractABIProps {
  abi: any[],
  address: string
}

const GasCard = () => {
  const chainId = useChainId();
  const [loading, setLoading] = useState(false);
  const [gasDetails, setGasDetails] = useState<GasFeeEstimate | null>(null)
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
          <CardContent>
            <h2 className="font-semibold">Estimated Base Fee</h2>
            <p>Gas Price: {gasDetails?.estimatedBaseFee}</p>
            <h2 className="font-semibold">Network Congestion</h2>
            <p>{gasDetails?.networkCongestion}</p>
            <h2 className="font-semibold">Latest Priority Fee Range</h2>
            <p>{gasDetails?.latestPriorityFeeRange?.join(" - ")}</p>
            <h2 className="font-semibold">Historical Priority Fee Range</h2>
            <p>{gasDetails?.historicalPriorityFeeRange?.join(" - ")}</p>
            <h2 className="font-semibold">Historical Base Fee Range</h2>
            <p>{gasDetails?.historicalBaseFeeRange?.join(" - ")}</p>
            <h2 className="font-semibold">Priority Fee Trend</h2>
            <p>{gasDetails?.priorityFeeTrend}</p>
            <h2 className="font-semibold">Base Fee Trend</h2>
            <p>{gasDetails?.baseFeeTrend}</p>
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
  return (
    <div className='w-[60%] m-auto'>
      <AlertDialog>
        <AlertDialogTrigger>
          <Button variant='outline' className='flex gap-2 mb-3'><span>Estimate</span><FaGasPump /></Button>
        </AlertDialogTrigger>
        <AlertDialogContent className='w-[70vw] h-[auto]'>
          <AlertDialogHeader>
            <AlertDialogTitle>Metamask Gas API</AlertDialogTitle>
            <AlertDialogDescription>
              <GasCard />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* <AlertDialogCancel>Cancel</AlertDialogCancel> */}
            <AlertDialogAction>Thanks</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {abi.filter(f => f?.type === 'function')?.map((a: any, i) => (
        <Accordion key={`${a.name}_${i}`}>
          <AccordionSummary
            expandIcon={<ChevronDownIcon />}
            aria-controls="panel1a-content"
          >
            {/* <Typography> */}
              <pre>{a.name}{`()`}{a.stateMutability === 'view' ? `:${a.outputs.map(o => o.type)}` : ''}</pre>
            {/* </Typography> */}
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              <div className='flex flex-col gap-2 overflow-x-auto'>
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