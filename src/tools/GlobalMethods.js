/**
 * Created by jerry on 2018/4/12.
 * 全局方法
 */
import _ from 'lodash'

export default {

  /* eslint padded-blocks: ["error", "never"] */
  install (Vue, options) {
    // 挂则lodash到vue实例上全局使用
    Object.defineProperty(Vue.prototype, '_', {value: _})

    // 获取文件（主要是图片）的全路径
    Vue.prototype.getAvatarFullUrl = function (domain, filename) {
      if (filename && (_.startsWith(filename, 'http://') || _.startsWith(filename, 'https://'))) {
        return filename
      }
      if (!filename) {
        return ''
      }
      return domain + filename
    }

    // 判断用户是否有某个权限，code是权限编码
    Vue.prototype.isPermission = function (code) {
      return (this.$store.state.permissions === 'all') || _.some(this.$store.state.permissions, function (item) {
          return item === code
        })
    }

    // 封装的消息提示
    Vue.prototype.$msgSuccess = function (msg) {
      this.$message.success({showClose: true, message: msg || '操作成功', duration: 2000})
    }

    Vue.prototype.$msgWarning = function (msg) {
      this.$message.warning({showClose: true, message: msg || '操作失败', duration: 2000})
    }

    Vue.prototype.$msgError = function (msg) {
      this.$message.error({showClose: true, message: msg || '操作失败', duration: 2000})
    }

    Vue.prototype.$msgInfo = function (msg) {
      this.$message.info({showClose: true, message: msg, duration: 2000})
    }
  }
}
