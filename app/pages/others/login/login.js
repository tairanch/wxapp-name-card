var util = require('../../../utils/util.js');
var RequestManager = require('../../../utils/RequestHelper.js');
var Login = require('../../../utils/login.js');
const app = getApp()
const ctxPath = app.globalData.ncxcxPath
const pageApi = {
  getNameCardQRCode: {
    url: `${ctxPath}/api/getNameCardQRCode`,
    method: "RequestGet"
  },
  getNameCardInfo: {
    url: `${ctxPath}/api/getNameCardInfo`,
    method: "RequestGet"
  },
  followNameCard: {
    url: `${ctxPath}/api/followNameCard`,
    method: "RequestGet"
  },
  getPosterList: {
    url: `${ctxPath}/api/poster/getPosterList`,
    method: "RequestGet"
  } // 收下名片
}

const errTost = (err) => {
  const message = (err && err.data && err.data.message) ? err.data.message : '小泰发生错误，请稍后再试'
  wx.showToast({
    title: message,
    icon: 'none'
  })
}
const DcpPage = require('../../../utils/dcp/dcpPage'); // dcp封装的page
// const dcpSdk = require('../../utils/dcp/dcp_miniprogram.min');
const dcpSdk = app.dcp;
import AppService from '../../../AppService/index';
DcpPage({

  /**
   * 页面的初始数据
   */
  data: {
    _extraInfo: null,
    isregister: false,
    showGiftAlert: false,
    giftimg: '/image/login/newperople.png', //礼包图片
    enterBtnClick: false, //登录点击
    dcpTitle: '登录',
    changeStatus: '',
    result: {},
    styleConfig: {
      color: "#00aa90",
      btnWidth: '180px'
    },
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

    phone: "",
    passWord: "",
    mobileCode: "",
    times: 60,
    canGetIdentify: true,
    getText: "发送验证码",
    secretCode: '',
    didGee: false,
    timer: null,
    redirect_uri: '',
    showhasgetinfo: false,
    tarranimg: '../../../image/logo.png',
    isWxpage: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let _redirect_uri = ''
    let isWxpage = false
    if (options.redirect_uri) {
      _redirect_uri = options.redirect_uri
    } else if (app.globalData.globShareUrl != null) {
      _redirect_uri = app.globalData.globShareUrl
    } else if (options.wxpage) {
      _redirect_uri = '/pages/wxpage/wxpage?scene=' + options.wxpage
      isWxpage = true
    } else {
      _redirect_uri = ''
    }
    this.setData({
      redirect_uri: _redirect_uri,
      isWxpage: isWxpage
    })
    this.checkUseInfo()
  },

  checkUseInfo: function() {
    var _this = this
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          _this.getCode();
          _this.setData({
            didGee: true,
            showhasgetinfo: false
          })
        } else {
          // wx.navigateTo({
          //   url: '/pages/others/beforelogin/index',
          // })
          _this.setData({
            showhasgetinfo: true
          })
        }
      }
    })
  },

  getUserInfo: function(e) {
    let _that = this
    if (e.detail.userInfo) {
      _that.getCode()
      _that.setData({
        didGee: true,
        showhasgetinfo: false
      })
    }
  },
  // 重新获取code
  getCode: function() {
    let _that = this
    // 登录按键多次点击
    _that.setData({
      enterBtnClick: true
    })
    setTimeout(() => {
      _that.setData({
        enterBtnClick: false
      })
    }, 3000)
    wx.login({
      success: res => {
        wx.getUserInfo({
          success: ress => {
            app.globalData.userInfo = ress.userInfo
            _that.didHasLoad(ress, res.code)
          }
        })
      }
    })
  },
  didHasLoad: function(data, _code) {
    var _that = this;
    if (!_that.data.didGee) {
      util.MessageToast("请先完成极验！")
      return
    }
    var params = {
      mpIV: data.iv,
      mpEncryptedData: data.encryptedData,
      appId: app.globalData.baseAppId,
      code: _code,
      returnBy: 'JSON',
      platform: "MINI_PROGRAM"
    }
    RequestManager.RequestGet(app.globalData.UCUrl + '/foundation-user/login/wechat', params, function(res) {
      Login.removeStorage() //登录失败 清除本地 storage
      if (res.body !== null) {
        app.globalData.globInent = res.body.ident
        let _token = res.body.token
        _that.setNewLogin(_token, res);
      }
    })
  },

  setNewLogin: function(_token, res) {
    let _that = this
    if (res.body && res.body.extraInfo != null) {
      app.globalData.globOpenID = res.body.extraInfo.openId
      _that.setData({
        _extraInfo: res.body.extraInfo
      })
    }

    if (_token !== null) {
      app.globalData.globtoken = _token
      if (_that.data._extraInfo != null) {
        Login.setXcxStorage(_token, _that.data._extraInfo.openId)
      }

      if (res.body.userId) {
        dcpSdk.storedUserId(res.body.userId) // dcp采集userId
      }

      app.globalData.haslogin = true
      app.globalData.userInfo.isNew = res.body.isNew

      if (app.globalData.cardId != '') {
        _that.getCardInfo(app.globalData.cardId, _that.data.phone, _token)
      } else {
        _that.testPhoneNum(_that.data.phone, _token)
      }
    } else {
      _that.newUser(res.body.ident)
    }
  },

  // 清除手机号码
  clearPhone: function() {
    this.setData({
      phone: ""
    })
  },
  // 获取手机号码
  getPhone: function(event) {
    this.setData({
      phone: event.detail.value.replace(/\s+/g, '')
    })
  },
  //获取验证码
  getMobileCode: function(event) {
    this.setData({
      mobileCode: event.detail.value
    })
  },
  // 发送验证码
  sendMobileCode: function() {
    if (this.data.phone.length <= 10) {
      util.MessageToast("请输入手机号码")
      return
    }
    if (!this.data.canGetIdentify) {
      return
    }
    // 极验校验
    this.loadCaptchas(this.data.phone)
  },
  setCodePost: function() {
    var _this = this;
    var params = {
      mode: "SMS",
      appId: app.globalData.baseAppId,
      phone: this.data.phone,
      usage: "QUICK_LOGIN_REGISTER"
    }
    RequestManager.RequestPost(app.globalData.UCUrl + '/foundation-user/auth/send_code', params, function(res) {
      if (res.code == 200) {
        util.ToastSuccess("验证码已成功发送")
        _this.countdown();
        _this.setData({
          canGetIdentify: false,
          getText: "60s",
          times: 60
        })
      } else {
        util.ToastSuccess(res.message)
      }
    })
  },

  // 登录
  newUser: function(ident) {
    if (this.data.phone.length != 11) {
      util.MessageToast("请输入手机号码")
      return
    }
    if (this.data.mobileCode.length <= 0) {
      util.MessageToast("请输入短信验证码")
      return
    }
    var _this = this
    var params = {
      phone: this.data.phone,
      appId: app.globalData.baseAppId,
      inviteCode: app.globalData.inviteCode,
      inviteType: 'PP_INVITE',
      phoneCode: this.data.mobileCode,
      rememberMe: 10,
      thirdPartyIdent: ident,
      spm: _this.data.secretCode,
    }
    RequestManager.RequestPost(app.globalData.UCUrl + '/foundation-user/login/quick_login_register?spm=' + _this.data.secretCode, params, function(res) {
      if (res.message.length == 0) {
        // _this.getCode()
        _this.setNewLogin(res.body.token, res)
        _this.setData({
          isregister: true
        })
      } else {
        util.MessageToast(res.message)
      }
    }, true)
  },

  // 倒计时
  countdown: function() {
    var _this = this
    var timers = setInterval(function() {
      _this.setData({
        times: _this.data.times - 1,
        timer: timers
      })
      if (_this.data.times == 0) {
        _this.setData({
          canGetIdentify: true,
          getText: "发送验证码"
        })
        clearInterval(timers)
      } else {
        _this.setData({
          getText: _this.data.times + "s"
        })
      }
    }, 1000);

  },

  loadCaptchas: function(tel) {
    var _this = this
    let _times = (new Date()).getTime()
    var params = {
      appId: app.globalData.baseAppId,
      addressIp: tel,
      clientType: "WEB",
      t: _times
    }
    RequestManager.RequestGet(app.globalData.UCUrl + '/foundation-captcha/gee/getChallenge', params, function(res) {
      _this.setData({
        loadCaptcha: true,
        gt: res.gt,
        challenge: res.challenge,
        offline: !res.success
      })
    })
  },
  // 校验手机号码是否绑定
  testPhoneNum: function(phone, token) {
    let _this = this
    wx.request({
      url: app.globalData.UCUrl + '/foundation-user/user',
      data: {
        needPhone: true
      },
      method: 'GET',
      header: {
        'Authorization': "Bearer " + token
      },
      success: function(res) {
        if (phone && res.data.body && res.data.body.phone != phone) {
          wx.showToast({
            title: '输入绑定账号',
            duration: 2000
          })
        } else {
          if (_this.data.isregister) {
            _this.obtainNewerGift();
          } else {
            _this.goUrlChange()
          }
        }
      },
      fail: function(res) {
        wx.hideLoading()
      },
      complete: function(res) {

      }
    })
  },
  obtainNewerGift: function() {
    let _this = this;
    AppService.NameCardTask.obtainNewerGift({},
      (res) => {
        wx.hideLoading();
        if (res.data && res.data.status) {
          _this.setData({
            showGiftAlert: true
          })
          // 新人礼包金额 不做显示
        } else {
          _this.goUrlChange();
        }
      }, (error) => {
        wx.hideLoading();
        _this.goUrlChange()
      }
    )
  },
  goUrlChange: function() {
    let _this = this
    if (_this.data.redirect_uri.length > 0) {
      if (_this.data.isWxpage) {
        wx.navigateTo({
          url: _this.data.redirect_uri
        });
      } else if (_this.data.redirect_uri == 'switchTabMine') {
        wx.switchTab({
          url: '/pages/mine/mine/index'
        });
      } else if (_this.data.redirect_uri == 'switchTabMall') {
        wx.switchTab({
          url: '/pages/mall/index'
        });
      } else if (_this.data.redirect_uri == 'cardlist') {
        wx.redirectTo({
          url: '/pages/nameCard/cardlist/index'
        });
      }else if(_this.data.redirect_uri == 'item-detail'){
        wx.navigateBack()
      } else {
        wx.reLaunch({
          url: '/pages/wxpage/wxpage?type=backtowx&backtowx=' + _this.data.redirect_uri
        });
      }
    } else {
      wx.switchTab({
        url: '/pages/mall/index'
      })
    }
  },
  captchaSuccess: function(result) {
    let _this = this
    var params = {
      challenge: result.detail.geetest_challenge,
      validate: result.detail.geetest_validate,
      seccode: result.detail.geetest_seccode,
      addressIp: _this.data.phone,
      serverStatus: 1,
      appId: app.globalData.baseAppId,
    }
    RequestManager.RequestPost(app.globalData.UCUrl + '/foundation-captcha/gee/verifyLogin', params, function(res) {
      _this.setCodePost()
      _this.setData({
        didGee: true,
        loadCaptcha: false,
        result: result.detail,
        secretCode: res.body.secretCode || ''
      })
    })

  },
  captchaReady: function() {
    console.log('captcha-Ready!')
  },
  captchaClose: function() {
    console.log('captcha-Close!')
  },
  captchaError: function(e) {
    console.log('captcha-Error!', e.detail)
    // 这里对challenge9分钟过期的机制返回做一个监控，如果服务端返回code:21,tips:not proof，则重新调用api1重置
    if (e.detail.code === 21) {
      var that = this
      // 需要先将插件销毁
      that.setData({
        loadCaptcha: false
      })
      // 重新调用api1
      that.captchaRegister()
    }

  },
  //判断登录的用户 是否登入且是否为名片业务员本人
  isSalesmanLogin(commission_ucenter_id, phone, token) {
    let _params = {
      commission_ucenter_id: commission_ucenter_id
    }
    let that = this
    RequestManager.RequestGet(app.globalData.ncxcxPath + '/api/isSalesmanLogin', _params, function(res) {
      if (res.code === 0) {
        let commissionUcenterLoginType = res.data.is_salesman_login || false
        app.globalData.commissionUcenterLoginType = commissionUcenterLoginType
        that.testPhoneNum(phone, token)
      } else {
        app.globalData.commissionUcenterLoginType = false
        that.testPhoneNum(phone, token)
      }
    }, (err) => {
      app.globalData.commissionUcenterLoginType = false
      that.testPhoneNum(phone, token)
    }, true)
  },
  getCardInfo(cardId, phone, token) { // 获取名片信息
    let _this = this
    const api = pageApi.getNameCardInfo
    wx.login({
      success: function(res) {
        const code = res.code;
        if (code) {
          RequestManager[api.method](api.url, {
            code: code,
            name_card_id: cardId
          }, (ress) => {
            if (ress.code === 0) {
              app.globalData.salesmanId = ress.data.salesman_id
              app.globalData.commissionUcenterId = ress.data.commission_ucenter_id
              app.globalData.inviteCode = ress.data.invite_code || ''
              let _params = {
                commission_ucenter_id: ress.data.commission_ucenter_id
              }
              RequestManager.RequestGet(app.globalData.ncxcxPath + '/api/isSalesmanLogin', _params, function(getres) {
                if (getres.code === 0) {
                  let commissionUcenterLoginType = getres.data.is_salesman_login || false
                  app.globalData.commissionUcenterLoginType = commissionUcenterLoginType
                  _this.testPhoneNum(phone, token)
                } else {
                  app.globalData.commissionUcenterLoginType = false
                  _this.testPhoneNum(phone, token)
                }
              }, (err) => {
                app.globalData.commissionUcenterLoginType = false
                _this.testPhoneNum(phone, token)
              }, true)
            } else {
              _this.testPhoneNum(phone, token)
            }
          }, (err) => {
            _this.testPhoneNum(phone, token)
          }, false)
        } else {
          _this.testPhoneNum(phone, token)
        }
      }
    });
  },
  // 返回到传入页面
  goBackWeb() {
    this.goUrlChange()
    this.setData({
      showGiftAlert: false
    })
  },
  // 跳转优惠券页面
  goSeeCouponList() {
    wx.switchTab({
      url: '/pages/mine/mine/index'
    });
  }
})