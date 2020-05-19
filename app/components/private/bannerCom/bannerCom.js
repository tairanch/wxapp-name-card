// pages/conponent/bannerCom/bannerCom.js
var app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data:{
      type:Object,
      value:{}
    },
    autoplay:{
      type: Boolean,
      value: true
    },
    duration: {
      type: String,
      value: "500"
    },
    circular: {
      type: Boolean,
      value: false
    },
    current: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
   index:0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bannerClick: function (e) {
      // if (app.globalData.haslogin == false) {
      //   wx.navigateTo({
      //     url: '/pages/others/login/login?redirect_uri=switchTabMall'
      //   });
      //   return
      // }
        const reg = /^javascript/
        if( !e.currentTarget.dataset.data.link || reg.test(e.currentTarget.dataset.data.link)) {
            return
        }
        let itemId= e.currentTarget.dataset.data.link.split('?item_id=')[1]
        wx.navigateTo({
          url:'/pages/product/item-detail/index?itemId='+itemId
        })


        // wx.navigateTo({
        //     url: '/pages/others/out/out?url=' + encodeURIComponent(e.currentTarget.dataset.data.link),  //路径必须跟app.json一致
        //     success: function () {
        //     },
        //     fail: function () { },         //失败后的回调；
        //     complete: function () { }      //结束后的回调(成功，失败都会执行)
        // })
    },
    swiperChange: function (e) {
      let self = this;
      self.setData({
        index: e.detail.current
      })
    }
  }
})
