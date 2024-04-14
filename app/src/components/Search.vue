<template>
  <div class="search">
    <div class="search-select">
      <a-select show-search :placeholder="$t('search.search')" :default-active-first-option="false" :show-arrow="false"
        :filter-option="false" :not-found-content="null" @search="handleSearch">
        <a-select-option v-if="searchData.to" :value="searchData.to">
          <div @click="selectChat(searchData.to)">
            <div class="avatar">
              <my-avatar :avatar="getRoomLogo()" :showButton="false" :showName="searchData.to"></my-avatar>
              <span class="avatar-name">{{ searchData.text }}</span>
            </div>
          </div>
        </a-select-option>
      </a-select>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import MyAvatar from '@/components/Avatar.vue';
import { log, utils } from '@/const';
import { AppStorage, AppSync, AppAsync, ChatSync } from '@/store';
const chatModule = namespace('chat');
const appModule = namespace('app');

@Component({
  components: {
    MyAvatar,
  },
})
export default class MySearch extends Vue {
  @appModule.State('storage') appStorage: AppStorage;
  @appModule.State('sync') appSync: AppSync;
  @appModule.State('async') appAsync: AppAsync;
  @chatModule.State('sync') chatSync: ChatSync;

  searchData: { to?: string; text?: string } = {};

  getRoomLogo() {
    try {
      if (this.appAsync.tokenMap[this.searchData.to!.toString()].logo) {
        return this.appAsync.tokenMap[this.searchData.to!.toString()].logo;
      }
      throw '';
    } catch (error) {
      return './static/token/empty-token.png';
    }
  }

  async handleSearch(to: string) {
    if (utils.ethers.isAddress(to)) {
      to = utils.ethers.getAddress(to);
      const { length } = await this.appSync.api.getMessage(this.appSync.ether.chainId!.toString(), to, 0, 0);
      await this.$store.dispatch('app/getTokenData', [to]);
      await this.$store.dispatch('app/getTokenBalance', { contract: to, addressList: [this.appSync.userAddress] });
      this.searchData = {
        to,
        text: `${utils.format.balance(
        this.appAsync.balanceMap[to][this.appSync.userAddress],
        18,
        this.appAsync.tokenMap[to].symbol,
        this.appSync.decimalLimit
      )}(${length} messages)`,
      };
    }
  }

  async selectChat(to: string) {
    this.searchData = {};
    await this.$store.dispatch('chat/setActiveTo', to);
  }
}
</script>
<style lang="scss" scoped>
.avatar {
  display: flex;
  align-items: center;
  height: 37px;

  .avatar-img {
    cursor: pointer;
    width: 25px;
    height: 25px;
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

.search {
  position: relative;
  height: 60px;
  padding: 10px;
  display: flex;
  align-items: center;

  .search-select {
    width: 100%;

    .ant-select {
      width: 100%;
    }
  }

  .search-dropdown {
    position: absolute;
    right: 10px;
    top: 13px;
    width: 40px;
    height: 34px;
    font-size: 20px;
    cursor: pointer;
    line-height: 40px;
    color: gray;
    transition: 0.2s all linear;
    border-radius: 4px;

    &:hover {
      background-color: skyblue;
    }
  }
}
</style>
