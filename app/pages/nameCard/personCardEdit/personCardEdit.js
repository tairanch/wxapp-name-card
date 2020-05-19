// pages/myCardEdit/myCardEdit.js
var util = require('../../../utils/util.js');
var RequestManager = require('../../../utils/RequestHelper.js');
const app = getApp();
const DcpPage = require('../../../utils/dcp/dcpPage');  // dcp封装的page
const ctxPath = app.globalData.ncxcxPath;

import NameCardTask from '../../../AppService/nameCardTask';

const pageApi = {
    // 上传图片
    uploadImage: {
        url: `${ctxPath}/api/uploadImage`,
        method: "RequestPost"
    },
    // 新增名片
    addNameCardInfo: {
        url: `${ctxPath}/api/addNameCardInfo`,
        method: "RequestPost"
    },
    // 获取当前登录的业务员的名片信息
    getSalesmanNameCardInfo: {
        url: `${ctxPath}/api/getSalesmanNameCardInfo`,
        method: "RequestGet"
    },
    // 更新名片
    updateNameCardInfo: {
        url: `${ctxPath}/api/updateNameCardInfo`,
        method: "RequestPost"
    },
    // 收下名片
    followNameCard: {
        url: `${ctxPath}/api/followNameCard`,
        method: "RequestGet"
    }
}

DcpPage({

    /**
     * 页面的初始数据
     */
    data: {
        headerImageUrl: '', // 头像地址(展示)
        topPartHeight: 0, // 上部分view的高度
        clientWidth: 0,
        clientHeight: 0,

        currentSelectTemplateType: '1', // "1" 为默认模板； "2"模板2
        userName: '',
        userPhone: '',
        userEmail: '',
        userStaff: '',
        shop_name: '', // 店铺名称
        userDescWordsCount: 0, // 个人介绍字数
        userDescText: '', // 个人介绍
        shop_id: '', // 商户id
        isUpdate: false, // 是否是更新
        name_card_id: '', // 名片id
        showInvalidView: false, // 名片是否已经失效
        sourcePath: '', // 页面来源
        popTimer: null,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

        let sp = options && options.hasOwnProperty('sourcePath') ? options.sourcePath : '';
        this.setData({
            shop_id: options.shop_id,
            sourcePath: sp
        })

        wx.hideShareMenu();
        wx.setNavigationBarColor({
            frontColor: "#ffffff",
            backgroundColor: '#2b2314'
        });

        var that = this;
        //  高度自适应
        wx.getSystemInfo({
            success: function(res) {
                var clientHeight = res.windowHeight,
                    clientWidth = res.windowWidth;
                that.setData({
                    topPartHeight: clientWidth * 2 / 3,
                    clientWidth: clientWidth,
                    clientHeight: clientHeight,
                });
            }
        });

        this.getSalesmanNameCardInfo();
    },

    // -------------------------------API-------------------------------

    // [API] 获取当前登录的业务员的名片信息
    getSalesmanNameCardInfo: function() {

        let that = this;
        NameCardTask.getSalesmanNameCardInfo(
            this.data.shop_id,
            (result) => {
                wx.hideLoading();
                wx.hideNavigationBarLoading();
                if (result && result.code == 0 && result.data && (result.data.constructor == Object)) {
                    // 不为空

                    let cardInfo = result.data;
                    that.setData({
                        headerImageUrl: cardInfo.portrait, // 头像地址(展示)
                        currentSelectTemplateType: cardInfo.template_id,
                        userName: cardInfo.name,
                        userPhone: cardInfo.mobile,
                        userEmail: cardInfo.email,
                        userStaff: cardInfo.job,
                        shop_name: cardInfo.shop_name,
                        userDescWordsCount: cardInfo.introduction ? cardInfo.introduction.length : 0, // 个人介绍字数
                        userDescText: cardInfo.introduction, // 个人介绍
                        isUpdate: true,
                        name_card_id: cardInfo.id,
                        showInvalidView: false
                    })
                } else if (result && result.code == 1000) {
                    // 业务员名片已失效
                    that.setData({
                        showInvalidView: true
                    })
                }

            }, (error) => {
                wx.hideLoading();
            }
        );
    },

    // 上传头像
    uploadHeaderImage: function(tempFilePath) {

        let _that = this;
        wx.showLoading({
            title: '头像上传中',
        })
        wx.getFileSystemManager().readFile({
            filePath: tempFilePath, //选择图片返回的相对路径
            encoding: 'base64', //编码格式
            success: res => { //成功的回调
                // console.log('data:image/png;base64,' + res.data)
                wx.hideLoading();
                const api = pageApi.uploadImage;

                var params = {
                    image_file: 'data:image/png;base64,' + res.data,
                    file_name: 'file_name'
                };

                RequestManager[api.method](
                    api.url,
                    params,
                    (ress) => {
                        let data = ress.data;
                        _that.setData({
                            headerImageUrl: data.image_url,
                        })
                    }, (error) => {
                        wx.hideLoading();
                        wx.showToast({
                            title: '网络异常，请重试',
                            duration: 2000,
                            icon: 'none'
                        })
                    }, true);
            }
        })
    },

    // [API] 添加名片
    addNameCardInfo: function() {
        const api = pageApi.addNameCardInfo;

        var params = {
            template_id: this.data.currentSelectTemplateType,
            name: this.data.userName,
            job: this.data.userStaff,
            shop_name: this.data.shop_name,
            mobile: this.data.userPhone,
            email: this.data.userEmail,
            introduction: this.data.userDescText,
            portrait: this.data.headerImageUrl,
            shop_id: this.data.shop_id,
        };

        wx.showLoading({
            title: '保存中',
        })
        RequestManager[api.method](
            api.url,
            params,
            (res) => {
                wx.showToast({
                    title: '保存成功',
                })
                let name_card_id = res.data.name_card_id;
                this.setData({
                    name_card_id: name_card_id
                });

                // 收下名片
                this.receiveCard(name_card_id);
            }, (error) => {
                wx.showToast({
                    title: '网络异常，请重试',
                    duration: 2000,
                    icon: 'none'
                })
            }, true);
    },

    // [API] 更新名片
    updateNameCardInfo: function() {
        const api = pageApi.updateNameCardInfo;

        var params = {
            template_id: this.data.currentSelectTemplateType,
            name: this.data.userName,
            job: this.data.userStaff,
            shop_name: this.data.shop_name,
            mobile: this.data.userPhone,
            email: this.data.userEmail,
            introduction: this.data.userDescText,
            portrait: this.data.headerImageUrl,
            name_card_id: this.data.name_card_id
        };

        wx.showLoading({
            title: '保存中',
        })
        RequestManager[api.method](
            api.url,
            params,
            (res) => {
                wx.showToast({
                    title: '修改成功',
                })
                let name_card_id = res.data.name_card_id;
                this.setData({
                    name_card_id: name_card_id
                });

                // 收下名片
                this.receiveCard(name_card_id);
            }, (error) => {
                wx.showToast({
                    title: '网络异常，请重试',
                    duration: 2000,
                    icon: 'none'
                })
            }, true);
    },

    // 收下名片
    receiveCard(name_card_id) {
        const api = pageApi.followNameCard
        let _that = this;
        wx.login({
            success: res => {
                // 调用收下名片接口
                RequestManager[api.method](api.url, {
                    code: res.code,
                    name_card_id: name_card_id
                }, (res) => {
                    _that._gotoNextPage(name_card_id);
                }, (err) => {
                    _that._gotoNextPage(name_card_id);
                }, true)
            }
        })
    },

    // -------------------------------Action--------------------------------------

    // [Action] 选择模板按钮点击
    selectTemplateClick: function(event) {

        let selectType = event.currentTarget.dataset.type;

        if (selectType === this.data.currentSelectTemplateType) {
            return;
        }

        if (selectType === '1') {
            wx.setNavigationBarColor({
                frontColor: '#ffffff',
                backgroundColor: '#2b2314'
            })
        } else {
            wx.setNavigationBarColor({
                frontColor: '#000000',
                backgroundColor: '#ffffff'
            })
        }

        this.setData({
            currentSelectTemplateType: selectType
        })
    },

    // [Action] 点击选择头像
    selectHeaderButtonClick: function() {

        let that = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success(res) {
                // tempFilePath可以作为img标签的src属性显示图片
                const tempFilePaths = res.tempFilePaths
                if (tempFilePaths && tempFilePaths.length > 0) {
                    that.uploadHeaderImage(tempFilePaths[0]);
                }
            }
        })
    },

    // [CallBack] 输入框回调
    textInputBlurCallback: function(event) {

        // 输入框类型
        let inputType = event.currentTarget.dataset.inputtype;

        // 输入框值
        let detail = event.detail.value.replace(/\s+/g, '');

        if (inputType === 'name') {
            this.setData({
                userName: detail
            })
        } else if (inputType === 'phone') {
            this.setData({
                userPhone: detail
            })
        } else if (inputType === 'email') {
            this.setData({
                userEmail: detail
            })
        } else if (inputType === 'staff') {
            this.setData({
                userStaff: detail
            })
        } else if (inputType === 'shop_name') {
            this.setData({
                shop_name: detail
            })
        }
    },

    // [Action] 点击保存按钮
    saveButtonClick: function() {
        if (!this._checkInputInfoIsOK()) {
            return;
        }
        // 如果是更新，就调用更新接口，否则为新用户添加
        if (this.data.isUpdate) {
            // 更新
            this.updateNameCardInfo();
        } else {
            // 添加
            this.addNameCardInfo();
        }
    },

    // [CallBack] textarea输入框Input回调
    textareaInputCallback: function(event) {

        let textareaValue = event.detail.value;
        // 字数
        let wordCount = textareaValue && textareaValue.length > 0 ? textareaValue.length : 0;

        this.setData({
            userDescWordsCount: wordCount,
        })
    },

    // [CallBack] textarea输入框Blur回调
    textareaBlurCallback: function(event) {

        let textareaValue = event.detail.value;
        this.setData({
            userDescText: textareaValue
        })
    },

    // 校验输入信息是否完整
    _checkInputInfoIsOK: function() {

        if (!this.data.userName || this.data.userName.length == 0) {
            util.MessageToast("请输入姓名");
            return false;
        }

        if (!this.data.userPhone || this.data.userPhone.length == 0) {
            util.MessageToast("请输入手机号码");
            return false;
        } else if (this.data.userPhone.length != 11) {
            util.MessageToast("请输入正确手机号码");
            return false;
        }

        if (!this.data.userStaff || this.data.userStaff.length == 0) {
            util.MessageToast("请输入职务");
            return false;
        }

        return true;
    },

    // 跳转到名片详情
    _gotoNextPage: function(name_card_id) {
        if (this.data.sourcePath && this.data.sourcePath === 'promotion') {
            this.data.popTimer = setTimeout(()=>{
                wx.navigateBack();
            }, 1000);
        } else {
            app.globalData.showInfoId = name_card_id;
            app.globalData.isFromEditPage = true;
            wx.switchTab({
                url: '/pages/myCard/myCard',
            })
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {
        this.data.popTimer && clearTimeout(this.data.popTimer);
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})
