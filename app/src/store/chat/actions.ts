import { ActionTree } from 'vuex';
import { RootState, ChatState } from '../index';
import { log, retry, sleep, utils } from '@/const';
import Vue from 'vue';

const actions: ActionTree<ChatState, RootState> = {
  async start({ dispatch }) {
    try {
      await dispatch('listenMessage');
      log('chat message start success!');
    } catch (err) {
      log(err);
    }
  },

  async sendMessage({ rootState, state }, data: string) {
    const to = state.sync.activeTo;
    const from = await rootState.app.sync.ether.singer!.getAddress();
    const { date } = await rootState.app.sync.api.sendMessage(rootState.app.sync.ether.chainId!.toString(), to, data);
    Vue.set(state.async.messageMap[to], 'messageList', [...state.async.messageMap[to].messageList, { from, data, date }]);
  },

  async listenMessage({ state, dispatch }) {
    while (true) {
      state.sync.toList.forEach(async (to) => {
        dispatch('getMessage', to);
      });
      await sleep(10 * 1000);
    }
  },

  async getMessage({ state, rootState, dispatch }, to: string) {
    const { messageList, length } = await rootState.app.sync.api.getMessage(rootState.app.sync.ether.chainId!.toString(), to, 0, 1000);
    Vue.set(state.async.messageMap, to, { messageList, length });
    const addressList: string[] = [];
    state.async.messageMap[to].messageList.forEach((message) => {
      dispatch('app/setAvatar', message.from, { root: true });
      addressList.push(message.from);
    });
    const balanceList = await rootState.app.sync.ether.uniChatHelper!.contract.batchGetUserListBalance(to, addressList);
    balanceList.forEach((balance, i) => {
      Vue.set(rootState.app.async.balanceMap[to], addressList[i], balance);
    });
  },

  async deleteTo({ state, dispatch }, to: string) {
    const index = state.sync.toList.indexOf(to);
    if (index != -1) {
      if (state.sync.activeTo == to) {
        if (state.sync.toList.length > 1) {
          await dispatch('setActiveTo', state.sync.toList[index == 0 ? index + 1 : index - 1]);
        } else {
          throw new Error('must have one recipient');
        }
      }
      state.sync.toList.splice(index, 1);
      Vue.set(state.async.messageMap, to, {});
      delete state.async.messageMap[to];
      Vue.set(state.async, 'messageMap', state.async.messageMap);
    }
  },

  async addToList({ state, dispatch }, to: string) {
    if (state.sync.toList.indexOf(to) == -1) {
      state.sync.toList.push(to);
      dispatch('getMessage', to);
    }
  },

  async setActiveTo({ state, dispatch }, to: string) {
    dispatch('addToList', to);
    state.sync.activeTo = to;
  },
};

export default actions;
