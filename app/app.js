//app.js
var util = require('/utils/util.js');
var RequestManager = require('/utils/RequestHelper.js');
const updateManager = wx.getUpdateManager();
var Login = require('/utils/login.js');
const sdk = require('./utils/dcp/dcp_miniprogram.min');
const _XT = { // dcp相关字段
    channelCode: 've3dC41i',   // 渠道码,
    auth: '93c55350e179a3676c905723e112b440',          // 安全访问的凭证,
    appId: 'wxedcbb3e02fc8dfb5',        // 每个小程序独有的appid
    is_plugin: true
}
sdk.init(_XT)
const App = sdk.App

// 重写page
const miniPage = Page;
Page = (opt) => {
  const pageShow = opt.onShow ? opt.onShow: null
  opt.onShow = function () {                                           // 重写onshow
    if(getApp().globalData.isMaintenance && !opt.data.isMaintenance) { // 维护中
      wx.redirectTo({
        url: '/pages/others/maintenance/index?url=' + getApp().globalData.maintenanceUrl
      })
    } else {
      pageShow && pageShow.call(this)
    }
  }
  return miniPage(opt);
}

App({
    data: {
        webviewIsShowed: false // 用来标记lots页面是否已经显示过了
    },

    onLaunch: function (option) {
        // 展示本地存储能力
        // var logs = wx.getStorageSync('logs') || []
        // logs.unshift(Date.now())
        this.checkUseInfo();
        
    },

    onShow() {
        this.getMaintenancePage();
        this.getUpdate();
    },

    checkUseInfo: function () {
        let _this = this
        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    Login.getCode((data) => {
                        Login.didHasLoadFirst(data.ress, data.code, 'space')
                    })
                }
            },
            fail: res => {
                console.log(res, 'wrong')
            }
        })
        setTimeout(() => {
            _this.getStorageFunction();
        }, 2000);
    },

    getStorageFunction() {
        let _this = this
        wx.getStorage({
            key: 'namecardtoken',
            success(res) {
                let _datajson = JSON.parse(res.data)
                // _this.globalData.globtoken = _datajson.token
                _this.globalData.globOpenID = _datajson.openid
                _this.globalData.haslogin = true
            },
            fail(error) {

            }
        })
    },

    /**
     * 更检查是否有更新
     */
    getUpdate() {
        updateManager.onCheckForUpdate(function (res) {
            // 请求完新版本信息的回调
        });
        updateManager.onUpdateReady(function () {
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success(res) {
                    if (res.confirm) {
                        console.log("更新准备好");
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                    } else {
                        console.log("没有更新");
                    }
                }
            })
        });
    },

    onHide() {
        this.data.webviewIsShowed = false;  // 小程序退出时，将变量置为初始值
    },

    /**
   * 是否在维护中
   */
  getMaintenancePage() {
    wx.request({
      url: this.globalData.vbuybuyPath + '/api/MaintenancePage',
      method: 'GET',
      success: (res) => {
        const _res = res.data
        if(_res.code === 0 && _res.data && _res.data.status == 1) {  // 维护中
          this.globalData.isMaintenance = true
          this.globalData.maintenanceUrl = encodeURIComponent(_res.data.maintenance)
          wx.redirectTo({
            url: '/pages/others/maintenance/index?url=' + this.globalData.maintenanceUrl
          })
        } else {
          this.getNotMaintenancePage()
        }
      },
      fail: (res) => {
        this.getNotMaintenancePage()
      },
      complete: () => {}
    })
  },
  getNotMaintenancePage(){
    if(this.globalData.isMaintenance) {
      wx.switchTab({
        url: '/pages/mall/index'
      })
    }
    this.globalData.isMaintenance = false
    this.globalData.maintenanceUrl = null
  },

    globalData: {
        UCUrl: "https://ucenter.trc.com/gateway",  //用户中心域名
        UCGEE: '/ucenter/gateway/foundation-captcha', //用户中心极验 前缀
        baseAppId: "uc6c7f06e54ac77f87", //存储的appid
        ctxPathPay: "https://pay.tairanmall.com",
        ctxPath: "https://ncwxapp.tairanmall.com",//h5页面相关的域名
        ncxcxPath: 'https://ncwxapp.tairanmall.com',//api的代理
        // ncxcxPath: 'https://ncwxapp.tairanmall.com',

        vbuybuyPath: "https://mtns.vbuybuy.com",  // 工具后台地址

        haslogin: false,
        userInfo: null,
        userDetailInfo: null,
        addSpecHead: false,
        globOpenID: null,
        globtoken: null,
        //globtoken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJkODRkODY4MGRhYmQ0MzdlOTJmZjRlZTM4NmEwZWIwMyIsImF1ZCI6WyJ1YzZjN2YwNmU1NGFjNzdmODciLCJ1Y2VudGVyIl0sImlfdiI6MTUyNjk3NDM3OTAwMCwiaWRlbnRfaWQiOjMwNDYwNzEsIm5iZiI6MTU1NDM0OTQ2NSwicF92IjoxNTUzNTg1OTMzMDAwLCJpc3MiOiJ1Y2VudGVyIiwiZXhwIjoxNTU0NDM1ODY0LCJ0eXBlIjoxLCJpYXQiOjE1NTQzNDk0NjUsImp0aSI6IjYyODYzMTA3Mjk0MDAzMiJ9.ks3PSynGURFiYhpQe8wvu-nc2cEcYXPFJ1uaxw9miiXw7NUzy8S5zZoynDvLQ8I6fOeVSypb1SyVzKylZPrml3zWCU-cuaVjq1P-4P33KIUshLxSRnEkteK1w98WGtg7OJ87zs-QKRRmNKlMuWSDXX95s3aqH7DxU41hqw4shVA",

        globInent: '',
        globShareUrl: null,
        accessTokenlegal: true, //防止accessToken不合法被重复刷新
        login: {
            accessToken: null,
            code: null
        },
        webviewIsShowed: false,   //购物袋首页问题
        cardId: '',   // 业务员id
        showInfoId: '',
        salesmanId: '',
        commissionUcenterId: '',  //业务员用户中心ID
        commissionUcenterLoginType: false, //判断登录的用户是不是名片业务员本人 true false
        isFromEditPage: false, // 是否来自名片编辑页，用途：myCard页根据此参数来判断，是否要刷新接口
        inviteCode:"",
        hideFlag:false,//名片小程序项目暂时隐藏
        isMaintenance: false,     // 是否在维护中
        maintenanceUrl: null     // 维护页地址
    }
})
