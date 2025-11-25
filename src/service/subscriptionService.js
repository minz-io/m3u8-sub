import { db } from '../config/db.js';
import { deleteDownloadsByVodId } from './downloadService.js';

/**
 * 添加订阅
 * @param {string} videoId - 视频ID
 * @param {string} videoName - 视频名称
 * @returns {Promise<Object>} 返回新增的订阅对象
 * @throws {Error} 当视频已订阅或添加失败时抛出异常
 */
export async function addSubscription(videoId, videoName) {
    const database = db();

    // 检查是否已订阅
    const existing = database.data.subscriptions.find(sub => sub.vod_id === videoId);
    if (existing) {
        throw new Error('该视频已订阅');
    }

    // 添加订阅
    const subscription = {
        vod_id: videoId,
        vod_name: videoName,
        current_episode: 0,
        download_episode: 0,
    };
    database.data.subscriptions.push(subscription);
    await database.write();

    return subscription;
}

/**
 * 删除订阅
 * @param {string} videoId - 视频ID
 * @returns {Promise<Object>} 返回删除结果 { deletedDownloads: number }
 * @throws {Error} 当视频未订阅或删除失败时抛出异常
 */
export async function deleteSubscription(videoId) {
    const database = db();
    const index = database.data.subscriptions.findIndex(sub => sub.vod_id === videoId);

    if (index === -1) {
        throw new Error('该视频未订阅');
    }

    // 删除订阅
    database.data.subscriptions.splice(index, 1);
    await database.write();

    // 删除关联的下载记录
    const deletedDownloads = await deleteDownloadsByVodId(videoId);

    return { deletedDownloads };
}

/**
 * 获取订阅
 * @param {string} [videoId] - 视频ID，为空时返回所有订阅
 * @returns {Promise<Object|Array|null>} 返回订阅对象、订阅列表或 null
 */
export async function getSubscription(videoId) {
    const database = db();

    if (videoId) {
        const subscription = database.data.subscriptions.find(sub => sub.vod_id === videoId);
        return subscription || null;
    }

    return database.data.subscriptions;
}
