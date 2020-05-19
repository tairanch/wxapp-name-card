// pages/product/shopCart/components/storeHeader/StoreHeader.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    shopInfo: {
      type: Object,
      value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: function (newVal, oldVal, changedPath) {
        // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
        // 通常 newVal 就是新设置的数据， oldVal 是旧数据
      }
    },
    edit: {
      type: Boolean,
      value: false, // 属性初始值（可选），如果未指定则会根据类型选择一个
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
    toggleEdit() { // 改变编辑状态
      console.log('toggle')
    },
    toggleCheck() { // 改变店铺check状态

    },
    handleCheck(){ // 触发点击icon事件
      this.triggerEvent('handleCheck')
    }
  }
})
