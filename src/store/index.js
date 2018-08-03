/**
 * Created by jerry on 2018/4/16.
 */
import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import permission from './modules/permission'
import book from './modules/book'
import category from './modules/category'
import picture from './modules/picture'
import createLogger from 'vuex/dist/logger'
import {asyncRouterMap, constantRouterMap} from '@/router/index.js'
import TYPE from './mutation-types'
Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  state: {
    loading: false,
    currentActive: '-1',
    currentUser: null,
    permissions: []
  },
  getters: {
    currentUser: function (state) {
      return state.currentUser
    },
    storageUser: function (state) {
      let user
      try {
        // 从localStorage中获取
        user = JSON.parse(window.localStorage.getItem('access-user'))
      } catch (ex) {
        localStorage.removeItem('access-user')
        user = null
      }
      return user
    }
  },
  mutations: {
    [TYPE.setLoading] (state, status) {
      state.loading = status
    },
    [TYPE.setCurrentUser] (state, user) {
      state.currentUser = user
    },
    [TYPE.setCurrentActive] (state, menuIndex) {
      state.currentActive = menuIndex
    },
    [TYPE.setPermissions] (state, permissions) {
      state.permissions = permissions
    }
  },
  modules: {
    user,
    permission,
    book,
    category,
    picture
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
