/* eslint-disable prettier/prettier */
<template>
  <div
    class="chat"
    :style="{
      '--bg-image': `url('${appStorage.background}')`,
    }"
  >
    <div class="chat-part1" v-if="visibleTool">
      <my-tool></my-tool>
    </div>
    <div class="chat-part2">
      <my-search></my-search>
      <my-room></my-room>
    </div>
    <div class="chat-part3">
      <a-icon class="chat-team" type="message" @click="toggleDrawer" />
      <div class="chat-tool">
        <a-icon type="menu-fold" @click="toggleTool" v-if="visibleTool" />
        <a-icon type="menu-unfold" @click="toggleTool" v-else />
      </div>
      <my-message></my-message>
    </div>
    <a-drawer placement="left" :closable="false" :visible="visibleDrawer" @close="toggleDrawer" style="height: 100%">
      <div class="chat-drawer">
        <my-search></my-search>
        <my-room></my-room>
      </div>
    </a-drawer>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import MyTool from '@/components/Tool.vue';
import MyRoom from '@/components/Room.vue';
import MyMessage from '@/components/Message.vue';
import MySearch from '@/components/Search.vue';
import { namespace } from 'vuex-class';
import { AppStorage, AppSync } from '@/store';
import { log } from '@/const';
const appModule = namespace('app');

@Component({
  components: {
    MyTool,
    MyRoom,
    MyMessage,
    MySearch,
  },
})
export default class MyChat extends Vue {
  @appModule.State('storage') appStorage: AppStorage;
  @appModule.State('sync') appSync: AppSync;

  visibleDrawer: boolean = false;
  visibleTool: boolean = true;

  created() {
    window.addEventListener('load', async () => {
      try {
        log('window load');
        await this.$store.dispatch('app/start');
        if (this.$route.query.r) {
          await this.$store.dispatch('chat/setActiveRecipient', this.$route.query.r);
        }
        if (this.appSync.isMobile) {
          this.visibleDrawer = true;
          this.visibleTool = false;
        }
        await this.$store.dispatch('chat/start');
        // eslint-disable-next-line prettier/prettier
      } catch (err: any) {
        log(err);
        this.$message.error(err.message);
      }
    });
  }

  toggleDrawer() {
    this.visibleDrawer = !this.visibleDrawer;
  }

  toggleTool() {
    this.visibleTool = !this.visibleTool;
  }
}
</script>
<style lang="scss" scoped>
.chat {
  font-size: 16px;
  z-index: 999;
  max-width: 1000px;
  min-width: 300px;
  width: 100%;
  height: 80%;
  max-height: 900px;
  min-height: 470px;
  position: relative;
  margin: auto 20px;
  box-shadow: 10px 20px 80px rgba(0, 0, 0, 0.8);
  display: flex;
  border-radius: 5px;
  overflow: hidden;
  .chat-part1 {
    width: 74px;
    height: 100%;
    background-color: rgb(0, 0, 0, 0.7);
  }
  .chat-part2 {
    width: 230px;
    height: 100%;
    background-color: rgb(0, 0, 0, 0.3);
  }
  .chat-part3 {
    flex: 1;
    height: 100%;
    background-color: rgb(0, 0, 0, 0.2);
    overflow-y: hidden;
    position: relative;
    .chat-group {
      height: 53px;
      border-bottom: 1px solid #ccc;
      line-height: 50px;
      font-weight: bold;
    }
  }
  .chat-team {
    display: none;
  }
  .chat-tool {
    display: none;
  }
}
.chat::after {
  content: '';
  background: var(--bg-image) 0 / cover fixed;
  position: absolute;
  object-fit: cover;
  width: 100%;
  height: 100%;
  filter: blur(10px);
  transform: scale(1.08);
  z-index: -1;
}

@media screen and (max-width: 768px) {
  .chat {
    margin: 0;
    height: 100%;
    .chat-part2 {
      display: none;
    }
    .chat-team {
      display: block !important;
      position: absolute;
      font-size: 25px;
      top: 17px;
      left: 60px;
      z-index: 999;
      &:active {
        color: skyblue;
      }
    }
    .chat-tool {
      display: block !important;
      position: absolute;
      font-size: 25px;
      top: 13px;
      left: 20px;
      z-index: 999;
      &:active {
        color: skyblue;
      }
    }
  }
}
</style>
