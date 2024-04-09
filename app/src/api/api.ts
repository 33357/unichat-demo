import { Message } from '@/store/chat/state';
import axios from 'axios';

export class API {
  host = 'http://localhost:8001/api';
  api = axios.create({
    withCredentials: true,
  });

  constructor() {}

  async getMessage(
    chain: string,
    to: string,
    start: number,
    length: number
  ): Promise<{
    messageList: Message[];
    length: number;
  }> {
    return (
      await this.api.post(`${this.host}/getMessage`, {
        chain,
        to,
        start,
        length,
      })
    ).data;
  }

  async sendMessage(chain: string, to: string, data: string): Promise<{ date: number }> {
    return (
      await this.api.post(`${this.host}/sendMessage`, {
        chain,
        to,
        data,
      })
    ).data;
  }

  async getLogin(
    address: string
  ): Promise<
    | {
        message: string;
      }
    | {
        message: string;
        address: string;
        date: number;
      }
  > {
    return (await this.api.post(`${this.host}/getLogin`, { address })).data;
  }

  async login(signature: string, message: any): Promise<{ message: string }> {
    return (await this.api.post(`${this.host}/login`, { signature, message })).data;
  }

  // async getUSD(address: string): Promise<number> {
  //   return (await axios.get(`https://api.debank.com/user/addr?addr=${address}`)).data.usd_value;
  // }

  async getTokenList(): Promise<
    {
      chainId: number;
      address: string;
      name: string;
      symbol: string;
      decimals: number;
      logoURI: string;
    }[]
  > {
    return (await axios.get('https://gateway.ipfs.io/ipns/tokens.uniswap.org')).data.tokens;
  }
}
