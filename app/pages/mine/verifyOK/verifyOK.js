// pages/mine/verifyOK/verifyOK.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        nameText:'',
        cardIdText:'',
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