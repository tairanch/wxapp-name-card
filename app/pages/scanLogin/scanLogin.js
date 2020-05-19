var util = require('../../utils/util.js');
var RequestManager = require('../../utils/RequestHelper.js');
const app = getApp()
var Login = require('../../utils/login.js');
const DcpPage = require('../../utils/dcp/dcpPage');  // dcp封装的page
const dcpSdk = app.dcp
DcpPage({

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
        secretCode: '',
        loginBtnEnable: false,
        didGee: false,
        timer: null,
        redirect_uri: '',
        tarranimg: '../../../image/logo.png',
        shop_id: '', // 商户id
        showInputClearBtn: false,
        hasGetVerifyCode: false, // 是否获取过验证码
        loadCaptcha: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        // 在这里获取扫码得到的shop_id，再传给下个页面
        if (options && options.hasOwnProperty('scene')) {
            this.setData({
                shop_id: options.scene
            })
        }
    },

    // [Action] 点击发送验证码按钮
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

    // [API] 调起极验验证框
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

    // [API] 发送验证码
    sendVerifyCode: function () {
        var _this = this;
        var params = {
            mode: "SMS",
            appId: app.globalData.baseAppId,
            phone: this.data.phone,
            usage: "QUICK_LOGIN_REGISTER"
        }
        RequestManager.RequestPost(app.globalData.UCUrl + '/foundation-user/auth/send_code', params, function (res) {
            if (res.code == 200) {
                util.ToastSuccess("验证码已成功发送")
                _this.countdown();
                _this.setData({
                    canGetIdentify: false,
                    getText: "60s",
                    times: 60,
                    hasGetVerifyCode: true
                })
            } else {
                util.ToastSuccess(res.message)
            }
        })
    },

    // [Action] 点击获取用户信息按钮
    getUserInfoButtonClick: function(e) {
        if (e.detail.userInfo) {
            // 已经授权
            this.setData({
                didGee: true,
                loginBtnEnable: false,
            })
            this.getWXLoginCode()
        }
    },

    // [WX API] 获取微信code
    getWXLoginCode: function() {
        let _that = this
        wx.login({
            success: res => {
                // 获取到微信登录code，传给下个页面，收下名片接口要使用
                wx.getUserInfo({
                    success: ress => {
                        app.globalData.userInfo = ress.userInfo
                        _that.didHasLoad(ress, res.code)
                    }
                })
            },
            fail: err => {
                _that.setData({
                    loginBtnEnable: true,
                })
            }
        })
    },

    // [API] ①若已授权且用户中心已注册，则直接登陆；②若未注册则提交注册信息到用户中心
    didHasLoad: function(data, _code) {
        var _that = this;
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
                if (_token !== null) {

                    // 已授权且用户中心已注册，直接登陆
                    app.globalData.globtoken = res.body.token
                    app.globalData.globOpenID = res.body.extraInfo.openId
                    app.globalData.haslogin = true
                    app.globalData.userInfo.isNew = res.body.isNew;
                    Login.setXcxStorage(res.body.token, res.body.extraInfo.openId)
                    dcpSdk.storedUserId(res.body.userId)  // dcp采集userId
                    _that.testPhoneNum(_that.data.phone, res.body.token)
                } else {

                    // 已授权但未注册，提交注册信息到用户中心
                    _that.newUser(res.body.ident)
                }
            }
        })
    },

    // [API] 新用户快速注册并登录
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
                _this.getWXLoginCode()
            } else {
                util.MessageToast(res.message)
                _this.setData({
                    loginBtnEnable: true,
                })
            }
        }, true)
    },

    // 校验手机号码是否绑定，同一个微信只能绑定一个手机号
    // 已绑定：跳转下个页面
    // 未绑定：提示请输入绑定账号
    testPhoneNum: function (phone, token) {
        let _this = this
        wx.request({
            url: app.globalData.UCUrl + '/foundation-user/user',
            data: { needPhone: true },
            method: 'GET',
            header: { 'Authorization': "Bearer " + token },
            success: function (res) {
                if (phone && res.data.body.phone != phone) {
                    wx.showToast({
                        title: '该微信已绑定泰然城账号，请先下载APP解绑',
                        duration: 2000,
                        icon: 'none'
                    })
                } else {
                    _this._gotoPersonCardEditPage();
                }
            },
            fail: function (res) {
                wx.hideLoading();
            },
            complete: function (res) {
                _this.setData({
                    loginBtnEnable: true,
                })
            }
        })
    },

    // 跳转名片编辑
    _gotoPersonCardEditPage: function () {
        wx.navigateTo({
            url: '/pages/nameCard/personCardEdit/personCardEdit?shop_id=' + this.data.shop_id
        });
    },

    // 清除手机号码
    clearPhone: function () {
        this.setData({
            phone: "",
            loginBtnEnable: this.checkLoginButtonEnable("", this.data.mobileCode)
        })
    },

    // 获取手机号码
    getPhone: function (event) {
        let phoneStr = event.detail.value.replace(/\s+/g, '');
        this.setData({
            phone: phoneStr,
            showInputClearBtn: phoneStr && phoneStr.length > 0 ? true : false,
            loginBtnEnable: this.checkLoginButtonEnable(phoneStr, this.data.mobileCode)
        })
    },

    //获取验证码
    getMobileCode: function (event) {
        this.setData({
            mobileCode: event.detail.value,
            loginBtnEnable: this.checkLoginButtonEnable(this.data.phone, event.detail.value)
        })
    },

    // 校验登录按钮是否可点击
    checkLoginButtonEnable: function (phone, code) {

        // 如果没有获取验证码，则不可点击
        if (!this.data.hasGetVerifyCode) {
            return false;
        }

        if (phone && code && phone.length > 0 && code.length > 0) {
            // 已经填过手机号和验证码
            return true;
        }
        return false;
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

    // [极验组件回调] 组件已经准备好
    captchaReady: function() {
        console.log('captcha-Ready!')
    },

    // [极验组件回调] 已经关闭组件
    captchaClose: function() {
        console.log('captcha-Close!')
    },

    // [极验组件回调] 极验验证通过，发送验证码
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
            _this.sendVerifyCode()
            _this.setData({
                didGee: true,
                loadCaptcha: false,
                result: result.detail,
                secretCode: res.body.secretCode || ''
            })
        })
    },

    // [极验组件回调] 极验校验错误
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
})
