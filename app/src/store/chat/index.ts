import actions from './actions';
import state, { ChatState } from './state';
import { Module } from 'vuex';
import { RootState } from '../index';

export * from './state';

const chat: Module<ChatState, RootState> = {
  namespaced: true,
  state,
  actions,
};

export default chat;
