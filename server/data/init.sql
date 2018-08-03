-- 用户表
CREATE TABLE xuser (
    id         INTEGER   PRIMARY KEY
                         NOT NULL
                         UNIQUE,
    nickname   TEXT,               -- 昵称
    username   TEXT      NOT NULL  -- 用户名
                         UNIQUE,
    email      TEXT      UNIQUE, -- 邮箱
    mobile     TEXT      UNIQUE, -- 手机号
    avatar_url TEXT,             -- 头像url
    passwd     TEXT      NOT NULL, -- 密码
    salt       TEXT,               -- 密码盐值
    role       INTEGER   NOT NULL  -- 角色： 1 内置超级管理员admin(不可删除) 2 内置管理员demo(不可删除) 3 普通用户
                         DEFAULT (3),
    created_at TIMESTAMP NOT NULL
                         DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 权限表
CREATE TABLE permission (
    id          INTEGER   PRIMARY KEY
                          NOT NULL
                          UNIQUE,
    [group]     TEXT,             -- 权限组
    code        TEXT      NOT NULL, -- 权限编码(唯一)
    name        TEXT      NOT NULL, -- 权限名称
    description TEXT,             -- 权限描述
    srvauth     TEXT      NOT NULL, -- 对应后端权限路由（多路由用逗号分割）
    created_at  TIMESTAMP NOT NULL
                          DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP,
    UNIQUE (
        code
    )
);

-- 用户权限关联表
CREATE TABLE user_permission (
    id         INTEGER   PRIMARY KEY
                         UNIQUE
                         NOT NULL,
    uid                  NOT NULL, -- 用户id
    code       STRING    NOT NULL, -- 权限编码
    created_at TIMESTAMP NOT NULL
                         DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 用户session关联表
CREATE TABLE user_session (
    id         INTEGER   PRIMARY KEY
                         UNIQUE
                         NOT NULL,
    uid                  NOT NULL, -- 用户id
    sid        STRING    NOT NULL, -- session id
    created_at TIMESTAMP NOT NULL
                         DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 图书类别表
CREATE TABLE category (
    id          INTEGER   PRIMARY KEY
                          NOT NULL
                          UNIQUE,
    name        TEXT      NOT NULL, -- 类别名称(唯一)
    description TEXT,         -- 类别描述
    created_at  TIMESTAMP NOT NULL
                          DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP,
    UNIQUE (
        name
    )
);

-- 图书表
CREATE TABLE book (
    id         INTEGER   PRIMARY KEY
                         NOT NULL
                         UNIQUE,
    name       TEXT,  -- 书名
    summary    TEXT,  -- 简介
    translator TEXT,  -- 译者
    author     TEXT,  -- 作者
    publisher  TEXT,  -- 出版社
    publish_at TEXT,  -- 出版日期
    isbn       TEXT      NOT NULL,  -- ISBN号
    created_at TIMESTAMP NOT NULL
                         DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 图书分类关联表
CREATE TABLE book_category (
    id         INTEGER   PRIMARY KEY -- 图书id
                         UNIQUE
                         NOT NULL,
    cid        INTEGER   NOT NULL, --类别id
    created_at TIMESTAMP NOT NULL
                         DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 图片表
CREATE TABLE picture (
    id           INTEGER   PRIMARY KEY
                           NOT NULL
                           UNIQUE,
    url          TEXT, -- 图片filename
    content_type TEXT, -- 图片类型
    ext          TEXT, -- 图片扩展名，例如：.jpg,.png
    size         REAL, -- 图片大小，byte
    width        REAL, -- 图片宽 px
    height       REAL, -- 图片高 px
    tag          TEXT, -- 图片标签
    created_at   TIMESTAMP NOT NULL
                           DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP
);
