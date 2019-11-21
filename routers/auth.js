const router = require('koa-router')()
const mongoose = require('mongoose')
const User = mongoose.model('User')
const jsonWebToken = require('jsonwebtoken')

const checkPassWord = async (name, pwd) => {
    let match = false;

    const user = await User.findOne({
        name
    })

    if (user) {
        match = await user.comparePwd(pwd, user.pwd)

        return {
            match,
            user
        }
    } else {
        return {
            match
        }
    }
}

router.post('/login', async ctx => {
    const {
        user,
        pwd,
    } = ctx.request.body

    const check = await checkPassWord(user, pwd)

    if (check.match) {
        let userToken = {name: check.user.name, _id: check.user._id};
        ctx.body = {
            token: jsonWebToken.sign(userToken, ctx.state.SECRET,  {expiresIn: '24h'})
        }
    } else {
        ctx.status = 202
        ctx.body = '密码错误！'
    }
})

router.post('/register', async ctx => {
    const {
        user,
        pwd
    } = ctx.request.body

    const findUser = await User.findOne({
        name: user
    })
    if (!findUser) {
        let userSave = new User({
            name: user,
            pwd
        })
        let save = await userSave.save()
        if (save) {
            let userToken = {
                name: save.name,
                _id: save._id,
            }
            ctx.body = {
                token: jsonWebToken.sign(userToken, ctx.state.SECRET, {expiresIn: '24h'})
            }
        } else {
            ctx.status = 202
            ctx.body = '注册失败'
        }
    } else {
        ctx.status = 202
        ctx.body = '已存在该用户！'
    }
})

module.exports = router