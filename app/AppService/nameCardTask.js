/**
 * Created by mengai on 2019/5/10.
 *
 * 名片 - 相关接口
 */

import AppRequest, { paramsHandle } from '../utils/network/AppRequest';
import { ncxcxPath } from '../AppConfig';


export default class NameCardTask {

    /**
     * 获取店铺下的业务员信息
     *
     * shop_id: 店铺id
     */
    static getSalesmanNameCardInfo(shop_id, successCallBack, failureCallBack, completeCallBack) {

        let url = `${ncxcxPath}/api/getSalesmanNameCardInfo`;
        let params = {
            shop_id: shop_id
        };

        AppRequest.getRequest(
            url + "?" + paramsHandle(params),
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
    };


    /**
     * 添加名片
     */
    static addNameCardInfo(params, successCallBack, failureCallBack, completeCallBack) {

        let url = `${ncxcxPath}/api/addNameCardInfo`;

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
        )
    };


    /**
     * 获取用户基本统计数据
     */
    static getUserCommissionBasicStaticsData(successCallBack, failureCallBack, completeCallBack) {

        let url = `${ncxcxPath}/ncxcx/commission/getUserCommissionBasicStaticsData`;
        AppRequest.getRequest(
            url,
            null,
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
    };

    /**
     * 领取新人礼包
     */
    static obtainNewerGift(params, successCallBack, failureCallBack, completeCallBack) {

        let url = `${ncxcxPath}/ncxcx/promotion/obtainNewerGift`;

        AppRequest.postRequest(
            url,
            {
                test:'test'
            },
            (result) => {
                successCallBack && successCallBack(result);
            },
            (error) => {
                failureCallBack && failureCallBack(error);
            },
            (res) => {
                completeCallBack && completeCallBack(res);
            }
        )
    };

};
