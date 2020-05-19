// pages/product/item-detail/component/evaluate/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
      rate:{
          type:Object,
          value:{}
      },
      itemId:{
          type: String,
          value: ""
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
      _evaluate(){
          let path = `../../wxpage/wxpage?type=evaluate&item_id=${this.data.itemId}`;
          wx.navigateTo({
              url: path
          });
      }
  }
})
