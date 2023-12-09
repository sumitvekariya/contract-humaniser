import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Chain } from "viem"
import { base, goerli, polygonZkEvm, sepolia } from "viem/chains"
import { mainnet } from "wagmi"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolveEtherscanURL(chain: Chain): string {
  switch (chain.id) {
    case mainnet.id:
      return "https://api.etherscan.io"
    case goerli.id:
      return "https://api-goerli.etherscan.io"
    case sepolia.id:
      return "https://api-sepolia.etherscan.io"
    case base.id:
      return "https://api.basescan.org"
    case polygonZkEvm.id:
      return "https://api-zkevm.polygonscan.com"
    
    default:
      return "https://etherscan.io"
  }
}
