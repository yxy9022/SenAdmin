/**
 * Created by jerry on 2018/7/16.
 * 图片处理中间逻辑
 */
const imageMiddleware = {};

// 设置图片获取时缺省的类型
imageMiddleware.setImageTypeDefault = function (req, res, next) {
  req.query.imgt = 'image';
  next();
};

// 设置图片获取时类型是头像
imageMiddleware.setImageTypeAvatar = function (req, res, next) {
  req.query.imgt = 'avatar';
  next();
};

module.exports = imageMiddleware;
