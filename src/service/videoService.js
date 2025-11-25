/**
 * 视频API服务
 */

/**
 * 获取视频列表
 * @param {string} keyword - 搜索关键词
 * @param {number} page - 页码
 * @returns {Promise<Object|null>} 返回视频列表数据或 null
 * @throws {Error} 当请求失败时抛出异常
 */
export async function getVideoList(keyword = '', page = 1) {
    const params = new URLSearchParams({
        ac: 'list',
        ...(keyword && { wd: keyword }),
        ...(page && { pg: page })
    });

    const response = await fetch(`${process.env.VOD_API}?${params}`);
    if (!response.ok) {
        throw new Error(`获取视频列表失败: HTTP ${response.status}`);
    }

    const data = await response.json();
    return data || null;
}

/**
 * 获取视频详情
 * @param {string|number} ids - 视频ID，多个ID用逗号分隔
 * @returns {Promise<Object|null>} 返回视频详情数据或 null
 * @throws {Error} 当参数无效或请求失败时抛出异常
 */
export async function getVideo(ids) {
    if (!ids) {
        throw new Error('视频ID不能为空');
    }

    const params = new URLSearchParams({
        ac: 'detail',
        ids: ids
    });

    const response = await fetch(`${process.env.VOD_API}?${params}`);
    if (!response.ok) {
        throw new Error(`获取视频详情失败: HTTP ${response.status}`);
    }

    const data = await response.json();
    return data || null;
}