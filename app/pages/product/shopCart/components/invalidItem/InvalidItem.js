// pages/product/shopCart/components/invalidItem/InvalidItem.js
Component({
  externalClasses: ['info-class'],
  /**
   * 组件的属性列表
   */
  properties: {
    edit: {  //是否编辑状态
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal, changedPath) {
        // if (newVal && oldVal) {
        //   this.setData({ isOpen: false });
        // }
      }
    },
    itemData: {
      type: Object
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    isOpen: false,  // 操作打开状态
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
    turnLink(event) {   //页面跳转
      let swiperCtrl = this.selectComponent('.swiper-ctrl')
      swiperCtrl.onTap(event, () => {
        if (this.properties.edit) return
        let itemid = event.currentTarget.dataset.itemid
        wx.navigateTo({
          url: '/pages/product/item-detail/index?&itemId=' + itemid
        })
      })
    },
    handleCollect(event){ // 收藏
      let swiperCtrl = this.selectComponent('.swiper-ctrl')
      swiperCtrl.onTap(event, () => {
        let dataset = event.currentTarget.dataset
        this.triggerEvent('handleCollect', {
          cart_id: dataset.cartid
        })
      })
    },
    handleDelete(event) { // 删除
      let swiperCtrl = this.selectComponent('.swiper-ctrl')
      swiperCtrl.onTap(event, () => {
        let dataset = event.currentTarget.dataset
        this.triggerEvent('handleDelete', {
          cart_id: dataset.cartid
        })
      })
    },
    //改变编辑区域打开状态
    getIsOpen(event){
      this.setData({
        isOpen: event.detail.status
      })
    }
  }
})
