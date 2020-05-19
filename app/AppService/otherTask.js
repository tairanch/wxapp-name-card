/**
 * Created by mengai on 2019/5/10.
 *
 * 其他页面 - 相关接口
 */


import AppRequest, { paramsHandle } from '../utils/network/AppRequest';
import { ncxcxPath, baseAppId, message_serveId } from '../AppConfig';

export default class OtherTask {

    /**
     * 【商城的接口，使用`api-m`域名】
     *
     * 获取提现用户的身份证实名信息
     */
    static getUserIdCardInfo(params, successCallBack, failureCallBack, completeCallBack) {

        let url = `${ncxcxPath}/ncxcx/share/getUserIdCardInfo`;

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
        )
    }


    /**
     * 【商城的接口，使用`api-m`域名】
     *
     * 保存分享赚钱用户信息（保存身份证）
     *
     * 1	name	        用户姓名	        是	[string]
     * 2	id_number	    身份证号码	    是	[string]
     * 3	face_image	    身份证正面照片	是	[string]
     * 4	inverse_image	身份证反面照片	是	[string]
     */
    static saveShareBonusUser(params, successCallBack, failureCallBack, completeCallBack) {

        let url = `${ncxcxPath}/ncxcx/share/saveShareBonusUser`;

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
    }


    /**
     * 【商城的接口，使用`api-m`域名】
     *
     * 获取用户的收益流水明细
     *
     * 1	page	    页码	        是	[int]
     * 2	page_size	每页数据条数	是	[int]
     */
    static getShareBonusFlowList(page, page_size, successCallBack, failureCallBack, completeCallBack) {

        let url = `${ncxcxPath}/ncxcx/share/getShareBonusFlowList`;

        let params = {
            page,
            page_size
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
        )
    }


    /**
     * 【商城的接口，使用`api-m`域名】
     *
     * params:
     * 参数1: amount	        申请提现金额	是	[float]
     * 参数2: captcha	    手机验证码	是	[string]
     * 参数3: generate_id	验证码流水号	是	[string]
     * 参数4: phone	        手机号码	    是	[string]
     *
     * 用户申请提现
     */
    static applyWithdrawal(params, successCallBack, failureCallBack, completeCallBack) {

        let url = `${ncxcxPath}/ncxcx/share/applyWithdrawal`;

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
    }

    /**
     * 【短信的接口，使用`message.trc.com`域名】
     *
     * 验证码生成接口
     *
     * phoneNumber: 手机号
     */
    static captchaGenerate (phoneNumber, successCallBack, failureCallBack, completeCallBack) {

        let url = `${ncxcxPath}/message/gateway/message-captcha/api/v1/captcha/` + baseAppId+ `/generate`;

        let params = {
            phone: phoneNumber,
            serveId: message_serveId
        };

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
    }


    /**
     * 【商城的接口，使用`api-m`域名】
     *
     * 名片小程序图片上传接口
     *
     * 1	img	    图片文件的base64编码	                是	[string]	data:image/jpeg;base64,/9j/XXXXXXXXX
     * 2	private	是否为私有（身份证图片等私有图片传true）	是	[boolean]	true
     */
    static uploadImage (img, is_private, successCallBack, failureCallBack, completeCallBack) {

        let url = `${ncxcxPath}/ncxcx/uploadImage`;

        let params = {
            img,
            private: is_private
        };

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
    }
}
