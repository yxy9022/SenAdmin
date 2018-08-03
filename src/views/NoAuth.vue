<template>
  <el-row class="page-wrapper">
    <!--头部-->
    <el-col :span="24" style="text-align: center;padding-top: 60px;">
      <h2 style="color: #777;">Sorry! 您没权限访问此页面!!!</h2>
    </el-col>
  </el-row>
</template>
<script>
  export default {
    data () {
      return {
        loading: false
      }
    }
  }
</script>
