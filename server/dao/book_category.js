/**
 * Created by jerry on 2018/6/6.
 */

const base = require('./base');
const tableName = 'book_category';
const dao = {};

dao.findById = async function (id) {
  return await base.findById(tableName, id);
};

dao.add = async function (data) {
  let fields = {
    id: data.id,
    cid: data.cid
  };
  return await base.insert(tableName, fields);
};

dao.update = async function (id, data) {
  return await base.updateById(tableName, id, data);
};

dao.deleteById = async function (id) {
  return await base.deleteById(tableName, id);
};

dao.save = async function (id, cid) {
  let item = await this.findById(id);
  if (item) {
    return await this.update(id, {cid: cid});
  } else {
    return await this.add({id: id, cid: cid});
  }
};

dao.findByCid = async function (cid) {
  return await base.findByKey(tableName, 'cid', cid, '*');
};

module.exports = dao;
