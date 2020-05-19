// pages/product/shopCart/components/storeMarket/StoreMarket.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    promotionInfo: { // 基本信息
      type: Object,
      observer: function (newVal, oldVal, changedPath){
        let { cart_list, rules } = newVal
        cart_list = JSON.parse(JSON.stringify(cart_list))
        let promotion_id = newVal['group_promotion_id']
        let calPrice = this.calPrice(cart_list, this.properties.checkObj)
        let Num = calPrice.num
        let Price = calPrice.price
        let num = this.data.num
        let price = this.data.price
        if (num !== Num && price !== Price){
          this.setData({
            num: Num,
            price: Price
          })
        } else if (num !== Num && price === price) {
          this.setData({
            num: Num
          })
        } else if (num === num && price !== Price) {
          this.setData({
            price: Price
          })
        }
      }
    },
    exchangeItem: {  // 换购商品
      type: Object,
      observer: function (newVal, oldVal, changedPath) {
        if (newVal) {
          let exchangeData = newVal['data'] ? newVal['data'] : ''
          this.setData({
            exchangeData: exchangeData
          }, () => {
            this.getSpecList()
          })
        }
      }
    },
    edit: {  //是否编辑状态
      type: Boolean,
      value: false // 属性初始值（可选），如果未指定则会根据类型选择一个
    },
    scrollOpen: {  // 左滑打开状态
      type: Boolean,
      value: false
    },
    checkObj: {
      type: Object,
      observer: function (newVal, oldVal, changedPath) {
        if (JSON.stringify(newVal) !== JSON.stringify(oldVal)){
          //换购反选删除子商品
          let { exchangeItem, promotionInfo } = this.properties;
          let { cart_list, rules } = promotionInfo
          cart_list = JSON.parse(JSON.stringify(cart_list))
          let promotion_id = promotionInfo['group_promotion_id']
          let calPrice = this.calPrice(cart_list, newVal)
          let exchange_full = 0
          if (rules && rules['ExchangeBuy']) {
            exchange_full = rules['ExchangeBuy']['exchange_full']
          }
          let Num = calPrice.num
          let Price = calPrice.price
          this.setData({
            num: Num,
            price: Price
          })
          let exchangeData = exchangeItem['data']
          if (exchangeData && exchangeData[promotion_id] && calPrice.price < exchange_full) {
            this.triggerEvent('deleteExchangeItem', {
              promotionId: promotion_id
            })
          }
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    exchangeList: [], // 换购商品列表
    num: 0,   // store数量
    price: 0,  // store总价格
    exchangeData: ''
  },

  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
      this.initData()
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    turnLink() { // 页面跳转

    },
    turnSetItem() {  //进行换购
      let { group_promotion_id, rules } = this.data.promotionInfo
      let { ExchangeBuy } = rules
      wx.navigateTo({
        url: `/pages/exchangeItem/exchangeItem?promotion_id=${group_promotion_id}&fullPrice=${ExchangeBuy['exchange_full']}&limit=${ExchangeBuy['exchange_count']}`,
      })
    },
    turnExchangeItem() { // 查看换购
      let { group_promotion_id, rules } = this.data.promotionInfo
      let { ExchangeBuy } = rules
      wx.navigateTo({
        url: `/pages/exchangeItem/exchangeItem?look=1&promotion_id=${group_promotion_id}&fullPrice=${ExchangeBuy['exchange_full']}&limit=${ExchangeBuy['exchange_count'] }`,
      })
    },
    initData(cb) { // 初始化data
      let { promotionInfo, exchangeItem, checkObj } = this.properties
      let { group_promotion_id } = promotionInfo
      let exchangeData = exchangeItem ? exchangeItem['data'] : ''
      let { cart_list } = promotionInfo
      let calPrice = this.calPrice(cart_list, checkObj)
      let Num = calPrice.num
      let Price = calPrice.price
      this.setData({
        num: Num,
        price: Price,
        exchangeData: exchangeData,
        promotionId: group_promotion_id
      }, () => {
        this.getSpecList()
      })
    },
    getSpecList() { // 用于获取specList
      let { promotionInfo, exchangeItem } = this.properties
      let { rules, group_promotion_id } = promotionInfo
      let { price, exchangeData } = this.data
      let exchangeList = []
      let exchange_full = 0
      if (rules && rules['ExchangeBuy']) {
        exchange_full = rules['ExchangeBuy']['exchange_full']
      }
      if (price > 0 && price >= exchange_full && exchangeData && exchangeData[group_promotion_id]) {
        exchangeData[group_promotion_id].forEach((item, i) => {
          if (item.check) {
            exchangeList.push(item)
          } 
        })
      }
      this.setData({
        exchangeList: exchangeList
      })
    },
    calPrice(cart_list, checkObj) {
      let Num = 0
      let Price = 0
      if (cart_list && cart_list.length > 0) {
        cart_list.map((cart) => {
          let { promotion_single, quantity, sell_price, cart_id } = cart
          let check = checkObj[cart_id]
          let cart_price = +sell_price;
          if (promotion_single && promotion_single.price && promotion_single.price > 0) {
            if (promotion_single.type === "SecKill") {
              if (new Date(promotion_single.start_time).getTime() <= new Date().getTime() < new Date(promotion_single.end_time).getTime()) {
                cart_price = +promotion_single.price
              }
            } else {
              cart_price = +promotion_single.price
            }
          }
          let isSingle = promotion_single && ['FlashSale', 'DirectReduction', 'SecKill'].indexOf(promotion_single.type) > -1 ? true : false
          if (check) {
            Num += quantity
            if (promotion_single && promotion_single.price && promotion_single.price > 0) {
              Price += parseFloat(quantity) * parseFloat(promotion_single.price)
            } else {
              Price += parseFloat(sell_price) * parseFloat(quantity)
            }
          }
        })
      }
      return {
        num: Num,
        price: Price
      }
    },

    //  改变状态的方法
    deleteExchangeItem(promotionId) { // 删除换购商品
      this.triggerEvent('deleteExchangeItem', {
        promotionId: promotionId
      })
    },
    oneNumUpdate(event){
      let detail = event.detail
      this.triggerEvent('oneNumUpdate', detail)
    },
    handleCheck(data) { // 切换header check
      this.triggerEvent('handleCheck')
    },
    oneHandleCheck(event) { // one item 切换check
      this.triggerEvent('oneHandleCheck', event.detail)
    },
    handleItemNum(event){
      this.triggerEvent('handleItemNum', event.detail)
    },
    handleItemCollect(event) {
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
