/**
 * Created by jerry on 2018/7/16.
 */
import * as API from './base'
const name = 'picture'

export default {
  findGrid: params => {
    return API.GET(`/api/${name}/findgrid`, params)
  },
  findById: (id) => {
    return API.GET(`/api/${name}/find/${id}`)
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
