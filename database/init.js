const config = require('../config/config')
const mongoose = require('mongoose')
const glob = require('glob')
const {
    resolve
} = require('path')

exports.initSchemas = () => {
    glob.sync(resolve(__dirname, './schema/', '**/*.js')).forEach(require)
}

// username 数据库用户名
// password 数据库密码
// localhost 数据库ip
// dbname 数据库名称
const db = `mongodb://${config.db.user}:${config.db.pass}@${config.db.servername}:${config.db.port}/${config.db.DATABASE}`
const noUserDb = `mongodb://${config.db.servername}:${config.db.port}/${config.db.DATABASE}`

exports.connect = () => {
    let maxConnectTimes = 0

    return new Promise((resolve, reject) => {
        if (process.env.NODE_ENV !== 'production') {
            mongoose.set('debug', true)
        }

        mongoose.connect(noUserDb)

        mongoose.connection.on('disconnected', () => {
            maxConnectTimes++
            if (maxConnectTimes < 5) {
                mongoose.connect(db)
            } else {
                throw new Error('数据库挂了')
            }
        })
        mongoose.connection.on('error', err => {
            maxConnectTimes++
            if (maxConnectTimes < 5) {
                mongoose.connect(noUserDb)
            } else {
                throw new Error('数据库挂了')
            }
            // reject(err)
            // console.log(err)
        })

        mongoose.connection.once('open', () => {
            resolve()
            console.log('Mongodb Connected Success')
        })
    })
}

mongoose.Promise = global.Promise
