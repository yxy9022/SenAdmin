/**
 * Created by jerry on 2018/4/11.
 */
import * as API from './base'
const name = 'user'

export default {
  login: params => {
    return API.POST(`/api/${name}/login`, params)
  },
  logout: params => {
    return API.GET(`/api/${name}/logout`, params)
  },
  profile: () => {
    return API.GET(`/api/${name}/profile`)
  },
  reload: () => {
    return API.GET(`/api/${name}/reload`)
  },
  changepwd: params => {
    return API.POST(`/api/${name}/changepwd`, params)
  },
  findById: (id, params) => {
    return API.GET(`/api/${name}/find/${id}`, params)
  },
  findList: params => {
    return API.GET(`/api/${name}/findlist`, params)
  },
  delete: id => {
    return API.POST(`/api/${name}/delete/${id}`)
  },
  updateAvatar: params => {
    return API.POST(`/api/${name}/avatar/save`, params)
  },
  add: params => {
    return API.POST(`/api/${name}/add`, params)
  },
  update: (id, params) => {
    return API.POST(`/api/${name}/update/${id}`, params)
  },
  updateAuth: params => {
    return API.POST(`/api/${name}/auth/save`, params)
  }
}
