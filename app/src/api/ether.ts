import detectEthereumProvider from '@metamask/detect-provider';
import { ethers, Signer } from 'ethers';
import { log } from '@/const';
import { Web3Provider, JsonRpcProvider } from '@ethersproject/providers';
import * as ethUtil from 'ethereumjs-util';
import * as sigUtil from '@metamask/eth-sig-util';
import { UniChatHelper, DeploymentInfo } from 'unichat-contract-sdk';

export class Ether {
  private _ethereum: any;
  public singer?: Signer;
  public chainId?: number;
  public provider?: Web3Provider | JsonRpcProvider;
  public uniChatHelper?: UniChatHelper;

  constructor() {}

  async load() {
    this._ethereum = await detectEthereumProvider();
    if (this._ethereum) {
      this._ethereum.on('accountsChanged', () => {
        window.location.reload();
      });
      this._ethereum.on('chainChanged', () => {
        window.location.reload();
      });
      try {
        await this._ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        throw new Error('Connection refused');
      }
      this.provider = new ethers.providers.Web3Provider(this._ethereum);
      this.singer = this.provider.getSigner();
      this.chainId = await this.singer.getChainId();
      if (this.chainId != 1) {
        await this._ethereum.request({
          method: 'wallet_switchEthereumChain', // Metamask的api名称
          params: [{ chainId: '0x1' }],
        });
      }
      this.uniChatHelper = new UniChatHelper(this.provider, DeploymentInfo[this.chainId]['UniChatHelper'].proxyAddress);
    } else {
      log('Please use a browser that supports web3 to open');
    }
  }

  P2P = {
    decrypt: async (secretBase64: string, address: string) => {
      const secretHex = Buffer.from(secretBase64, 'base64').toString('hex');
      const ephemPublicKeyBase64 = Buffer.from(secretHex.substring(0, 64), 'hex').toString('base64');
      const nonceBase64 = Buffer.from(secretHex.substring(64, 112), 'hex').toString('base64');
      const ciphertextBase64 = Buffer.from(secretHex.substring(112), 'hex').toString('base64');
      const encryptData = JSON.stringify({
        version: 'x25519-xsalsa20-poly1305',
        ephemPublicKey: ephemPublicKeyBase64,
        nonce: nonceBase64,
        ciphertext: ciphertextBase64,
      });
      const hex = ethUtil.bufferToHex(Buffer.from(encryptData, 'utf-8'));
      const content: string = await this._ethereum.request({
        method: 'eth_decrypt',
        params: [hex, address],
      });
      console.log(content);
      return content;
    },
    encrypt: (content: string, encryptionPublicKey: string) => {
      const encryptData = sigUtil.encrypt({ publicKey: encryptionPublicKey, data: content, version: 'x25519-xsalsa20-poly1305' });
      const ephemPublicKeyHex = Buffer.from(encryptData.ephemPublicKey, 'base64').toString('hex');
      const nonceHex = Buffer.from(encryptData.nonce, 'base64').toString('hex');
      const ciphertextHex = Buffer.from(encryptData.ciphertext, 'base64').toString('hex');
      const secretHex = ephemPublicKeyHex + nonceHex + ciphertextHex;
      const secretBase64 = Buffer.from(secretHex, 'hex').toString('base64');
      console.log(secretBase64);
      return secretBase64;
    },
  };

  P2G = {
    decrypt: (signSecretBase64: string, privateKey: string) => {
      const signSecretHex = Buffer.from(signSecretBase64, 'base64').toString('hex');
      const signHex = '0x' + signSecretHex.substring(0, 130);
      const secretHex = signSecretHex.substring(130);
      const address = sigUtil.recoverPersonalSignature({ data: secretHex, signature: signHex });
      const wallet = new ethers.Wallet(privateKey);
      const isSign = ethers.utils.getAddress(address) == ethers.utils.getAddress(wallet.address);
      const ephemPublicKeyBase64 = Buffer.from(secretHex.substring(0, 64), 'hex').toString('base64');
      const nonceBase64 = Buffer.from(secretHex.substring(64, 112), 'hex').toString('base64');
      const ciphertextBase64 = Buffer.from(secretHex.substring(112), 'hex').toString('base64');
      const encryptedData = {
        version: 'x25519-xsalsa20-poly1305',
        ephemPublicKey: ephemPublicKeyBase64,
        nonce: nonceBase64,
        ciphertext: ciphertextBase64,
      };
      const content = sigUtil.decrypt({ encryptedData, privateKey: privateKey.substring(2) });
      console.log({ content, isSign });
      return { content, isSign };
    },
    encrypt: (content: string, privateKey: string) => {
      const encryptionPublicKey = sigUtil.getEncryptionPublicKey(privateKey.substring(2));
      const encryptData = sigUtil.encrypt({ publicKey: encryptionPublicKey, data: content, version: 'x25519-xsalsa20-poly1305' });
      const ephemPublicKeyHex = Buffer.from(encryptData.ephemPublicKey, 'base64').toString('hex');
      const nonceHex = Buffer.from(encryptData.nonce, 'base64').toString('hex');
      const ciphertextHex = Buffer.from(encryptData.ciphertext, 'base64').toString('hex');
      const secretHex = ephemPublicKeyHex + nonceHex + ciphertextHex;
      const sign = sigUtil.personalSign({ data: secretHex, privateKey: Buffer.from(privateKey.substring(2), 'hex') });
      const signHex = sign.substring(2);
      const signSecretHex = signHex + secretHex;
      const signSecretBase64 = Buffer.from(signSecretHex, 'hex').toString('base64');
      console.log(signSecretBase64, signSecretBase64.length);
      return signSecretBase64;
    },
  };

  metamask = {
    getEncryptionPublicKeyByAddress: async (address: string) => {
      const publicKey: string = await this._ethereum.request({
        method: 'eth_getEncryptionPublicKey',
        params: [address],
      });
      return publicKey;
    },
    createWallet: () => {
      return ethers.Wallet.createRandom();
    },
    getWalletByPrivateKey: (privateKey: string) => {
      return new ethers.Wallet(privateKey);
    },
    getEncryptionPublicKeyByPrivateKey: (privateKey: string) => {
      return sigUtil.getEncryptionPublicKey(privateKey);
    },
    getBalance: (address: string) => {
      if (!this.provider) {
        throw new Error('no provider');
      }
      return this.provider.getBalance(address);
    },
    isContract: async (address: string) => {
      if (!this.provider) {
        throw new Error('no provider');
      }
      const code = await this.provider.getCode(address);
      if (code == '0x') {
        return false;
      }
      return true;
    },
  };

  utils = {
    getType: async (str: string) => {
      if (ethers.utils.isAddress(str)) {
        if (await this.metamask.isContract(str)) {
          return 'contract';
        } else {
          return 'wallet';
        }
      } else {
        return 'string';
      }
    },
  };
}
