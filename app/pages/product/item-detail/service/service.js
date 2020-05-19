// pages/item-detail/service/service.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

    web_src:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let web_src = decodeURIComponent(options.serviceUrl);
    this.setData({
      web_src:web_src
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  }
})