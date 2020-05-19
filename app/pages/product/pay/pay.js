// pages/product/pay/pay.js
//获取应用实例
var payApi = require('../../../utils/payApi.js');
const DcpPage = require('../../../utils/dcp/dcpPage')
DcpPage({

  /**
   * 页面的初始数据
   */
  data: {
    dcpTitle: '我的收银台',
    payId: '', // 支付订单ID
    from: '',
    successUrl: '', // success跳转地址
    errorUrl: '', // closed跳转地址
    orderDetail: {}, // 订单详情
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      payId: options.payId,
      from: options.from,
      successUrl: options.successUrl,
      errorUrl: options.errorUrl
    })
    // 请求获取订单信息
    // this.getOrderDetail(options)
  },

  onShow: function () {
    // 请求获取订单信息
    this.getOrderDetail({ payId: this.data.payId})
  },

  /**
   * 获取订单信息
   */
  getOrderDetail: function (params) {
    let _this = this
    payApi.getOrderDetailData(params, function (data) { // 方法返回的是res.data时
      // 判断订单状态，成功和失败跳转到支付结果页面
      if (data.orderStatus == 'SUCCESS') {
        _this.navigateToRes(_this.data.successUrl) // 跳转成功页面
      } else if (data.orderStatus == 'CLOSE') {
        _this.navigateToRes(_this.data.errorUrl) // 跳转失败页面
      }
      // 设置data
      _this.setData({
        orderDetail: data
      })
    })
  },

  /**
   * 点击确认支付
   */
  payBtnClick: function () {
    let params = {
      payId: this.data.payId,
      platformCode: this.data.from,
      channelPayCode: 'WEIXIN_SPP',
      returnUrl: this.data.successUrl
    }
    let _this = this
    payApi.getGateWayPay(params,
      // success
      function (res) {
        // _this.navigateToRes(_this.data.successUrl) // 跳转成功页面
      },
      // fail
      function (res) {
        // _this.navigateToRes(_this.data.errorUrl) // 跳转失败页面
      },
      // complete
      function (res) {

      }
    )
  },

  /**
   * 跳转页面
   */
  navigateToRes: function (url) {
    wx.navigateTo({
      url: '/pages/wxpage/wxpage?type=payresult&url=' + url
    })
  }
})
