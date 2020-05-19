// pages/component/returnTop/returnTop.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    style: {
      type: String
    },
    showDistance: {
      type: Number,
      value: 650
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    returnTop(){
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 300
      })
    },
    scrollEvent(scrollTop){
      if (scrollTop > this.properties.showDistance) {
        !this.data.show && this.setData({ show: true })
      } else {
        this.data.show && this.setData({ show: false });
      }
    }
  }
})
