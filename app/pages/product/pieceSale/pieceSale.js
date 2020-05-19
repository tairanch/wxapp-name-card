// pages/product/pieceSale/pieceSale.js
let RequestManager = require('../../../utils/RequestHelper.js');
let app = getApp();
let ctxPath = app.globalData.ncxcxPath;
let pageApi = {
  getMyGroupBuy: { url: ctxPath + '/ncxcx/promotion/myGroupBuy', method: "RequestGetNoLoading" },
};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navData: [{text: '全部'},{text: '拼团中'},{text: '拼团成功'},{text: '拼团失败'}],
    currentTab: 0,

    scrollTop:0,
    page: 1,
    groupStatus:4,
    shopLists: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    wx.hideShareMenu()//隐藏分享
    this.requestList('加载数据中');
  },

  /**
   * 点击切换导航
   */
  onSwitchNav(event) {
    let cur = event.currentTarget.dataset.current;
    this.handleSwitch(cur);
  },

  /**
   * 滚动swiper
   */
  onSwitchTab(event) {
    let cur = event.detail.current;
    this.handleSwitch(cur);
  },

  /**
   * 处理页面切换
   */
  handleSwitch(cur){
    this.setData({
      currentTab: cur,
      scrollTop:0
    });
    if (cur === 0) {
      this.data.groupStatus = 4
    } else if (cur === 1) {
      this.data.groupStatus = 1
    } else if (cur === 2) {
      this.data.groupStatus = 2
    } else {
      this.data.groupStatus = 0
    }
    this.data.page = 1;
    this.requestList('加载数据中');
  },

  /**
   * 获取数据列表
   */
  requestList(msg) {
    let that = this;
    wx.showLoading({
      title: msg,
    });
    let api = pageApi['getMyGroupBuy'];
    RequestManager[api.method](api.url, {
      page: that.data.page,
      page_size: 10,
      group_status: that.data.groupStatus,
    }, function (res) {
      console.log(res);
      let data = res.data.group.data;
      if (data.length <= 0) {
        if (that.data.page === 1) {
          that.setData({
            shopLists: []
          });
          wx.showToast({
            title: '您还没有相关订单',
            icon: 'none',
            duration: 1000,
          });
        }else{
          wx.showToast({
            title: '没有更多数据了...',
            icon: 'none',
            duration: 1000,
          });
        }
      } else {
        let contentlistTem = that.data.shopLists;
        if (that.data.page === 1) {
          contentlistTem = [];
          that.setData({
            shopLists: contentlistTem.concat(data)
          });
        } else {
          that.setData({
            shopLists: contentlistTem.concat(data)
          });
        }
        wx.hideLoading();
      }
      // 隐藏导航栏加载框
      wx.hideNavigationBarLoading();
      // 停止下拉动作
      wx.stopPullDownRefresh();
    }, function (err) {
      console.log(err);
      errTost(err);
    }, true);
  },

  /**
   * 上拉刷新
   */
  refreshTop() {
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    this.data.page = 1;
    this.requestList('正在刷新数据');
  },

  /**
   * 下拉加载
   */
  reactBottom() {
    this.setData({
      page: this.data.page + 1
    });
    this.requestList('加载更多数据');
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
});
