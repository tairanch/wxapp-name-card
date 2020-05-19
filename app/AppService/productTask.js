/**
 * Created by mengai on 2019/5/10.
 *
 * 商城 - 相关接口
 */




import AppRequest, { paramsHandle } from '../utils/network/AppRequest';
import { ncxcxPath } from '../AppConfig';

export default class ProductTask {

    /**
     * 使用Demo
     *
     * id
     */
    static demoApi(id, successCallBack, failureCallBack, completeCallBack) {

        let url = `${ncxcxPath}/api/demo`;
        let params = {
            id: id
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
    };
    

    /**
     *
     *商品详情
     * @static
     * @param {*} params
     * @param {*} successCallBack
     * @param {*} failureCallBack
     * @param {*} completeCallBack
     */
    static loadDetail(params, successCallBack, failureCallBack, completeCallBack) {
        let url = `${ncxcxPath}/ncxcx/item/detail`;
        AppRequest.getRequest(
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
    };



    /**
     *
     *促销和规格数据
     * @static
     * @param {*} params
     * @param {*} successCallBack
     * @param {*} failureCallBack
     * @param {*} completeCallBack
     * @memberof loadPromotion
     */
    static loadPromotion(params, successCallBack, failureCallBack, completeCallBack) {
        let url = `${ncxcxPath}/ncxcx/item/promotion`;
        AppRequest.getRequest(
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
    };
    

    /**
     *
     *购物车商品数量
     * @static
     * @param {*} params
     * @param {*} successCallBack
     * @param {*} failureCallBack
     * @param {*} completeCallBack
     * @memberof loadCount
     */
    static loadCount(params, successCallBack, failureCallBack, completeCallBack) {
        let url = `${ncxcxPath}/ncxcx/cart/count`;
        AppRequest.getRequest(
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
    };

    /**
     *
     *混合接口
     * @static
     * @param {*} params
     * @param {*} successCallBack
     * @param {*} failureCallBack
     * @param {*} completeCallBack
     * @memberof loadMix
     */
    static loadMix(params, successCallBack, failureCallBack, completeCallBack) {
        let url = `${ncxcxPath}/ncxcx/item/mix`;
        AppRequest.getRequest(
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
    };

    /**
     *
     *加载评价
     * @static
     * @param {*} params
     * @param {*} successCallBack
     * @param {*} failureCallBack
     * @param {*} completeCallBack
     * @memberof loadRate
     */
    static loadRate(params, successCallBack, failureCallBack, completeCallBack) {
        let url = `${ncxcxPath}/ncxcx/item/rate`;
        AppRequest.getRequest(
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
    };

    /**
     *
     *秒杀购买图形验证码二次验证 
     * @static
     * @param {*} params
     * @param {*} successCallBack
     * @param {*} failureCallBack
     * @param {*} completeCallBack
     * @memberof checkAgain
     */
    static checkAgain(params, successCallBack, failureCallBack, completeCallBack) {
        let url = `${ncxcxPath}/ncxcx/promotion/SecKill/check`;
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
    };

    /**
     *
     *数据存入token
     *原生详情页与H5订单确认页交互 将数据提交到后台之后再从后台获取
     * @static
     * @param {*} params
     * @param {*} successCallBack
     * @param {*} failureCallBack
     * @param {*} completeCallBack
     * @memberof setToken
     */
    static setToken(params, successCallBack, failureCallBack, completeCallBack) {
        let url = `${ncxcxPath}/ncxcx/order/subscriptionInfoToken`;
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
    };

    /**
     *
     *获取可领取的优惠券接口
     * @static
     * @param {*} params
     * @param {*} successCallBack
     * @param {*} failureCallBack
     * @param {*} completeCallBack
     * @memberof loadCupon
     */
    static loadCupon(params, successCallBack, failureCallBack, completeCallBack) {
        let url = `${ncxcxPath}/ncxcx/item/coupon`;
        AppRequest.getRequest(
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
    };


    /**
     *
     *领取优惠券
     * @static
     * @param {*} params
     * @param {*} successCallBack
     * @param {*} failureCallBack
     * @param {*} completeCallBack
     * @memberof getCoupon
     */
    static getCoupon(params, successCallBack, failureCallBack, completeCallBack) {
        let url = `${ncxcxPath}/ncxcx/promotion/obtainCoupon`;
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
    };
    
    /**
     *
     *加载弹幕
     * @static
     * @param {*} params
     * @param {*} successCallBack
     * @param {*} failureCallBack
     * @param {*} completeCallBack
     * @memberof loadBarrage
     */
    static loadBarrage(params, successCallBack, failureCallBack, completeCallBack) {
        let url = `${ncxcxPath}/ncxcx/recentTenOrders`;
        AppRequest.getRequest(
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
    };
    
    /**
     *
     *为您推荐
     * @static
     * @param {*} params
     * @param {*} successCallBack
     * @param {*} failureCallBack
     * @param {*} completeCallBack
     * @memberof getViewBack
     */
    static getViewBack(params, successCallBack, failureCallBack, completeCallBack) {
        let url = `${ncxcxPath}/ncxcx/recommend/getViewBack`;
        AppRequest.getRequest(
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
    };
   

    /**
     *
     *取消收藏/收藏
     * @static
     * @param {*} params
     * @param {*} successCallBack
     * @param {*} failureCallBack
     * @param {*} completeCallBack
     * @memberof goodsCollect
     */
    static goodsCollect(collect,params, successCallBack, failureCallBack, completeCallBack) {
        let url =  `${ncxcxPath}/ncxcx/user/${collect?'removeItemCollection':'saveItemCollection'}`;
        let methods = collect?'getRequest':'postRequest'
        AppRequest[methods](
            url,
            params,
            (res,result)=>{
                typeof successCallBack == "function" && successCallBack(res,result)
            },
            (error)=>{
                typeof failureCallBack == "function" && failureCallBack(error)
            },
            (res)=>{
                typeof completeCallBack == "function" && completeCallBack(res)
            },
        );
    };

     /**
     *
     *加入购物车
     * @static
     * @param {*} params
     * @param {*} successCallBack
     * @param {*} failureCallBack
     * @param {*} completeCallBack
     * @memberof addCart
     */
    static addCart(params, successCallBack, failureCallBack, completeCallBack) {
        let url = `${ncxcxPath}/ncxcx/cart/add`;
        AppRequest.postRequest(
            url,
            params,
            (res,result)=>{
                typeof successCallBack == "function" && successCallBack(res,result)
            },
            (error)=>{
                typeof failureCallBack == "function" && failureCallBack(error)
            },
            (res)=>{
                typeof completeCallBack == "function" && completeCallBack(res)
            },
        );
    };

    /**
     *
     *加载图形验证码
     * @static
     * @param {*} params
     * @param {*} successCallBack
     * @param {*} failureCallBack
     * @param {*} completeCallBack
     * @memberof loadCaptchas
     */
    static loadCaptchas(params, successCallBack, failureCallBack, completeCallBack) {
        let url = `${ncxcxPath}/ncxcx/promotion/getRandCaptcha`;
        AppRequest.getRequest(
            url,
            params,
            (res,result)=>{
                typeof successCallBack == "function" && successCallBack(res,result)
            },
            (error)=>{
                typeof failureCallBack == "function" && failureCallBack(error)
            },
            (res)=>{
                typeof completeCallBack == "function" && completeCallBack(res)
            },
        );
    };


    /**
     *
     *拼团校验
     * @static
     * @param {*} params
     * @param {*} successCallBack
     * @param {*} failureCallBack
     * @param {*} completeCallBack
     * @memberof CheckGroupBuy
     */
    static CheckGroupBuy(params, successCallBack, failureCallBack, completeCallBack) {
        let url = `${ncxcxPath}/ncxcx/promotion/checkGroupBuy`;
        AppRequest.postRequest(
            url,
            params,
            (res,result)=>{
                typeof successCallBack == "function" && successCallBack(res,result)
            },
            (error)=>{
                typeof failureCallBack == "function" && failureCallBack(error)
            },
            (res)=>{
                typeof completeCallBack == "function" && completeCallBack(res)
            },
        );
    };
}