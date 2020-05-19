// pages/product/item-detail/component/chooseSpec/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
      retState:{
          type:Object,
          value:{}
      },
  },

  /**
   * 组件的初始数据
   */
  data: {
      chooseSpec:[]
  },

  /**
   * 组件的方法列表
   */
  methods: {
      selectSku(){
          this.triggerEvent('skuShow')
      }
  }
})
