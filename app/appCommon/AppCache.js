/**
 * Created by mengai on 2019/5/10.
 *
 * 缓存中心 - 统一处理小程序所有缓存
 */

import { app_token_storage_key } from '../AppConfig';


/**
 * 【同步】从本地缓存中异步获取指定 key 的内容
 *
 * @returns tokenInfo json字符串  例如：{"token":"xxx","openid":"xxx"}
 */
export function getTokenInfoFromStorageSync() {
    // 返回的是json字符串
    let tokenInfoStr = wx.getStorageSync(app_token_storage_key);

    if (tokenInfoStr) {
        return JSON.parse(tokenInfoStr);
    }
    return tokenInfoStr;
}


/**
 * 【异步】从本地缓存中异步获取指定 key 的内容
 *
 * @returns tokenInfo json字符串  例如：{"token":"xxx","openid":"xxx"}
 */
export const getTokenInfoFromStorage = new Promise((resolve, reject)=>{
    wx.getStorage({
        key: app_token_storage_key,
        success: function (result) {
            if ((result && result.errMsg !== 'getStorage:ok') || !result.data) {
                reject(result);
            }
            resolve(JSON.parse(result.data));
        },
        fail: function (error) {
            reject(error);
        }
    })
});
