// pages/component/empty/ErrorPage/ErrorPage.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    text: {
      type: String,
      value: "网络异常，点击重试~"
    },
    btnText: {
      type: String,
      value: '重新加载'
    },
    link: {
      type: String
    },
    imgUrl: {
      type: String,
      value: '/components/public/EmptyPage/img/net-error.png'
    },
    btnStyle: {
      type: Object
    },
    imgWidth: {
      type: String,
      value: "110px"
    },
    imgHeight: {
      type: String,
      value: "110px"
    },
    zIndex: {
      type: Number,
      value: 0
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
    btnClick() {
      this.triggerEvent('btnClick')
    }
  }
})
