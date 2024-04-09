<template>
  <div class="message">
    <div class="message-header">
      <div class="message-header-box">
        <span class="message-header-text">
          {{ getRoomName() }}
        </span>
        <!-- <myIcon v-if="get_lock().show" :type="get_lock().type" :class="get_lock().class" @click="clickChatEncrypt()" /> -->
      </div>
    </div>
    <transition name="loading">
      <div class="message-loading" v-if="get_loading()">
        <a-icon type="sync" spin class="message-loading-icon" />
      </div>
    </transition>
    <div class="message-main" :style="{ opacity: messageOpacity }">
      <div class="message-content" v-if="chatAsync.messageMap[chatSync.activeTo]">
        <!-- <transition name="noData">
          <div class="message-content-noData">
            {{ get_noData_text() }}
          </div>
        </transition> -->
        <template v-for="(message, index) in chatAsync.messageMap[chatSync.activeTo].messageList">
          <div class="message-content-message" :key="index"
            :class="{ 'text-right': message.from == appSync.userAddress }">
            <my-avatar :avatar="appSync.avatarMap[message.from]" :name="getFromName(message.from)"
              :time="utils.format.date(message.date)" :showName="utils.format.string2(message.from, 6)"
              @goTo="utils.go.address(appSync.ether.chainId ? appSync.ether.chainId : 0, message.from)"></my-avatar>

            <!-- <a-popover style="display: inline-block" v-if="'status' in message">
              <div slot="content" class="avatar-card">
                <a-icon :type="get_avatar_card(message).type" :class="get_avatar_card(message).class" />
                <div>{{ get_avatar_card(message).text }}</div>
                <a-button @click="utils.go.tx(appSync.ether.chainId, message.hash)" type="primary" :disabled="!message.hash">{{
                  $t('message.view_on_the_blockchain_browser')
                }}</a-button>
              </div>
              <a-icon :type="get_avatar_card(message).type" :class="get_avatar_card(message).class" />
            </a-popover> -->

            <!-- <a-icon type="swap" @click="changeContent(message)"
              v-if="getDataType(message.data) != 'text' && message.from == appSync.userAddress" /> -->
            <div class="message-content-text">
              <div v-if="getDataType(message.data) == 'text'">{{ message.data }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <my-input></my-input>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import MyAvatar from '@/components/Avatar.vue';
import MyInput from '@/components/Input.vue';
import { namespace } from 'vuex-class';
import { AppSync, AppAsync, ChatSync, ChatAsync, Message } from '@/store';
import { utils, log, BigNumber } from '@/const';

const chatModule = namespace('chat');
const appModule = namespace('app');

interface Transaction {
  contractAddress: string;
  value: BigNumber;
  callcode: string;
}

interface Call {
  contractAddress: string;
  callcode: string;
  returnTypeList: Array<string>;
  numZeroList: Array<number>;
  callTextList: Array<string>;
}

@Component({
  components: {
    MyAvatar,
    MyInput,
  },
})
export default class MyMessage extends Vue {
  @appModule.State('sync') appSync: AppSync;
  @appModule.State('async') appAsync: AppAsync;
  @chatModule.State('sync') chatSync: ChatSync;
  @chatModule.State('async') chatAsync: ChatAsync;

  utils = utils;

  messageDom: HTMLElement;
  messageContentDom: HTMLElement;
  headerDom: HTMLElement;
  messageOpacity: number = 1;
  lastMessagePosition: number = 0;

  getRoomName() {
    let str1 = this.chatSync.activeTo;
    try {
      str1 = this.appAsync.tokenMap[this.chatSync.activeTo].name;
    } catch (error) { }
    let str2 = '';
    try {
      str2 = `(${this.chatAsync.messageMap[this.chatSync.activeTo].length
        } messages)`
    } catch (error) { }
    return str1 + str2;
  }

  getFromName(from: string) {
    if (from == this.appSync.userAddress) {
      return ''
    } else {
      let str1 = utils.format.string2(from, 6);
      try {
        str1 = utils.format.balance(
          this.appAsync.balanceMap[this.chatSync.activeTo][from],
          18,
          this.appAsync.tokenMap[this.chatSync.activeTo].symbol,
          this.appSync.decimalLimit
        )
      } catch (error) { }
      return str1
    }
  }

  getDataType(data: string) {
    return 'text';
  }

  // changeContent(message: Message) {

  // }

  // show_swap(message: Message, index: number) {
  //   if (messageType.getType(this.get_message_content(message, index), this).type == 'text') {
  //     return false;
  //   }
  //   return true;
  // }

  // get_lock() {
  // if (utils.have.value(this.chatAsync.recipientMap[this.appStorage.activeRecipientText])) {
  //   if (this.chatAsync.recipientMap[this.appStorage.activeRecipientText].useEncrypt == false) {
  //     if (!this.chatAsync.dataUploadedEventMap[this.appStorage.activeRecipientText + 'publicKey']) {
  //       if (this.appStorage.activeRecipientText == this.appSync.userAddress) {
  //         return {
  //           show: true,
  //           type: 'unlock',
  //           class: 'message-header-icon-white-blue',
  //         };
  //       }
  //     } else {
  //       return {
  //         show: true,
  //         type: 'unlock',
  //         class: 'message-header-icon-blue',
  //       };
  //     }
  //   } else if (this.chatAsync.recipientMap[this.appStorage.activeRecipientText].useEncrypt == true) {
  //     return {
  //       show: true,
  //       type: 'lock',
  //       class: 'message-header-icon-red',
  //     };
  //   }
  // }
  //   return {
  //     show: false,
  //     type: '',
  //     class: '',
  //   };
  // }

  // get_message(message: Message, index: number) {
  //   // if (this.reloadMessage[index]) {
  //   //   return this.reloadMessage[index];
  //   // }
  //   // return messageType.getType(this.get_message_content(message, index), this);
  // }

  // get_name(message: BlockChatUpgradeModel.MessageCreatedEvent) {
  //   if (this.appAsync.USD_Value_Map[message.sender] && this.appAsync.USD_Value_Map[message.sender] != 0) {
  //     return this.appAsync.USD_Value_Map[message.sender].toFixed(2) + ' USD';
  //   } else {
  //     return utils.format.string2(message.sender, 6);
  //   }
  // }

  get_loading() {
    // if (this.status == MessageStatus.loading || this.status == MessageStatus.geting) {
    //   return true;
    // } else {
    return false;
    // }
  }

  // get_noData_text() {
  //   try {
  //     // if (
  //     //   this.chatAsync.recipientMap[this.appStorage.activeRecipientText].messageBlockListLength ==
  //     //     this.chatAsync.recipientMap[this.appStorage.activeRecipientText].messageBlockList.length &&
  //     //   this.chatAsync.recipientMap[this.appStorage.activeRecipientText].messageBlockList.length ==
  //     //     Object.keys(this.chatAsync.messageCreatedEventListMap[this.appStorage.activeRecipientText]).length
  //     // ) {
  //     //   return this.$t('message.no_more_message');
  //     // }
  //     return '';
  //   } catch (error) {
  //     return '';
  //   }
  // }

  // get_avatar_card(message: Message) {
  //   // if (message.status == SendMessageStatus.prePending) {
  //   //   return {
  //   //     type: 'loading',
  //   //     class: 'loading1-icon',
  //   //     text: this.$t('message.not_send'),
  //   //   };
  //   // } else if (message.status == SendMessageStatus.pending) {
  //   //   return {
  //   //     type: 'loading',
  //   //     class: 'loading2-icon',
  //   //     text: message.hash == '' ? utils.format.string2(message.hash, 6) : '',
  //   //   };
  //   // } else if (message.status == SendMessageStatus.error) {
  //   //   return {
  //   //     type: 'exclamation-circle',
  //   //     class: 'error-icon',
  //   //     text: message.hash == '' ? utils.format.string2(message.hash, 6) : '',
  //   //   };
  //   // } else if (message.status == SendMessageStatus.success) {
  //   //   return {
  //   //     type: 'check-circle',
  //   //     class: 'check-icon',
  //   //     text: message.hash == '' ? utils.format.string2(message.hash, 6) : '',
  //   //   };
  //   // }
  // }

  // @Watch('chatAsync.messageMap', { deep: true })
  // changeRecipientMap() {
  //   this.setMessageList();
  // }

  // @Watch('appStorage.activeRecipientText')
  // changeActiveRecipient() {
  //   this.status = MessageStatus.loading;
  //   this.messageList = [];
  //   this.messageOpacity = 0;
  //   if (this.headerDom) {
  //     this.headerDom.classList.add('transition');
  //     setTimeout(() => {
  //       this.headerDom.classList.remove('transition');
  //     }, 400);
  //   }
  //   this.setMessageList();
  // }

  // changeContent(message: BlockChatUpgradeModel.MessageCreatedEvent, index: number) {
  //   let reloadMessage;
  //   if (!this.reloadMessage[index] || this.reloadMessage[index].type != 'text') {
  //     reloadMessage = {
  //       type: 'text',
  //       text: this.get_message_content(message, index),
  //     };
  //   } else {
  //     reloadMessage = messageType.getType(this.get_message_content(message, index), this);
  //   }
  //   this.$set(this.reloadMessage, index, reloadMessage);
  // }

  // async decryptContent(message: BlockChatUpgradeModel.MessageCreatedEvent, index: number) {
  //   const content = await this.appSync.ether.P2P.decrypt(
  //     this.get_message_content(message, index).replace('e::', ''),
  //     this.appSync.userAddress
  //   );
  //   this.$set(this.encryptContent, index, content);
  // }

  // async clickChatEncrypt() {
  //   // if (
  //   //   !this.chatAsync.dataUploadedEventMap[this.appStorage.activeRecipientText + 'publicKey'] &&
  //   //   this.appStorage.activeRecipientText == this.appSync.userAddress
  //   // ) {
  //   //   const publicKey = await this.appSync.ether.metamask.getEncryptionPublicKeyByAddress(this.appSync.userAddress);
  //   //   await this.appSync.ether.blockchat.uploadData(this.appSync.ether.blockchat.nameHash('publicKey'), publicKey);
  //   //   this.$store.dispatch('chat/setDataUploadedEvent', this.appStorage.activeRecipientText);
  //   // } else if (this.chatAsync.dataUploadedEventMap[this.appStorage.activeRecipientText + 'publicKey']) {
  //   //   this.$set(
  //   //     this.chatAsync.recipientMap[this.appStorage.activeRecipientText],
  //   //     'useEncrypt',
  //   //     !this.chatAsync.recipientMap[this.appStorage.activeRecipientText].useEncrypt
  //   //   );
  //   // }
  // }

  // async sendTransaction(transaction: Transaction) {
  //   try {
  //     if (this.appSync.ether.singer) {
  //       await this.appSync.ether.singer.sendTransaction({
  //         to: transaction.contractAddress,
  //         value: 0,
  //         data: transaction.callcode,
  //       });
  //     }
  //   } catch (err: any) {
  //     log(err);
  //     this.$message.error(err.message);
  //   }
  // }

  // async call(call: Call, index: number) {
  //   try {
  //     if (this.appSync.ether.provider) {
  //       const res = await this.appSync.ether.provider.call({
  //         to: call.contractAddress,
  //         data: call.callcode,
  //       });
  //       const datas = utils.ethers.defaultAbiCoder.decode(call.returnTypeList, res);
  //       let dataList = [datas];
  //       if (datas.indexOf(',') != -1) {
  //         dataList = datas.split(',');
  //       }
  //       let text = '';
  //       let numZeroListIndex = 0;
  //       for (let i = 0; i < dataList.length; i++) {
  //         if (call.returnTypeList[i].indexOf('int') != -1) {
  //           dataList[i] = dataList[i].toString().substring(0, dataList[i].toString().length - call.numZeroList[numZeroListIndex]) as any;
  //           numZeroListIndex++;
  //         }
  //         text += `${call.callTextList[i]}${dataList[i]}`;
  //       }
  //       // this.$set(this.reloadMessage, index, {
  //       //   type: 'text',
  //       //   text,
  //       // });
  //     }
  //   } catch (err: any) {
  //     log(err);
  //     this.$message.error(err.message);
  //   }
  // }

  // setMessageList() {
  //   // try {
  //   //   let messageList: Array<Message> = [];
  //   //   messageList.push(...this.chatAsync.messageMap[this.chatSync.activeTo]);
  //   //this.messageList = this.chatAsync.messageMap[this.chatSync.activeTo];
  // }

  // checkMessageList() {
  //   // let loadAll =
  //   //   this.chatAsync.recipientMap[this.appStorage.activeRecipientText].messageBlockList.length ==
  //   //     this.chatAsync.recipientMap[this.appStorage.activeRecipientText].messageBlockListLength &&
  //   //   this.chatAsync.recipientMap[this.appStorage.activeRecipientText].messageBlockList.length ==
  //   //     Object.keys(this.chatAsync.messageCreatedEventListMap[this.appStorage.activeRecipientText]).length;
  //   if (this.status == MessageStatus.geting) {
  //     this.scrollTo();
  //     // if (loadAll) {
  //     //   this.status = MessageStatus.listening;
  //     // }
  //   } else if (this.status == MessageStatus.loading) {
  //     this.messageDom = document.getElementsByClassName('message-main')[0] as HTMLElement;
  //     this.messageContentDom = document.getElementsByClassName('message-content')[0] as HTMLElement;
  //     this.headerDom = document.getElementsByClassName('message-header-text')[0] as HTMLElement;
  //     this.messageDom.addEventListener('scroll', this.handleScroll);
  //     this.scrollToBottom();
  //     // if (loadAll) {
  //     //   this.status = MessageStatus.listening;
  //     // }
  //   } else if (
  //     this.status == MessageStatus.listening &&
  //     this.messageDom.scrollTop + this.messageDom.offsetHeight + 100 > this.messageContentDom.scrollHeight
  //   ) {
  //     this.scrollToBottom();
  //   }
  // }

  //handleScroll(event: Event) {
  // if (event.currentTarget) {
  //   if (this.messageDom.scrollTop == 0 && this.status == MessageStatus.listening) {
  //     this.lastMessagePosition = this.messageContentDom.offsetHeight;
  //    // this.getMessage();
  //   }
  // }
  // }

  // getMessage() {
  //   if (
  //     this.chatAsync.recipientMap[this.appStorage.activeRecipientText].messageBlockListLength >
  //     this.chatAsync.recipientMap[this.appStorage.activeRecipientText].messageBlockList.length
  //   ) {
  //     this.status = MessageStatus.geting;
  //     this.$store.dispatch('chat/getMessage');
  //   }
  // }

  scrollToBottom() {
    this.$nextTick(() => {
      this.messageDom.scrollTop = this.messageDom.scrollHeight;
      this.messageOpacity = 1;
    });
  }

  scrollTo() {
    this.$nextTick(() => {
      this.messageDom.scrollTop = this.messageContentDom.offsetHeight - this.lastMessagePosition;
    });
  }
}
</script>
<style lang="scss" scoped>
.message {
  overflow: hidden;
  height: 100%;
  position: relative;

  .message-header {
    height: 60px;
    line-height: 60px;
    z-index: 100;
    background-color: rgb(0, 0, 0, 0.6);

    .message-header-text {
      color: #fff;
    }

    .message-header-icon-white-blue {
      margin-left: 5px;
      color: rgb(137, 164, 238);
    }

    .message-header-icon-red {
      margin-left: 5px;
      color: rgb(248, 7, 7);
    }

    .message-header-icon-blue {
      margin-left: 5px;
      color: rgb(11, 71, 235);
    }
  }

  .message-loading {
    position: absolute;
    left: calc(50% - 18px);
    top: 60px;
    z-index: 99;

    .message-loading-icon {
      margin: 10px auto;
      font-size: 20px;
      padding: 8px;
      border-radius: 50%;
      background-color: rgb(0, 0, 0, 0.8);
    }
  }

  .message-main {
    height: calc(100% - 100px);
    overflow: auto;
    position: relative;

    .message-content {
      .message-content-noData {
        line-height: 50px;
      }

      .message-content-message {
        text-align: left;
        margin: 10px 20px;

        .message-content-text,
        .message-content-image {
          max-width: 600px;
          display: inline-block;
          overflow: hidden;
          margin-top: 4px;
          padding: 6px;
          background-color: rgba(0, 0, 0, 0.4);
          font-size: 16px;
          border-radius: 5px;
          text-align: left;
          word-break: break-word;
        }

        .message-content-image {
          max-height: 350px;
          max-width: 350px;

          img {
            cursor: pointer;
            max-width: 335px;
            max-height: 335px;
          }
        }
      }

      .text-right {
        text-align: right !important;

        .avatar {
          justify-content: flex-end;
        }
      }
    }
  }

  .message-input {
    display: flex;
    flex-wrap: nowrap;
    position: absolute;
    width: 100%;
    bottom: 0px;

    input {
      height: 40px;
    }

    .message-input-button {
      width: 30px;
      cursor: pointer;
      position: absolute;
      right: 10px;
      top: 4px;
    }
  }
}

//输入框样式
.ant-input {
  padding: 0 50px 0 50px;
}

// 消息工具样式
.messagte-tool-icon {
  position: absolute;
  left: 0;
  top: 0;
  width: 50px;
  height: 40px;
  text-align: center;
  line-height: 42px;
  font-size: 16px;
  cursor: pointer;
  z-index: 99;
}

.message-tool-item {
  width: 0px;
  height: 240px;
  cursor: pointer;

  .message-tool-contant {
    width: 50px;
    padding: 5px;
    border-radius: 5px;
    transition: all linear 0.2s;

    .message-tool-item-img {
      width: 40px;
    }

    .message-tool-item-text {
      text-align: center;
      font-size: 10px;
    }

    &:hover {
      background: rgba(135, 206, 235, 0.6);
    }
  }
}

// 移动端样式
@media screen and (max-width: 768px) {
  .message-main {
    .message-content-image {
      img {
        cursor: pointer;
        max-width: 138px !important;
        height: inherit !important;
      }
    }
  }
}

@media screen and (max-width: 500px) {
  .message-header-box {
    .message-header-text {
      display: block;
      width: 36%;
      margin: 0 auto;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .message-header-icon {
      position: absolute;
      top: 17px;
      right: 60px;
      font-size: 25px;
    }
  }
}

.loading-enter-active {
  transition: all 0.3s ease;
}

.loading-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.loading-enter,
.loading-leave-to {
  transform: translateY(-30px);
  opacity: 0;
}

.noData-enter-active,
.noData-leave-active {
  transition: opacity 1s;
}

.noData-enter,
.noData-leave-to {
  opacity: 0;
}

.transition {
  display: inline-block;
  animation: transition 0.4s ease;
}

@keyframes transition {
  0% {
    transform: translateY(-40px);
    opacity: 0;
  }

  60% {
    transform: translateY(10px);
    opacity: 0.6;
  }

  100% {
    transform: translateY(0px);
    opacity: 1;
  }
}

.check-icon {
  font-size: 30px;
  color: rgb(12, 240, 115);
  cursor: pointer;

  &:hover {
    color: rgb(177, 236, 182);
  }
}

.error-icon {
  font-size: 30px;
  color: rgb(240, 12, 31);
  cursor: pointer;

  &:hover {
    color: rgb(233, 162, 168);
  }
}

.loading1-icon {
  font-size: 30px;
  color: rgb(244, 244, 250);
  cursor: pointer;

  &:hover {
    color: rgb(147, 149, 235);
  }
}

.loading2-icon {
  font-size: 30px;
  color: rgb(11, 247, 82);
  cursor: pointer;

  &:hover {
    color: rgb(150, 240, 173);
  }
}

.avatar {
  display: flex;
  align-items: center;
  height: 37px;

  .avatar-img {
    cursor: pointer;
    width: 35px;
    height: 35px;
  }

  .avatar-name {
    margin-left: 5px;
  }

  .avatar-time {
    font-size: 12px;
    color: rgb(255, 255, 255, 0.75);
    margin-left: 3px;
  }
}

.avatar-card {
  display: flex;
  font-size: 18px;
  flex-direction: column;
  align-items: center;

  >div {
    margin: 4px;
  }
}
</style>
