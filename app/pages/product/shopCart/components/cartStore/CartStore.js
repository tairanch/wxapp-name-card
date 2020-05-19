// pages/product/shopCart/components/cartStore/CartStore.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    shopInfo: {  // shop_info信息
      type: Object,
      value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: function (newVal, oldVal, changedPath) {
        // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
        // 通常 newVal 就是新设置的数据， oldVal 是旧数据
      }
    },
    checkObj: {  // check信息
      type: Object
    },
    promotionList: { // goods list
      type: Array
    },
    exchangeItem: {  // 换购商品
      type: Object
    },
    shopLevelGroupId: {
      type: Number
    },
    storeEdit: {
      type: Boolean,
      observer: function (newVal, oldVal, changedPath) {
          this.setData({
              edit: newVal
          })
      }
    },
    scrollOpen: {  // 左滑打开状态
      type: Boolean,
      value: false
    },
    shopid: {
      type: Number
    },
    scrollTopObj: {
      type: null
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
    edit: false, // 编辑状态
    timer: null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    turnLink(event) {   //页面跳转
      if (this.properties.shopInfo.is_open == 1 && !this.data.edit) {
        let shopid = event.currentTarget.dataset.shopid
        wx.navigateTo({
          url: '/pages/wxpage/wxpage?type=storeHome&shop_id=' + shopid
        })
      } else {
        return
      }
    },
    toggleEdit() { // 改变编辑状态
      let edit = !this.data.edit
      this.setData({ edit: edit });
      this.triggerEvent('computeEditNum', {
        status: edit
      })
    },
    popupCoupon(event) { // 领取优惠券
      let shopId = event.currentTarget.dataset.shopid
      let shopName = event.currentTarget.dataset.shopname
      this.triggerEvent('popupCoupon',{
        shopId: shopId,
        shopName: shopName
      })
    },
    deleteExchangeItem(event) { //删除换购商品
      let detail = event.detail
      let promotionId = detail ? detail.promotionId : ''
      this.triggerEvent('deleteExchangeItem', {
        promotionId: promotionId
      })
    },
    handleCheck() { // 触发点击icon事件
    // 父组件：bindhandleCheck='handleCheck'
      this.triggerEvent('handleCheck')
    },
    oneHandleCheck(event) {
      this.triggerEvent('oneHandleCheck', Object.assign({}, event.detail,{
        shopId: this.properties.shopid
      }))
    },
    oneNumUpdate(event) {
      let detail = event.detail
      this.triggerEvent('oneNumUpdate', detail)
    },
    handleItemNum(event) {
      this.triggerEvent('handleItemNum', event.detail)
    },
    handleItemCollect(event){
      this.triggerEvent('handleItemCollect', event.detail)
    },
    handleItemDelete(event) {
      this.triggerEvent('handleItemDelete', event.detail)
    },
    handleSecItemCollect(event) {
      this.triggerEvent('handleSecItemCollect', event.detail)
    },
    handleSpecItemDelete(event) {
      this.triggerEvent('handleSpecItemDelete', event.detail)
    },
    popupSaleAttr(event) {
      this.triggerEvent('popupSaleAttr', event.detail)
    },
    scrollCtrl(event) {
      this.triggerEvent('scrollCtrl', {
        status: event.detail.status
      })
    }
  }
})
