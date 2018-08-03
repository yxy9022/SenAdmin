// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import GlobalMethods from '@/tools/GlobalMethods'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/styles/iconfont.css'
import '@/assets/styles/main.less'

Vue.config.productionTip = false

// 进行插件注册,use方法参考:Vue.use源码分析 http://www.cnblogs.com/dupd/p/6716386.html
Vue.use(GlobalMethods)
Vue.use(ElementUI)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: {App}
})
