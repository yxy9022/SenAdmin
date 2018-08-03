/**
 * Created by jerry on 2018/4/11.
 */
import axios from 'axios'
import {bus} from '../bus.js'

axios.defaults.withCredentials = true
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';//配置请求头

// 添加一个请求拦截器
// axios.interceptors.request.use(function (config) {
//   console.dir(config);
//   return config;
// }, function (error) {
//   // Do something with request error
//   return Promise.reject(error);
// });

// 添加一个响应拦截器
axios.interceptors.response.use(function (response) {
  // console.log(response);
  if (response.data && response.data.errcode) {
    if (parseInt(response.data.errcode) === 41000) {
      // 未登录
      bus.$emit('goto', '/login')
    } else if (parseInt(response.data.errcode) === 42000) {
      // 没有权限
      bus.$emit('goto', '/noauth')
    }
  }
  return response
}, function (error) {
  return Promise.reject(error)
})

let baseURL = ''

// 通用方法
export const POST = (url, params) => {
  return axios.post(`${baseURL}${url}`, params).then(res => res.data)
}

export const GET = (url, params) => {
  return axios.get(`${baseURL}${url}`, {params: params}).then(res => res.data)
}

// 上传路径
// eg. http://127.0.0.1:8084/api/file/upload/
export const UPLOADURL = `${baseURL}/api/file/upload/`

// 下载路径,后面跟filename参数,例如, DOWNLOAD + "?filename=eeffe750-fcdc-4b1c-931b-80835efab92b.png"
export const DOWNLOADURL = `${baseURL}/api/file/download`

// pdf文件预览,例如,PDFVIEWER+'?file=PDF文件流或者不跨域的PDF文件路径'
export const PDFVIEWER = `${baseURL}/pdf/viewer.html`

// 返回指定的接口路径
export const RETURNURL = (url) => {
  return `${baseURL}${url}`
}
