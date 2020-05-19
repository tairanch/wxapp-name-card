// pages/product/item-detail/component/shareEarn/index.js

Component({
  /**
   * 组件的属性列表
   */
  properties: {
      promotion:{
          type:Object,
          value:{}
      },
      commissionUcenterLoginType:{//是否显示分享浮动蒙层
          type:Boolean,
          value: false
      },
      detail:{
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
      onShareEarnTap({currentTarget:{dataset}}) {
          let {item_id}=this.data.detail;
          wx.navigateTo({
              url: `/pages/product/shareMiddlePage/shareMiddlePage?item_id=${item_id}&commission_min_price=${dataset.price}`
          });
      },
  }
})
