<template>
  <div class="room">
    <div v-for="(to, index) in chatSync.toList" :key="index">
      <div class="room-card" :class="{ active: chatSync.activeTo == to }" @click="setActiveTo(to)">
        <a-badge class="room-card-badge" />
        <my-avatar :avatar="getRoomLogo(to)" :showName="utils.format.string2(to, 6)"
          @goTo="utils.go.token(appSync.ether.chainId ? appSync.ether.chainId : 0, to)"></my-avatar>
        <div class="room-card-message">
          <div class="room-card-name">
            <div>
              {{ getRoomName(to) }}
              <a-icon type="close-circle-o" class="room-card-close" @click.stop="closeTo(to)"
                v-if="chatSync.toList.length > 1" />
            </div>
            <div class="room-card-new">
              {{ getRoomLastMessage(to) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { AppSync, AppAsync, ChatSync, ChatAsync } from '@/store';
import { log, utils } from '@/const';
import MyAvatar from '@/components/Avatar.vue';

const chatModule = namespace('chat');
const appModule = namespace('app');

@Component({
  components: {
    MyAvatar,
  },
})
export default class MyRoom extends Vue {
  @appModule.State('sync') appSync: AppSync;
  @appModule.State('async') appAsync: AppAsync;
  @chatModule.State('sync') chatSync: ChatSync;
  @chatModule.State('async') chatAsync: ChatAsync;

  utils = utils;

  getRoomLogo(to: string) {
    try {
      if (this.appAsync.tokenMap[to].logo) {
        return this.appAsync.tokenMap[to].logo;
      }
      throw '';
    } catch (error) {
      return './static/token/empty-token.png';
    }
  }

  getRoomName(to: string) {
    let str1 = utils.format.string2(to, 6);
    try {
      str1 = this.appAsync.tokenMap[to].name;
    } catch (error) { }
    let str2 = ``;
    try {
      str2 = `(${utils.format.balance(
        this.appAsync.balanceMap[to][this.appSync.userAddress],
        18,
        this.appAsync.tokenMap[to].symbol,
        this.appSync.decimalLimit
      )})`;
    } catch (error) { }
    return str1 + str2;
  }

  getRoomLastMessage(to: string) {
    try {
      const lastMessage = utils.get.last(this.chatAsync.messageMap[to].messageList);
      return `[${utils.format.string2(lastMessage.from, 4)}]${utils.format.string1(lastMessage.data, 7)}`;
    } catch (error) {
      return '';
    }
  }

  async closeTo(to: string) {
    await this.$store.dispatch('chat/deleteTo', to);
  }

  async setActiveTo(to: string) {
    await this.$store.dispatch('chat/setActiveTo', to);
  }
}
</script>
<style lang="scss" scoped>
@mixin button($bcolor, $url, $x1, $y1, $bor, $col) {
  background: $bcolor;
  -webkit-mask: url($url);
  mask: url($url);
  -webkit-mask-size: $x1 $y1;
  mask-size: $x1 $y1;
  border: $bor;
  color: $col;
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

.room {
  height: calc(100% - 60px);
  overflow: auto;

  .room-card {
    position: relative;
    min-height: 70px;
    display: flex;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.2);
    padding: 5px 10px;
    text-align: left;
    transition: all 0.2s linear;
    cursor: pointer;

    &:hover {
      background-color: rgb(0, 0, 0, 0.4);
    }

    &.active {
      background-color: rgb(0, 0, 0, 0.5);
      @include button(rgb(0, 0, 0, 0.5), '/static/pages/animate.png', 3000%, 100%, none, #fff);
      -webkit-animation: ani 2s steps(29) forwards;
      animation: ani 0.5s steps(29) forwards;
    }

    .room-card-badge {
      position: absolute;
      right: 10px;
      top: 10px;

      ::v-deep.ant-badge-count {
        box-shadow: none;
      }
    }

    .room-card-type {
      width: 35px;
      height: 35px;
      margin-right: 5px;
      border-radius: 50%;
      object-fit: cover;

      &.offLine {
        filter: grayscale(90%);
      }
    }

    .room-card-message {
      flex: 1;
      display: flex;
      width: 75%;
      flex-direction: column;

      .room-card-name {
        overflow: hidden; //超出的文本隐藏
        text-overflow: ellipsis; //溢出用省略号显示
        white-space: nowrap; //溢出不换行

        .room-card-close {
          font-size: 20px;
          float: right;
          color: rgb(89, 91, 92);
        }
      }

      .room-card-new {
        >* {
          display: block;
          overflow: hidden; //超出的文本隐藏
          text-overflow: ellipsis; //溢出用省略号显示
          white-space: nowrap; //溢出不换行
        }

        color: rgb(255, 255, 255, 0.6);
        font-size: 14px;
      }
    }
  }
}

@keyframes ani {
  from {
    -webkit-mask-position: 100% 0;
    mask-position: 100% 0;
  }

  to {
    -webkit-mask-position: 0 0;
    mask-position: 0 0;
  }
}
</style>
