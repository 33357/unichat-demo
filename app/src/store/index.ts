import Vue from 'vue';
import Vuex, { ModuleTree } from 'vuex';

// app
import app from './app';
import { AppState } from './app/state';

// chat
import chat from './chat';
import { ChatState } from './chat/state';

export * from './app';
export * from './chat';

export type RootState = {
  app: AppState;
  chat: ChatState;
};

Vue.use(Vuex);

const modules: ModuleTree<RootState> = {
  app,
  chat,
};

export default new Vuex.Store({
  modules,
});
