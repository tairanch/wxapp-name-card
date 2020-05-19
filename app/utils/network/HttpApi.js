/**
 * app的请求接口
 * Created by 焦亚 on 2019/4/13.
 */
import api from 'utils/network/AppRequest';
import host from '../../AppConfig.js';

/**
 * 获取微信code用户中心登录
 * @param data
 * @param successCallBack
 * @param failureCallBack
 * @param completeCallBack
 */
export function loginWechat(data, successCallBack, failureCallBack, completeCallBack) {
    let params = {
        mpIV: data.iv,
        mpEncryptedData: data.encryptedData,
        appId: app.globalData.baseAppId,
        code: data.code,
        returnBy: 'JSON',
        platform: "MINI_PROGRAM"
    };
    api.getRequest(host.USER_CENTER_HOST + '/foundation-user/login/wechat', params, successCallBack, failureCallBack, completeCallBack)
}
