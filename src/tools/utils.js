/**
 * Created by jerry on 2018/7/18.
 */

/**
 * 数字左边补零(不传总长度，默认两位)
 * @param num 数字
 * @param len 总长度
 * @returns {string}
 */
const padLeftZero = function (num, len) {
  if (len) {
    for (let i = 1; i < len; i++) {
      num = '0' + num
    }
    return num.slice(-len)
  }
  return ('00' + num).slice(-2)
}

const formatDuration = function (duration) {
  if (!isNaN(duration) && duration > 0) {
    duration = parseInt(duration)
    if (duration < 60) {
      return '00:' + padLeftZero(duration)
    } else if (duration < 3600) {
      return padLeftZero(parseInt(duration / 60)) + ':' + padLeftZero(duration % 60)
    } else if (duration < 24 * 3600) {
      let h = parseInt(duration / 3600)
      let s = duration % 3600
      return padLeftZero(h) + ':' + padLeftZero(parseInt(s / 60)) + ':' + padLeftZero(s % 60)
    } else {
      return '超过1天'
    }
  } else {
    return '未知'
  }
}

const formatSize = function (size) {
  if (!isNaN(size) && size > 0) {
    if (size < 1024) {
      return size + 'byte'
    } else if (size < 1048576) {
      return (size / 1024).toFixed(1) + 'K'
    } else if (size < 1073741824) {
      return (size / 1024 / 1024).toFixed(1) + 'M'
    } else if (size < 1099511627776) {
      return (size / 1024 / 1024 / 1024).toFixed(1) + 'G'
    } else {
      return '超过1T'
    }
  } else {
    return '未知'
  }
}
//  将时间戳转换成日期格式
// console.log(timestampToTime(1514844303));//2018-01-02 06:05:03
const timestampToTime = function (timestamp) {
  if (timestamp < 1000000000000) {
    timestamp = timestamp * 1000 // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
  }
  const date = new Date(timestamp)
  const Y = date.getFullYear() + '-'
  const M = padLeftZero(date.getMonth() + 1) + '-'
  const D = padLeftZero(date.getDate()) + ' '
  const h = padLeftZero(date.getHours()) + ':'
  const m = padLeftZero(date.getMinutes()) + ':'
  const s = padLeftZero(date.getSeconds())
  return Y + M + D + h + m + s
}

export {
  padLeftZero,
  formatDuration,
  formatSize,
  timestampToTime
}
