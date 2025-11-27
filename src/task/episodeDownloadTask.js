import {sleep} from "../util/time";
import {db} from "../config/db";
import path from 'path';
import fs from "fs";
import logger from "../util/logger";

/**
 * 循环下载任务
 */
export const episodeDownloadTask = async ()=>{

    const database = db()

    logger.info('开始下载剧集任务')

    // 获取全部未下载剧集
    const allDownloads = database.data.downloads.filter(
        download => !download.is_download && download.download_times < 3
    )
    const sortDownloads = allDownloads.sort((a, b) => a.download_times - b.download_times)
    const vod = sortDownloads[0] ?? null
    if (!vod){
        logger.info("当前无任务下载任务")
        return
    }

    // 开始下载
    logger.info(`开始下载 ${vod.vod_name} ${vod.title} ${vod.link}`)

    // 检查目录是否存在，不存在创建
    const dirPath = path.join(process.env.DOWNLOAD_PATH, vod?.vod_name)
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        logger.info(`剧集目录创建 ${dirPath}`)
    }

    // 下载任务
    const proc = Bun.spawn([
        "ffmpeg",
        "-i",
        vod?.link,
        // "https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/hls/xgplayer-demo.m3u8",
        "-c",
        "copy",
        "-y",
        path.join(process.env.DOWNLOAD_PATH, vod?.vod_name, `${vod?.title}.mp4`)
    ],{});

    const exitCode = await proc.exited;
    if (exitCode !== 0) {
        // 失败
        logger.error(`下载错误 ${vod.vod_name} ${vod.title}`);
        vod.download_times += 1
        await database.write()
        return
    }

    // 成功
    logger.info(`下载完成 ${vod.vod_name} ${vod.title}`);
    vod.is_download = true

    // 计算已下载的剧集
    const downloadEpisode = database.data.downloads.filter(
        download => download.is_download && download.vod_id === vod.vod_id
    ).length
    const subscription = database.data.subscriptions.find(
        subscription => subscription.vod_id === vod.vod_id
    )
    if(subscription) {
        subscription.download_episode = downloadEpisode
    }
    await database.write()
}
