import createPage from '../../../../store/westore/createPage'
// import RequestManager from '../../../../utils/RequestHelper'

// const ctxPath = getApp().globalData.ctxPath;
// const pageApi={
//     initOrderData: {url: `${ctxPath}/order/init`, method: "RequestPost"}, //订单确认初始接口
//     recalculate: {url: `${ctxPath}/order/recalculate`, method: "RequestPost"},  //重计分摊借口（红包 地址 优惠券）
//     couponRecalculate: {url: `${ctxPath}/order/applyCouponRecalculate`, method: "RequestPost"},  //应用卡券快速重计分摊接口
//     initCoupon: {url: `${ctxPath}/promotion/getTradeCoupons`, method: "RequestPost"},  //拉取优惠券和红包接口
//     orderSubmit: {url: `${ctxPath}/order/create`, method: "RequestPost"},  //创建订单接口
//     certifyIdentityCard: {url: `${ctxPath}/user/certifyIdentityCard`, method: "RequestGet"}, //身份证认证
//     getUserInvoice: {url: `${ctxPath}/user/getUserInvoice`, method: "RequestGet"}, //判断是否有邮箱
//     getInvalidSupplyGoods: {url: `${ctxPath}/order/getInvalidSupplyGoods`, method: "RequestPost"}, //获取供应链无库存得商品堆
// };



createPage({
  /**
   * 页面的初始数据
   */
    data: {
      orderConfirm:{
          params:{},
          address:{},
      },
    },
  jumpAddress(){
    wx.navigateTo({
      url: '/pages/mine/address/index',
    })
  },

    loadDetail(options){
        /*item_id  存在 从购物袋进入 不存在 详情页立即购买
        * storage数据进入当前页面之前存入本地的
        * params
        * address 详情页面的地址选择
        * 地址切换之后更新数据
        * */
        let {item_id}=options;
        let params = !item_id? wx.getStorageSync('cart_buy'): wx.getStorageSync('fast_buy');
        let address = item_id ? wx.getStorageSync('areaData'):'';
        let subscribe = JSON.stringify(params.subscribe);
        this.store.update({
            params:{
                buyMode:"cart_buy",
                bizMode:"online",
                bizAttr:"trmall",
                subscribe:JSON.stringify([{"quantity":3,"cart_id":450574,"item_id":53524,"sku_id":103745,"extra":{"promotion":[]},"created_at":"2019-05-30 10:35:44"},{"quantity":2,"cart_id":450567,"item_id":66107,"sku_id":129020,"extra":{"promotion":[]},"created_at":"2019-05-30 10:35:44"}]),
                address:""
            }
        }).then(()=>{
            console.log(this.store.data.params)
        })


            /*...params,
            address,
            subscribe*/
        /*this.store.orderConfirm.loadData({
            buyMode:"cart_buy",
            bizMode:"online",
            bizAttr:"trmall",
            subscribe:JSON.stringify([{"quantity":3,"cart_id":450574,"item_id":53524,"sku_id":103745,"extra":{"promotion":[]},"created_at":"2019-05-30 10:35:44"},{"quantity":2,"cart_id":450567,"item_id":66107,"sku_id":129020,"extra":{"promotion":[]},"created_at":"2019-05-30 10:35:44"}]),
            address:""
        },(res)=>{
            console.log(res)
        },(error)=>{
            console.log(error)
        })*/






        // RequestManager.RequestGet(pageApi.initOrderData.url, {
        //     ...params,
        //     subscribe: subscribe,
        //     address: JSON.stringify(newAddress)
        // },  (res) => {
        //     if (res.code === 0) {
        //         // this.initialData(res, onload)
        //     } else {
        //         // this.initialError(res)
        //     }
        // }, (err) => { // error
        //     if (err && err.data && err.data.code === 504) {
        //         // this.initialNetError()
        //     } else {
        //         // this.initialError()
        //     }
        // })
    },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
      this.loadDetail(options)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      // let page=getCurrentPages();
    // console.log(page[page.length-1]['options'])
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
