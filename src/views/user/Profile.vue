<template>
  <div class="page-wrapper page-wrapper--profile" v-loading.fullscreen.lock="loading">
    <div class="page-breadcrumb">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>个人信息</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="page-main">
      <el-form ref="form" :model="userInfo" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model='userInfo.username' disabled></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model='userInfo.nickname'></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model='userInfo.email'></el-input>
        </el-form-item>
        <el-form-item label="手机">
          <el-input v-model='userInfo.mobile'></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="btn-long" @click="handleSubmit">更新</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  import {mapState, mapActions} from 'vuex'
  import TYPE from '@/store/mutation-types'

  export default {
    data () {
      return {
        orgInfo: {},
        userInfo: {}
      }
    },
    computed: {
      ...mapState(['loading'])
    },
    methods: {
      ...mapActions('user', ['profile']),
      loadData: async function () {
        try {
          this.$store.commit(TYPE.setLoading, true)
          let result = await this.profile()
          this.$store.commit(TYPE.setLoading, false)
          if (result && result.errcode === 0) {
            this.orgInfo = _.cloneDeep(result.data)
            this.userInfo = result.data
          } else {
            this.$msgError(result.errmsg)
          }
        } catch (error) {
          console.log(error)
          this.$store.commit(TYPE.setLoading, false)
          this.$msgError('请求出现异常')
        }
      },
      handleSubmit () {
        this.$msgInfo('功能未开发...')
      }
    },
    mounted () {
      this.loadData()
    }
  }
</script>

<style scoped lang="less">
  .page-wrapper--profile {

    .page-main {
      padding-top: 15px;
    }
    .el-form {
      padding: 0px;

      .el-form-item {
        margin-bottom: 15px;
      }

      .el-form-item .el-input {
        max-width: 420px;
      }
    }
  }
</style>
