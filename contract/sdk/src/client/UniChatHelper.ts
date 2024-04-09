import { Provider } from '@ethersproject/providers';
import {
  Signer
} from 'ethers';
import { UniChatHelper as _UniChatHelper, UniChatHelper__factory } from '../typechain';

export class UniChatHelper {
  public contract: _UniChatHelper;
  protected _provider: Provider | Signer;

  constructor(provider: Provider | Signer, address: string) {
    this._provider = provider;
    this.contract = UniChatHelper__factory.connect(address, provider);
  }

  /* ================ UTILS FUNCTIONS ================ */

  /* ================ VIEW FUNCTIONS ================ */

  /* ================ TRANSACTION FUNCTIONS ================ */
}
