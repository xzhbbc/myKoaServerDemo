# koa服务器搭建模版

### 解决方案

1.用jwt，解决服务器token的问题，需要验证的接口，需要在header传递对应的token。
2.密码用bcrypt进行加严
3.数据库用的mongod
4.相关服务器配置在config/config.json下进行更改
5.配置了全局状态码管理

### 运行

```bash
npm install

node app / nodemon app.js
```