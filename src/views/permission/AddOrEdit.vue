<template>
  <div class="page-wrapper" v-loading="loading" element-loading-text="数据请求中">
    <!--导航区-->
    <div class="page-breadcrumb">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/permission/list' }">
          <b>权限设置</b>
        </el-breadcrumb-item>
        <el-breadcrumb-item>
          <b>{{id ? "编辑权限" : "新增权限"}}</b>
        </el-breadcrumb-item>
      </el-breadcrumb>
      <!--返回按钮-->
      <div class="button-back">
        <router-link :to="{ path:'/permission/list'}">
          <el-button type="default" size="mini">返回</el-button>
        </router-link>
      </div>
    </div>

    <!--主内容区-->
    <div class="page-main">
      <div class="content-wrap">
        <!--表单-->
        <el-form :model="permissionForm" :rules="rules" ref="permissionForm" label-width="80px">
          <el-form-item label="权限编码" prop="code">
            <el-input v-model="permissionForm.code" :disabled="canEditCode"></el-input>
          </el-form-item>
          <el-form-item label="权限名称" prop="name">
            <el-input v-model="permissionForm.name"></el-input>
          </el-form-item>
          <el-form-item label="权限组别" prop="group">
            <el-input v-model="permissionForm.group"></el-input>
          </el-form-item>
          <el-form-item label="后台路由" prop="backendAuth">
            <el-input type="textarea" v-model="permissionForm.srvauth" :autosize="{ minRows: 3}"></el-input>
          </el-form-item>
          <el-form-item label="权限说明" prop="description">
            <el-input type="textarea" v-model="permissionForm.description" :autosize="{ minRows: 2}"></el-input>
          </el-form-item>
          <!-- 提交按钮 -->
          <el-form-item>
            <el-button type="main" @click="handleSubmit" :disabled="btnSubmitDisabled" class="btn-long">提交</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

  </div>
</template>
<script>
  import {mapState, mapActions} from 'vuex'
  import TYPE from '@/store/mutation-types'

  export default{
    data () {
      return {
        btnSubmitDisabled: false,
        id: '',
        permissionForm: {
          name: '',
          code: '',
          group: '',
          srvauth: '',
          description: ''
        },
        rules: {
          code: [{required: true, message: '请输入权限编码', trigger: 'blur'}],
          name: [{required: true, message: '请输入权限名称', trigger: 'blur'}],
          group: [{required: true, message: '请输入权限组别', trigger: 'blur'}],
          srvauth: [
            {required: true, message: '请输入后台路由', trigger: 'blur'}
          ]
        }
      }
    },
    computed: {
      ...mapState(['loading']),
      canEditCode () {
        return !!this.id
      }
    },
    methods: {
      ...mapActions('permission',
        ['findById', 'add', 'update']
      ),
      checkValid: async function () {
        let valid = false
        try {
          valid = await this.$refs['permissionForm'].validate()
        } catch (error) {
        }
        return valid
      },
      handleSubmit: async function () {
        if (this.loading) {
          return
        }
        let valid = await this.checkValid()
        if (!valid) {
          return
        }
        try {
          // 修改
          if (this.id) {
            let params = _.clone(this.permissionForm)
            params.id = this.id
            this.$store.commit(TYPE.setLoading, true)
            let result = await this.update(params)
            this.$store.commit(TYPE.setLoading, false)
            if (result && result.errcode === 0) {
              this.$msgSuccess('修改成功')
            } else {
              this.$msgError(result.errmsg)
            }
          }
          // 新增
          else {
            this.$store.commit(TYPE.setLoading, true)
            let result = await this.add(this.permissionForm)
            this.$store.commit(TYPE.setLoading, false)
            if (result && result.errcode === 0) {
              this.$msgSuccess('新增成功')
            } else {
              this.$msgError(result.errmsg)
            }
          }
        } catch (error) {
          console.log(error)
          this.$store.commit(TYPE.setLoading, false)
          this.$msgError('请求出现异常')
        }
      }
    },
    created: async function () {
      let id = this.$route.params.id
      if (id) {
        this.id = id
        try {
          let result = await this.findById(id)
          if (result.errcode === 0 && result.data) {
            this.permissionForm.name = result.data.name
            this.permissionForm.code = result.data.code
            this.permissionForm.group = result.data.group
            this.permissionForm.srvauth = result.data.srvauth
            this.permissionForm.description = result.data.description
          } else {
            this.btnSubmitDisabled = true
            this.$msgError('获取数据失败')
          }
        } catch (error) {
          this.btnSubmitDisabled = true
          this.$msgError(error.toString())
        }
      }
    }
  }
</script>
