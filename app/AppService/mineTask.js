/**
 * Created by mengai on 2019/5/10.
 *
 * 个人中心 - 相关接口
 */


import AppRequest, { paramsHandle } from '../utils/network/AppRequest';
import { ncxcxPath, user_center_host } from '../AppConfig';

export default class MineTask {

    /**
     * 【用户中心接口，使用`ucenter.trc.com`域名】
     *
     * 获取用户基本信息
     */
    static getUserInfo(needPhone, successCallBack, failureCallBack, completeCallBack) {

        let url = `${user_center_host}/foundation-user/user`;

        wx.request({
            url: url,
            data: { needPhone: needPhone },
            method: 'GET',
            header: { 'Authorization': "Bearer " + getApp().globalData.globtoken },
            success: function (result) {
                if (result && result.statusCode == 200) {
                    let data = result.data;
                    if (data && data.code == 200) {
                        successCallBack && successCallBack(data.body);
                        return;
                    }
                }
                failureCallBack && failureCallBack(result.data)
            },
            fail: function (error) {
                failureCallBack && failureCallBack(error)
            },
            complete: function (resp) {
                completeCallBack && completeCallBack(resp)
            }
        });
    };

    /**
     * 
     * @param {*店铺id数组} shop_id 
     * @param {*成功过回调} successCallBack 
     * @param {*失败回调} failureCallBack 
     * @param {*} completeCallBack 
     */
    static getInvoice(shop_id,successCallBack, failureCallBack, completeCallBack) {
     
        let url = `${ncxcxPath}/ncxcx/user/getUserInvoice`;
        let params = {
            shop_id
        };

        AppRequest.getRequest(
            url,
            params,
            (result) => {
                successCallBack && successCallBack(result);
            },
            (error) => {
                failureCallBack && failureCallBack(error);
            },
            (res) => {
                completeCallBack && completeCallBack(res);
            }
        );
    }
    /**
     * 确认订单/order/init
     * @param {params}参数
     *
     */
    static getOrderInit(params,successCallBack, failureCallBack, completeCallBack){
        let url = `${ncxcxPath}/ncxcx/order/init`;
        AppRequest.postRequest(
            url,
            params,
            (result)=>{
                typeof successCallBack == "function" && successCallBack(result)
            },
            (error)=>{
                typeof failureCallBack == "function" && failureCallBack(error)
            },
            (res)=>{
                typeof completeCallBack == "function" && completeCallBack(res)
            },
        );
    }

    /**
     *  保存发票
     * @param {*保存发票所需参数} params 
     * @param {*} successCallBack 
     * @param {*} failureCallBack 
     * @param {*} completeCallBack 
     */
    static saveInvoice(params,successCallBack, failureCallBack, completeCallBack) {
     
        let url = `${ncxcxPath}/ncxcx/user/saveUserInvoice`;
        AppRequest.postRequest(
            url,
            params,
            (result) => {
                successCallBack && successCallBack(result);
            },
            (error) => {
                failureCallBack && failureCallBack(error);
            },
            (res) => {
                completeCallBack && completeCallBack(res);
            }
        );
    }


}
