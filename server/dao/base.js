/**
 * Created by jerry on 2018/4/11.
 * 通用
 */
const config = require('../config.js');
const sqlite = require('sqlite');
const dbPromise = sqlite.open(config.dbPath, {Promise});

let baseDao = {};

/**
 * 根据id获取一条记录
 * @param tableName 表名
 * @param id id
 * @param fields 要查询的字段，不填默认所有
 * @returns {Promise}
 */
baseDao.findById = async function (tableName, id, fields) {
  return await this.findByKey(tableName, 'id', id, fields);
};

/**
 * 获取数据不分页
 * @param tableName
 * @param fields
 * @param where
 * @param sorts
 * @returns {Promise.<void>}
 */
baseDao.findAll = async function (tableName, fields, where, sorts) {
  fields = fields || '*';
  where = where || '';
  sorts = sorts || '';
  let sqlQuery = _.trim(`SELECT ${fields} FROM ${tableName} ${where} ${sorts}`);
  const db = await dbPromise;
  let [items] = await Promise.all([
    db.all(sqlQuery)
  ]);

  return items;
};

/**
 * 根据某个关键字段获取一条记录
 * @param tableName 表名
 * @param keyName 关键字段
 * @param keyVal 关键字段的值
 * @param fields 要查询的字段，不填默认所有
 * @returns {Promise.<*>}
 */
baseDao.findByKey = async function (tableName, keyName, keyVal, fields) {
  fields = fields || '*';
  const db = await dbPromise;
  return await db.get(`SELECT ${fields} FROM ${tableName} WHERE ${keyName} = ?`, keyVal);
};

/**
 * 单表通分页查询
 * @param tableName 表名
 * @param fields 要查询的字段，不填默认所有
 * @param where 查询where条件
 * @param sorts 查询排序
 * @param page 页码，默认第1页
 * @param limit 每页查询记录数
 * @returns {Promise.<{page: *, limit: *, total, items}>}
 */
baseDao.findList = async function (tableName, fields, where, sorts, page, limit) {
  limit = isNaN(limit) ? 10 : parseInt(limit);
  page = isNaN(page) ? 1 : parseInt(page);
  let offset = (page - 1) * limit;
  let result = await this.findGrid(tableName, fields, where, sorts, offset, limit);
  return {
    page: page,
    limit: result.limit,
    total: result.total,
    items: result.items
  };
};

/**
 * 单表通用查询
 * @param tableName 表名
 * @param fields 要查询的字段，不填默认所有
 * @param where 查询where条件
 * @param sorts 查询排序
 * @param offset 跳过记录数
 * @param limit 每页查询记录数
 * @returns {Promise.<{page: *, limit: *, total, items}>}
 */
baseDao.findGrid = async function (tableName, fields, where, sorts, offset, limit) {
  fields = fields || '*';
  limit = isNaN(limit) ? 10 : parseInt(limit); //查询记录数
  offset = isNaN(offset) ? 0 : parseInt(offset); //跳过记录数
  where = where || '';
  sorts = sorts || '';
  let sqlQuery = _.trim(`SELECT ${fields} FROM ${tableName} ${where} ${sorts}`);
  // console.log(sqlQuery);
  const db = await dbPromise;
  let [rows, items] = await Promise.all([
    db.get(`SELECT count(1) as total FROM ${tableName} ${where}`),
    db.all(sqlQuery + ' limit ? offset ?', limit, offset)
  ]);

  return {
    offset: offset,
    limit: limit,
    total: rows.total,
    items: items
  };
};


/**
 * 根据id更新记录
 * @param tableName
 * @param id
 * @param fields
 * @returns {Promise.<*>}
 */
baseDao.updateById = async function (tableName, id, fields) {
  let placeholder = '';
  let values = [];
  for (let key in fields) {
    placeholder += `\`${key}\` = ?,`;
    values.push(fields[key]);
  }
  if (!placeholder) {
    throw 'fields no data';
  }
  placeholder += 'updated_at = datetime(\'now\',\'localtime\')';
  values.push(id);
  const db = await dbPromise;
  return await db.run(`update ${tableName} set ${placeholder} where id=?`, ...values);
};


/**
 * 根据id删除一条记录
 * @param tableName 表名
 * @param id
 * @returns {Promise.<*>}
 */
baseDao.deleteById = async function (tableName, id) {
  return await this.deleteByKey(tableName, 'id', id);
};

/**
 * 根据某个关键字段删除记录(可能有多条)
 * @param tableName 表名
 * @param keyName 关键字段
 * @param keyVal 关键字段的值
 * @returns {Promise.<*>}
 */
baseDao.deleteByKey = async function (tableName, keyName, keyVal) {
  const db = await dbPromise;
  return await db.run(`delete from ${tableName} where ${keyName}=?`, keyVal);
};

/**
 * 增加一条记录
 * @param tableName
 * @param fields
 * @returns {Promise.<Statement>}
 */
baseDao.insert = async function (tableName, fields) {
  let keys = '';
  let placeholder = '';
  let values = [];
  for (let key in fields) {
    if (fields[key]) {
      keys += '`' + key + '`,';
      placeholder += '?,';
      values.push(fields[key]);
    }
  }
  keys = _.trim(keys, ',');
  placeholder = _.trim(placeholder, ',');
  if (!keys) {
    throw 'fields no data';
  }

  const db = await dbPromise;
  // 使用？占位符方式添加防止sql注入
  return await db.run(`insert into ${tableName}(${keys}) values(${placeholder})`, ...values);
};

/**
 * 自定义sql执行语句(可用于批量添加)
 * @param sqlQuery
 * @param params
 * @returns {Promise.<Statement>}
 */
baseDao.run = async function (sqlQuery, params) {
  const db = await dbPromise;
  if (Array.isArray(params)) {
    return await db.run(sqlQuery, params);
  } else {
    return await db.run(sqlQuery);
  }
};

/**
 * 自定义sql通用查询数据集合（可用于多表联合等复杂查询）
 * @param sqlQuery
 * @param params
 * @returns {Promise.<Statement>}
 */
baseDao.query = async function (sqlQuery, params) {
  const db = await dbPromise;
  let [items] = await Promise.all([
    db.all(sqlQuery, params)
  ]);
  return items;
};

/**
 * 自定义sql通用查询单条数据（可用于多表联合等复杂查询）
 * @param sqlQuery
 * @param params
 * @returns {Promise<Promise<any>|Promise<T>>}
 */
baseDao.get = async function (sqlQuery, params) {
  const db = await dbPromise;
  if (Array.isArray(params)) {
    return await db.get(sqlQuery, params);
  } else {
    return await db.get(sqlQuery);
  }
};

module.exports = baseDao;
