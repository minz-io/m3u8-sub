import {db} from "../config/db";
import logger from "../util/logger";

/**
 * 添加下载
 * @param vodId
 * @param title
 * @param link
 */
export const addDownload = async (vodId, vodName, title, link) => {

    // 入库
    const database = db()

    // 检查是否已入库
    const existingDownload = database.data.downloads.find(
        download => download.vod_id === vodId && download.title === title
    );
    if (existingDownload) return;

    database.data.downloads.push({
        vod_id: vodId,
        vod_name: vodName,
        title,
        link,
        is_download: false,
        download_times: 0,
    });
    await database.write();
    logger.info(`发现剧集：${vodId} ${title} ${link}` )
}

/**
 * 根据视频ID删除所有相关的下载记录
 * @param {string} vodId - 视频ID
 * @returns {Promise<number>} 返回删除的记录数
 */
export const deleteDownloadsByVodId = async (vodId) => {
    const database = db();
    const originalLength = database.data.downloads.length;

    // 过滤掉所有匹配的下载记录
    database.data.downloads = database.data.downloads.filter(
        download => download.vod_id !== vodId
    );

    const deletedCount = originalLength - database.data.downloads.length;

    if (deletedCount > 0) {
        await database.write();
        logger.info(`删除了 ${deletedCount} 条下载记录（vod_id: ${vodId}）`);
    }

    return deletedCount;
}
