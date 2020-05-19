'use strict';

var RequestManager = require('./RequestHelper.js');
var util = require('./util.js');
var app = getApp();
// const getApp().dcp = require('./dcp/dcp_miniprogram.min.js');

function getCode(callBack) {
  wx.login({
    success: function success(res) {
      wx.getUserInfo({
        success: function success(ress) {
          getApp().globalData.userInfo = ress.userInfo;
          var _data = {
            ress: ress,
            code: res.code
          };
          callBack(_data);
        }
      });
    }
  });
}

function didHasLoad(data, _code, redirect_uri) {
  var _this = this;
  var params = {
    mpIV: data.iv,
    mpEncryptedData: data.encryptedData,
    appId: getApp().globalData.baseAppId,
    code: _code,
    returnBy: 'JSON',
    platform: "MINI_PROGRAM"
  };
  RequestManager.RequestGet(getApp().globalData.UCUrl + '/foundation-user/login/wechat', params, function (res) {
    removeStorage()
    if (res.body !== null) {
      getApp().globalData.globInent = res.body.ident;
      var _token = res.body.token;
      if (_token !== null) {
        getApp().globalData.globtoken = res.body.token;
        getApp().globalData.globOpenID = res.body.extraInfo.openId;
        getApp().globalData.haslogin = true;
        getApp().globalData.userInfo.isNew = res.body.isNew;
        if (getApp().globalData.commissionUcenterId != '') {
          isSalesmanLogin()
        }
        setXcxStorage(res.body.token,res.body.extraInfo.openId)
        getApp().dcp.storedUserId(res.body.userId)  // dcp采集userId
        if (redirect_uri != null) {
          if (redirect_uri == 'switchTabMine') {
            wx.switchTab({
              url: '/pages/mine/mine/index'
            });
          } else if (redirect_uri == 'switchTabMall'){
            wx.switchTab({
              url: '/pages/mall/index'
            });
          }else if (redirect_uri == 'space'){

          }
          else{ 
            wx.reLaunch({
              url: '/pages/wxpage/wxpage?type=backtowx&backtowx=' + redirect_uri
            });
          }
        } else {
            wx.switchTab({
              url: '/pages/mall/index'
            });
        }
      } else {
        wx.redirectTo({
          url: '/pages/others/login/login'
        });
      }
    } else {
      wx.redirectTo({
        url: '/pages/others/login/login'
      });
    }
  });
}

// 处理登录 却不跳转
function didHasLoadFirst(data, _code, redirect_uri) {
  var _this = this;
  var params = {
    mpIV: data.iv,
    mpEncryptedData: data.encryptedData,
    appId: getApp().globalData.baseAppId,
    code: _code,
    returnBy: 'JSON',
    platform: "MINI_PROGRAM"
  };
  RequestManager.RequestGet(getApp().globalData.UCUrl + '/foundation-user/login/wechat', params, function (res) {
    removeStorage()//登录失败 清除本地 storage
    if (res.body !== null) {
      getApp().globalData.globInent = res.body.ident;
      var _token = res.body.token;
      if (_token !== null) {
        getApp().globalData.globtoken = res.body.token;
        getApp().globalData.globOpenID = res.body.extraInfo.openId;
        getApp().globalData.haslogin = true;
        getApp().globalData.userInfo.isNew = res.body.isNew;
        if (getApp().globalData.commissionUcenterId != '') {
          isSalesmanLogin()
        }
        setXcxStorage(res.body.token,res.body.extraInfo.openId)
        getApp().dcp.storedUserId(res.body.userId)  // dcp采集openId
        if (redirect_uri != null) {
          if (redirect_uri == 'switchTabMine') {
            wx.switchTab({
              url: '/pages/mine/mine/index'
            });
          } else if (redirect_uri == 'switchTabMall'){
            wx.switchTab({
              url: '/pages/mall/index'
            });
          }else if (redirect_uri == 'space'){
            
          }else{
            wx.reLaunch({
              url: '/pages/wxpage/wxpage?type=backtowx&backtowx=' + redirect_uri
            });
          }
        } else {
            wx.switchTab({
              url: '/pages/mall/index'
            });
        }
      }
    }
  },false);
}

// [通用登录]
// 功能描述：登录成功后，将登陆信息保存全局app.globalData中，同时将token与openId保存本地
// 返回：直接返回callBack，本函数内不做任何业务操作
function generalLoginAndCallBack(wxData, wxCode, successCallBack, failureCallBack) {
    var _this = this;
    var params = {
        mpIV: wxData.iv,
        mpEncryptedData: wxData.encryptedData,
        appId: getApp().globalData.baseAppId,
        code: wxCode,
        returnBy: 'JSON',
        platform: "MINI_PROGRAM"
    };
    RequestManager.RequestGet(getApp().globalData.UCUrl + '/foundation-user/login/wechat', params, function (res) {
      removeStorage()//登录失败 清除本地 storage
      // wx.clearStorageSync()
        if (res.body) {
          getApp().globalData.globInent = res.body.ident;
            var _token = res.body.token;
            if (_token) {
              getApp().globalData.globtoken = res.body.token;
              getApp().globalData.globOpenID = res.body.extraInfo.openId;
              getApp().globalData.haslogin = true;
                getApp().globalData.userInfo.isNew = res.body.isNew;
                if (getApp().globalData.commissionUcenterId != '') {
                  isSalesmanLogin()
                }
                setXcxStorage(res.body.token,res.body.extraInfo.openId);
                getApp().dcp.storedUserId(res.body.userId)  // dcp采集openId
                // 返回回调
                successCallBack && successCallBack();
                return;
            }
        }

        failureCallBack && failureCallBack();
    },false);
}

function checkUseInfo(callBack) {
  var _this = this;
  // 获取用户信息
  wx.getSetting({
    success: function success(res) {
      let _type = false
      if (res.authSetting['scope.userInfo']) {
        // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
        _this.getCode(function (data) {
          _this.didHasLoad(data.ress, data.code, null);
        });
        _type = true
      } else {
        getApp().globalData.haslogin = false;
        _type = false
      }
      callBack(_type)
    },
    fail: function fail(res) {
      console.log(res, 'wrong');
    }
  });
}

function justGetCode (){
  wx.login({
    success: function (res) {
        const code = res.code;
        if (code && getApp().globalData.cardId != '') {
          let _params = {
            code: code,
            name_card_id: getApp().globalData.cardId
          }
          RequestManager.RequestGet(getApp().globalData.ncxcxPath +'/api/getNameCardInfo', _params, function (res) {
            if(res.code === 0) {
              getApp().globalData.inviteCode = res.data.invite_code || ''
              getApp().globalData.salesmanId = res.data.salesman_id
              getApp().globalData.commissionUcenterId = res.data.commission_ucenter_id
              isSalesmanLogin(res.data.commission_ucenter_id)
            }
          }, null, true)
        } 
    }
});
}

//判断登录的用户是不是名片业务员本人
function isSalesmanLogin (commissionUcenterId=''){
  if (commissionUcenterId!='') {
    getApp().globalData.commissionUcenterId = commissionUcenterId
  }
  if (getApp().globalData.commissionUcenterId == '' ) {
    getApp().globalData.commissionUcenterLoginType = false
    return
  }
  let _params = {
    commission_ucenter_id: getApp().globalData.commissionUcenterId || commissionUcenterId
  }
  RequestManager.RequestGet(getApp().globalData.ncxcxPath +'/api/isSalesmanLogin', _params, function (res) {
    getApp().globalData.commissionUcenterLoginType = res.data.is_salesman_login
      // app.globalData.commissionUcenterLoginType = true
  }, null, true)
}

// token 存储本地
function setXcxStorage (token,openid){
  let _datajson= {
    token:token,
    openid:openid
  }
  let _data = JSON.stringify(_datajson)
  wx.setStorage({
    key: 'namecardtoken',
    data: _data
  })
}

function removeStorage (){
  try {
    getApp().globalData.globtoken = null
    getApp().globalData.haslogin = false
    getApp().dcp.storedUserId('')  // dcp采集userId 退出
    wx.removeStorageSync('namecardtoken')
  } catch (e) {
    // Do something when catch error
  }
}

function receiveNameCard (code , name_card_id){
  let _data = {
    code: code,
    name_card_id: name_card_id
  }
  RequestManager.RequestGet(getApp().globalData.ncxcxPath +'/api/followNameCard', _data, function (res) {

  })
}

module.exports = {
  getCode: getCode,
  didHasLoad: didHasLoad,
  checkUseInfo: checkUseInfo,
  didHasLoadFirst:didHasLoadFirst,
  isSalesmanLogin:isSalesmanLogin,
  setXcxStorage:setXcxStorage,
  removeStorage:removeStorage,
  receiveNameCard:receiveNameCard,
    generalLoginAndCallBack: generalLoginAndCallBack,
    justGetCode:justGetCode
};
