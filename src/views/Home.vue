<template>
  <el-container class="app-container" v-loading="loading" element-loading-text="进行中..">
    <!--头部-->
    <el-header class="app-header" :style="[{height:'50px',paddingLeft:'9px'}]">
      <div class="logo">
        <a href="/">
          <img src="../assets/logo.png" class="logo__img"/>
          <span class="logo__text">风车车的后台管理系统</span>
        </a>
      </div>
      <div class="pull-right">
        <el-dropdown trigger="click">
            <span class="el-dropdown-link">
              <img :src="avatar" class="avatar" @click="handleChangeAvatar($event)" style="width: 32px;height: 32px;"/>
              <b style="font-size: 16px;padding-left: 15px;">{{nickName}}</b>
              <i class="iconfont icon-down"></i>
            </span>
          <el-dropdown-menu slot="dropdown" class="myself-menu">
            <el-dropdown-item>
              <div @click="handleToPage('/myself/profile')" class="myself-menu__item">
                <i class="iconfont icon-user"></i>
                <span> 个人信息</span>
              </div>
            </el-dropdown-item>
            <el-dropdown-item>
              <div @click="handleToPage('/myself/changepasswd')" class="myself-menu__item">
                <i class="iconfont icon-icchangepwd"></i>
                <span> 修改密码</span>
              </div>
            </el-dropdown-item>
            <el-dropdown-item divided @click.native="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-header>

    <!--中间区域-->
    <el-container>

      <!--左侧菜单区域-->
      <aside :class="{showSidebar:!collapsed}">
        <!--展开折叠开关-->
        <div class="menu-toggle" @click.prevent="collapse">
          <i class="iconfont icon-menufold" v-show="!collapsed"></i>
          <i class="iconfont icon-menuunfold" v-show="collapsed"></i>
        </div>

        <el-menu router :default-active="currentActive" :collapse="collapsed" @select="handleSelect">
          <template v-for="(item) in $router.options.routes" v-if="item.menuShow">
            <el-submenu v-if="!item.menuPath" :key="item.path" :index="item.path+''">
              <template slot="title">
                <i :class="item.iconCls"></i><span slot="title">{{item.menuName}}</span>
              </template>
              <el-menu-item v-for="chd in item.children"
                            :index="chd.path"
                            :key="chd.path"
                            :class="$route.path==chd.path?'is-active':''"
                            v-if="chd.menuShow">
                <i v-if="chd.iconCls" :class="chd.iconCls"></i><span slot="title">{{chd.menuName}}</span>
              </el-menu-item>
            </el-submenu>
            <el-menu-item v-else-if="item.menuPath"
                          :index="item.menuPath"
                          :key="item.menuPath"
                          :class="$route.path==item.menuPath?'is-active':''">
              <i :class="item.iconCls"></i><span slot="title">{{item.menuName}}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </aside>

      <!--右侧主内容区-->
      <el-container>
        <el-main class="app-main">
          <transition name="fade" mode="out-in">
            <router-view/>
          </transition>
        </el-main>
      </el-container>
    </el-container>
    <crop-image :show.sync="showAvatarDialog" :oldImg="avatar" :donecropimage="doneCropImage"></crop-image>
  </el-container>
</template>

<script>
  import {bus} from '../bus.js'
  import CropImage from '../components/CropImage'
  import defaultAvatar from '../assets/avatars/default.png'
  import {mapState, mapActions} from 'vuex'
  import TYPE from '../store/mutation-types'

  export default {
    components: {
      CropImage
    },
    created () {
      if (!bus._events.goto) {
        // 只注册一次goto事件
        bus.$on('goto', (url) => {
          if (url === '/login') {
            this.$store.commit(TYPE.setCurrentUser, null)
            localStorage.removeItem('access-user')
            this.$router.go(url)
          }
          else {
            this.$router.push(url)
          }
        })
      }
    },
    data () {
      return {
        loading: false,
        avatar: defaultAvatar,
        nickName: '',
        collapsed: false,
        showAvatarDialog: false
      }
    },
    computed: {
      ...mapState(['currentActive'])
    },
    methods: {
      ...mapActions('user',
        ['logout', 'updateAvatar']
      ),
      handleSelect (index) {
        this.$store.commit(TYPE.setCurrentActive, index)
      },
      // 折叠导航栏
      collapse: function () {
        this.collapsed = !this.collapsed
        bus.$emit('setMenuCollapse', this.collapsed ? 50 : 180) // 菜单宽度，折叠时60px,展开时180px,需要同css保持一致。
      },
      handleLogout: async function () {
        try {
          await this.$confirm('确认退出吗？', '系统提示', {type: 'warning'})
        } catch (cancel) {
          return // 取消就不继续处理
        }
        try {
          // 确认后继续
          this.loading = true
          let result = await this.logout()
          this.loading = false
          if (result.errcode === 0) {
            this.$router.go('/login') // 用go刷新
          } else {
            this.$msgError(result.errmsg)
          }
        } catch (error) {
          console.log(error)
          this.$store.commit(TYPE.setLoading, false)
          this.$msgError('请求出现异常')
        }
      },
      handleChangeAvatar (ev) {
        this.showAvatarDialog = true
        if (ev) {
          ev.preventDefault()
          ev.stopPropagation()
        }
      },
      doneCropImage: async function (base64Image) {
        let params = {
          avatar: base64Image
        }
        try {
          this.loading = true
          let result = await this.updateAvatar(params)
          this.loading = false
          if (result && result.errcode === 0 && result.data) {
            this.avatar = result.data.avatar
            this.showAvatarDialog = false

            this.$msgSuccess('用户头像更新成功')
          } else {
            this.$msgError('用户头像更新失败')
          }
        } catch (error) {
          console.log(error)
          this.$store.commit(TYPE.setLoading, false)
          this.$msgError('请求出现异常')
        }
      },
      handleToPage (url) {
        this.$store.commit(TYPE.setCurrentActive, url)
        this.$router.push(url)
      }
    },
    mounted () {
      // 获取用户信息
      let user = this.$store.getters.currentUser
      if (!user) {
        user = this.$store.getters.storageUser
      }
      if (user) {
        this.avatar = user.avatar || defaultAvatar
        this.nickName = user.nickname || ''
      }

      window.onresize = function resize () {
        let w = document.documentElement.clientWidth - (this.collapsed ? 50 : 180) - 30 // 两边的padding
        let h = document.documentElement.clientHeight - 115
        bus.$emit('resizeWindowLayout', w, h)
      }
    }
  }
</script>
