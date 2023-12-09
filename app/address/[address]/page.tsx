"use client"

import React, { useEffect, useState } from 'react'
import TextField from '@mui/material/TextField';
import { Box, Tab, Tabs } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import ABI from '@/components/ABI';
import ContractCode from '@/components/ContractCode';
import Interact from '@/components/Interact';
import { resolveEtherscanURL } from '@/lib/utils';
import { Source } from '@/lib/model';
import { useNetwork } from 'wagmi';
import { useFetchABI } from '@/hooks/useFetchABI';

const Page = () => {
  const router = useRouter();
  const { address: addressParam } = useParams();
  const [address, setAddress] = React.useState(addressParam || '');
  const [selectedTab, setSelectedTab] = React.useState(0);

  const [abi, setAbi] = useState([]);
  const [simplifiedABI, setSimplifiedABI] = useState([]);
  const [contractCode, setContractCode] = useState<Source>();
  const [contractName, setContractName] = useState<string>('');
  const { chain } = useNetwork();
  const { fetchABI } = useFetchABI(chain?.id)

  useEffect(() => {
    if (!address) return
    fetchContractData()
  }, [address])


  const fetchContractData = async () => {
    if (!addressParam) return
    try {
      const resolvedAPI = resolveEtherscanURL(chain);
      if (resolvedAPI) {

        const etherscanAPIRoute = new URL(`${resolvedAPI}/api?module=contract&action=getsourcecode&address=${addressParam}`);
        fetch(`/fetchContractDetails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ apiRoute: etherscanAPIRoute.toString() })
        }).then(async (res) => {
          const data = await res.json();
          if (!data.result[0]) return
          const source = data.result[0].SourceCode;
          let cleanedUpData;
          if (source[0] == '{') {
            cleanedUpData = source.slice(1, source.length - 1);
            setContractCode(JSON.parse(cleanedUpData)?.sources);
          } else {
            cleanedUpData = source
            setContractCode(cleanedUpData);

          }
          setContractName(data.result[0]?.ContractName)
          setAbi(JSON.parse(data.result[0].ABI))
          console.log(data);
        })
      }
    } catch (error) {
      console.log(error)
    }


    try {
      const res = await fetchABI(addressParam as string);
      setSimplifiedABI(res.abi)
    } catch (error) {

    }
  }

  return (
    <div>
      <Box display={'flex'} width={'full'} mt={3} justifyContent={'center'}>
        <TextField className='w-[50vw] m-auto align-middle' value={address}     
        onKeyDown={(e) => {
        if (e.key === "Enter" && address) {
          router.push(`/address/${address}`);
        }
        }} onChange={(e) => setAddress(e.target.value)} label="Contract Address*" variant="outlined" />
      </Box>
      <Box mt={3}>
        <Tabs value={selectedTab} onChange={(e, v) => setSelectedTab(v)} centered>
          <Tab label="ABI" />
          <Tab label="Code" />
          <Tab label="Interact" />
        </Tabs>
      </Box>

      <Box my={3} mx={3} >
        {selectedTab == 0 && <ABI abi={abi} />}
        {selectedTab == 1 && <ContractCode sources={contractCode} contractName={contractName} />}
        {selectedTab == 2 && <Interact abi={abi} address={addressParam as string} />}
      </Box>

    </div>
  )
}

export default Page