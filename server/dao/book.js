/**
 * Created by jerry on 2018/5/30.
 */

const base = require('./base');
const utils = require('../tools/utils');
const tableName = 'book';
const dao = {};

dao.findList = async function (sname, page, limit) {
  sname = utils.trimSqlchar(sname);
  let where = `where name like '%${sname}%'`;
  let sorts = 'order by name';
  return await base.findList(tableName, null, where, sorts, page, limit);
};

dao.findById = async function (id, hasCategory) {
  if (hasCategory) {
    let sqlQuery = `select a.*,c.id as cid,c.name as cname from book a 
    left join book_category b on a.id = b.id 
    left join category c on b.cid = c.id 
    where a.id = ${id}`;
    return await base.get(sqlQuery, null);
  } else {
    return await base.findById(tableName, id);
  }

};

dao.add = async function (data) {
  let fields = {
    name: data.name,
    summary: data.summary,
    translator: data.translator,
    author: data.author,
    publisher: data.publisher,
    publish_at: data.publish_at,
    isbn: data.isbn
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
