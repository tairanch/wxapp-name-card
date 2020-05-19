// pages/product/shopCart/components/numWidget/NumWidget.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    quantity: {  // 数量
      type: Number
    },
    buyLimit: {  // 限制数量
      type: Number,
      value: null
    },
    disable: {   // 是否可以改变数量
      type: Boolean
    }
  },

  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
    },
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
    handleNum(event) { // 输入数量改变
      let value = event.detail.value
      this.triggerEvent('handleNum', {
        val: value
      })
    },
    handleInputNum(event) { // 数量改变 api
      let value = event.detail.value
      this.triggerEvent('handleInputNum', {
        val: +value
      })
    },
    handleReduce() { //减少
      this.triggerEvent('handleReduce')
    },
    handlePlus() { //增加
      this.triggerEvent('handlePlus')
    }
  }
})
