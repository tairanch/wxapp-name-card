// pages/product/shopCart/components/marketHeader/MarketHeader.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    type: { //促销类型
      type: String,
      value: ''
    },
    rules: { //促销规则
      type: Object
    },
    Price: {  //商品价格
      type: Number,
      observer: function (newVal, oldVal, changedPath) {
        this.getData()
      }
    },
    Num: {   //商品数量
      type: Number,
      observer: function (newVal, oldVal, changedPath) {
        this.getData()
      }
    },
    group_promotion_id: {
      type: String
    },
    edit: {  //是否编辑状态
      type: Boolean
    },
    exchangeDataLength: { // 换购商品数量
      type: Number
    },
    cartList: {    // 对应的商品
      type: Array
    },
    checkObj: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    cart_list: [],  //排序后的商品
    is_satisfied: false, //是否满足促销条件
    perPrice: 0,  //优惠的价格
    fullMinus: {
      perDeductTmp: 0,
      fullMinusMoney: 0,
      fullMinusText: ''
    },
    fullDiscount: {
      fullDiscount: 0,
      fullDiscountText: ''
    },
    optionBuy: {
      tmpBuyQuantity: 0,
      perBuyPrice: 0
    },
    exchangeBuy: {

    }
  },

  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
      this.getData()
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getData() { // 处理相关数据
      let { rules, type, group_promotion_id, edit, exchangeDataLength, Num, Price, cartList } = this.properties;
      let cart_list = JSON.parse(JSON.stringify(cartList))
      let activity = "";
      let is_satisfied = false;
      let perPrice = 0
      switch (type) {
        //满减
        case "FullMinus":
          let FullMinus = rules['FullMinus']
          let perDeductTmp = 0;
          let fullMinusMoney = 0;
          FullMinus.sort(this.compare('limit_money', true))
          if (rules['has_high_limit'] == 0) {
            let multiple = Math.floor((Price / (FullMinus[FullMinus.length - 1].limit_money)))
            if (multiple > 0) {
              perDeductTmp = multiple * (parseFloat(FullMinus[FullMinus.length - 1].deduct_money))
              fullMinusMoney = multiple * (parseFloat(FullMinus[FullMinus.length - 1].limit_money))
              is_satisfied = perDeductTmp > 0 ? true : false
              Price = Math.floor((Price / (FullMinus[FullMinus.length - 1].limit_money))) * (parseFloat(FullMinus[FullMinus.length - 1].limit_money))
            } else {
              FullMinus.some((full) => {
                const { limit_money, deduct_money } = full
                if (Price < parseFloat(limit_money)) {
                  return true
                } else {
                  perDeductTmp = +deduct_money
                  fullMinusMoney = +limit_money
                  is_satisfied = true
                  return false
                }
              })
            }
          } else {
            FullMinus.some((full) => {
              const { limit_money, deduct_money } = full
              if (Price < parseFloat(limit_money)) {
                return true
              } else {
                perDeductTmp = deduct_money
                fullMinusMoney = +limit_money
                is_satisfied = true
                return false
              }
            })
          }
          let fullMinusText = ''
          rules['FullMinus'].some((rule, i) => {
            if (i === (rules['FullMinus'].length - 1)) {
              fullMinusText += `满${rule.limit_money}减${rule.deduct_money}`
              return true
            } else {
              fullMinusText += `满${rule.limit_money}减${rule.deduct_money}，`
              return false
            }
          })
          fullMinusText = rules.has_high_limit == 0 ? fullMinusText + "，上不封顶" : fullMinusText
          this.setData({
            is_satisfied: is_satisfied,
            perPrice: perPrice,
            fullMinus: {
              perDeductTmp: perDeductTmp,
              fullMinusMoney: fullMinusMoney,
              fullMinusText: fullMinusText
            }
          })
          break;
        //满折
        case "FullDiscount":
          let fullDiscount = 0;
          let FullDiscount = rules['FullDiscount']
          FullDiscount.sort(this.compare('full', true))
          if (Num >= FullDiscount[0].full) {
            is_satisfied = true
            let tmpFull = 1
            let tmpPercent = 0
            rules['FullDiscount'].map((discount) => {
              if (tmpFull <= discount.full) {
                tmpFull = parseFloat(discount.full)
              }
              if (Num >= discount.full && tmpFull <= discount.full) {
                tmpFull = parseFloat(discount.full)
                tmpPercent = discount.percent
                fullDiscount = tmpFull
              }
            })
            perPrice = Price * (1 - tmpPercent / 100)
          }
          let fullDiscountText = ''
          rules['FullDiscount'].some((rule, i) => {
            if (i === (rules['FullDiscount'].length - 1)) {
              fullDiscountText += `${rule.full}件${rule.percent / 10}折`
              return true
            } else {
              fullDiscountText += `${rule.full}件${rule.percent / 10}折，`
              return false
            }
          })
          this.setData({
            is_satisfied: is_satisfied,
            perPrice: perPrice,
            fullDiscount: {
              fullDiscount: fullDiscount,
              fullDiscountText: fullDiscountText
            }
          })
          break;
        //N元任选
        case "OptionBuy":
          let tmpBuyQuantity = 0
          let perBuyPrice = 0
          let promotionCheckObj = this.properties.checkObj
          if (Num >= rules['OptionBuy']['quantity']) {
            is_satisfied = true
            let OptionBuy = rules['OptionBuy']
            if (Price >= OptionBuy.amount) {
              let _cart_list = JSON.parse(JSON.stringify(cart_list))
              _cart_list.sort(this.compare('sell_price', false))
              for (let i = 0; i < _cart_list.length; i++) {
                let cart = _cart_list[i]
                let { promotion_single, sell_price, quantity, cart_id } = cart
                let check = promotionCheckObj[cart_id]
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
                  if (tmpBuyQuantity < parseFloat(OptionBuy.quantity)) {
                    for (let j = 0; j < quantity; j++) {
                      if (tmpBuyQuantity < parseFloat(OptionBuy.quantity)) {
                        tmpBuyQuantity++
                        if (promotion_single && promotion_single.price && promotion_single.price > 0) {
                          perBuyPrice += parseFloat(promotion_single.price)
                        } else {
                          perBuyPrice += parseFloat(sell_price)
                        }
                      } else {
                        break
                      }
                    }
                  } else {
                    break
                  }
                }
              }
            }
            if (Price >= parseFloat(OptionBuy.amount)) {
              perPrice = (perBuyPrice - parseFloat(OptionBuy.amount))
            } else {
              perPrice = 0
            }
          }
          this.setData({
            perPrice: perPrice,
            is_satisfied: is_satisfied,
            optionBuy: {
              tmpBuyQuantity: tmpBuyQuantity,
              perBuyPrice: perBuyPrice
            }
          })
          break;
        //换购
        case "ExchangeBuy":
          if (Price >= parseFloat(rules['ExchangeBuy']['exchange_full'])) {
            is_satisfied = true
          }
          this.setData({
            is_satisfied: is_satisfied
          })
        default:
          break;
      }

    },
    turnLink() { //跳转
        return; // 名片小程序0.6版本，隐藏凑单入口
      if (this.properties.edit) return
      wx.navigateTo({
        url: '/pages/wxpage/wxpage?type=searchResult&promotion_id=' + this.properties.group_promotion_id
      })
    },
    compare(prop, sort) { // 排序
      return function (obj1, obj2) {
        const val1 = parseFloat(obj1[prop]);
        const val2 = parseFloat(obj2[prop]);
        if (val1 < val2) {
          if (sort) {
            return -1;
          } else {
            return 1
          }
        } else if (val1 > val2) {
          if (sort) {
            return 1;
          } else {
            return -1
          }

        } else {
          return 0;
        }
      }
    }

  }
})
