import { Button } from "@mui/material";
import { useState } from "react";
import { createPublicClient, createWalletClient, custom } from "viem";
import { useAccount, useChainId, useNetwork } from "wagmi";
import { Input } from "./ui/input";

interface InputComponent {
  internalType: string;
  name: string;
  type: string;
  components?: InputComponent[];
}

interface InputField {
  components: InputComponent[];
  internalType: string;
  name: string;
  type: string;
}

interface ContractFunction {
  inputs: InputField[];
  name: string;
  outputs: any[];
  stateMutability: string;
  type: string;
}

interface ContractData {
  abi: any[],
  address: string
}

export const DynamicForm = ({ contractFunction, contractData }: { contractFunction: ContractFunction, contractData: ContractData }) => {
  // Initialize state for the form
  const [formState, setFormState] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<any>(null);
  const chainId = useChainId();
  const { chain } = useNetwork();
  const { address } = useAccount();

  const walletClient = createWalletClient({
    transport: custom((window as any).ethereum)
  })
  const publicClient = createPublicClient({
    transport: custom((window as any).ethereum)
  })

  const handleInputChange = (path: string, value: string) => {
    setFormState((prevState: any) => {
      const newState = { ...prevState };
      newState[path] = value;
      return newState;
    });
  };

  const renderInputField = (input: InputComponent, path: string) => {
    const fieldPath = `${path}.${input.name}`;

    // Handle the change event for the input
    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      handleInputChange(fieldPath, e.target.value);
    };

    switch (input.type) {
      case 'address':
      case 'uint256':
      case 'bytes':
        return (
          <Input
            type="text"
            value={formState[fieldPath] || ''}
            placeholder={`Enter ${input.type}`}
            onChange={onChange}
          />
        );
      case 'address[]':
      case 'uint256[]':
        return (
          <Input
            type="text"
            value={formState[fieldPath] || ''}
            placeholder={`Enter ${input.type} separated by commas`}
            onChange={onChange}
          />
        );
      case 'tuple':
        return (
          <div>
            {input.components!.map((component) => (
              <div key={component.name}>
                <label>{component.name}</label>
                {renderInputField(component, fieldPath)}
              </div>
            ))}
          </div>
        );
      default:
        return (
          <Input
            type="text"
            value={formState[fieldPath] || ''}
            placeholder={`Enter ${input.type}`}
            onChange={onChange}
          />
        );
    }
  };

  const renderForm = () => {
    return contractFunction.inputs?.map((input) => (
      <div key={input?.name} className='flex flex-col gap-2 mb-4'>
        <label>{input?.name}</label>
        {renderInputField(input, input.name)}
      </div>
    ));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(formState);
    // Submit logic here...
    if (contractFunction.stateMutability === 'view') {
      publicClient.readContract({
        abi: contractData.abi,
        functionName: contractFunction.name,
        address: contractData.address as `0x${string}`,
        args: Object.keys(formState).map(key => formState[key]),
        account: address
      }).then(async (res: any) => {
        setRes(res);
        console.log(res);
      }).catch((err) => {
        console.log(err);
      })
    } else if (contractFunction.stateMutability === 'nonpayable') {
      walletClient.writeContract({
        abi: contractData.abi,
        functionName: contractFunction.name,
        address: contractData.address as `0x${string}`,
        args: Object.keys(formState).map(key => formState[key]),
        account: address,
        chain
      }).then(async (res: any) => {
        const receipt = await publicClient.waitForTransactionReceipt({ hash: res.hash })
        console.log(res);
      }).catch((err) => {
        console.log(err);
      })
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      {renderForm()}
      <Button style={{ marginTop: '0px', marginLeft: 'auto' }} type="submit" variant='contained'>Submit</Button>
      { res && (
        <div className='mt-3'>
          <label>Output</label>
          <pre>{res?.toString()}</pre>
        </div>
      )}
    </form>
  );
};