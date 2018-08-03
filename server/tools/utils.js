/**
 * Created by jerry on 2018/4/10.
 * 工具模块
 */
const crypto = require('crypto');
const _ = require('lodash');
const saltArr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '='];

const utils = {};

/**
 * MD5签名
 */
utils.md5 = function (str) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(str);
  str = md5sum.digest('hex');
  return str;
};

utils.trimSqlchar = function (str) {
  if (str) {
    str = str.replace(/[%'"]*/g, '');
  }
  return str || '';
};


//随机salt值
//n 长度，默认5
utils.randomSalt = function (n) {
  if (isNaN(n) || parseInt(n) <= 0) {
    n = 5;
  }
  return _.sampleSize(saltArr, parseInt(n)).join('');
};

/**
 * 判断是不是正数
 * @param val
 * @returns {boolean}
 */
utils.isPositive = function (val) {
  return /^[1-9][0-9]*$/.test(val);
};

module.exports = utils;

