<template>
  <div class="page-wrapper page-wrapper--user" v-loading="loading" element-loading-text="数据请求中">
    <!--导航区-->
    <div class="page-breadcrumb">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      </el-breadcrumb>
      <!--返回按钮-->
      <div class="button-back">
        <router-link :to="{ path:'/user/list'}">
          <el-button type="default" size="mini">返回</el-button>
        </router-link>
      </div>
    </div>

    <!--主内容区-->
    <div class="page-main">
      <!--表单-->
      <el-tabs type="border-card" v-model="activeTab">
        <!--用户信息-->
        <el-tab-pane name="tab1" label="用户信息">
          <span slot="label"><i class="el-icon-date"></i> 用户信息</span>
          <el-form class="form-user--info" ref="userForm" :model="userForm" :rules="userRule" label-width="80px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="userForm.username" :disabled="id?true:false"></el-input>
            </el-form-item>
            <el-form-item label="姓名" prop="nickname">
              <el-input v-model="userForm.nickname"></el-input>
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
              <el-input v-model="userForm.mobile"></el-input>
            </el-form-item>
            <el-form-item label="电子邮箱" prop="email">
              <el-input v-model="userForm.email"></el-input>
            </el-form-item>
            <el-form-item label="">
              <el-button type="primary" class="btn-long" @click="handleSubmitInfo">保存用户信息</el-button>
              <p class="tip"> ( * ) 新增的用户初始密码默认为： demo@ + 用户名</p>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!--权限设置-->
        <el-tab-pane name="tab2" label="权限设置" :disabled="authDisabled" v-if="!isAdmin">
          <span slot="label"><i class="el-icon-star-on"></i> 权限设置</span>
          <el-form class="form-user--auth" ref="userAuthForm" label-width="10px">
            <el-form-item style="margin-bottom: 0px;">
              <p class="quick-box"><span>快捷勾选:</span>
                <el-checkbox label="全选/全不选" @change="handleAuthChange($event,1)"></el-checkbox>
                <el-checkbox label="仅选查询功能" @change="handleAuthChange($event,2)"></el-checkbox>
                <el-checkbox label="仅选非删除功能" @change="handleAuthChange($event,3)"></el-checkbox>
              </p>
            </el-form-item>
            <el-form-item style="border-top: solid 1px #bfcbd9;margin-bottom: 5px;">
              <template>
                <el-checkbox-group v-model="checkList">
                  <fieldset v-for="(value,key) in permissionOptions" :key="key" class="auth-group">
                    <el-checkbox v-for="item in value" :label="item.code" :key="item.code">{{item.name}}</el-checkbox>
                  </fieldset>
                </el-checkbox-group>
              </template>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" style="margin-top: 12px;" class="btn-long" @click="handleSubmitAuth">
                <span>保存用户权限</span>
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

    </div>
  </div>
</template>
<script>
  import {mapState, mapActions} from 'vuex'
  import TYPE from '@/store/mutation-types'

  export default{
    data () {
      const checkMobile = (rule, value, callback) => {
        if (!value) {
          callback()
        } else if (/^1\d{10}$/.test(value)) {
          callback()
        } else {
          callback(new Error('手机号格式不正确!'))
        }
      }
      const checkEmail = (rule, value, callback) => {
        if (!value) {
          callback()
        } else if (/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value)) {
          callback()
        } else {
          callback(new Error('电子邮箱格式不正确!'))
        }
      }
      return {
        activeTab: 'tab1',
        authDisabled: true,
        checkList: [],
        backUrl: '/user/list',
        id: '',
        isAdmin: false,
        userForm: {
          username: '',
          nickname: '',
          mobile: '',
          email: ''
        },
        userRule: {
          username: [
            {required: true, message: '用户名不能为空', trigger: 'blur'}
          ],
          nickname: [
            {required: true, message: '姓名不能为空', trigger: 'blur'}
          ],
          mobile: [
            {validator: checkMobile, trigger: 'blur'}
          ],
          email: [
            {validator: checkEmail, trigger: 'blur'}
          ]
        },
        oldPermissions: []
      }
    },
    computed: {
      ...mapState(['loading']),
      ...mapState({
        permissionOptions: state => state.permission.permissionOptions,
        permissionCodes: state => state.permission.permissionCodes
      })
    },
    methods: {
      ...mapActions('user',
        ['findMoreById', 'add', 'update', 'updateAuth']
      ),
      ...mapActions('permission', {
          'fillPermissions': 'findAll'
        }
      ),
      handleAuthChange (checked, i) {
        if (i === 1) {
          this.checkList = checked ? this.permissionCodes : []
        } else if (i === 2 && checked) {
          this.checkList = _.filter(this.permissionCodes, function (item) {
            return item.toString().endsWith('View')
          })
        } else if (i === 3 && checked) {
          this.checkList = _.filter(this.permissionCodes, function (item) {
            return !item.toString().endsWith('Delete')
          })
        }
      },
      checkValid: async function () {
        let valid = false
        try {
          valid = await this.$refs.userForm.validate()
        } catch (error) {
        }
        return valid
      },
      handleSubmitInfo: async function () {
        if (this.loading) {
          return
        }
        let valid = await this.checkValid()
        if (!valid) {
          return
        }
        try {
          // 修改用户
          if (this.id) {
            let params = _.clone(this.userForm)
            params.id = this.id
            this.$store.commit(TYPE.setLoading, true)
            console.log(params)
            let result = await this.update(params)
            this.$store.commit(TYPE.setLoading, false)
            if (result && result.errcode === 0) {
              this.$msgSuccess('修改成功')
            } else {
              this.$msgError(result.errmsg)
            }
          }
          // 新增用户
          else {
            this.$store.commit(TYPE.setLoading, true)
            let result = await this.add(this.userForm)
            this.$store.commit(TYPE.setLoading, false)
            if (result && result.errcode === 0) {
              this.$msgSuccess('用户增加成功,您可以继续给TA设置权限了')
              this.id = result.data.id
              this.authDisabled = false
              this.activeTab = 'tab2'
            } else {
              this.$msgError(result.errmsg)
            }
          }
        } catch (error) {
          console.log(error)
          this.$store.commit(TYPE.setLoading, false)
          this.$msgError('请求出现异常')
        }
      },
      handleSubmitAuth: async function () {
        if (this.checkList.length === 0) {
          try {
            await this.$confirm('确认不给该用户任何操作权限吗？', '系统提示', {type: 'warning'})
          } catch (cancel) {
            return // 取消就不继续处理
          }
        }
        let args = {
          uid: this.id,
          codes: this.checkList.join(',')
        }
        this.$store.commit(TYPE.setLoading, true)
        let result = await this.updateAuth(args)
        this.$store.commit(TYPE.setLoading, false)
        if (result && result.errcode === 0) {
          this.$msgSuccess('权限设置成功')
        } else {
          this.$msgError(result.errmsg)
        }
      }
    },
    created: async function () {
      let id = this.$route.params.id
      if (id) {
        this.id = id
        try {
          let result = await this.findMoreById(id)
          if (result.errcode === 0 && result.data) {
            this.userForm.username = result.data.username
            this.userForm.nickname = result.data.nickname
            this.userForm.mobile = result.data.mobile
            this.userForm.email = result.data.email
            this.authDisabled = false
            this.checkList = result.data.permissions
            if (result.data.role === 1) {
              this.isAdmin = true
            }
          } else {
            this.$msgError(result.errmsg || '获取数据失败')
          }
        } catch (error) {
          this.$msgError(error.toString())
        }
      }

      await this.fillPermissions()
    }
  }
</script>
<style scoped lang="less">
  .page-wrapper--user {
    .tip {
      color: red;
      font-size: 12px;
    }
    .form-user--info .el-input {
      max-width: 300px;
    }

    .form-user--auth {
      .el-checkbox {
        /*color: #1d90e6;*/
        font-size: 12px;
      }

      .quick-box {
        margin: 0px;
        font-size: 13px;
      }

      .auth-group {
        margin: 0px;
        padding: 0px;
        border-top: 0px;
        border-left: 0px;
        border-right: 0px;
        border-bottom: dotted 1px #bfcbd9;
      }
    }
  }
</style>
