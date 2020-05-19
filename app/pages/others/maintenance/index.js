Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: '',
    isMaintenance: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _tourl = decodeURIComponent(options.url)
    this.setData({
      url: _tourl
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if(!getApp().globalData.isMaintenance) { // 不在维护中
      wx.switchTab({
        url: '/pages/mall/index'
      })
    }
  }
})