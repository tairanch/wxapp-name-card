//该页面用于存放分享后的内嵌网页
var app = getApp();
var ctxPath = app.globalData.ctxPath;

var RequestManager = require('../../../utils/RequestHelper.js');
var common = require('../../../utils/common.js');
var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    share_src: '',
    systemInfo: {},
    isAphone:false,
    getmessagesUrl: null,  //分享方法调用的url
    systemInfo:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()//隐藏分享
    let that = this;
    that.getSystem()
    // let _url = that.parseQueryString(decodeURIComponent(options.sharesssUrl))
    let _url = options.sharesssUrl
    // let _params = this.getCurrentPageUrlWithArgs()
    app.globalData.globShareUrl = _url
    wx.navigateTo({
      url: '../beforelogin/index?redirect_uri=' + _url
    })
    // that.setData({
    //   share_src: _url,
    // })
  },
  getSystem: function () {
    let that = this
    let _systeminfo = 'android' //手机系统
    wx.getSystemInfo({
      success: function (res) {
        if (res.platform == "devtools") {
          _systeminfo = 'PC'
        } else if (res.platform == "ios") {
          _systeminfo = 'IOS'
        } else if (res.platform == "android") {
          _systeminfo = 'android'
        }
        that.setData({
          systemInfo: _systeminfo,
        })
      }
    })
  },
  parseQueryString:function (url) {
    let _this = this
    var obj = {};
    var keyvalue = [];
    var key = "", value = "";
    var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
    var _host = url.substring(0,url.indexOf("?") + 1)
    for (var i in paraString) {
      keyvalue = paraString[i].split("=");
      key = keyvalue[0];
      value = keyvalue[1];
      obj[key] = value;
    }
    obj.openid = app.globalData.globOpenID
    obj.token = app.globalData.globtoken
    obj.mini = "true"
    delete obj.openid
    delete obj.token
    delete obj.mini
    return _host + _this.paramsHandle(obj);
  },
  paramsHandle:function (params) {
    return Object.keys(params).map(key => {
      return key + '=' + encodeURIComponent(params[key])
    }).join('&')
  },

  /*
   * 用户点击右上角分享
   */
  onShareAppMessage(options) {
    var that = this
    let _baseurl = that.data.systemInfo == 'IOS' ? that.data.getmessagesUrl : options.webViewUrl
    let return_url = encodeURIComponent(_baseurl)
    // var return_url = encodeURIComponent(that.data.getmessagesUrl ||  options.webViewUrl)
    var path = 'pages/others/sharepage/sharepage?sharesssUrl=' + return_url
    return {
      title: '泰然城分享',
      path: path,
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: "转发成功",
          icon: 'success',
          duration: 2000
        })
        that.setData({
          share_src: return_url
        })
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  bindmessage(e) {//接收web-view传递的参数
    console.log(e)
    let _this = this
    if (e && e.detail) {
      let _url = e.detail.data.slice(-1)[0]
      _this.setData({//存储状态
        getmessagesUrl: _url.url
      })
    }
  },

  getCurrentPageUrlWithArgs:function(){
    var pages = getCurrentPages()    //获取加载的页面
    var currentPage = pages[pages.length - 1]    //获取当前页面的对象
    var url = currentPage.route    //当前页面url
    var options = currentPage.options    //如果要获取url中所带的参数可以查看options

    //拼接url的参数
    var urlWithArgs = url + '?'
    for (var key in options) {
      var value = options[key]
      urlWithArgs += key + '=' + value + '&'
    }
    urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1)
    return urlWithArgs
  },
  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.data.webviewIsShowed = true;
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
    
  }

})