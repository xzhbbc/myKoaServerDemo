const Koa = require('koa')
const router = require('koa-router')()
const koaBody = require('koa-body')
const koaJwt = require('koa-jwt')
const jsonWebToken = require('jsonwebtoken')

const fs = require('fs')
const path = require('path')

const handleReponse = require('./middleware/handleReponseStatus')
const config = require('./config/config')

const app = new Koa();
const SECRET = 'testXzhQuick'; // 加密参数

/**
 * post接口数据处理
 */
app.use(koaBody({
    multipart: true,
    formidable: {
        maxFileSize: 3000 * 1024 * 1024    // 设置上传文件大小最大限制，默认30M
    }
}))

/**
 * 认证授权
 */
app.use(koaJwt({secret: SECRET}).unless({
    // 登录，注册接口不需要验证 给前端展示的接口不用验证
    path: [
        // /^\/common\/html2canvas\/corsproxy/, // 排除html2canvas跨域接口
        /^\/front/,
        /^\/auth\/login/,
        /^\/auth\/register/
    ]
}))

/**
 * 配置全局的变量
 */
router.use(async (ctx, next) => {
    // token解密 将token里的用户信息赋值到全局变量中
    let token = ctx.headers.authorization
    if (token) {
        ctx.state.user = jsonWebToken.verify(token.split(' ')[1], SECRET);
    }
    // 全局变量
    ctx.state.BASE_URL = config.baseURL + ':' + config.port;
    ctx.state.ROOT_PATH = path.join(__dirname, './');
    ctx.state.SERVER_PATH = path.join(__dirname, './');
    ctx.state.SECRET = SECRET;
    await next()
})

const {
        connect, initSchemas
    } = require('./database/init')

;(async () => {
    // 数据库连接
    await initSchemas()
    await connect()

    // 配置路由
    fs.readdirSync(path.join(__dirname, './routers')).forEach(route => {
        let api = require(`./routers/${route}`)
        router.use(`/${route.replace('.js', '')}`, api.routes())
    })

    // 全局status处理
    app.use(handleReponse)

    // 启动路由
    app.use(router.routes())
    app.use(router.allowedMethods())

    app.listen(config.port, () => {
        console.log(`服务器开启，${config.baseURL}:${config.port}`)
    });
})()
