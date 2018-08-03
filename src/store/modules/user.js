/**
 * Created by jerry on 2018/4/16.
 */
import API from '@/api/user'
import TYPE from '../mutation-types'
import RouteHelper from '@/tools/RouteHelper'

// initial state
const state = {
  // 管理列表
  sname: '',
  dataList: [],
  total: 0,
  page: 1,
  limit: 10
}

// actions
const actions = {
  // 登录
  async login ({commit}, params) {
    let result = await API.login(params)
    if (result && result.errcode === 0) {
      // 登录成功，处理user信息
      let user = result.data
      user.expire = Date.now() + 10 * 60 * 1000 // 超过十分钟，刷新时更新用户信息和权限
      if (user.role === 1) {
        user.permissions = 'all'
      } else if (!Array.isArray(user.permissions)) {
        user.permissions = []
      }
      // 存储用户信息到localStorage
      localStorage.setItem('access-user', JSON.stringify(user))
      // 设置当前用户变量
      commit(TYPE.setCurrentUser, user, {root: true})

      // 设置权限
      commit(TYPE.setPermissions, user.permissions, {root: true})
      // 设置路由
      RouteHelper.setRouters(user.permissions)
    }
    return result
  },
  async reload ({commit}, params) {
    let result = await API.reload()
    if (result && result.errcode === 0) {
      let user = result.data
      user.expire = Date.now() + 10 * 60 * 1000 // 超过十分钟，刷新时更新用户信息和权限
      if (user.role === 1) {
        user.permissions = 'all'
      } else if (!Array.isArray(user.permissions)) {
        user.permissions = []
      }
      // 存储用户信息到localStorage
      localStorage.setItem('access-user', JSON.stringify(user))
      // 设置当前用户变量
      commit(TYPE.setCurrentUser, user, {root: true})

      // 设置权限
      commit(TYPE.setPermissions, user.permissions, {root: true})
      // 设置路由
      RouteHelper.setRouters(user.permissions)
    }
    return result
  },
  async findList ({commit, state}) {
    let params = {
      total: state.total,
      page: state.page,
      limit: state.limit,
      sname: state.sname
    }
    let result = await API.findList(params)
    if (result && result.errcode === 0) {
      commit('updateItem', {
        dataList: result.data.items,
        total: result.data.total,
        page: result.data.page,
        limit: result.data.limit
      })
    }
    return result
  },
  findById ({commit}, id) {
    return API.findById(id)
  },
  findMoreById ({commit}, id) {
    return API.findById(id, {hasAuth: 1})
  },
  async delete ({commit}, id) {
    let result = await API.delete(id)
    if (result && result.errcode === 0) {
      commit('updateDataList', {act: 'delete', id: id})
    }
    return result
  },
  async add ({commit}, params) {
    let result = await API.add(params)
    if (result && result.errcode === 0) {
      commit('resetSearchStatus')
    }
    return result
  },
  profile () {
    return API.profile()
  },
  async logout ({commit}) {
    let result = await API.logout()
    if (result && result.errcode === 0) {
      commit(TYPE.setCurrentUser, null, {root: true})
      localStorage.removeItem('access-user')
    }
    return result
  },
  async updateAvatar ({commit}, params) {
    let result = await API.updateAvatar(params)
    if (result && result.errcode === 0 && result.data) {
      let user = localStorage.getItem('access-user')
      user = JSON.parse(user)
      user.avatar = result.data.avatar
      localStorage.setItem('access-user', JSON.stringify(user))
      commit(TYPE.setCurrentUser, user, {root: true})
    }
    return result
  },
  async update ({commit}, params) {
    let result = await API.update(params.id, params)
    if (result && result.errcode === 0 && result.data) {
      let user = localStorage.getItem('access-user')
      user = JSON.parse(user)
      if (user.username === result.data.username) {
        user.nickname = result.data.nickname
        user.email = result.data.email
        user.mobile = result.data.mobile
        localStorage.setItem('access-user', JSON.stringify(user))
        commit(TYPE.setCurrentUser, user, {root: true})
      }
    }
    return result
  },
  updateAuth ({commit}, params) {
    return API.updateAuth(params)
  }
}

// mutations
const mutations = {
  resetSearchStatus: (state) => {
    state.dataList = []
    state.total = 0
    state.page = 1
    state.limit = 10
  },
  updateItem (state, item) {
    for (let key in item) {
      if (state.hasOwnProperty(key)) {
        state[key] = item[key]
      }
    }
  },
  updateDataList: (state, option) => {
    if (option.act === 'delete') {
      let i = _.findIndex(state.dataList, function (item) {
        return item.id === option.id
      })
      if (state.dataList.length && i > -1) {
        state.dataList.splice(i, 1)
        state.total = state.total - 1
      }
    }
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
