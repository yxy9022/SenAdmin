<template>
  <div class="page-wrapper page-wrapper--picture">
    <!--导航区-->
    <div class="page-breadcrumb">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/picture/list' }">图库</el-breadcrumb-item>
        <el-breadcrumb-item>查看图片</el-breadcrumb-item>
      </el-breadcrumb>
      <!--返回按钮-->
      <div class="button-back">
        <router-link :to="{ path:'/picture/list#pic_'+id}">
          <el-button type="default" size="mini">返回</el-button>
        </router-link>
      </div>
    </div>

    <div class="page-main" v-loading="loading" element-loading-text="数据请求中">
      <div class="main-container" :style="{height: containerHeight +'px'}">
        <div class="main-container__inner">
          <!--图片区域-->
          <div class="album-box" :style="{height: (containerHeight-38) +'px'}">
            <div id="imgBoxIn" class="img-box" style="height: 100%;width: 100%;">
              <img @mousedown.prevent="handleDrag($event)" id="currentImg" :src="imgInfo.fullUrl"
                   width="100%" height="100%" style="top: 0px; left: 0px; height: 100px; cursor: pointer;"
                   v-bind:style="stylePictureShow">
            </div>
          </div>
          <!--底部工具栏-->
          <div class="tool-box" style="width: 100%;">
            <div class="tool-bar">
              <span class="bar-btn" id="btnZoomIn" @click="handleZoomIn()">
                <span class="b-before"></span><i></i>
              </span>
              <label>{{zoomScale}}%</label>
              <span class="bar-btn" id="btnZoomOut" @click="handleZoomOut()">
                  <i></i>
              </span>
              <a class="bar-btn btn-imgtoggle" :title="toggleImgText" @click="toggleShowPicture">
                <span class="b-before"></span>{{toggleImgText}}<i></i>
              </a>
              <a class="bar-btn bar-btn--download" :href="downloadBaseUrl + '?filename=' + imgInfo.url">
                <span class="b-before"></span><i title="下载"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="right-sider" :style="{height: containerHeight +'px'}">
        <div class="info-card">
          <el-col :span="24" class="info-title">
            <span>图片信息</span>
            <span class="edit-box" v-if="AuthPictureEdit">
              <el-button type="text" icon="el-icon-edit" size="small" @click="handleEdit">编辑</el-button>
            </span>
          </el-col>
          <div class="info-tagbox">
            <el-tag class="tag" type="success" :key="tag" v-for="tag in pictureTags">{{tag}}</el-tag>
          </div>
          <div class="info-probox">
            <span>图片尺寸：{{pictureWidthAndHeight(imgInfo.width, imgInfo.height)}}</span><br/>
            <span>大小：{{pictureSize(imgInfo.size)}} </span><br/>
            <span>日期：{{formatDate(imgInfo.createdAt)}} </span>
          </div>
        </div>
      </div>
    </div>

    <el-dialog class="dialog-tag" title="编辑图片标签" :visible.sync="dialogVisible" width="40%">
      <span>
        <tag-box ref="pictureTagBox" :max-num="12" :tags="editTags"></tag-box>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleUpdate">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>
<script>
  import {DOWNLOADURL} from '../../api/base'
  import {bus} from '../../bus.js'
  import {mapState, mapActions} from 'vuex'
  import TYPE from '@/store/mutation-types'
  import {formatSize, timestampToTime} from '../../tools/utils.js'
  import TagBox from '../../components/TagBox'

  export default{
    components: {
      TagBox
    },
    created () {
      bus.$on('resizeWindowLayout', (w, h) => {
//        console.log('picture_detail:' + h);
        if (h > 300) {
          this.containerHeight = h + 18
        }
        if (this.resizeEnable) {
          this.showSuitSize()
        }
      })

      // 初始化容器高度
      let h = document.documentElement.clientHeight - 97
      if (h > 300) {
        this.containerHeight = h
      }
    },
    data () {
      return {
        downloadBaseUrl: DOWNLOADURL,
        dialogVisible: false,
        editTags: [],

        id: '',
        // 图片的原始信息
        imgInfo: {
          id: '',
          width: 0,
          height: 0,
          size: 0,
          ext: '',
          tag: '',
          url: '',
          fullUrl: '',
          createdAt: ''
        },
        containerHeight: 300, // 容器高度
        realHeight: '',
        realWidth: '',
        resizeEnable: true, // 图片显示是否跟随窗体大小变化
        stylePictureShow: '',
        toggleImgText: '原始尺寸',
        zoomScale: 100,
        zoomInGroup: [10, 12, 15, 19, 24, 30, 37, 45, 54, 64, 75, 87, 100, 114, 129, 145, 162, 180, 196, 200],
        zoomOutGroup: [200, 190, 178, 160, 152, 140, 132, 121, 110, 102, 94, 82, 72, 60, 52, 33, 26, 20, 16, 13, 10]
      }
    },
    computed: {
      ...mapState(['loading']),
      pictureTags: function () {
        if (this.imgInfo.tag) {
          return this.imgInfo.tag.split(',')
        }
        return []
      },
      AuthPictureEdit: function () {
        return this.isPermission('AuthPictureEdit')
      }
    },
    methods: {
      ...mapActions('picture', ['findById', 'update']),
      loadData: async function (id) {
        try {
          this.$store.commit(TYPE.setLoading, true)
          let result = await this.findById(id)
          this.$store.commit(TYPE.setLoading, false)
          if (result && result.errcode === 0) {
            this.imgInfo.id = result.data.id
            this.imgInfo.width = result.data.width
            this.imgInfo.height = result.data.height
            this.imgInfo.size = result.data.size
            this.imgInfo.ext = result.data.ext
            this.imgInfo.tag = result.data.tag
            this.imgInfo.url = result.data.url
            this.imgInfo.fullUrl = result.data.fullUrl || ''
            this.imgInfo.createdAt = result.data.created_at

            this.editTags = result.data.tag ? result.data.tag.split(',') : []

            // TODO 有的图片太大,直接加载会比较慢,所以可以在这里判断加载一个相对较清晰的的小一点的图片
            this.realWidth = result.data.width
            this.realHeight = result.data.height

            this.$nextTick(function () {
              this.showSuitSize()
            })
          }
        } catch (error) {
          console.log(error)
          this.$store.commit(TYPE.setLoading, false)
          this.$msgError('请求出现异常')
        }
      },
      handleZoomIn () {
        // 放大,最大到200%
        if (this.zoomScale < 200) {
          let that = this
          let scale = _.find(that.zoomInGroup, function (item) {
            return item > that.zoomScale
          })
          if (scale) {
            if (scale > 50) {
              this.toggleImgText = '合适尺寸'
            }
            this.showZoomInOrOut(scale)
          }
        }
      },
      handleZoomOut () {
        // 缩小，最小到10%
        if (this.zoomScale > 10) {
          let that = this
          let scale = _.find(that.zoomOutGroup, function (item) {
            return item < that.zoomScale
          })
          if (scale) {
            if (scale < 50) {
              this.toggleImgText = '原始尺寸'
            }
            this.showZoomInOrOut(scale)
          }
        }
      },
      // 放大或缩小图片显示
      showZoomInOrOut (scale) {
        if (scale >= 10 && scale <= 200 && this.zoomScale !== scale) {
          this.resizeEnable = false
          // 获取当前图片
          let currentImg = document.getElementById('currentImg')
          if (currentImg) {
            let currentImgWidth = currentImg.offsetWidth
            let currentImgHeight = currentImg.offsetHeight
            let currentImgTop = currentImg.offsetTop
            let currentImgLeft = currentImg.offsetLeft

            let x = currentImgWidth / 2 + currentImgLeft
            let y = currentImgHeight / 2 + currentImgTop

            this.zoomScale = scale
            let styleWidth = (this.realWidth * this.zoomScale / 100)
            let styleHeight = (this.realHeight * this.zoomScale / 100)

            let disTop = y - styleHeight / 2
            let disLeft = x - styleWidth / 2

            this.stylePictureShow = {
              top: disTop + 'px',
              left: disLeft + 'px',
              height: styleHeight + 'px',
              width: 'auto'
            }
          }
        }
      },
      toggleShowPicture () {
        if (this.toggleImgText === '原始尺寸') {
          this.resizeEnable = false
          this.toggleImgText = '合适尺寸'
          this.showZoomInOrOut(100)
        }
        else {
          this.resizeEnable = true
          this.toggleImgText = '原始尺寸'
          this.showSuitSize()
        }
      },
      // 以合适的尺寸显示图片
      showSuitSize () {
        let imgBoxIn = document.getElementById('imgBoxIn')
        if (imgBoxIn) {
          let imgBoxWidth = imgBoxIn.offsetWidth
          let imgBoxHeight = imgBoxIn.offsetHeight
          let disTop = 0
          let disLeft = 0
          if (this.realWidth < imgBoxWidth && this.realHeight < imgBoxHeight) {
            // 100%显示
            this.zoomScale = 100
            disTop = (imgBoxHeight - this.realHeight) / 2
            disLeft = (imgBoxWidth - this.realWidth) / 2

            this.stylePictureShow = {
              top: disTop + 'px',
              left: disLeft + 'px',
              height: this.realHeight + 'px',
              width: 'auto'
            }
          }
          else {
            // 需要缩放
            let wratio = imgBoxWidth * 100 / this.realWidth
            let hratio = imgBoxHeight * 100 / this.realHeight
            // 得到合适的缩放比例
            let ratio = wratio < hratio ? parseInt(wratio) : parseInt(hratio) // 缩放比
            this.zoomScale = ratio < 10 ? 10 : ratio // 缩放比不能小于10
            // 样式显示图片宽高
            let styleWidth = (this.realWidth * this.zoomScale / 100)
            let styleHeight = (this.realHeight * this.zoomScale / 100)
            disTop = (imgBoxHeight - styleHeight) / 2
            disLeft = (imgBoxWidth - styleWidth) / 2

            this.stylePictureShow = {
              top: disTop + 'px',
              left: disLeft + 'px',
              height: styleHeight + 'px',
              width: 'auto'
            }
          }
        }
      },
      // 图片拖动
      handleDrag (ev) {
        let that = this
        let currentImg = document.getElementById('currentImg')
        if (currentImg) {
          let disX = ev.clientX - currentImg.offsetLeft
          let disY = ev.clientY - currentImg.offsetTop
          // console.log('disX:' + disX, "disY:" + disY)
          currentImg.onmousemove = function (ev) {
            ev = ev || event
            currentImg.style.left = ev.clientX - disX + 'px'
            currentImg.style.top = ev.clientY - disY + 'px'
          }
          currentImg.onmouseup = function (ev) {
            // 鼠标左键抬起
            currentImg.onmousemove = null
            currentImg.onmouseup = null
            currentImg.onmouseleave = null
          }
          currentImg.onmouseleave = function () {
            // 鼠标超出区域
            currentImg.onmousemove = null
            currentImg.onmouseup = null
            currentImg.onmouseleave = null
          }
        }
      },
      handleEdit () {
        this.dialogVisible = true
      },
      handleUpdate: async function () {
        if (this.$refs.pictureTagBox.tagList.length === 0) {
          this.$msgWarning('至少需要一个标签')
          return
        }
        try {
          this.$store.commit(TYPE.setLoading, true)
          let params = {
            id: this.id,
            tag: this.$refs.pictureTagBox.tagList
          }
          let result = await this.update(params)
          this.$store.commit(TYPE.setLoading, false)
          if (result && result.errcode === 0) {
            this.imgInfo.tag = params.tag.join()
            this.dialogVisible = false
          }
        } catch (error) {
          console.log(error)
          this.$store.commit(TYPE.setLoading, false)
          this.$msgError('请求出现异常')
        }
      },
      pictureWidthAndHeight (wid, hgt) {
        if (wid && hgt) {
          return wid + ' * ' + hgt
        } else {
          return '未知'
        }
      },
      pictureSize (size) {
        return formatSize(size)
      },
      formatDate (dt) {
        return timestampToTime(dt)
      }
    },
    mounted () {
      let id = this.$route.params.id
      if (id) {
        this.id = id
        this.loadData(id)
      }
    }
  }
</script>
<style>
  .dialog-tag .el-dialog {
    min-width: 300px;
  }
</style>
<style scoped lang="less">
  .page-wrapper--picture {
    .page-main {

      .main-container {
        margin-right: 225px;
        padding-top: 0px;
        border-top: 1px solid #e6e6e6;
      }

      .main-container__inner {
        position: relative;
        background: #fff;
        margin-right: 2px;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      .album-box {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        /*background: green;*/

        img {
          position: absolute;
          border: 0;
        }
      }

      .img-box {
        height: 100%;
        margin: 0px;
        padding: 0px;
      }

      .tool-box {
        visibility: visible;
        position: absolute;
        bottom: 0;
        padding-top: 0;
        font-size: 14px;
        color: #666;

        .tool-bar {
          height: 36px;
          line-height: 36px;
          border-top: 1px solid #e3e3e3;
          border-bottom: 1px solid #e3e3e3;
          background: #fafafa;
          overflow: hidden;
          /*padding-right: 10px;*/
          text-align: right;
        }

        .bar-btn {
          display: inline-block;
          padding: 0 16px 0 15px;
          height: 36px;
          line-height: 36px;
          vertical-align: top;
          margin: 0;
          outline: 0;
          overflow: visible;
          background-color: #fafafa;
          position: relative;
          text-decoration: none;
          cursor: pointer;
          border: 0px;
          border-radius: 0px;
        }

        .bar-btn:hover {
          background-color: #e3e3e3;
          text-decoration: none;
        }

        .bar-btn .b-before {
          content: ".";
          display: block;
          position: absolute;
          left: -1px;
          top: 9px;
          width: 1px;
          height: 18px;
          overflow: hidden;
          background-color: #dfdfdf;
        }

        .bar-btn i {
          display: inline-block;
          vertical-align: middle;
          width: 20px;
          height: 17px;
          overflow: hidden;
          margin-left: 5px;
          background: url('../../assets/images/toolbar_ic.png') repeat-x;
        }

        .bar-btn--download i {
          margin-top: 4px;
          background-position-y: -40px;
        }

        #btnZoomOut {
          padding: 0 5px 0 0;
          background-position: 0 0;
        }

        #btnZoomOut i {
          background-position: -15px 4px;
        }

        #btnZoomIn {
          margin-left: 0;
          padding: 0;
        }

        #btnZoomIn i {
          margin-left: 9px;
          background-position: 5px 4px;
        }

        .btn-imgtoggle i {
          width: 12px;
          height: 12px;
          background-position: -40px -60px;
        }
      }

      .right-sider {
        position: fixed;
        top: 96px;
        border-bottom: 0px;
        right: 0;
        overflow-y: auto;
        min-height: 300px;
        background: #f6f6f6;
        border-radius: 0px;
        border-left: 1px solid #e3e3e3;
        width: 224px;
        *width: 224px;
      }

      .info-card {
        background-color: #fff;
        margin: 2px 4px 2px 4px;
      }

      .info-title {
        border-left: solid 5px #58B7FF;
        height: 40px;
        padding-left: 5px;

        span {
          font-weight: 800;
          font-size: 16px;
          line-height: 40px;
        }

        .edit-box {
          float: right;
          padding-right: 10px;
        }
      }
      .info-tagbox {
        padding: 10px;

        .tag {
          margin-right: 5px;
          margin-top: 3px;
        }
      }

      .info-probox {
        line-height: 20px;
        font-size: 13px;
        margin-top: 10px;
        padding-left: 5px;
        padding-bottom: 20px;
      }
    }
  }
</style>
