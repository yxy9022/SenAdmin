const base = require('./base');
const tableName = 'user_permission';
const utils = require('../tools/utils');
const ErrorCode = require('../tools/ErrorCode');
const dao = {};

/**
 * 获取用户权限
 * @param id 用户id
 * @returns {Promise}
 */
dao.findPermissionsById = async function (id) {
  let sqlQuery = `select a.code,a.srvauth from permission a inner join user_permission b on a.code = b.code where b.uid = ${id}`;
  return await base.query(sqlQuery);
};

/**
 * 保存权限
 * @param uid
 * @param codes
 * @returns {Promise.<boolean>}
 */
dao.saveAuth = async function (uid, codes) {
  codes = utils.trimSqlchar(codes);
  uid = parseInt(uid);
  //批量删除
  await base.deleteByKey(tableName, 'uid', uid);
  if (!codes) {
    return ErrorCode.OK;
  }
  //批量添加
  let sqlQuery = 'insert into user_permission(`uid`,`code`)';
  let codesArr = codes.split(',');
  for (let i = 0; i < codesArr.length; i++) {
    sqlQuery += ((i === 0) ? ` select ${uid},?` : ` union all select ${uid},?`);
  }
  await base.run(sqlQuery, codesArr);
  return ErrorCode.OK;
};

module.exports = dao;
