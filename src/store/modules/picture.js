/**
 * Created by jerry on 2018/7/12.
 */
import API from '@/api/picture'
import TYPE from '../mutation-types'

// initial state
const state = {
  // 管理列表
  tag: '',
  total: 0,
  offset: 0,
  limit: 70,

  dataArr: null // 暂存数据
}

const actions = {
  async findGrid ({commit, state}) {
    let params = {
      offset: state.offset,
      limit: state.limit,
      tag: state.tag
    }
    let result = await API.findGrid(params)
    if (result && result.errcode === 0) {
      commit('updateItem', {
        total: result.data.total,
        limit: result.data.limit
      })
    }
    return result
  },
  findById ({commit}, id) {
    return API.findById(id)
  },
  async add ({commit}, params) {
    let result = await API.add(params)
    if (result && result.errcode === 0) {
      // commit('resetSearchStatus')
    }
    return result
  },
  update ({commit}, params) {
    return API.update(params.id, params)
  },
  delete ({commit}, id) {
    return API.delete(id)
  }
}

const mutations = {
  updateItem (state, item) {
    for (let key in item) {
      if (state.hasOwnProperty(key)) {
        state[key] = item[key]
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
