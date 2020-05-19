// pages/product/item-detail/component/cartShop/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
        count:{
            type:Number,
            value:0
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
// 跳转到购物袋
      onShopCartTap(){
          wx.navigateTo({
              url: '/pages/product/shopCart/index'
          });
      },
  }
})
