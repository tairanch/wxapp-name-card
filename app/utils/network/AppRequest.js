/**
 * Created by mengai on 2019/4/11.
 */

import {
    x_channel,
    x_platform_type,
    x_platform_from,
    x_device_info
} from '../../AppConfig';


//-------------------------请求方法-------------------------

export default class AppRequest {

    /**
     * [网络请求] GET请求
     * @param url
     * @param params
     * @param successCallBack
     * @param failureCallBack
     * @param completeCallBack
     */
    static getRequest(url, params, successCallBack, failureCallBack, completeCallBack) {

        url = paramsHandle(params) ? url + "?" + paramsHandle(params) : url;

        wx.request({
            url: url,
            method: 'GET',
            header: getHttpHeaders(),
            success: function(res) {
                AppRequest.requestSuccessHandle(res, successCallBack);
            },
            fail: function(error) {
                AppRequest.requestErrorHandle(error, failureCallBack);
            },
            complete: function(res) {
                completeCallBack && completeCallBack();
            }
        })
    }

    /**
     * [网络请求] POST请求
     *
     * @param url
     * @param params
     * @param successCallBack
     * @param failureCallBack
     * @param completeCallBack
     */
    static postRequest(url, params, successCallBack, failureCallBack, completeCallBack) {

        wx.request({
            url: url,
            data: params,
            method: 'POST',
            header: getHttpHeaders(),
            success: function (res) {
                AppRequest.requestSuccessHandle(res, successCallBack);
            },
            fail: function (error) {
                AppRequest.requestErrorHandle(error, failureCallBack);
            },
            complete: function(res) {
                completeCallBack && completeCallBack();
            }
        })
    }


    /**
     * [结果处理] 请求成功
     * @param result
     * @param cb
     */
    static requestSuccessHandle(result, cb) {

        let data = result.data;
        let code = data.code;
        switch (code){
            case 401:
            {
                // 用户身份失效
                getApp().globalData.globtoken = null;
                getApp().globalData.haslogin = false;
                cb && cb(data);
            }
                break;
            default:
            {//dcp埋点需要http 状态码
                cb && cb(data,result);
            }
        }
    }

    /**
     * [结果处理] 请求失败
     * @param error
     * @param cb
     */
    static requestErrorHandle(error, cb) {
        cb && cb(error);
    }
}


/**
 * 获取请求头
 * @returns httpHeaders 返回包装完整的请求头
 */
export function getHttpHeaders() {

    // 拿到全局的token
    // let token = getApp().globalData.globtoken ?
    //     getApp().globalData.globtoken :
    //     '';

    let token = getApp().globalData.globtoken ?
        getApp().globalData.globtoken :
        (wx.getStorageSync('namecardtoken')?JSON.parse(wx.getStorageSync('namecardtoken')).token:'');
    

    let httpHeaders = {
        "X-Channel": x_channel,
        "X-Platform-Type": x_platform_type,
        "X-Platform-From": x_platform_from,
        "X-Device-Info": x_device_info,
        "Cookie": "token=" + token,
        "token": token ? token : ''
    };

    if (getApp() && getApp().globalData.addSpecHead === 'wxbind'){
        httpHeaders.Authorization = 'Bearer '+ token;
    }

    return httpHeaders;
}

// 请求参数处理
export function paramsHandle(params) {
    if (!params) return null;
    return Object.keys(params).map(key => {
        return key + '=' + encodeURIComponent(params[key])
    }).join('&')
}
