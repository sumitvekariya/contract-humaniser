import { whatsabi } from "@shazow/whatsabi";
import { createPublicClient, http } from "viem";
import { goerli } from "viem/chains";
import { mainnet, usePublicClient } from "wagmi";

export const useFetchABI = (chainId: number) => {
  const publicClient = usePublicClient({chainId});

  const fetchABI = async (address: string) => {
    // const client = createPublicClient({ 
    //   chain: goerli,
    //   transport: http('https://eth-goerli.g.alchemy.com/v2/S-uTorY7S0NXUbCXMvCf-V72W4vPl6RJ')
    // })
    
    /** Fetch ABI with selector */
    const code = await publicClient.getBytecode({
      address: address as `0x${string}`,
    })    
    const abi = whatsabi.abiFromBytecode(code!.toString());
    console.log(abi);
    // const signatureLookup = new whatsabi.loaders.OpenChainSignatureLookup();
    // let events = [];
    // let functions = [];
    // try {
    //   abi.forEach(async (item: any) => {
    //     if (item.type === 'function') {
    //       const signature = signatureLookup.loadFunctions(item.selector);
    //       functions.push(signature);
    //     } else if (item.type === 'event') {
    //       const signature = signatureLookup.loadEvents(item.hash);
    //       events.push(signature);   
    //     }
    //   });
    //   console.log(await Promise.all(events));
    //   console.log(await Promise.all(functions));

    // } catch (error) {
      
    // }

    /** Autoload */
    const result = await whatsabi.autoload(address as `0x${string}`, {
      provider: publicClient,
    })
    console.log(result);
    return result;
  }

  return {
    fetchABI
  }
}