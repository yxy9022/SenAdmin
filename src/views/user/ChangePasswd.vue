<template>
  <div class="page-wrapper">
    <div class="page-breadcrumb">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>密码修改</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="page-main">
      <el-form label-width="120px">
        <el-form-item label="原密码">
          <el-input></el-input>
        </el-form-item>
        <el-form-item label="新密码">
          <el-input></el-input>
        </el-form-item>
        <el-form-item label="确认新密码">
          <el-input></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="btn-long" @click="handleSubmit">更新</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
  export default {
    methods: {
      handleSubmit () {
        this.$msgInfo('功能未开发...')
      }
    }
  }
</script>

<style scoped lang="less">
  .page-main {
    padding-top: 15px;

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
