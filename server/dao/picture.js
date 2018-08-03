/**
 * Created by jerry on 2018/7/12.
 */
const base = require('./base');
const utils = require('../tools/utils');
const tableName = 'picture';
const ErrorCode = require('../tools/ErrorCode');
const dao = {};

dao.findGrid = async function (tag, skip, limit) {
  tag = utils.trimSqlchar(tag).replace(/ /g, ',').replace(/,,/g, ',');
  tag = _.compact(tag.split(','));
  let where = '';
  if (tag && tag.length) {
    where = 'where ';
    _.forEach(tag, function (item) {
      where += `tag like '%${item}%'`;
    });
  }
  console.log(where);
  let sorts = 'order by updated_at';
  return await base.findGrid(tableName, null, where, sorts, skip, limit);
};

dao.findById = async function (id) {
  return await base.findById(tableName, id);
};

dao.add = async function (pictures, tag) {
  if (Array.isArray(tag)) {
    tag = tag.join(',');
  }
  // 去特殊字符
  tag = utils.trimSqlchar(tag);
  // 批量添加
  let paramsArr = [];
  let sqlQuery = 'insert into picture(`url`,`content_type`,`ext`,`size`,`width`,`height`,`tag`)';
  _.forEach(pictures, function (item, i) {
    sqlQuery += ((i === 0) ? ' select ?,?,?,?,?,?,?' : ' union all select ?,?,?,?,?,?,?');
    paramsArr.push(item.url);
    paramsArr.push(item.contentType);
    paramsArr.push(item.ext);
    paramsArr.push(item.size);
    paramsArr.push(item.width);
    paramsArr.push(item.height);
    paramsArr.push(tag);
  });
  await base.run(sqlQuery, paramsArr);
  return ErrorCode.OK;
};

dao.update = async function (id, data) {
  return await base.updateById(tableName, id, data);
};

dao.deleteById = async function (id) {
  return await base.deleteById(tableName, id);
};

module.exports = dao;
