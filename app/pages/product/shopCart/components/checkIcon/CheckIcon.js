// pages/product/shopCart/components/checkIcon/CheckIcon.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    seckill: {
      type: Boolean,
      value: false
    },
    invalid: {
      type: Boolean,
      value: false
    },
    disable: {
      type: Boolean,
      value: false
    },
    isCheck: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

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
   * 组件的方法列表
   */
  methods: {
    checkHandle(event) { // 点击事件
      if (this.properties.disable) {
        return
      }
      this.triggerEvent('handleCheck', {
        event: event
      })
    }
  }
})
