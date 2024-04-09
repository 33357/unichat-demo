import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import Viewer from 'v-viewer';
import VueI18n from 'vue-i18n';
import en from '@/const/locales/en';
import cn from '@/const/locales/cn';

Vue.config.productionTip = false;

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: 'cn',
  messages: {
    cn, // 本地资源文件，我这里配2个语言，中文&英文，src下根据个人情况放置
    en,
  },
});

// 引入ant-desigin
import './ant-desigin';

// 引入moment
import moment from 'moment';
// 使用中文时间
Vue.prototype.$moment = moment;

// 图片预览插件
import 'viewerjs/dist/viewer.css';

Vue.use(Viewer, {
  defaultOptions: {
    navbar: false,
    title: false,
    toolbar: {
      zoomIn: 1,
      zoomOut: 1,
      oneToOne: 4,
      reset: 4,
      prev: 0,
      next: 0,
      rotateLeft: 4,
      rotateRight: 4,
      flipHorizontal: 4,
      flipVertical: 4,
    },
  },
});

new Vue({ i18n, router, store, render: (h) => h(App) }).$mount('#app');
