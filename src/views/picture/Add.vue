<template>
  <div class="page-wrapper page-wrapper--picture" v-loading="loading" element-loading-text="数据请求中">
    <!--导航区-->
    <div class="page-breadcrumb">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/picture/list' }">图库</el-breadcrumb-item>
        <el-breadcrumb-item>添加图片</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="page-main">
      <el-form class="picture-form" ref="pictureForm" label-width="80px">
        <el-form-item label="上传图片" class="upload-picture-box">
          <el-upload
            multiple
            drag
            :action="UPLOADURL"
            :withCredentials="true"
            accept="image/jpg,image/jpeg,image/png"
            list-type="picture-card"
            :on-preview="handleImagePreview"
            :on-remove="handlePictureRemove"
            :on-err="handlePictureError"
            :on-success="handlePictureSuccess"
            :before-upload="beforePictureUpload"
            :file-list="filePictureList">
            <div slot="tip" class="el-upload__tip">
              <span style="color: red">*</span>
              <span>只能上传jpg、jpeg、png文件，且不超过20M</span>
            </div>
            <i class="el-icon-plus"></i>
          </el-upload>
          <el-dialog :visible.sync="dialogVisible" width="50%">
            <img width="100%" :src="dialogImageUrl" alt="">
          </el-dialog>
        </el-form-item>
        <el-form-item label="添加标签">
          <tag-box ref="pictureTagBox"></tag-box>
        </el-form-item>
        <el-form-item label="">
          <router-link :to="{ path:'/picture/list'}">
            <el-button type="default" class="btn-long">返回列表</el-button>
          </router-link>
          <el-button type="main" @click="handleSubmit" class="btn-long">提交资源</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  import {UPLOADURL} from '../../api/base'
  import TagBox from '../../components/TagBox'
  import {mapState, mapActions} from 'vuex'
  import TYPE from '@/store/mutation-types'

  export default {
    components: {
      TagBox
    },
    data () {
      return {
        UPLOADURL: UPLOADURL,
        filePictureList: [],
        dialogImageUrl: '',
        dialogVisible: false
      }
    },
    computed: {
      ...mapState(['loading'])
    },
    methods: {
      ...mapActions('picture', ['add']),
      beforePictureUpload (file) {
        const isPic = (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png')
        const isLt20M = file.size / 1024 / 1024 < 20
        const isLt10P = this.filePictureList.length <= 10
        if (!isPic) {
          this.$msgError('上传图片只能是 jpg,png 格式!')
        }
        if (!isLt20M) {
          this.$msgError('上传图片大小不能超过 20M!')
        }
        if (!isLt10P) {
          this.$msgError('单次上传图片最多10张')
        }
        return isPic && isLt20M && isLt10P
      },
      handlePictureSuccess (response, file, fileList) {
        if (response.data && response.data.url) {
          // 这才算是真正的上传成功
          if (this.filePictureList.length >= 10) {
            // 超过10张的丢弃
            fileList.splice(-1, 1)
          } else {
            this.filePictureList = fileList
          }
        } else {
          fileList.splice(-1, 1)
          this.$msgError('上传服务器出现异常')
        }
      },
      handlePictureError (err, file, fileList) {
        this.$msgError(err)
      },
      handlePictureRemove (file, fileList) {
        // 批量上传是如果有图片不满足条件，存在部分图片假上传问题
        // 此处理作用是只要有一个不满足条件，这一批选的都不上传
        for (let i = fileList.length - 1; i > -1; i--) {
          if (fileList[i].status === 'uploading') {
            fileList.splice(i, 1)
          }
        }
        this.filePictureList = fileList
      },
      handleImagePreview (file) {
        this.dialogImageUrl = file.url
        this.dialogVisible = true
      },
      handleSubmit: async function () {
        if (this.loading) {
          return
        }
        if (this.filePictureList.length === 0) {
          this.$msgWarning('请上传图片')
          return
        }
        if (this.$refs.pictureTagBox.tagList.length === 0) {
          this.$msgWarning('请添加标签')
          return
        }
        try {
          let pictureList = []
          _.forEach(this.filePictureList, function (file) {
            pictureList.push(file.response.data)
          })
          let params = {
            pictures: pictureList,
            tags: this.$refs.pictureTagBox.tagList
          }
          this.$store.commit(TYPE.setLoading, true)
          let result = await this.add(params)
          this.$store.commit(TYPE.setLoading, false)
          if (result && result.errcode === 0) {
            this.$confirm('操作成功！ 是否继续?', '提示', {
              confirmButtonText: '继续新增',
              cancelButtonText: '返回列表',
              type: 'warning'
            }).then(() => {
              this.filePictureList = []
              this.$refs.pictureTagBox.reset()
            }).catch(() => {
              this.$router.push({path: '/picture/list'})
            })
          } else {
            this.$msgError(result.errmsg)
          }
        } catch (error) {
          console.log(error)
          this.$store.commit(TYPE.setLoading, false)
          this.$msgError('请求出现异常')
        }
      }
    }
  }
</script>

<style lang="less">
  .page-wrapper--picture {
    .upload-picture-box .el-upload-dragger {
      width: 148px;
      height: 148px;
    }
  }
</style>
<style scoped lang="less">
  .page-wrapper--picture {

    .page-main {
      padding-top: 10px;
      border-top: 1px solid #dcdfe6;
    }
  }
</style>
