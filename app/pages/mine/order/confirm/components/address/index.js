// pages/mine/order/confirm/components/address/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
      address:{
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
        jumpAddress(){
          this.triggerEvent('jumpAddress')
        }
  }
})
