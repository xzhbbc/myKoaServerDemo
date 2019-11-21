const router = require('koa-router')();

router.get('/test', async ctx => {
    ctx.status = 200;
    ctx.body = '成功！！！！'
    return
})

module.exports = router