// pages/component/advertising/advertisingCom.js
var app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data:{
      type:Object,
      value:{}
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
    onTap: function (e) {
      // if (app.globalData.haslogin == false) {
      //   wx.navigateTo({
      //     url: '/pages/others/login/login?redirect_uri=switchTabMall'
      //   });
      //   return
      // }
      var myEventDetail = {} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('myEvent', myEventDetail, myEventOption)
    },
  }
})
