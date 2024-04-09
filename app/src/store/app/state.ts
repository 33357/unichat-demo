import { Ether } from '@/api';
import { API } from '@/api/api';
import { BigNumber, BACKGROUND_LIST, ZERO_ADDRESS } from '@/const';

export interface AppStorage {
  background: string;
}

export interface AppSync {
  userAddress: string;
  isMobile: boolean;
  decimalLimit: number;
  avatarMap: { [address: string]: string };
  ether: Ether;
  api: API;
}

export interface TokenMap {
  [tokenAddress: string]: {
    name: string;
    symbol: string;
    decimals: number;
    logo?: string;
  };
}

export interface BalanceMap {
  [tokenAddress: string]: { [address: string]: BigNumber };
}

export interface AppAsync {
  tokenMap: TokenMap;
  balanceMap: BalanceMap;
  tokenList?: {
    chainId: number;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
  }[];
}

export interface AppState {
  storage: AppStorage;
  sync: AppSync;
  async: AppAsync;
}

const appState: AppState = {
  storage: {
    background: BACKGROUND_LIST[0].URL,
  },
  sync: {
    userAddress: ZERO_ADDRESS,
    decimalLimit: 5,
    isMobile: false,
    ether: new Ether(),
    api: new API(),
    avatarMap: {},
  },
  async: {
    tokenList: undefined,
    tokenMap: {},
    balanceMap: {},
  },
};
export default appState;
