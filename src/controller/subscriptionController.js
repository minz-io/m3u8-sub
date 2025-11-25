import {addSubscription, deleteSubscription, getSubscription} from "../service/subscriptionService";

export const getSubscriptionListHandler = async (c) => {
    try {
        const result = await getSubscription();
        return c.json({
            code: 1,
            data: result
        });
    } catch (error) {
        console.error('获取订阅列表失败:', error);
        return c.json({
            code: -1,
            msg: error.message || '获取订阅列表失败'
        }, 500);
    }
}

export const getSubscriptionByIdHandler = async (c) => {
    try {
        const id = c.req.param('id');
        const result = await getSubscription(id);

        if (!result) {
            return c.json({
                code: -1,
                msg: '未找到该订阅'
            }, 404);
        }

        return c.json({
            code: 1,
            data: result
        });
    } catch (error) {
        console.error('获取订阅详情失败:', error);
        return c.json({
            code: -1,
            msg: error.message || '获取订阅详情失败'
        }, 500);
    }
}

export const addSubscriptionHandler = async (c) => {
    try {
        const body = await c.req.json();
        const { vodId, vodName } = body;

        if (!vodId || !vodName) {
            return c.json({
                code: -1,
                msg: '视频ID和名称不能为空'
            }, 400);
        }

        const result = await addSubscription(String(vodId), vodName);

        return c.json({
            code: 1,
            data: result,
            msg: '添加订阅成功'
        }, 201);
    } catch (error) {
        console.error('添加订阅失败:', error);
        return c.json({
            code: -1,
            msg: error.message || '添加订阅失败'
        }, 500);
    }
}

export const deleteSubscriptionHandler = async (c) => {
    try {
        const id = c.req.param('id');
        const result = await deleteSubscription(id);

        return c.json({
            code: 1,
            msg: `删除订阅成功，同时删除了 ${result.deletedDownloads} 条相关下载记录`,
            data: result
        });
    } catch (error) {
        console.error('删除订阅失败:', error);
        return c.json({
            code: -1,
            msg: error.message || '删除订阅失败'
        }, 500);
    }
}
