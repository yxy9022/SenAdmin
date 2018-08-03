<template>
  <div class="page-wrapper page-wrapper--book" v-loading="loading" element-loading-text="数据请求中">
    <!--导航区-->
    <div class="page-breadcrumb">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/book/list' }">书籍管理</el-breadcrumb-item>
        <el-breadcrumb-item>{{id ? '编辑书籍' : '新增书籍'}}</el-breadcrumb-item>
      </el-breadcrumb>
      <!--返回按钮-->
      <div class="button-back">
        <router-link :to="{ path:'/book/list'}">
          <el-button type="default" size="mini">返回</el-button>
        </router-link>
      </div>
    </div>

    <!--主内容区-->
    <div class="page-main">
      <div class="content-wrap">
        <el-form class="form-book--info" ref="bookForm" :model="bookForm" :rules="bookRule" label-width="80px">
          <el-form-item label="书名" prop="name">
            <el-input v-model="bookForm.name"></el-input>
          </el-form-item>
          <el-form-item label="作者" prop="author">
            <el-input v-model="bookForm.author"></el-input>
          </el-form-item>
          <el-form-item label="译者" prop="translator">
            <el-input v-model="bookForm.translator"></el-input>
          </el-form-item>
          <el-form-item label="出版社" prop="publisher">
            <el-input v-model="bookForm.publisher"></el-input>
          </el-form-item>
          <el-form-item label="出版日期" prop="publish_at">
            <el-input v-model="bookForm.publish_at"></el-input>
          </el-form-item>
          <el-form-item label="ISBN" prop="isbn">
            <el-input v-model="bookForm.isbn"></el-input>
          </el-form-item>
          <el-form-item label="书籍类型">
            <el-select v-model="bookForm.cid" placeholder="请选择数据类别">
              <el-option
                v-for="item in categories"
                :key="item.name"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="简介" prop="summary">
            <el-input type="textarea" v-model="bookForm.summary" :autosize="{ minRows: 3}"></el-input>
          </el-form-item>
          <el-form-item label="">
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
        bookForm: {
          name: '',
          summary: '',
          translator: '',
          author: '',
          publisher: '',
          publish_at: '',
          isbn: '',
          cid: ''
        },
        bookRule: {
          name: [
            {required: true, message: '书名不能为空', trigger: 'blur'}
          ],
          author: [
            {required: true, message: '作者不能为空', trigger: 'blur'}
          ],
          isbn: [
            {required: true, message: 'ISBN不能为空', trigger: 'blur'}
          ]
        }
      }
    },
    computed: {
      ...mapState(['loading']),
      ...mapState({
        categories: state => state.category.categories
      })
    },
    methods: {
      ...mapActions('book',
        ['findById', 'findMoreById', 'add', 'update']
      ),
      ...mapActions('category', {
          'fillCategories': 'findAll'
        }
      ),
      checkValid: async function () {
        let valid = false
        try {
          valid = await this.$refs.bookForm.validate()
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
            let params = _.clone(this.bookForm)
            params.id = this.id
            this.$store.commit(TYPE.setLoading, true)
            let result = await this.update(params)
            this.$store.commit(TYPE.setLoading, false)
            if (result && result.errcode === 0) {
              this.$alert('操作成功！', '系统提示', {
                confirmButtonText: '确定',
                callback: action => {
                  this.$store.commit('book/updateItem', {dataList: []})
                  this.$router.push({path: '/book/list'})
                }
              })
            } else {
              this.$msgError(result.errmsg)
            }
          }
          // 新增
          else {
            this.$store.commit(TYPE.setLoading, true)
            let result = await this.add(this.bookForm)
            this.$store.commit(TYPE.setLoading, false)
            if (result && result.errcode === 0) {
              this.$confirm('操作成功！ 是否继续?', '提示', {
                confirmButtonText: '继续新增',
                cancelButtonText: '返回列表',
                type: 'warning'
              }).then(() => {
                this.id = ''
                this.$refs['bookForm'].resetFields()
              }).catch(() => {
                this.$router.push({path: '/book/list'})
              })
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
          let result = await this.findMoreById(id)
          if (result.errcode === 0 && result.data) {
            this.bookForm.name = result.data.name
            this.bookForm.summary = result.data.summary
            this.bookForm.translator = result.data.translator
            this.bookForm.author = result.data.author
            this.bookForm.publisher = result.data.publisher
            this.bookForm.publish_at = result.data.publish_at
            this.bookForm.isbn = result.data.isbn
            this.bookForm.cid = result.data.cid
          } else {
            this.btnSubmitDisabled = true
            this.$msgError('获取数据失败')
          }
        } catch (error) {
          this.$msgError(error.toString())
        }
      }

      await this.fillCategories()
    }
  }
</script>
