// pages/component/groupCom/groupCom.js
var app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Object,
      value: {},
      observer: function(data) {
      }
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    current: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    swiperChange: function(e) {
      // if (app.globalData.haslogin == false) {
      //   wx.navigateTo({
      //     url: '/pages/others/login/login?redirect_uri=switchTabMall'
      //   });
      //   return
      // }
      let self = this;
      console.log(e.detail.current)
      self.setData({
        current: e.detail.current
      })
    },
    goItemPage: function(e) {
      // if (app.globalData.haslogin == false) {
      //   wx.navigateTo({
      //     url: '/pages/others/login/login?redirect_uri=switchTabMall'
      //   });
      //   return
      // }
      let {
        item_id,
        status
      } = e.currentTarget.dataset.item
      if (status == 10 || status == 40 || status == 50) {
        return
      }
      
      wx.navigateTo({
        url: '/pages/product/item-detail/index?&itemId=' + item_id
      })
    },

    groupMore: function(e) {
      // if (app.globalData.haslogin == false) {
      //   wx.navigateTo({
      //     url: '/pages/others/login/login?redirect_uri=switchTabMall'
      //   });
      //   return
      // }
      console.log(e)
      // wx.switchTab({
      //   url: '../group/index'
      // })
      wx.navigateTo({
        url: '/pages/others/out/out?url=' + encodeURIComponent(e.currentTarget.dataset.more_link), //路径必须跟app.json一致
        success: function () { },
        fail: function () { }, //失败后的回调；
        complete: function () { } //结束后的回调(成功，失败都会执行)
      })
    }
  }
})