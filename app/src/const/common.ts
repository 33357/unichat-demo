export interface Chain {
  SCAN_URL: string;
  CHAIN_NAME: string;
  NODE_URL: string;
}

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const CHAIN: { [chainId: string]: Chain } = {
  1: {
    SCAN_URL: 'https://etherscan.io/',
    CHAIN_NAME: 'ETH',
    NODE_URL: 'https://mainnet.infura.io/v3',
  },
};

export const BACKGROUND_LIST = [
  {
    URL: './static/background/unichat.jpg',
    TEXT: 'UNICHAT',
  },
  {
    URL: './static/background/uniswap.jpg',
    TEXT: 'UNISWAP',
  },
  {
    URL: './static/background/aave.jpg',
    TEXT: 'AAVE',
  },
  {
    URL: './static/background/maker.jpg',
    TEXT: 'MAKER',
  },
  {
    URL: './static/background/eth.jpg',
    TEXT: 'ETH',
  },
  {
    URL: './static/background/btc.jpg',
    TEXT: 'BTC',
  },
];
