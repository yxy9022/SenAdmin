import Vue from 'vue'
import Router from 'vue-router'
import RouteHelper from '@/tools/RouteHelper'
import store from '../store'
import TYPE from '../store/mutation-types'
import Home from '@/views/Home'
import Dashboard from '@/views/Dashboard'
import Login from '@/views/Login'
import NoAuth from '@/views/NoAuth'
import NotFound from '@/views/NotFound'

const UserList = resolve => require(['@/views/user/List'], resolve)
const UserAddOrEdit = resolve => require(['@/views/user/AddOrEdit'], resolve)
const UserChangePasswd = resolve => require(['@/views/user/ChangePasswd'], resolve)
const UserProfile = resolve => require(['@/views/user/Profile'], resolve)

const BookList = resolve => require(['@/views/book/List'], resolve)
const BookAddOrEdit = resolve => require(['@/views/book/AddOrEdit'], resolve)
const BookCategory = resolve => require(['@/views/book/Category'], resolve)

const PermissionList = resolve => require(['@/views/permission/List'], resolve)
const PermissionAddOrEdit = resolve => require(['@/views/permission/AddOrEdit'], resolve)

const PictureList = resolve => require(['@/views/picture/List'], resolve)
const PictureAdd = resolve => require(['@/views/picture/Add'], resolve)
const PictureDetail = resolve => require(['@/views/picture/Detail'], resolve)

/**
 * 静态路由
 * 下面的路由属于默认的必须有的路由
 * path 路由
 * component 组件
 * redirect 重定向
 * name 路由名称
 * menuShow 在右侧菜单中是否显示(自定义字段)
 * menuName 菜单显示时的名称（自定义字段）
 * menuPath 单个菜单(没有展开功能)时的跳转路径，只显示一个菜单填值(自定义字段)
 * iconCls 菜单前面的小图标（自定义字段）
 * @type {[*]}
 */
export const constantRouterMap = [
  {
    path: '/login',
    component: Login
  },
  {
    path: '/',
    component: Home,
    redirect: {name: 'dashboard'},
    menuShow: true,
    menuName: '首页',
    menuPath: '/dashboard',
    iconCls: 'iconfont icon-home',
    children: [
      {path: '/dashboard', component: Dashboard, name: 'dashboard'}
    ]
  },
  {
    path: '/noauth',
    component: Home,
    redirect: {name: 'noauth'},
    children: [
      {path: '/noauth/index', component: NoAuth, name: 'noauth'}
    ]
  },
  {
    path: '/myself',
    component: Home,
    redirect: {name: 'profile'},
    children: [
      {path: '/myself/profile', component: UserProfile, name: 'profile'},
      {path: '/myself/changepasswd', component: UserChangePasswd, name: 'changepasswd'}
    ]
  }
]

/**
 * 动态路由(相关参数说明参见上面的静态路由)
 * 下面的路由会根据用户的权限动态加载
 * @type {[*]}
 */
export const asyncRouterMap = [
  {
    path: '/book',
    component: Home,
    redirect: {name: 'booklist'},
    menuShow: true,
    menuName: '书籍管理',
    iconCls: 'iconfont icon-books2',
    children: [
      {
        path: '/book/list', component: BookList, name: 'booklist', menuShow: true, menuName: '书籍列表',
        meta: {permission: 'AuthBookView'}
      },
      {
        path: '/book/add', component: BookAddOrEdit, name: 'bookadd',
        meta: {permission: 'AuthBookAdd'}
      },
      {
        path: '/book/edit/:id', component: BookAddOrEdit, name: 'bookedit',
        meta: {permission: 'AuthBookEdit'}
      },
      {
        path: '/book/category', component: BookCategory, name: 'bookcategory', menuShow: true, menuName: '书籍分类',
        meta: {permission: 'AuthCategoryView'}
      }
    ]
  },
  {
    path: '/picture',
    component: Home,
    redirect: {name: 'picturelist'},
    menuShow: true,
    menuName: '图库',
    menuPath: '/picture/list',
    iconCls: 'iconfont icon-pic',
    children: [
      {
        path: '/picture/list', component: PictureList, name: 'picturelist',
        meta: {permission: 'AuthPictureView'}
      },
      {
        path: '/picture/add', component: PictureAdd, name: 'pictureadd',
        meta: {permission: 'AuthPictureAdd'}
      },
      {
        path: '/picture/detail/:id', component: PictureDetail, name: 'picturedetail',
        meta: {permission: 'AuthPictureView'}
      }
    ]
  },
  {
    // 用户管理功能约定只给role===1的使用（本例子中是admin）
    path: '/user',
    component: Home,
    redirect: {name: 'userlist'},
    menuShow: true,
    menuName: '用户管理',
    menuPath: '/user/list',
    iconCls: 'iconfont icon-user',
    children: [
      {path: '/user/list', component: UserList, name: 'userlist', meta: {permission: 'AuthUserView'}},
      {path: '/user/add', component: UserAddOrEdit, name: 'useradd', meta: {permission: 'AuthUserAdd'}},
      {path: '/user/edit/:id', component: UserAddOrEdit, name: 'useredit', meta: {permission: 'AuthUserEdit'}}
    ]
  },
  {
    // 权限设置功能约定只给role===1的使用（本例子中是admin）
    path: '/permission',
    component: Home,
    redirect: {name: 'permissionlist'},
    menuShow: true,
    menuName: '权限设置',
    menuPath: '/permission/list',
    iconCls: 'iconfont icon-setting',
    children: [
      {
        path: '/permission/list',
        component: PermissionList,
        name: 'permissionlist',
        meta: {permission: 'AuthPermissionView'}
      },
      {
        path: '/permission/add',
        component: PermissionAddOrEdit,
        name: 'permissionadd',
        meta: {permission: 'AuthPermissionAdd'}
      },
      {
        path: '/permission/edit/:id',
        component: PermissionAddOrEdit,
        name: 'permissionedit',
        meta: {permission: 'AuthPermissionEdit'}
      }
    ]
  },
  { // 其它没有匹配到的路由都会跳至此模块(404）
    // 该路由为必须路由，不需要权限，必须放在最后
    path: '*',
    name: 'notfound',
    component: NotFound
  }
]

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: constantRouterMap
})

/**
 * 此处拦截路由判断
 */
router.beforeEach((to, from, next) => {
  // 在此处进行路由拦截处理

  // 获取用户信息
  let user = store.getters.currentUser
  if (!user) {
    user = store.getters.storageUser
    if (user) {
      store.commit(TYPE.setCurrentUser, user)
    }
  }

  if (!user) {
    // 没有登录的情况：访问登录页直接通过,访问其它页面跳转到登录页
    to.path.startsWith('/login') ? next() : next({path: '/login'})
  }
  else {
    // 已经登录的情况
    if (to.path.startsWith('/login')) {
      // 访问登录页直接跳转到首页
      next({path: '/'})
    }
    else if (RouteHelper.addRouters.length === 0) {
      // 页面强制刷新情况处理
      goAndRefresh()
    }
    else {
      next()
    }
  }

  async function goAndRefresh () {
    if (user.expire && Date.now() > user.expire) {
      // console.log('**用户缓存信息超过预设时间，准备更新数据**')
      try {
        let result = await store.dispatch('user/reload')
        if (result && result.errcode === 0) {
          router.addRoutes(RouteHelper.addRouters)
          router.options.routes = RouteHelper.routers
          next({path: to.path})
        } else {
          resetRouterCache(user.permissions)
        }
      } catch (ex) {
        resetRouterCache(user.permissions)
      }
    } else {
      resetRouterCache(user.permissions)
    }
  }

  function resetRouterCache (permissions) {
    store.commit(TYPE.setPermissions, permissions)
    RouteHelper.setRouters(permissions)
    router.addRoutes(RouteHelper.addRouters)
    router.options.routes = RouteHelper.routers
    next({path: to.path})
  }
})

export default router
