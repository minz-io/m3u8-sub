import {sleep} from "../util/time";
import {
    getSubscription
} from "../service/subscriptionService";
import {getVideo} from "../service/videoService";
import {addDownload} from "../service/downloadService";
import {db} from "../config/db";
import logger from "../util/logger";

/**
 * 检查节目剧集数量
 */
export const episodeWatchTask = async ()=>{

    const database = db()

    logger.info('开始采集剧集任务')

    // 获取全部订阅
    const subscriptions =  await getSubscription()

    for (const subscription of subscriptions) {

        // 获取节目进展
        const vods = await getVideo(subscription.vod_id)

        // 跳过
        if (!vods?.list || vods.list.length === 0) continue;
        const vod = vods.list[0]

        // 解析数据
        const cutData = vod?.vod_play_url.replace('$$$', '#')
        const vodList = cutData?.split('#')
        const vodItemList = vodList?.map(item => item.split('$'))
        const theVods = vodItemList.filter(item => item[1].includes('.m3u8'))

        // 添加
        for (const item of theVods) {
            await addDownload(subscription.vod_id, subscription.vod_name, item[0], item[1])
        }

        // 更新订阅数量
        subscription.current_episode = theVods.length
        console.log(subscription)
        await database.write()

    }

}