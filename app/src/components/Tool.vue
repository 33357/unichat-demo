<template>
  <div class="tool">
    <div class="tool-avatar">
      <div class="tool-avatar-img" @click="showUserModal = true">
        <img v-if="appSync.avatarMap[appSync.userAddress]" :src="appSync.avatarMap[appSync.userAddress]" alt="" />
      </div>
      <div class="tool-avatar-name">{{ appSync.userAddress }}</div>
    </div>

    <myIcon type="language" class="icon tool-language" @click="$i18n.locale == 'cn' ? ($i18n.locale = 'en') : ($i18n.locale = 'cn')" />
    <a-icon type="skin" class="tool-skin icon" @click="showBackgroundModal = true" />
    <a href="https://unichat.space" target="_blank" class="tool-home icon"><a-icon type="home"/></a>

    <a-modal :title="$t('tool.user_info')" :visible="showUserModal" footer="" @cancel="showUserModal = false">
      <div class="tool-user">
        <div class="tool-user-avatar" v-if="appSync.avatarMap[appSync.userAddress]">
          <a-avatar :src="appSync.avatarMap[appSync.userAddress]" class="img" :size="120"></a-avatar>
        </div>
        <div class="tool-user-info">
          <div class="tool-user-title">{{ $t('tool.user_address') }}</div>
          <div class="tool-user-input">{{ appSync.userAddress }}</div>
        </div>
      </div>
    </a-modal>

    <a-modal :title="$t('tool.theme')" :visible="showBackgroundModal" footer="" @cancel="showBackgroundModal = false">
      <div class="tool-user-info">
        <div class="tool-user-title" style="width: 65px">
          <span>{{ $t('tool.background_image') }}</span>
          <a-tooltip placement="topLeft" arrow-point-at-center>
            <div slot="title">
              <span>{{ $t('tool.support_jpg_png_gif_and_other_formats') }}</span>
            </div>
            <a-icon type="exclamation-circle" style="margin-left: 5px" />
          </a-tooltip>
        </div>
        <a-input
          v-model="backgroundInput"
          class="tool-user-input"
          :placeholder="$t('tool.please_enter_the_background_image_url')"
        ></a-input>
        <a-button type="primary" @click="changeBackground(backgroundInput)">{{ $t('tool.confirm') }}</a-button>
      </div>
      <div class="tool-recommend">
        <div class="recommend" @click="changeBackground(BACKGROUND.URL)" v-for="(BACKGROUND, index) in BACKGROUND_LIST" :key="index">
          <img :src="BACKGROUND.URL" alt="" />
          <span class="text">{{ BACKGROUND.TEXT }}</span>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { BACKGROUND_LIST } from '@/const';
import { AppStorage, AppSync } from '@/store';

const appModule = namespace('app');

@Component({})
export default class MyTool extends Vue {
  @appModule.State('storage') appStorage: AppStorage;
  @appModule.State('sync') appSync: AppSync;

  showUserModal: boolean = false;
  showBackgroundModal: boolean = false;
  showShovelModal: boolean = false;
  showCrowdFundingModal: boolean = false;

  backgroundInput: string = '';
  BACKGROUND_LIST = BACKGROUND_LIST;

  changeBackground(background: string) {
    if (background.trim().length) {
      this.appStorage.background = background;
    }
    this.showBackgroundModal = false;
  }
}
</script>
<style lang="scss" scoped>
.tool {
  padding: 10px 5px;
  height: 98%;
  position: relative;
  color: rgba(255, 255, 255, 0.85);
  .tool-avatar {
    margin-top: 3px;
    .tool-avatar-img {
      margin: 0 auto;
      width: 55px;
      height: 55px;
      border-radius: 50%;
      overflow: hidden;
      cursor: pointer;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    .tool-avatar-name {
      color: #fff;
      overflow: hidden; //超出的文本隐藏
      text-overflow: ellipsis; //溢出用省略号显示
      white-space: nowrap; //溢出不换行
      margin-top: 2px;
    }
  }
  .tool-zhongchou {
    font-size: 30px;
    bottom: 190px;
  }
  .tool-language {
    font-size: 30px;
    bottom: 130px;
  }
  .tool-skin {
    font-size: 25px;
    bottom: 70px;
  }
  .tool-home {
    font-size: 25px;
    color: rgba(255, 255, 255, 0.85);
    bottom: 10px;
  }
  .icon {
    display: flex;
    flex-direction: column;
    position: absolute;
    left: 25px;
    cursor: pointer;
    z-index: 100;
    &:hover {
      color: skyblue;
    }
  }
}
.tool-user {
  text-align: center;
  font-size: 16px;
  .tool-user-avatar {
    position: relative;
    width: 120px;
    overflow: hidden;
    margin: 0 auto 24px;
    border-radius: 50%;
    cursor: pointer;
    .tool-user-upload {
      .text {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        line-height: 120px;
        font-weight: bold;
      }
    }
    .loading {
      position: absolute;
      top: 50%;
      left: 50%;
      margin: -18px 0 0 -18px;
      font-size: 35px;
      font-weight: bold;
      color: #fff;
    }
    .img {
      transition: 0.2s all linear;
    }
    &.active {
      .img {
        filter: blur(3px);
      }
    }
  }
}
.tool-user-info {
  display: flex;
  justify-content: left;
  align-items: center;
  .tool-user-input {
    margin-right: 10px;
  }
  .tool-user-button {
    margin-right: 10px;
  }
  .tool-user-title {
    display: flex;
    align-items: center;
    width: 90px;
    text-align: left;
    font-weight: bold;
    word-break: keep-all;
    margin-right: 15px;
  }
  &:nth-child(2) {
    margin-bottom: 15px;
  }
}
.tool-recommend {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  .recommend {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    width: 100px;
    height: 100px;
    margin: 15px 10px 0;
    overflow: hidden;
    cursor: pointer;
    transition: 0.3s all linear;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    span {
      position: absolute;
      color: rgba(241, 9, 9, 0.85);
      font-weight: 1000;
      transition: 0.3s all linear;
      opacity: 0;
    }
    &:hover {
      box-shadow: 1px 5px 10px gray;
      span {
        opacity: 1;
      }
    }
  }
}
@media screen and (max-width: 788px) {
  .tool-recommend {
    font-size: 12px;
    .recommend {
      width: 80px;
      height: 80px;
    }
  }
}
</style>
