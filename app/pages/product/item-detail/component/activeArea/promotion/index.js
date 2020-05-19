
Component({
  /**
   * 组件的属性列表
   */
  properties: {
      list:{
          type:Array,
          value:[],

      },
      tab:{
          type:String,
          value:""
      },
      text:{
          type:String,
          value:""
      },
      hideFlag:{
          type:Boolean,
          value:false
      }
  },

  /**
   * 组件的初始数据
   */
  data: {
      promotionOne:{},//页面显示第一个
  },

  /**
   * 组件的方法列表
   */
  methods: {
      getPromotion(){
          if(!this.data.hideFlag) return;
          this.triggerEvent('getPromotion')
      }
  }
})
