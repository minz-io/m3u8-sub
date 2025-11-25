import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from '@hono/node-server/serve-static'
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
const watchJob = schedule.scheduleJob('* * * * *', async ()=>{
    watchJob.running === 0 && await episodeWatchTask()
});
const downloadJob = schedule.scheduleJob('*/5 * * * * *', async ()=>{
    downloadJob.running === 0 && await episodeDownloadTask()
})

const app = new Hono()

// 前端静态文件
app.use('/web/*', serveStatic({root: process.cwd()}))
app.use('/*', cors())
app.get('/', (c) => {
  return c.text('Hello M3U8!')
})

// 视频资源 API
app.get('/video', getVideoListHandler)
app.get('/video/:id', getVideoHandler)

// 订阅管理 API
app.get('/subscription', getSubscriptionListHandler)
app.get('/subscription/:id', getSubscriptionByIdHandler)
app.post('/subscription', addSubscriptionHandler)
app.delete('/subscription/:id', deleteSubscriptionHandler)

export default {
    hostname: process.env.HOST || '0.0.0.0',
    port: Number(process.env.PORT) || 3000,
    fetch: app.fetch,
}