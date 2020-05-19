var util = require('../../../utils/util.js');
var RequestManager = require('../../../utils/RequestHelper.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
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
    secretCode:'',
    didGee:false,
    timer: null,
    redirect_uri:'',
    showhasgetinfo:false,
    tarranimg: '../../../image/logo.png',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let _redirect_uri = ''
    if (options.redirect_uri){
      _redirect_uri = options.redirect_uri
    } else if (app.globalData.globShareUrl != null){
      _redirect_uri = app.globalData.globShareUrl
    }else{
      _redirect_uri = ''
    }
    this.setData({
      redirect_uri: _redirect_uri
    })
    this.checkUseInfo()
  },

  checkUseInfo: function () {
    var _this = this
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          _this.getCode();
          _this.setData({
            didGee: true,
            showhasgetinfo:false
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

  getUserInfo: function (e) {
    let _that = this
    if (e.detail.userInfo) {
      _that.getCode()
      _that.setData({
        didGee: true,
        showhasgetinfo:false
      })
    }
  },
  // 重新获取code
  getCode: function () {
    let _that = this
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
  didHasLoad: function (data, _code) {
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
    RequestManager.RequestGet(app.globalData.UCUrl + '/foundation-user/login/wechat', params, function (res) {
      if (res.body !== null) {
        app.globalData.globInent = res.body.ident
        let _token = res.body.token
        if (_token !== null) {
          app.globalData.globtoken = res.body.token
          app.globalData.globOpenID = res.body.extraInfo.openId
          app.globalData.haslogin = true
          app.globalData.userInfo.isNew = res.body.isNew
          _that.testPhoneNum(_that.data.phone, res.body.token)
        } else {
          _that.newUser(res.body.ident)
        }
      }
    })
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
  setCodePost:function(){
    var _this = this;
    var params = {
      mode: "SMS",
      appId: app.globalData.baseAppId,
      phone: this.data.phone,
      usage: "QUICK_LOGIN_REGISTER"
    }
    RequestManager.RequestPost(app.globalData.UCUrl +'/foundation-user/auth/send_code', params, function (res) {
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
        _this.getCode()
      }else{
        util.MessageToast(res.message)
      }
    },true)
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
  testPhoneNum: function (phone,token) {
    let _this = this
    wx.request({
      url: app.globalData.UCUrl + '/foundation-user/user',
      data: { needPhone: true },
      method: 'GET',
      header: { 'Authorization': "Bearer " + token },
      success: function (res) {
        if (phone && res.data.body.phone != phone ){
          wx.showToast({
            title: '输入绑定账号',
            duration: 2000
          })
        }else{
          if (_this.data.redirect_uri.length > 0) {
            if (_this.data.redirect_uri == 'switchTabMine') {
              wx.switchTab({
                url: '/pages/mine/mine/index'
              });
            } else if (_this.data.redirect_uri == 'switchTabMall'){
              wx.switchTab({
                url: '/pages/mall/index'
              });
            }else{
              wx.navigateTo({
                url: '/pages/wxpage/wxpage?type=backtowx&backtowx=' + _this.data.redirect_uri
              });
            }
          } else {
            wx.switchTab({
              url: '/pages/mall/index'
            })
          }
        }
      },
      fail: function (res) {
        wx.hideLoading()
      },
      complete: function (res) {

      }
    })
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
        loadCaptcha:false,
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

  }
})