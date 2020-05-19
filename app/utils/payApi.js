var RequestManager = require('./RequestHelper.js');
const app = getApp();
const payUrl = app.globalData.ctxPathPay

// 获取订单详情信息
function getOrderDetailData(params, callback) {
  RequestManager.RequestGet(payUrl + '/api/v4/funds-checkstand/order/' + params.payId, params, function (res) {callback(res)})
}

// 获取网关信息支付-接口返回result.data
function getGateWayPay(params, successCallBack, failCallBack, completeCallBack) {
  RequestManager.RequestPost(payUrl + '/api/v4/funds-checkstand/trade/pay/gateway', params, function (data) {
      wx.showLoading({
        title: '加载中',
      })
      let wxpa = {
        ...data.info,
        success: function (res) { successCallBack(res) },
        fail: function (res) { failCallBack(res) },
        complete: function (res) { wx.hideLoading(); completeCallBack(res) }
      }
      
      wx.requestPayment(wxpa)
  }, function (res) {
    wx.showToast({ title: res.data.error.description || '服务端异常', icon: 'none'})
  }, false)
}

module.exports = {
  getOrderDetailData,
  getGateWayPay
}