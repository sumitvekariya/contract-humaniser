import { Source } from '@/lib/model'
import React, { useEffect } from 'react'
import { BiFolderMinus, BiFolderPlus, BiCodeBlock, BiFile } from "react-icons/bi";
import { TreeView } from '@mui/x-tree-view/TreeView';
import { CodeBlock, dracula, atomOneDark, CopyBlock, vs2015 } from 'react-code-blocks';
import { TreeItem, TreeItemProps, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import { alpha, styled } from '@mui/material/styles';
import OpenAI from "openai";
import { Button } from './ui/button';
import { FaMagic } from "react-icons/fa";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { CircularProgress } from '@mui/material';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPEN_AI_KEY,
  dangerouslyAllowBrowser: true
});
interface ContractCodeProps {
  sources: Source | string,
  contractName: string
}
interface TreeNode {
  value: string;
  children: TreeNode[];
  code?: string;
  id: string;
}

const ContractCode = ({ sources = {}, contractName }: ContractCodeProps) => {
  const [treeData, setTreeData] = React.useState();
  const [selectedFile, setSelectedFile] = React.useState({
    name: '',
    code: '',
    path: '',
  });
  const isTypeOfSourceString = typeof sources === 'string';


  React.useEffect(() => {
    function generateTreeData(data: string[]): TreeNode[] {
      const tree: TreeNode[] = [];
      const nodeMap: { [key: string]: TreeNode } = {};

      for (const value of data) {
        const segments = value.split('/');
        const name = segments[segments.length - 1];
        let parentNode = null;

        for (let i = 0; i < segments.length - 1; i++) {
          const segment = segments[i];
          const nodeValue = segments.slice(0, i + 1).join('/');

          if (i === 0 && !nodeMap[nodeValue]) {
            const rootNode: TreeNode = { value: segment, children: [], id: `${segment}` };
            tree.push(rootNode);
            nodeMap[nodeValue] = rootNode;
            parentNode = rootNode;
          } else if (!nodeMap[nodeValue]) {
            const newNode: TreeNode = { value: segment, children: [], id: `${segment}_${value}` };
            parentNode!.children.push(newNode);
            nodeMap[nodeValue] = newNode;
            parentNode = newNode;
          } else {
            parentNode = nodeMap[nodeValue];
          }
        }

        const leafNode: TreeNode = { value: name.replace(new RegExp(`^${parentNode!.name}/`), ''), code: sources[value].content, children: [], id: `${name}` };
        if (leafNode.value === `${contractName}.sol`) {
          setSelectedFile({ name: leafNode?.value, code: leafNode?.code, path: leafNode?.id })
        }
        parentNode!.children.push(leafNode);
      }

      return tree;
    }

    if (!isTypeOfSourceString && Object.keys(sources).length) {
      const generated = generateTreeData(Object.keys(sources));
      setTreeData(generated);
      console.log(generated);
    } else {
      setSelectedFile({ name: contractName, code: sources as string, path: '' })
    }


  }, [sources, contractName, isTypeOfSourceString]);

  const onSelectFile = (node) => {
    if (node?.code) {
      setSelectedFile({ name: node.value, code: node.code, path: node.id })
    }
  }

  const CustomTreeItem = React.forwardRef(
    (props: TreeItemProps, ref: React.Ref<HTMLLIElement>) => (
      <TreeItem {...props} ref={ref} />
    ),
  );
  CustomTreeItem.displayName = 'CustomTreeItem';


  const StyledTreeItem = styled(CustomTreeItem)(({ theme }) => ({
    [`& .${treeItemClasses.iconContainer}`]: {
      '& .close': {
        opacity: 0.3,
      },
    },
    [`& .${treeItemClasses.group}`]: {
      marginLeft: 15,
      paddingLeft: 18,
      borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    },
  }));

  const renderTree = (nodes) => (
    <StyledTreeItem icon={nodes?.code && <BiFile />} key={nodes.id} nodeId={`${nodes.id}`} label={`${nodes.value}`} onClick={() => onSelectFile(nodes)}>
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => renderTree(node))
        : null}
    </StyledTreeItem>
  );



  const CodeExplanationCard = () => {
    const [loading, setLoading] = React.useState(false);
    const [explanation, setExplanation] = React.useState('');
    useEffect(() => {
      const explainCode = () => {
        setLoading(true);
        try {
          selectedFile.code && openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              { role: 'system', content: 'You will be provided with a piece of code, and your task is to explain it in a simplest way.' },
              { role: 'user', content: `${selectedFile.code}` }
            ],
            max_tokens: 2048,
            temperature: 0,
          }).then((res) => {
            setExplanation(res?.choices[0]?.message?.content);
            console.log(res);
          }).finally(() => {
            setLoading(false);
          })
        } catch (error) {
          console.log(error)
        }
      }
      explainCode()
    }, [])
    if (loading) return <CircularProgress className='m-auto' />
    return <pre className='whitespace-pre-wrap'>{explanation}</pre>
  }

  return (
    <div className='flex flex-row gap-2 justify-center m-auto'>
      {!isTypeOfSourceString && <TreeView className='min-w-[300px] h-fit sticky top-[70px]' defaultCollapseIcon={<BiFolderMinus />}
        defaultExpandIcon={<BiFolderPlus />}
        sx={{ overflowY: 'auto' }}
        defaultExpanded={[contractName ? `${contractName}.sol` : '', 'contracts']}
        defaultSelected={[contractName ? `${contractName}.sol` : '']}
      >
        {treeData?.map(t => renderTree(t))}
      </TreeView>}
      {
        selectedFile?.code && <div className='flex flex-col gap-3'>
          <div className='flex gap-3 items-center'>
            <label className='font-bold'>{selectedFile?.path}</label>
            <AlertDialog>
              <AlertDialogTrigger>
                <Button>Explain <FaMagic className={'w-5 h-5 ml-2 text-yellow-500'} /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent className='w-[70vw] h-[auto]'>
                <AlertDialogHeader>
                  <AlertDialogTitle>{contractName} explanation using AI</AlertDialogTitle>
                  <AlertDialogDescription>
                    <CodeExplanationCard />
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  {/* <AlertDialogCancel>Cancel</AlertDialogCancel> */}
                  <AlertDialogAction>Thanks</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className='max-h-[100vh] max-w-[70vw] overflow-y-auto w-full'>
            <CopyBlock
              // codeBlock={true}
              // codeContainerStyle={{ 'min-width': '70vw', 'maxHeight': '70vh !important', 'overflow-y': 'scroll' }}
              // codeBlockStyle={{ 'minWidth': '100%', 'maxHeight': '70vh !important', 'overflow-y': 'scroll !important' }}
              wrapLongLines={true}
              text={selectedFile?.code}
              language={'solidity'}
              showLineNumbers={true}
              theme={vs2015}
            />
          </div>
        </div>
      }

    </div>


  )
}

export default ContractCode