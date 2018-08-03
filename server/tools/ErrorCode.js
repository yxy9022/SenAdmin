/**
 * Created by jerry on 2018/4/10.
 * 错误码
 */
module.exports = {
  BUSY: {errcode: -1, errmsg: '系统繁忙'},
  OK: {errcode: 0, errmsg: '请求成功'},
  FAILED: {errcode: 1, errmsg: '请求失败'},

  INVALID_PARA: {errcode: 40001, errmsg: '不合法的参数'},
  NO_USER: {errcode: 40011, errmsg: '用户不存在'},
  PASSWORD_ERROR: {errcode: 40012, errmsg: '密码错误'},
  NO_LOGIN: {errcode: 41000, errmsg: '请先登录'},
  NO_AUTH: {errcode: 42000, errmsg: '没有权限'},

  SERVER_ERROR: {errcode: 50001, errmsg: '服务端错误'},

  CUSTOM_ERROR: function (errmsg) {
    return {
      errcode: 49000,
      errmsg: errmsg || '服务端错误'
    };
  }
};
