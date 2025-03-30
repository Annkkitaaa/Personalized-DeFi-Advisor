import { ethers } from 'ethers';

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

export const getProvider = () => {
  if (window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
  
  // Fallback to Alchemy provider
  const ALCHEMY_API_KEY = process.env.REACT_APP_ALCHEMY_API_KEY;
  if (ALCHEMY_API_KEY) {
    return new ethers.providers.JsonRpcProvider(
      `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
    );
  }
  
  throw new Error('No Ethereum provider available');
};

export const getSigner = async () => {
  const provider = getProvider();
  if (provider instanceof ethers.providers.Web3Provider) {
    return provider.getSigner();
  }
  throw new Error('Cannot get signer without Web3Provider');
};

export const getTokenBalance = async (tokenAddress, walletAddress) => {
  try {
    const provider = getProvider();
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    
    const balance = await tokenContract.balanceOf(walletAddress);
    const decimals = await tokenContract.decimals();
    const symbol = await tokenContract.symbol();
    
    return {
      balance: balance.toString(),
      formatted: ethers.utils.formatUnits(balance, decimals),
      decimals,
      symbol
    };
  } catch (error) {
    console.error('Error fetching token balance:', error);
    throw error;
  }
};

export const approveToken = async (tokenAddress, spenderAddress, amount) => {
    try {
      const signer = await getSigner();
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      
      const tx = await tokenContract.approve(spenderAddress, amount);
      return await tx.wait();
    } catch (error) {
      console.error('Error approving token:', error);
      throw error;
    }
  };
  
  export const transferToken = async (tokenAddress, recipientAddress, amount) => {
    try {
      const signer = await getSigner();
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      
      const tx = await tokenContract.transfer(recipientAddress, amount);
      return await tx.wait();
    } catch (error) {
      console.error('Error transferring token:', error);
      throw error;
    }
  };
  
  export const estimateGas = async (transaction) => {
    try {
      const provider = getProvider();
      const gasEstimate = await provider.estimateGas(transaction);
      return gasEstimate;
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw error;
    }
  };
  
  export const getGasPrice = async () => {
    try {
      const provider = getProvider();
      const gasPrice = await provider.getGasPrice();
      return {
        wei: gasPrice.toString(),
        gwei: ethers.utils.formatUnits(gasPrice, 'gwei')
      };
    } catch (error) {
      console.error('Error getting gas price:', error);
      throw error;
    }
  };
  
  export const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  export const getChainId = async () => {
    try {
      const provider = getProvider();
      const network = await provider.getNetwork();
      return network.chainId;
    } catch (error) {
      console.error('Error getting chain ID:', error);
      throw error;
    }
  };
  
  export const getEthBalance = async (address) => {
    try {
      const provider = getProvider();
      const balance = await provider.getBalance(address);
      return {
        wei: balance.toString(),
        eth: ethers.utils.formatEther(balance)
      };
    } catch (error) {
      console.error('Error getting ETH balance:', error);
      throw error;
    }
  };
  
  export default {
    getProvider,
    getSigner,
    getTokenBalance,
    approveToken,
    transferToken,
    estimateGas,
    getGasPrice,
    formatAddress,
    getChainId,
    getEthBalance
  };