export default {
  data: {
    load: true,
    shopCartData: null,  // 购物袋数据
    shopCheckObj: null   // 购物袋勾选d数据 this.store.data.shopCart.shopCheckObj
  },
  setData: function(shopCartData) {
    if (shopCartData) {
      this.data.shopCartData = JSON.parse(JSON.stringify(shopCartData))
    } else {
      this.data.shopCartData = null
    }
  },
  setCheck: function (shopCheckObj) { // setShopCartCheck
    if (shopCheckObj) {
      this.data.shopCheckObj = JSON.parse(JSON.stringify(shopCheckObj))
    } else {
      this.data.shopCheckObj = null
    }
  }
}