// pages/product/item-detail/component/activeArea/coupon/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
      coupon:{
          type:Array,
          value:[],
          observer(val){
              let couponList= val.length>3?val.slice(0,3):val;
              this.setData({couponList})
          }
      }
  },

  /**
   * 组件的初始数据
   */
  data: {
      couponList:[]
  },

  /**
   * 组件的方法列表
   */
  methods: {
      getCoupon(){
          this.triggerEvent('getCoupon')
      }
  }
})
