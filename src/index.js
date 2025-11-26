import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from '@hono/node-server/serve-static'
import { basicAuth } from 'hono/basic-auth'
import schedule from 'node-schedule'
import {episodeDownloadTask} from "./task/episodeDownloadTask";

import {db, initDB} from "./config/db";
import {episodeWatchTask} from "./task/episodeWatchTask";
import {getVideoHandler, getVideoListHandler} from "./controller/videoController";
import {
    addSubscriptionHandler,
    deleteSubscriptionHandler,
    getSubscriptionByIdHandler,
    getSubscriptionListHandler
} from "./controller/subscriptionController";

// 初始化数据库
await initDB()

// 任务
const watchJob = schedule.scheduleJob(process.env.SCHEDULE_WATCH, async ()=>{
    watchJob.running === 0 && await episodeWatchTask()
});
const downloadJob = schedule.scheduleJob(process.env.SCHEDULE_DOWNLOAD, async ()=>{
    downloadJob.running === 0 && await episodeDownloadTask()
})

const app = new Hono()

// CORS 配置
app.use('/*', cors())

// BasicAuth 中间件配置
const isAuthEnabled = process.env.BASIC_AUTH_ENABLE === 'true'
const authMiddleware = isAuthEnabled
    ? basicAuth({
        username: process.env.BASIC_AUTH_USERNAME || 'admin',
        password: process.env.BASIC_AUTH_PASSWORD || 'admin',
    })
    : async (c, next) => await next() // 不启用认证时，直接通过

// 首页跳转到 /web/
app.get('/', (c) => {
  return c.redirect('/web/')
})

// 前端静态文件
app.use('/web/*', authMiddleware, serveStatic({root: process.cwd()}))

// 视频资源 API (需要认证)
app.get('/video', authMiddleware, getVideoListHandler)
app.get('/video/:id', authMiddleware, getVideoHandler)

// 订阅管理 API (需要认证)
app.get('/subscription', authMiddleware, getSubscriptionListHandler)
app.get('/subscription/:id', authMiddleware, getSubscriptionByIdHandler)
app.post('/subscription', authMiddleware, addSubscriptionHandler)
app.delete('/subscription/:id', authMiddleware, deleteSubscriptionHandler)

export default {
    hostname: process.env.HOST || '0.0.0.0',
    port: Number(process.env.PORT) || 3000,
    fetch: app.fetch,
}