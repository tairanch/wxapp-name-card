// pages/component/card/card-component.js
// pages/mine/mine/index.js
/**
 * <pre>
 *      Copyright    : Copyright (c) 2019.
 *      Author       : zhufengyi.
 *      Created Time : 2019/4/1.
 *      Desc         : 卡片通用组件，不要重新建组件
 * </pre>
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {

    // 姓名
    name: {
      type: String,
      value: ''
    },

    // 职业
    professional: {

      type: String,
      value: ''
    },

    // 电话号码
    phone: {
      type: String,
      value: ''
    },

    // 邮箱
    email: {
      type: String,
      value: ''
    },

    // 头像
    portrait: {

      type: String,
      value: ""
    },

    // 分享图片
    shareImage:{
      type:String,
      value:''
    },

    // 店铺id
    shopId:{
     type:String,
      value:''
    },

    cardId: {
      type: String,
    }


  },

  /**
   * 组件的初始数据
   */
  data: {

  },


  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名

    // 在组件实例刚刚被创建时执行
    created() {
    },
    
    attached() {

    },
  },

  
  /**
   * 组件的方法列表
   */
  methods: {
    
    //  获取
    onGoCardDetailTap: function(e) {

      // let _id = e.currentTarget.dataset.id
      // app.globalData.showInfoId = _id
      // wx.switchTab({
      //   url: '/pages/myCard/myCard?cardId=' + _id,
      // })
    },

    // 编辑名片
    onEditCardTap: function() {

      this.triggerEvent('edit', {shopId:this.data.shopId});
    },

    // 分享
    onShareCardTap: function() {

      this.triggerEvent('share');
    }
  }

})