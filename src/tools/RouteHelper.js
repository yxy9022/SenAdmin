/**
 * Created by jerry on 2018/6/5.
 * 使用vuex存储动态路由时，如果使用严格模式会出现如下报错：
 [Vue warn]: Error in callback for watcher "function () { return this._data.$$state }": "Error: [vuex] Do not mutate vuex store state outside mutation handlers."
 (found in <Root>)
 虽然使用深拷贝可以解决问题。但是却引起了左侧菜单频繁刷的新问题。
 所以抽出此路由帮助类，处理动态路由问题。
 */
import {asyncRouterMap, constantRouterMap} from '@/router/index.js'

export default {
  routers: constantRouterMap,
  addRouters: [],

  setRouters: function (permissions) {
    if (permissions === 'all') {
      this.addRouters = asyncRouterMap
      this.routers = constantRouterMap.concat(asyncRouterMap)
    }
    else {
      // 因为*路由一定有，所以permit至少有一个值
      let permit = _.filter(asyncRouterMap, function (v) {
        if (v.path === '*') return true
        v.children = _.filter(v.children, function (c) {
          return c.meta.permission === '*' || (c.meta.permission && permissions.indexOf(c.meta.permission) > -1)
        })
        return v.children && v.children.length
      })
      this.addRouters = permit
      this.routers = constantRouterMap.concat(permit)
    }
  }
}
