/**
 * Created by jerry on 2018/6/5.
 */

const base = require('./base');
const utils = require('../tools/utils');
const tableName = 'category';
const dao = {};

dao.findAllForSelect = async function (id) {
  return await base.findAll(tableName, '`id`,`name`');
};

dao.findList = async function (sname, page, limit) {
  sname = utils.trimSqlchar(sname);
  let where = `where name like '%${sname}%'`;
  let sorts = 'order by name';
  return await base.findList(tableName, null, where, sorts, page, limit);
};

dao.findById = async function (id) {
  return await base.findById(tableName, id);
};

dao.add = async function (data) {
  let fields = {
    name: data.name,
    description: data.description
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
