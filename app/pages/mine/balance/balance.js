// pages/mine/balance/balance.js

const app = getApp();

import AppService from '../../../AppService/index';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        haveVerifyInfo: false, // 是否已经完成实名认证
        balanceCount: 0, // 账户余额
        showTipsModalView: false, // 是否显示提示模态视图
        showModelView: false,
        flowList: [], // 收支记录
        currentPageIndex: 1, //当前分页索引
        isLoading: false, // 正在加载中
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.hideShareMenu();
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

        // 页码重置
        this.data.currentPageIndex = 1;
        this.data.flowList = [];

        // 获取用户基本统计数据
        this._getUserCommissionBasicStaticsData();

        // 获取用户的收益流水明细
        this._getShareBonusFlowList();

        // 获取实名认证状态
        this._getUserIdCardInfo();
    },

    // 获取用户实名状态
    _getUserIdCardInfo: function() {

        let that = this;
        AppService.OtherTask.getUserIdCardInfo(
            null,
            (result) => {
                if (result.hasOwnProperty('data') && result.data && result.data.hasOwnProperty('has_certify_info')) {
                    let rst = result.data.has_certify_info;
                    if (rst) {
                        // 已经实名认证
                        that.setData({
                            haveVerifyInfo: true, // 有实名信息
                            showModelView: false
                        });
                    } else {
                        // 未实名认证
                        that.setData({
                            haveVerifyInfo: false,   // 没有实名信息
                        })
                    }
                }
            }, (error) => {

            }
        )
    },

    // 获取用户基本统计数据
    _getUserCommissionBasicStaticsData:function() {

        let that = this;
        AppService.NameCardTask.getUserCommissionBasicStaticsData(
            (result)=>{
                if (result && result.code == 0) {
                    let _data = result.data;
                    that.setData({
                        balanceCount: parseFloat(_data.amount.toString()).toFixed(2)
                    });
                }
            }, (error)=>{

            }
        );
    },

    // 获取用户的收益流水明细
    _getShareBonusFlowList: function () {

        let that = this;

        this.data.isLogin = true;

        AppService.OtherTask.getShareBonusFlowList(
            this.data.currentPageIndex,
            20,
            (result)=>{
                that.data.isLoading = false;
                let arr = result.data;

                let historyArr = that.data.flowList ? that.data.flowList : [];

                if (arr && arr.length > 0) {
                    arr = historyArr.concat(arr);
                    that.setData({
                        flowList: arr,
                        currentPageIndex: that.data.currentPageIndex+1
                    })
                }

            }, (error)=>{
                that.data.isLoading = false;
            }
        )
    },


    // 点击提示按钮
    tipsBtnClick: function () {
        this.setData({
            showTipsModalView: true
        })
    },

    // 点击提现按钮
    cashOutBtnClick: function () {
        if (!this.data.haveVerifyInfo) {
            // 未实名认证，弹框实名认证框
            this.setData({
                showModelView: true
            })
        } else {
            wx.navigateTo({
                url: '/pages/mine/cashOut/cashOut',
            })
        }
    },

    // 关闭弹框按钮
    closeBtnClick: function () {
        this.setData({
            showModelView: false
        })
    },

    gotoAuthBtnClick: function () {
        this.setData({
            showModelView: false
        })
        wx.navigateTo({
            url: '/pages/mine/verifyName/verifyName',
        })
    },

    // 明白了
    iSeeBtnClick: function () {
        this.setData({
            showTipsModalView: false
        })
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

        if (this.data.isLoading) {
            return;
        }
        this._getShareBonusFlowList();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
