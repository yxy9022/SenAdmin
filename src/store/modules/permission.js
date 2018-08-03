/**
 * Created by jerry on 2018/5/4.
 */
import API from '@/api/permission'

// initial state
const state = {
  permissionOptions: [],
  permissionCodes: [],

  sname: '',
  dataList: []
}

const actions = {
  async findAll ({commit, state}) {
    let result = await API.all()
    if (result && result.errcode === 0) {
      commit('setPermissions', result.data)
    }
    return result
  },
  async findList ({commit, state}) {
    let params = {
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
  async add ({commit}, params) {
    let result = await API.add(params)
    if (result && result.errcode === 0) {
      commit('resetSearchStatus')
    }
    return result
  },
  update ({commit}, params) {
    return API.update(params.id, params)
  },
  async delete ({commit}, id) {
    let result = await API.delete(id)
    if (result && result.errcode === 0) {
      commit('updateDataList', {act: 'delete', id: id})
    }
    return result
  }
}
const mutations = {
  setPermissions: (state, data) => {
    state.permissionOptions = _.groupBy(data, 'group')
    state.permissionCodes = _.map(data, 'code')
  },
  resetSearchStatus: (state) => {
    state.dataList = []
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
