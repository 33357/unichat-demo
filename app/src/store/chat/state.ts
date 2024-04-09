import { ZERO_ADDRESS } from '@/const';

export interface Message {
  from: string;
  data: string;
  date: number;
}

export interface MessageMap {
  [to: string]: { messageList: Message[]; length: number };
}

export interface ChatSync {
  activeTo: string;
  toList: string[];
}

export interface ChatAsync {
  messageMap: MessageMap;
}

export interface ChatState {
  sync: ChatSync;
  async: ChatAsync;
}

const chatState: ChatState = {
  sync: {
    activeTo: ZERO_ADDRESS,
    toList: [ZERO_ADDRESS],
  },
  async: {
    messageMap: {},
  },
};

export default chatState;
