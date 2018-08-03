<template>
  <div class="page-wrapper page-wrapper--picture">

    <!--搜索栏-->
    <div class="page-search">
      <el-form :inline="true" label-width="0px">
        <el-form-item label="" label-width="0px">
          <el-input v-model="tag"
                    placeholder="请输入标签"
                    :trigger-on-focus="false"
                    @keydown.enter.stop.native="handleSearch($event)">
            <el-button type="warn" slot="append" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          </el-input>
        </el-form-item>
        <el-form-item class="pull-right">
          <router-link :to="{ path: '/picture/add' }">
            <el-button type="default" icon="el-icon-plus">新增图片</el-button>
          </router-link>
        </el-form-item>
      </el-form>
    </div>

    <div class="page-main" v-loading="loading" element-loading-text="数据请求中">
      <div class="picture-container" id="pictureContainer">
        <ul class="picture-list">
          <li v-for="(pic,index) in dataList" v-bind:key="pic.id"
              class="picture-item" @mouseover="showPictureMenu(index,true)" @mouseout="showPictureMenu(index,false)">
            <div class="picture-item__main">
              <a @click="handleToDetail(pic.id)" :style='[{height: [pic.hgt+"px"],width:[pic.wth+"px"]}]'
                 style="display: block;">
                <img :id="'pic_'+pic.id" :src="pic.fullUrl"
                     :style='[{height: [pic.hgt+"px"],width:[pic.wth+"px"],backgroundColor: pic.bgColor}]'>
              </a>
            </div>
            <transition name="el-zoom-in-bottom">
              <!--图片的信息版 鼠标经过显示-->
              <div v-show="pic.show" class="transition-box info-board" :title="pic.tag" style="display: none;">
                <p class="info-text info-text__tag"><strong>{{pic.tag}}</strong></p>
                <a class="info-text info-text__size">{{pic.width}} X {{pic.height}}</a>
                <span class="info-opbox">
                      <i v-if="AuthPictureDelete" class="iconfont icon-sc"
                         v-on:click="handleDelete(pic.id,index)" title="删除"></i>
                      <a :href="downloadBaseUrl + '?filename=' + pic.url" style="color:#fff;">
                        <i class="iconfont icon-icon46" title="下载"></i>
                      </a>
                  </span>
              </div>
            </transition>
          </li>
        </ul>
        <div class="loadmore--bottom" v-show="moreLoadShow">
          <el-button :loading="moreLoading" @click="handleLoadMore">
            <span>{{moreLoadText}}</span>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import {DOWNLOADURL} from '../../api/base'
  import {bus} from '../../bus.js'
  import {mapState, mapActions} from 'vuex'
  import TYPE from '@/store/mutation-types'

  export default{
    data () {
      return {
        pictureContainerWidth: 0,
        menuWidth: 180,
        dataList: [],
        downloadBaseUrl: DOWNLOADURL,

        moreLoadShow: false,
        moreLoading: false,
        moreLoadText: '点击加载更多'
      }
    },
    computed: {
      ...mapState(['loading']),
      ...mapState({
        total: state => state.picture.total,
        offset: state => state.picture.offset,
        limit: state => state.picture.limit
      }),
      tag: {
        get () {
          return this.$store.state.picture.tag
        },
        set (value) {
          this.$store.commit('picture/updateItem', {tag: value})
        }
      },
      AuthPictureDelete: function () {
        return this.isPermission('AuthPictureDelete')
      }
    },
    created () {
      bus.$on('setMenuCollapse', (menuWidth) => {
//        console.log('picture_list:setMenuCollapse', menuWidth);
        this.menuWidth = menuWidth
        this.changePictureLayout(menuWidth)
      })

      bus.$on('resizeWindowLayout', (w, h) => {
//        console.log('picture_list:resized,' + w);
        if (w !== this.pictureContainerWidth) {
          this.changePictureLayout()
        }
      })
    },
    methods: {
      ...mapActions('picture', ['findGrid', 'delete']),
      handleSearch (ev) {
        this.dataList = []
        this.$store.commit('picture/updateItem', {offset: 0})
        this.search()
        if (ev) {
          ev.preventDefault()
          ev.stopPropagation()
        }
      },
      search: async function () {
        try {
          this.$store.commit(TYPE.setLoading, true)
          let result = await this.findGrid()
          this.$store.commit(TYPE.setLoading, false)
          if (result && result.errcode === 0) {
            _.forEach(result.data.items, (item) => {
              item.hgt = 200
              item.wth = 'auto'
              item.bgColor = this.getOneRandomColor()
              item.show = false
            })
            this.resetGrid(result.data.items)
          }
        } catch (error) {
          console.log(error)
          this.$store.commit(TYPE.setLoading, false)
          this.$msgError('请求出现异常')
        }
      },
      resetGrid (d) {
        let elPictureContainer = document.getElementById('pictureContainer')
        if (!elPictureContainer) {
          return
        }
        this.pictureContainerWidth = elPictureContainer.offsetWidth - 20
//       console.log(this.pictureContainerWidth)
        let that = this
        let sumRatio = 0
        let indexArr = []
        let minRatio = that.pictureContainerWidth / 200
        _.forEach(d, function (item, index) {
          d[index].hgt = 200
          if (sumRatio > minRatio) {
            let h = Math.floor((that.pictureContainerWidth - indexArr.length * 10) / sumRatio)
            indexArr.forEach(function (v) {
              d[v].hgt = h
              d[v].wth = Math.round(h * d[v].width / d[v].height)
            })
            sumRatio = 0
            sumRatio += parseFloat(item.width / item.height)
            indexArr = [index]
          } else {
            sumRatio += parseFloat(item.width / item.height)
            indexArr.push(index)
          }
        })
        if (d.length === that.limit && that.offset + d.length < that.total && indexArr.length) {
          d.splice(indexArr[0], indexArr.length)
        } else if (indexArr && indexArr.length > 0) {
          indexArr.forEach(function (v) {
            d[v].wth = Math.round(200 * d[v].width / d[v].height)
          })
        }
        this.dataList = _.concat(this.dataList, d)
        this.$store.commit('picture/updateItem', {offset: this.dataList.length})
        that.moreLoading = false
        that.moreLoadText = '点击加载更多'
        that.moreLoadShow = that.offset < that.total
      },
      changePictureLayout (menuWidth) {
        if (this.dataList.length === 0) {
          return
        }
        let elPictureContainer = document.getElementById('pictureContainer')
        if (elPictureContainer) {
          if (menuWidth && menuWidth > 100) {
            this.pictureContainerWidth = elPictureContainer.offsetWidth - 120
          } else if (menuWidth && menuWidth < 100) {
            this.pictureContainerWidth = elPictureContainer.offsetWidth + 120
          } else {
            this.pictureContainerWidth = elPictureContainer.offsetWidth
          }

          let that = this
          let sumRatio = 0
          let indexArr = []
          let minRatio = that.pictureContainerWidth / 200
//        console.log(this.pictureContainerWidth)
          _.forEach(this.dataList, function (item, index) {
            that.dataList[index].hgt = 200
            if (sumRatio > minRatio) {
              let h = Math.floor((that.pictureContainerWidth - indexArr.length * 10) / sumRatio)
              indexArr.forEach(function (v) {
                that.dataList[v].hgt = h
                that.dataList[v].wth = Math.round(h * that.dataList[v].width / that.dataList[v].height)
              })
              sumRatio = 0
              sumRatio += parseFloat(item.width / item.height)
              indexArr = [index]
            } else {
              sumRatio += parseFloat(item.width / item.height)
              indexArr.push(index)
            }
          })
          if (indexArr && indexArr.length > 0) {
            indexArr.forEach(function (v) {
              that.dataList[v].hgt = 180
              that.dataList[v].wth = Math.round(180 * that.dataList[v].width / that.dataList[v].height)
            })
          }
        }
      },
      getOneRandomColor () {
        return _.sample(['#94B2BF', '#F8F8FF', '#9370DB', '#FFE4E1', '#87CEFA'])
      },
      showPictureMenu (index, status) {
        this.dataList[index].show = status
      },
      handleToDetail (id) {
        this.$store.commit('picture/updateItem', {dataArr: this.dataList})
        this.$router.push({path: `/picture/detail/${id}`})
      },
      handleLoadMore () {
        if (this.offset < this.total && !this.moreLoading) {
          this.moreLoading = true
          this.moreLoadText = '拼命加载中...'
          this.search()
        }
      },
      handleDelete: async function (id, index) {
        try {
          await this.$confirm('确定删除该图片吗？', '系统提示', {type: 'warning'})
        } catch (cancel) {
          return // 取消就不继续处理
        }
        try {
          // 确认后继续
          this.$store.commit(TYPE.setLoading, true)
          let result = await this.delete(id)
          this.$store.commit(TYPE.setLoading, false)
          if (result.errcode === 0) {
            this.dataList.splice(index, 1)
            this.changePictureLayout(this.menuWidth)
          } else {
            this.$msgError(result.errmsg)
          }
        } catch (error) {
          console.log(error)
          this.$store.commit(TYPE.setLoading, false)
          this.$msgError('请求出现异常')
        }
      },
      goAnchor (selector) {
        // 跳转到指定锚点
        if (selector) {
          let anchor = this.$el.querySelector(selector)
          if (anchor) {
            anchor.scrollIntoView(true)
          }
        }
      }
    },
    mounted () {
      this.pictureContainerWidth = document.getElementById('pictureContainer').offsetWidth
      let dataArr = this.$store.state.picture.dataArr
      if (dataArr) {
        this.dataList = dataArr
        this.$store.commit('picture/updateItem', {dataArr: null})
        this.$nextTick(function () {
          this.goAnchor(this.$route.hash)
        })
      } else {
        this.handleSearch()
      }
    },
    destroyed: function () {
      // 解决多次触发的问题
      bus.$off('setMenuCollapse')
      bus.$off('resizeWindowLayout')
    }
  }
</script>
<style scoped lang="less">
  .page-wrapper--picture {
    .page-main {

      .picture-container {
        padding-left: 2px;
        width: 100%;
        min-width: 500px;
      }

      ul.picture-list {
        padding-left: 0px;
        padding-right: 0px;
        display: inline-block;
        position: relative;
      }

      /*每个图片项*/
      li.picture-item {
        list-style-type: none;
        float: left;
        margin-bottom: 5px;
        margin-right: 5px;
        position: relative;
        z-index: 1;
        overflow: hidden;
      }

      .info-board {
        position: absolute;
        width: 100%;
        height: 50px;
        z-index: 3;
        left: 0;
        bottom: 0;
        overflow: hidden;
        /*background: orange;*/
        background: url('../../assets/images/shadow.png') repeat-x;
        background: transparent \9;
        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=#7F000000, endColorstr=#7F000000);

        .info-text {
          text-decoration: none;
          height: 20px;
          font-size: 12px;
          line-height: 20px;
          color: rgb(255, 255, 255);
          text-shadow: rgb(0, 0, 0) 1px 1px;
          margin: 4px 12px 0;
        }
      }

      .info-text__tag {
        word-break: break-all;
        text-overflow: ellipsis;
        display: -webkit-box; /** 对象作为伸缩盒子模型显示 **/
        -webkit-box-orient: vertical; /** 设置或检索伸缩盒对象的子元素的排列方式 **/
        -webkit-line-clamp: 1; /** 显示的行数 **/
        overflow: hidden; /** 隐藏超出的内容 **/
        margin-top: 10px;
        margin-bottom: 10px;
        font-size: 13px;
        min-height: 20px;
      }

      .info-text__size {
        margin-top: 0px;
        color: rgba(255, 255, 255, .6);
      }

      .info-opbox {
        position: absolute;
        width: 60px;
        right: 0px;
        text-align: right;
        float: right;
        color: white;
        padding-right: 5px;
        margin-top: 0px;
        margin-bottom: 5px;
      }

      .info-opbox:hover {
        cursor: pointer;
      }

      .loadmore--bottom .el-button {
        width: 98%;
        border-radius: 0px;
        border-style: dashed;
        padding-top: 10px;
        padding-bottom: 10px;
      }
    }
  }
</style>
