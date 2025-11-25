import {getVideo, getVideoList} from "../service/videoService";

export const getVideoListHandler = async (c) => {
    try {
        const keyword = c.req.query('wd') || '';
        const page = parseInt(c.req.query('pg')) || 1;
        const result = await getVideoList(keyword, page);

        if (!result) {
            return c.json({
                code: -1,
                msg: '未找到视频列表数据'
            }, 404);
        }

        return c.json(result);
    } catch (error) {
        console.error('获取视频列表失败:', error);
        return c.json({
            code: -1,
            msg: error.message || '获取视频列表失败'
        }, 500);
    }
}

export const getVideoHandler = async (c) => {
    try {
        const ids = c.req.param('id');
        const result = await getVideo(ids);

        if (!result) {
            return c.json({
                code: -1,
                msg: '未找到视频详情数据'
            }, 404);
        }

        return c.json(result);
    } catch (error) {
        console.error('获取视频详情失败:', error);
        return c.json({
            code: -1,
            msg: error.message || '获取视频详情失败'
        }, 500);
    }
}
