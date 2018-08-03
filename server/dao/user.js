/**
 * Created by jerry on 2018/4/10.
 * 用户表操作
 */
const base = require('./base');
const utils = require('../tools/utils');
const tableName = 'user';
const dao = {};

dao.findById = async function (id, isAll) {
  let user = await base.findById(tableName, id);
  if (user && user.id && !isAll) {
    //剔除用户敏感信息
    delete user.passwd;
    delete user.salt;
  }
  return user;
};

dao.findByUserName = async function (username) {
  return await base.findByKey(tableName, 'username', username);
};

dao.findList = async function (sname, page, limit) {
  sname = utils.trimSqlchar(sname);
  let where = `where username like '%${sname}%' or nickname like '%${sname}%' or email like '%${sname}%' or mobile like '%${sname}%'`;
  let sorts = 'order by role,username';
  let fields = 'id,nickname,username,email,mobile,role,created_at,updated_at';
  return await base.findList(tableName, fields, where, sorts, page, limit);
};

dao.add = async function (user) {
  let salt = utils.randomSalt();
  let fields = {
    nickname: user.nickname,
    username: user.username,
    email: user.email,
    mobile: user.mobile,
    passwd: utils.md5('demo@' + user.username + salt),
    salt: salt
  };
  return await base.insert(tableName, fields);
};

dao.update = async function (id, data) {
  return await base.updateById(tableName, id, data);
};

dao.updateAvatar = async function (id, avatarUrl) {
  let fields = {
    avatar_url: avatarUrl
  };
  return await base.updateById(tableName, id, fields);
};

dao.deleteById = async function (id) {
  return await base.deleteById(tableName, id);
};

module.exports = dao;
