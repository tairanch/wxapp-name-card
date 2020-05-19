// pages/mine/verifyName/verifyName.js
const app = getApp();

import AppService from '../../../AppService/index';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        nameText: '', // 姓名
        cardIdText: '', // 身份证号
        id_card_info: null, // 上个页面传过来编辑的身份证信息
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.hideShareMenu();

        let id_info = options.hasOwnProperty('id_card_info') ? JSON.parse(decodeURIComponent(options.id_card_info)) : null;

        if (id_info) {
            this.setData({
                id_card_info: id_info,
                nameText: id_info.name,
                cardIdText: id_info.id_number,
            });
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    onNameTextInput: function (event) {
        let value = event.detail.value;
        this.setData({
            nameText: value
        })
    },

    onCardTextInput: function (event) {
        let value = event.detail.value;
        this.setData({
            cardIdText: value
        })
    },

    // 点击保存按钮
    saveBtnClick: function () {
        if (!this.data.nameText || this.data.nameText.length == 0) {
            wx.showToast({
                title: '请输入姓名',
                icon: 'none',
                duration: 2000
            });
            return;
        } else if (!this.data.cardIdText || this.data.cardIdText.length == 0) {
            wx.showToast({
                title: '请输入身份证号',
                icon: 'none',
                duration: 2000
            });
            return;
        }

        // 判断：如果信息没有被修改，点保存直接返回，不调用接口
        if (this.data.id_card_info &&
            this.data.id_card_info.name == this.data.nameText &&
            this.data.id_card_info.id_number == this.data.cardIdText)
        {
            // 说明什么都没改变，直接返回
            wx.navigateBack({
                delta: 1
            });
            return;
        }

        let params = {
            name: this.data.nameText,
            id_number: this.data.cardIdText
        };

        wx.showLoading({
            title: '保存中...',
        });

        let that = this;
        AppService.OtherTask.saveShareBonusUser(
            params,
            (result)=>{
                if (result && result.code == 0) {
                    wx.hideLoading();
                    wx.showToast({
                        title: '保存成功',
                        icon: 'none',
                        duration: 2000
                    });

                    that.timer = setTimeout(()=>{
                        wx.navigateBack({
                            delta: 1
                        });
                    }, 2000);

                } else if (result && result.hasOwnProperty('message') && result.message.length > 0) {
                    wx.showToast({
                        title: result.message,
                        icon: 'none',
                        duration: 2000
                    });
                }
            }, (error)=>{
                wx.hideLoading();
            }, ()=>{

            }
        )


    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        this.timer && clearTimeout(this.timer);
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
