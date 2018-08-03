/**
 * Created by jerry on 2018/5/30.
 */
import * as API from './base'
const name = 'book'

export default {
  findList: params => {
    return API.GET(`/api/${name}/findlist`, params)
  },
  findById: (id, params) => {
    return API.GET(`/api/${name}/find/${id}`, params)
  },
  add: params => {
    return API.POST(`/api/${name}/add`, params)
  },
  update: (id, params) => {
    return API.POST(`/api/${name}/update/${id}`, params)
  },
  delete: id => {
    return API.POST(`/api/${name}/delete/${id}`)
  }
}
