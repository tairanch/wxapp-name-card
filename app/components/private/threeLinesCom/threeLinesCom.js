// pages/component/threeLinesCom/threeLinesCom.js
var app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Object,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    goItemPage: function(e) {
      // if (app.globalData.haslogin == false) {
      //   wx.navigateTo({
      //     url: '/pages/others/login/login?redirect_uri=switchTabMall'
      //   });
      //   return
      // }
      if (e.currentTarget.dataset.insertimg) {
        e.currentTarget.dataset.link && wx.navigateTo({
          url: '/pages/others/out/out?url=' + encodeURIComponent(e.currentTarget.dataset.link), //路径必须跟app.json一致
          success: function() {},
          fail: function() {}, //失败后的回调；
          complete: function() {} //结束后的回调(成功，失败都会执行)
        })
      } else {
        let {
          item_id,
          status
        } = e.currentTarget.dataset.item
        if (status == 10||status == 40 || status == 50) {
          return
        }
        wx.navigateTo({
          url: '/pages/product/item-detail/index?&itemId=' + item_id
        })
      }
    },
    goMore: function(e) {
      // if (app.globalData.haslogin == false) {
      //   wx.navigateTo({
      //     url: '/pages/others/login/login?redirect_uri=switchTabMall'
      //   });
      //   return
      // }
      // wx.switchTab({
      //   url: e.currentTarget.dataset.more_link
      // })
      wx.navigateTo({
        url: '/pages/others/out/out?url=' + encodeURIComponent(e.currentTarget.dataset.more_link), //路径必须跟app.json一致
        success: function() {},
        fail: function() {}, //失败后的回调；
        complete: function() {} //结束后的回调(成功，失败都会执行)
      })
    },
    imgTopLink: function(e) {
      // if (app.globalData.haslogin == false) {
      //   wx.navigateTo({
      //     url: '/pages/others/login/login?redirect_uri=switchTabMall'
      //   });
      //   return
      // }
      if (e.currentTarget.dataset.link) {
        wx.navigateTo({
          url: '/pages/others/out/out?url=' + encodeURIComponent(e.currentTarget.dataset.link), //路径必须跟app.json一致
          success: function() {},
          fail: function() {}, //失败后的回调；
          complete: function() {} //结束后的回调(成功，失败都会执行)
        })
      }
    }
  }
})