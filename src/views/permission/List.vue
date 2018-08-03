<template>
  <div class="page-wrapper">

    <!--搜索栏-->
    <div class="page-search">
      <el-form :inline="true" label-width="0px">
        <el-form-item label="" label-width="0px">
          <el-input v-model="sname"
                    placeholder="请输入权限名称或code"
                    :trigger-on-focus="false"
                    @keydown.enter.stop.native="handleSearch($event)">
            <el-button type="warn" slot="append" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          </el-input>
        </el-form-item>
        <el-form-item class="pull-right" v-if="AuthPermissionAdd">
          <router-link :to="{ path: '/permission/add' }">
            <el-button type="default" icon="el-icon-plus">新增权限</el-button>
          </router-link>
        </el-form-item>
      </el-form>
    </div>

    <!--主内容区-->
    <div class="page-main">
      <el-table :data="dataList" highlight-current-row v-loading="loading" element-loading-text="数据请求中"
                style="width: 100%;">
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column label="权限名称" prop="name" sortable width="150"></el-table-column>
        <el-table-column label="权限编码" prop="code" sortable width="160"></el-table-column>
        <el-table-column label="权限组" prop="group" sortable width="160"></el-table-column>
        <el-table-column label="后端路由" prop="srvauth" min-width="200"></el-table-column>
        <el-table-column label="操作" width="170">
          <template slot-scope="scope">
            <el-button type="warning" plain size="mini" v-if="AuthPermissionEdit" @click="handleToEdit(scope.row)">
              <span>编辑</span>
            </el-button>
            <el-button type="danger" plain size="mini" v-if="AuthPermissionDelete" @click="handleDelete(scope.row.id)">
              <span>删除</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

  </div>
</template>

<script>
  import {mapState, mapActions} from 'vuex'
  import TYPE from '@/store/mutation-types'

  export default{
    data () {
      return {}
    },
    computed: {
      ...mapState(['loading']),
      ...mapState({
        dataList: state => state.permission.dataList
      }),
      sname: {
        get () {
          return this.$store.state.permission.sname
        },
        set (value) {
          this.$store.commit('permission/updateItem', {sname: value})
        }
      },
      AuthPermissionAdd: function () {
        return this.isPermission('AuthPermissionAdd')
      },
      AuthPermissionEdit: function () {
        return this.isPermission('AuthPermissionEdit')
      },
      AuthPermissionDelete: function () {
        return this.isPermission('AuthPermissionDelete')
      }
    },
    methods: {
      ...mapActions('permission', ['findList', 'delete']),
      handleSearch (ev) {
        this.$store.commit('permission/resetSearchStatus')
        this.search()
        if (ev) {
          ev.preventDefault()
          ev.stopPropagation()
        }
      },
      search: async function () {
        try {
          this.$store.commit(TYPE.setLoading, true)
          let result = await this.findList()
          this.$store.commit(TYPE.setLoading, false)
          if (!(result && result.errcode === 0)) {
            this.$msgError(result.errmsg)
          }
        } catch (error) {
          console.log(error)
          this.$store.commit(TYPE.setLoading, false)
          this.$msgError('请求出现异常')
        }
      },
      handleDelete: async function (id) {
        try {
          await this.$confirm('确定删除该权限吗？', '系统提示', {type: 'warning'})
        } catch (cancel) {
          return // 取消就不继续处理
        }
        try {
          // 确认后继续
          this.$store.commit(TYPE.setLoading, true)
          let result = await this.delete(id)
          this.$store.commit(TYPE.setLoading, false)
          if (result.errcode === 0) {
            this.$msgSuccess('删除成功')
          } else {
            this.$msgError(result.errmsg)
          }
        } catch (error) {
          console.log(error)
          this.$store.commit(TYPE.setLoading, false)
          this.$msgError('请求出现异常')
        }
      },
      handleToEdit (row) {
        this.$router.push({path: '/permission/edit/' + row.id})
      }
    },
    mounted () {
      if (this.$store.state.permission.dataList.length === 0) {
        this.handleSearch()
      }
    }
  }
</script>
<style scoped>
  .summary {
    margin: 0px;
  }
</style>
