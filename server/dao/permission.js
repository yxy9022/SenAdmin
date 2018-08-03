/**
 * Created by jerry on 2018/5/3.
 */
const base = require('./base');
const utils = require('../tools/utils');
const tableName = 'permission';
const dao = {};

dao.findAllForSelect = async function (id) {
  return await base.findAll(tableName, '`id`,`code`,`name`,`group`');
};

dao.findList = async function (sname, page, limit) {
  sname = utils.trimSqlchar(sname);
  const where = `where name like '%${sname}%' or code like '%${sname}%'`;
  const sorts = 'order by `group`,name';
  return await base.findList(tableName, null, where, sorts, page, limit);
};

dao.findById = async function (id) {
  return await base.findById(tableName, id);
};

dao.add = async function (data) {
  let fields = {
    group: data.group,
    code: data.code,
    name: data.name,
    description: data.description,
    srvauth: data.srvauth
  };
  return await base.insert(tableName, fields);
};

dao.update = async function (id, data) {
  return await base.updateById(tableName, id, data);
};

dao.deleteById = async function (id) {
  return await base.deleteById(tableName, id);
};

module.exports = dao;
