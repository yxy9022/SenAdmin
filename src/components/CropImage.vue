<template>
  <el-dialog :title="dialogTitle"
             :append-to-body="true"
             :visible.sync="dialogVisible"
             :close-on-click-modal="false"
             width="587px"
             top="80px">
    <div class="avatar-content">
      <div class="preview-box">
        <div>预览</div>
        <ul>
          <li>
            <div style="display: block;height: 100px;">
              <div class="pre-avatar circle"><img class="old-image" :src="oldImg||defaultAvatar"/></div>
            </div>
          </li>
          <li>
            <div style="display: block;height: 100px;">
              <div class="pre-avatar square"><img class="old-image" :src="oldImg||defaultAvatar"/></div>
            </div>
          </li>
        </ul>
      </div>
      <div class="image-box">
        <div class="image-box-inner">
          <div class="thumb-box" v-show="!cropperImageSrc"></div>
          <img id="cropperImage" :src="cropperImageSrc">
        </div>
        <div class="image-actions">
          <div class="pull-left">
            <i class="el-icon-circle-plus btn-zoom" @click="handleZoom(0.1)"></i>
            <i class="el-icon-remove btn-zoom" @click="handleZoom(-0.1)"></i>
          </div>
          <div class="pull-right">
            <el-button type="default" size="mini" @click="handleSelectImage">上传</el-button>
            <el-button type="primary" size="mini" @click="handleCrop" style="margin-left:0px;">确定</el-button>
            <input ref="inputer" type="file" name="file" accept="image/jpg,image/jpeg,image/png"
                   style="opacity: 0;display: none;" @change="handleChange">
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
  import defaultAvatar from '@/assets/avatars/default.png'
  import Cropper from 'cropperjs'
  import 'cropperjs/dist/cropper.min.css'

  export default {
    data () {
      return {
        dialogVisible: this.show,
        defaultAvatar: defaultAvatar,
        cropper: '',
        cropperImageSrc: '',
        croppable: false // 是否可以剪裁
      }
    },
    props: {
      donecropimage: {
        type: Function,
        default: null
      },
      dialogTitle: {
        type: String,
        default: '更换头像'
      },
      oldImg: {
        type: String,
        default: ''
      },
      show: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      initCropper () {
        // 初始化这个裁剪框设置
        let that = this
        let image = document.getElementById('cropperImage')
        if (!image) {
          // 延迟500毫秒再试
          setTimeout(function () {
            let image = document.getElementById('cropperImage')
            if (image) {
              that.setCropper(image)
            }
          }, 500)
        } else {
          that.setCropper(image)
        }
      },
      setCropper (image) {
        this.cropper = new Cropper(image, {
          aspectRatio: 1,
          autoCrop: true,
          dragMode: 'move',
          background: false, // 不显示网格背景
          guides: false, // 不在剪裁框上显示虚线
          cropBoxMovable: false, // 不让移动剪裁框
          cropBoxResizable: false, // 不允许改变剪裁框的大小
          autoCropArea: 0.7, // 自动剪裁框大小（百分比）
          preview: '.pre-avatar',
          ready: () => {
            this.croppable = true
          }
        })
      },
      // 点击【上传】按钮
      handleSelectImage () {
        if (!this.cropper) {
          return
        }
        return this.$refs.inputer.click()
      },
      handleChange (ev) {
        let that = this
        // 通过DOM取文件数据
        let picfile = ev.target.files[0]
        if (that.checkFile(picfile)) {
          that.cropperImageSrc = that.getObjectURL(picfile)
          // 每次替换图片要重新得到新的url
          if (that.cropper) {
            that.cropper.replace(that.cropperImageSrc)
            that.$refs.inputer.value = null
          }
        }
      },
      checkFile (file) {
        const isPic = (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png')
        const isLt2M = file.size / 1024 / 1024 < 2
        if (!isPic) {
          this.$msgError('上传图片只能是 jpg,png,jpeg 格式!')
        }
        if (!isLt2M) {
          this.$msgError('上传图片大小不能超过 2M!')
        }
        return isPic && isLt2M
      },
      getObjectURL (file) {
        let url = null
        if (window.createObjectURL !== undefined) { // basic
          url = window.createObjectURL(file)
        } else if (window.URL !== undefined) { // mozilla(firefox)
          url = window.URL.createObjectURL(file)
        } else if (window.webkitURL !== undefined) { // webkit or chrome
          url = window.webkitURL.createObjectURL(file)
        }
        return url
      },
      handleZoom (ratio) {
        if (this.cropper && this.cropperImageSrc && this.croppable) {
          this.cropper.zoom(ratio)
        }
      },
      // 确定剪裁图片
      handleCrop () {
        if (!this.croppable) {
          return
        }
        // 剪裁
        let croppedCanvas = this.cropper.getCroppedCanvas()
        let base64Image = croppedCanvas.toDataURL() // base64编码格式
        // 触发事件执行父组件方法
        if (this.donecropimage) {
          this.donecropimage(base64Image)
        }
      }
    },
    watch: {
      show: function (val) {
        this.dialogVisible = val
      },
      dialogVisible (val) {
        if (!val) {
          this.$emit('update:show', false)
        } else if (!this.cropper) {
          // 初始化cropper
          this.initCropper()
        }
      }
    }
  }
</script>

<style scoped lang="less">
  .avatar-content {
    display: flex;

    .preview-box {
      width: 180px;
      display: flex;
      flex-direction: column;
      text-align: center;

      ul li {
        margin-top: 25px;
      }
    }

    .pre-avatar {
      margin: 0px auto;
      overflow: hidden;
      width: 100px;
      height: 100px;
    }

    .pre-avatar .old-image {
      width: 100px;
      height: 100px;
    }

    .pre-avatar.circle {
      border-radius: 100%;
    }

    .image-box {
      width: 350px;
      height: 380px;
    }

    .image-box-inner {
      position: relative;
      height: 350px;
      width: 350px;
      border: 1px solid #aaa;
      background: #fff;
      overflow: hidden;
      background-repeat: no-repeat;
      cursor: move;
    }

    .image-box-inner .thumb-box {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 200px;
      height: 200px;
      margin-top: -100px;
      margin-left: -100px;
      border: 1px solid #39f;
      -webkit-box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.5);
      box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.5);
      background: none repeat scroll 0% 0% transparent;
    }

    .image-actions {
      padding-top: 5px;

      .btn-zoom {
        font-size: 1.5em;
      }
      .btn-zoom:hover {
        font-size: 1.6em;
      }
    }
  }
</style>
