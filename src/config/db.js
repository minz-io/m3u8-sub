import { JSONFilePreset } from 'lowdb/node'
import logger from "../util/logger";

// 默认数据结构
const defaultData = {
  subscriptions: [],
  downloads: []
};

let dbc = null;

/**
 * 初始化数据库
 */
export const initDB = async ()=> {
    if (!dbc) {
        const dbPath = process.env.DB_PATH;

        if (!dbPath) {
            throw new Error('环境变量 DB_PATH 未设置');
        }

        dbc = await JSONFilePreset(dbPath, defaultData);
        await dbc.write();

        logger.info("数据库初始化完成")
    }

    return dbc;
}

/**
 * 获取数据库实例（需先调用 initDB）
 * @returns {object} 数据库实例
 */
export const db = () => {
    if (!dbc) {
        throw new Error('数据库未初始化，请先调用 initDB()');
    }
    return dbc;
};