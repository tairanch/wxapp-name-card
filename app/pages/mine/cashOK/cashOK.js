/**
 * Created by mengai on 2019/5/22.
 *
 * 提现成功页
 */

import AppService from '../../../AppService/index';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        moneyCount: 0, // 提现金额
        balanceCount: 0, // 账户余额
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.hideShareMenu();

        let moneyCount = options && options.hasOwnProperty('moneyCount') ? parseFloat(options.moneyCount) : 0;

        this.setData({
            moneyCount:moneyCount
        });

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
        this._getUserCommissionBasicStaticsData();
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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
