var RequestManager = require('./RequestHelper.js');
var util = require('./util.js');
const app = getApp();
function classifyListData(callBack) {
  var _this = this;
  RequestManager.RequestGet('', null, function(res) {
    callBack(res)
  })
}
// 订单微信支付
function payOrderByWechat(orderId, successBack, failureBack) {
  var _this = this;
  var params = {
    orderId: orderId,
    payType: 1
  }
  RequestManager.RequestPost('', params, function(res) {
    wx.requestPayment({
      'timeStamp': res.timeStamp,
      'nonceStr': res.nonceStr,
      'package': res.prepayId,
      'signType': res.signType,
      'paySign': res.paySign,
      'success': function(res) {
        successBack(res)
      },
      'fail': function(res) {
        failureBack(res)
      },
      'complete': function(res) {
        
      }
    })

  }, function(res) {
    failureBack(res)
  })

}
// 轮廓图
function getAdsImage(callBack) {
  RequestManager.RequestPost('', null, function(res) {
    callBack(res)
  }, null, true)
}

// 获取首页数据
function gethomePageData(callBack) {
  RequestManager.RequestGet(app.globalData.ctxPath+'/ncxcx/module/getHomeModuleList',{}, function (res) {
    callBack(res);
  }, null, true)
}

// 获取首页搜索预设词
function getSearchDefaultWord(callBack) {
  RequestManager.RequestGet(app.globalData.ctxPath + '/ncxcx/search/placeholder', { terminal: 8 }, function (res) {
    callBack(res);
  }, null, true)
}

// 我的页面接口
// 我的拼团 收藏 卡券包  卡券包（优惠券  红包）
function getMoreCount(callBack) {
  RequestManager.RequestGet(app.globalData.ctxPath + '/ncxcx/getMoreCount', {}, function (res) {
    callBack(res);
  }, null, true)
}
// 用户信息
function getUserInfo(callBack) {
  wx.request({
    url: app.globalData.UCUrl + '/foundation-user/user',
    data: { needPhone: true },
    method: 'GET',
    header: { 'Authorization': "Bearer " + app.globalData.globtoken },
    success: function (res) {
      callBack(res);

    },
    fail: function (res) {
      wx.hideLoading()

    },
    complete: function (res) {

    }
  })

  // RequestManager.RequestGet('https://ucenter.trc.com/gateway/foundation-user/user', { needPhone: true }, function (res) {
  //   callBack(res);
  // }, null, false)
}
// 订单数据
function getOrderCount(callBack) {
  RequestManager.RequestPost(app.globalData.ctxPath + '/ncxcx/user/order/count', {}, function (res) {
    callBack(res);
  }, null, true)
}
// E卡数据
function eCardCount(callBack) {
  RequestManager.RequestGet(app.globalData.ctxPathPay +'/api/v3/ecard-dew/card/account/info', {}, function (res) {
    callBack(res);
  }, null, true)
}

// 名片
function getCustomerFollowNameCardList(params, callBack) {
  RequestManager.RequestGet(app.globalData.ncxcxPath + '/api/getCustomerFollowNameCardList', { code: params}, function (res) {
    callBack(res);
  }, null, true)
}

// 获取分佣信息页面数据
function getUserPromoteInfo(callBack) {

    RequestManager.RequestGet(app.globalData.ncxcxPath + '/ncxcx/demo/getCommissionOrderList', {}, function (res) {
        callBack(res);
    }, null, true)
}


// 获取佣金明细列表接口
// type:0：全部 1：待入账 2：已入账 3：取消入账	
// page:页数	
function getUserCommissionList(params, callBack) {
  RequestManager.RequestGet(app.globalData.ncxcxPath + '/ncxcx/commission/getUserCommissionList', params, function (res) {
    callBack(res);
  }, null, false)
}


// 获取业务员名片列表
function getSalesmanNameCardList(callBack) {
  RequestManager.RequestGet(app.globalData.ncxcxPath + '/api/getSalesmanNameCardList', {}, function (res) {
    callBack(res);
  }, null, true)
}


// 判断登录的用户是否为业务员
function isSalesman(callBack) {
  RequestManager.RequestGet(app.globalData.ncxcxPath + '/api/isSalesman', {}, function (res) {
    callBack(res);
  }, null, true)
}

module.exports = {
  classifyListData: classifyListData,
  payOrderByWechat: payOrderByWechat,
  getAdsImage: getAdsImage,
  gethomePageData:gethomePageData,
  getSearchDefaultWord: getSearchDefaultWord,
  getMoreCount: getMoreCount,
  getOrderCount: getOrderCount,
  eCardCount: eCardCount,
  getUserInfo: getUserInfo,
  getCustomerFollowNameCardList: getCustomerFollowNameCardList,
  getUserPromoteInfo:getUserPromoteInfo,
  getUserCommissionList: getUserCommissionList,
  getSalesmanNameCardList: getSalesmanNameCardList,
  isSalesman: isSalesman
}
