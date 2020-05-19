// pages/product/shopCart/components/specItem/SpecItem.js
Component({
  externalClasses: ['spec-class', 'spec-content'],
  /**
   * 组件的属性列表
   */
  properties: {
    itemData: {
      type: Object,
      observer: function (newVal, oldVal, changedPath) {
        this.getQuantity()
      }
    },
    edit: {  //是否编辑状态
      type: Boolean,
      value: false
    },
    type: {
      type: String
    },
    mainQuantity: { // 最大购买数量
      type: Number
    },
    give: {  //是否赠品
      type: Boolean,
      value: false
    },
    disMove: { //禁止页面左滑
      type: Boolean,
      value: false
    },
    promotionId: { // group_promotion_id
      type: Number
    }
  },
  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
      this.getQuantity()
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    isOpen: false,  // 操作打开状态
    quantity: '', // 数量
    price: '' //价格
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //  跳转详情
    godetail(event) {
      if(this.properties.edit) return
      let _itemid = event.currentTarget.dataset.itemid
      wx.navigateTo({
        url: '/pages/product/item-detail/index?&itemId=' + _itemid
      })
    },
    getQuantity() {
      const { edit, itemData, give, type, mainQuantity } = this.properties;
      let { promotion_single, item_id, sku_id, cart_id, store } = itemData;
      let price = promotion_single ? +promotion_single.price : (itemData.sell_price ? +itemData.sell_price : itemData.price);
      if (type == "ExchangeBuy") {
        price = itemData.price
      }
      let quantity = (itemData.base && mainQuantity) ? ((+itemData.base) * +mainQuantity) : 0
      if (parseFloat(store) < parseFloat(quantity)) {
        quantity = parseFloat(store)
      }
      this.setData({
        quantity: quantity,
        price: price || ''
      })
    },
    popupSaleAttr() { //商品属性
      const { edit, give, type } = this.properties;
      if ( give || type === "ExchangeBuy" && edit) return
    },
    controlOpen(event) { // getIsOpen 获取打开状态
      this.setData({
        isOpen: event.detail.status,
      })
    },
    handleCollect() {
      let { itemData } = this.properties;
      this.triggerEvent('handleItemCollect', {
        itemId: itemData.item_id,
        promotionId: this.properties.promotionId
      })
    },
    handleDelete() {
      let { itemData } = this.properties;
      this.triggerEvent('handleItemDelete', {
        itemId: itemData.item_id,
        promotionId: this.properties.promotionId
      })
    }
  }
})
