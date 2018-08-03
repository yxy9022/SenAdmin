<template>
  <div class="tag-box">
    <div class="tag-content">
      <el-tag v-for="(tag,index) in tagList"
              :key="index"
              :disable-transitions="false"
              closable
              @close="handleClose(index)">
        <span>{{tag}}</span>
      </el-tag>
      <el-input class="input-new-tag"
                placeholder="+"
                size="small"
                v-model="inputValue"
                @keydown.enter.stop.native="handleInputTagConfirm($event)">
      </el-input>
    </div>
    <div class="tag-tip" v-show="showTip">
      <span style="color: red;">* </span><span>{{tip}}</span>
    </div>
  </div>
</template>
<script>
  export default{
    data () {
      return {
        tagList: this.tags,
        inputValue: ''
      }
    },
    props: {
      maxNum: {
        type: Number,
        default: 10,
        validator: function (value) {
          return value > 0 && value <= 20
        }
      },
      showTip: {
        type: Boolean,
        default: true
      },
      tip: {
        type: String,
        default: '标签用回车分开，填写与图片内容相关的标签，更容易被搜索'
      },
      tags: {
        type: Array,
        default: function () {
          return []
        }
      }
    },
    methods: {
      handleClose (index) {
        this.tagList.splice(index, 1)
      },
      handleInputTagConfirm (ev) {
        let inputValue = this.inputValue
        if (inputValue) {
          inputValue = inputValue.replace(/，/g, ',').replace(/,/g, ' ').replace(/ {2}/g, '')
          let vals = inputValue.split(' ')
          for (let i = 0; i < vals.length; i++) {
            let val = _.trim(vals[i])
            if (val) {
              if (this.tagList.length < this.maxNum) {
                this.tagList.push(val)
              } else {
                this.$msgInfo('最多' + this.maxNum + '个标签')
                break
              }
            }
          }
        }
        this.inputValue = ''
        if (ev) {
          ev.preventDefault()
          ev.stopPropagation()
        }
      },
      reset () {
        this.tagList = []
        this.inputValue = ''
      }
    }
  }
</script>
<style lang="less">
  .input-new-tag {
    width: auto;
    margin-top: 2px;
    margin-bottom: 2px;

    .el-input__inner {
      border: 0px;
      padding: 0px 10px;
    }
  }
</style>
<style scoped lang="less">
  .tag-box {
    display: block;

    .tag-content {
      width: 100%;
      display: block;
      border: 1px solid #ebeef5;
      padding: 0px;
      padding-left: 2px;

      .el-tag {
        margin-top: 2px;
        margin-bottom: 2px;
        margin-right: 5px;
      }
    }

    .tag-tip {
      width: 100%;
      padding: 6px;
      font-size: 12px;
    }
  }
</style>
