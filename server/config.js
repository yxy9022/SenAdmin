/**
 * Created by jerry on 2018/04/10.
 * 配置文件
 */
const path = require('path');

module.exports = {
  publicPath: path.join(__dirname, 'public'),
  avatarPath: path.join(__dirname, 'upload/avatars'),
  imgPath: path.join(__dirname, 'upload/imgs'),
  tmpPath: path.join(__dirname, 'upload/tmp'),
  dbPath: path.join(__dirname, 'data', 'demo.db'),
  port: 8601,
  hostname: 'http://localhost:8084/'
};
