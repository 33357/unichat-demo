import { ActionTree } from 'vuex';
import Vue from 'vue';
import { RootState, AppState } from '../index';
import { utils, log, ZERO_ADDRESS } from '@/const';

const actions: ActionTree<AppState, RootState> = {
  async start({ dispatch }) {
    try {
      await dispatch('setSync');
      await dispatch('watchStorage');
      await dispatch('setTokenMap');
      log('app start success!');
    } catch (err) {
      throw err;
    }
  },

  async setSync({ state, dispatch }) {
    state.sync.isMobile = utils.is.mobile();
    await state.sync.ether.load();
    state.sync.userAddress = await state.sync.ether.singer!.getAddress();
    const data = await state.sync.api.getLogin(state.sync.userAddress);
    if (data.message != 'success') {
      await state.sync.api.login(await state.sync.ether.singer!.signMessage(JSON.stringify(data)), data);
    }
    await state.sync.api.getLogin(state.sync.userAddress);
    await dispatch('setAvatar', state.sync.userAddress);
  },

  async watchStorage({ state }) {
    try {
      const storage = localStorage.getItem(state.sync.userAddress);
      if (storage) {
        utils.deep.clone(state.storage, JSON.parse(storage));
      } else {
        throw new Error('localStorage is empty!');
      }
    } catch (err) {
      localStorage.setItem(state.sync.userAddress, JSON.stringify(state.storage));
    }
    this.watch(
      (state) => state.app.storage,
      (storage) => {
        localStorage.setItem(state.sync.userAddress, JSON.stringify(storage));
      },
      {
        deep: true,
      }
    );
  },

  async setAvatar({ state }, address: string) {
    if (!state.sync.avatarMap[address]) {
      Vue.set(state.sync.avatarMap, address, utils.get.avatar(address));
    }
  },

  async getTokenData({ state }, addressList: string[]) {
    const _addressList = addressList.filter((address) => {
      if (!state.async.tokenMap[address]) {
        return true;
      }
      return false;
    });
    if (_addressList.length > 0) {
      const tokenDataList = await state.sync.ether.uniChatHelper!.contract.batchGetTokenData(_addressList);
      tokenDataList.forEach((tokenData, index) => {
        state.async.tokenMap[_addressList[index]] = tokenData;
      });
    }
  },

  async getTokenBalance({ state }, { contract, addressList }: { contract: string; addressList: string[] }) {
    if (!state.async.balanceMap[contract]) {
      state.async.balanceMap[contract] = {};
    }
    const _addressList = addressList.filter((address) => {
      if (!state.async.balanceMap[contract][address]) {
        return true;
      }
      return false;
    });
    if (_addressList.length > 0) {
      const balanceList = await state.sync.ether.uniChatHelper!.contract.batchGetUserListBalance(contract, addressList);
      balanceList.forEach((balance, index) => {
        state.async.balanceMap[contract][_addressList[index]] = balance;
      });
    }
  },

  async setTokenMap({ state, dispatch }) {
    const addressList: string[] = [];
    state.async.tokenList = (await state.sync.api.getTokenList()).filter((e) => {
      if (e.chainId == 1) {
        addressList.push(utils.ethers.getAddress(e.address));
        return true;
      }
      return false;
    });
    state.async.tokenList.forEach((token) => {
      state.async.tokenMap[token.address] = {
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        logo: token.logoURI,
      };
    });
    state.async.tokenMap[ZERO_ADDRESS] = {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      logo: './static/token/ethereum.webp',
    };
    const [balance, balanceList] = await Promise.all([
      state.sync.ether.singer!.getBalance(),
      state.sync.ether.uniChatHelper!.contract.batchGetTokenListBalance(addressList, state.sync.userAddress),
    ]);
    if (balance.gt(0)) {
      state.async.balanceMap[ZERO_ADDRESS] = {};
      state.async.balanceMap[ZERO_ADDRESS][state.sync.userAddress] = balance;
      dispatch('chat/addToList', ZERO_ADDRESS, { root: true });
    }
    balanceList.forEach((balance, i) => {
      if (balance.gt(0)) {
        state.async.balanceMap[addressList[i]] = {};
        state.async.balanceMap[addressList[i]][state.sync.userAddress] = balance;
        dispatch('chat/addToList', addressList[i], { root: true });
      }
    });
  },
};

export default actions;
