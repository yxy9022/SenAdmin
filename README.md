# senior-admin
> 一个基于vue2.x编写的后端管理项目
 [SenAdmin](https://github.com/jerry9022/SenAdmin)

### 说明

  这是一个用vuejs2.x和element-ui2.x搭建的后台管理项目**进阶版**。
基于先前的基础版 [LitAdmin](https://github.com/jerry9022/LitAdmin)项目。  
   
   相比基础版[LitAdmin](https://github.com/jerry9022/LitAdmin)主要改变如下：
   - 项目结构调整，层次更清晰
   - 增加了vuex状态管理组件，绝大部分操作直接访问action。 
   - 增加用户头像上传功能
   - 增加了基础权限设置功能（通常情况该功能信息有开发人员设置） 
   - 增加了用户权限功能，可以给不同的用户分配不同的权限。
   - 增加了图库管理功能，仿百度图片(部分功能)。
   - 抽取了截图组件、标签组件
   - 后端使用了nodejs+express+sqlite

   
  演示地址：[http://sen.ipyro.cn](http://sen.ipyro.cn)  
  效果图:  
  <img src="https://raw.githubusercontent.com/jerry9022/SenAdmin/master/sample1.jpg" width=540 height=300 />  
  <img src="https://raw.githubusercontent.com/jerry9022/SenAdmin/master/sample2.jpg" width=540 height=300 />

    
### 项目结构
```
├── build  #webpack编译相关文件目录，一般不用动 
├── config  #配置目录
│   ├────dev.env.js  #开发环境变量
│   ├────index.js    #主配置文件
│   └────prod.env.js #生产环境变量
├── dist  #生产环境下build后的文件存放目录（发布目录）
├── server  #服务端代码目录，提供给前端接口
├── src #前端项目源码目录
│   ├───—api  #封装的接口文件目录
│   ├───—assets  #资源目录
│   ├───—common  #公用文件目录
│   ├───—components  #组件目录
│   ├───—store  #状态管理目录
│   ├───—router  #路由目录
│   ├───—tools  #工具目录
│   ├───—views  #页面目录
│   ├───—App.vue #项目入口文件
│   ├───—bus.js  #公共通信组件
│   └────main.js  #项目的核心文件
├── static  #开发模式下的静态资源目录
├── index.html #首页入口文件，你可以添加一些 meta 信息或同统计代码啥的
├── package.json #项目配置文件
└── README.md #项目的说明文档，markdown 格式
```

## 项目编译和运行

``` bash
第一步： 先安装node v8.2.1环境，可以用nvm安装，支持多版本切换
可参看链接：https://fengmk2.com/blog/2014/03/node-env-and-faster-npm.html

第二步：下载项目
可以直接在git上下载项目源码。
或者通过git命令下载
#git命令下载
git clone https://github.com/jerry9022/SenAdmin

假定项目已经下载下来了。

第三步：启动服务端
（1）新开一个命令行窗口
（2）定位到项目中的server目录并安装依赖
  > cd 你自己的位置/SenAdmin/server
  > npm install
（3）依赖安装成功后执行启动命令
  > npm start 
  # 显示如下内容说明服务端启动成功
  # Server is runing... Listening on port 8601
  # Listening at http://localhost:8601
  
  
第四步：启动前端
（1）新开一个命令行窗口
（2）定位到项目目录并安装依赖
  > cd 你自己的位置/SenAdmin
  > npm install
（3）依赖安装成功后执行启动命令
  > npm run dev
  # 显示如下内容说明本地启动成功
  # DONE Compiled successfully in 7515ms
  # Listening at http://localhost:8085
   
   
#正式环境编译命令
# build for production with minification
npm run build

```


### 更新日志
> 2018-08-03
 >> 1.项目初始化。



