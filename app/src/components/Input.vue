<template>
  <div class="message-input">
    <a-popover placement="topLeft" trigger="hover" class="message-popver">
      <template slot="content">
        <a-tabs default-key="1" size="small">
          <a-tab-pane key="1" tab="Emoji">
            <my-emoji @addEmoji="addEmoji"></my-emoji>
          </a-tab-pane>
        </a-tabs>
      </template>
      <div class="messagte-tool-icon">😃</div>
    </a-popover>
    <a-input
      autocomplete="off"
      type="text"
      :placeholder="$t('input.hello') + '...'"
      v-model="data"
      ref="data"
      autoFocus
      style="color: #000"
      @pressEnter="sendMessage"
    />
    <myIcon type="send" :class="get_send()" @click="sendMessage" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import MyEmoji from '@/components/Emoji.vue';
import { namespace } from 'vuex-class';
import { AppStorage, AppSync, AppAsync, ChatSync, ChatAsync } from '@/store';
import { log,utils } from '@/const';

const chatModule = namespace('chat');
const appModule = namespace('app');

@Component({
  components: {
    MyEmoji,
  },
})
export default class MyInput extends Vue {
  @appModule.State('storage') appStorage: AppStorage;
  @appModule.State('sync') appSync: AppSync;
  @appModule.State('async') appAsync: AppAsync;
  @chatModule.State('sync') chatSync: ChatSync;
  @chatModule.State('async') chatAsync: ChatAsync;

  data: string = '';

  get_send() {
    // if(utils.have.value(this.chatAsync.recipientMap[this.appStorage.activeRecipientText])){
    //   if(this.chatAsync.recipientMap[this.appStorage.activeRecipientText].useEncrypt){
    //     return 'message-input-button2'
    //   }else{
        return 'message-input-button1'
    //   }
    // }
  }

  async sendMessage() {
    try {
      if (!this.data.trim()) {
        throw new Error(this.$t('input.cannot_send_empty_messages') as string);
      }
      const data = this.data;
      this.data = '';
      await this.$store.dispatch('chat/sendMessage', data);
    } catch (err: any) {
      log(err);
      this.$message.error(err.message);
    }
  }

  addEmoji(emoji: string) {
    const inputDom = (this.$refs.data as Vue).$el as HTMLFormElement;
    if (inputDom.selectionStart || inputDom.selectionStart === '0') {
      // 得到光标前的位置
      const startPos = inputDom.selectionStart;
      // 得到光标后的位置
      const endPos = inputDom.selectionEnd;
      // 在加入数据之前获得滚动条的高度
      const restoreTop = inputDom.scrollTop;
      // emoji表情插入至当前光标指定位置
      this.data = this.data.substring(0, startPos) + emoji + this.data.substring(endPos, this.data.length);
      // 如果滚动条高度大于0
      if (restoreTop > 0) {
        // 返回
        inputDom.scrollTop = restoreTop;
      }
      inputDom.focus();
      // 设置光标位置至emoji表情后一位
      const position = startPos + emoji.length;
      if (inputDom.setSelectionRange) {
        inputDom.focus();
        setTimeout(() => {
          inputDom.setSelectionRange(position, position);
        }, 10);
      } else if (inputDom.createTextRange) {
        const range = inputDom.createTextRange();
        range.collapse(true);
        range.moveEnd('character', position);
        range.moveStart('character', position);
        range.select();
      }
    } else {
      this.data += emoji;
      inputDom.focus();
    }
  }
}
</script>
<style lang="scss" scoped>
.message-input {
  display: flex;
  flex-wrap: nowrap;
  position: absolute;
  width: 100%;
  bottom: 0px;
  input {
    height: 40px;
  }
  .message-input-button1 {
    font-size: 35px;
    right: 10px;
    top: 4px;
    color: rgba(11, 71, 235, 0.85);
    cursor: pointer;
    position: absolute;
  }
  .message-input-button2 {
    font-size: 35px;
    right: 10px;
    top: 4px;
    color: rgba(248, 7, 7, 0.85);
    cursor: pointer;
    position: absolute;
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
</style>
