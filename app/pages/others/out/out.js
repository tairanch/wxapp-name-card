// pages/out.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: '',
    systemInfo: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getSystem()
    let _tourl = decodeURIComponent(options.url), _token
    if (_tourl.indexOf('?') != -1) {
      _token = "&token=" + app.globalData.globtoken + "&openid=" + app.globalData.globOpenID + "&mini=true"  + "&salesmanId=" + app.globalData.salesmanId + "&commissionUcenterId=" + app.globalData.commissionUcenterId +   "&commissionUcenterLoginType=" + app.globalData.commissionUcenterLoginType + "&cardId=" + app.globalData.showInfoId
    } else {
      _token = "?token=" + app.globalData.globtoken + "&openid=" + app.globalData.globOpenID + "&mini=true"  + "&salesmanId=" + app.globalData.salesmanId + "&commissionUcenterId=" + app.globalData.commissionUcenterId +  "&commissionUcenterLoginType=" + app.globalData.commissionUcenterLoginType + "&cardId=" + app.globalData.showInfoId
    }
    _tourl = _tourl + _token
    console.log("_tourl", _tourl)
    this.setData({
      url: _tourl
    });
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
  onShareAppMessage: function (options) {
    let that = this
    let _baseurl = that.systemInfo == 'IOS' ? that.data.getmessagesUrl : options.webViewUrl
    let return_url = encodeURIComponent(_baseurl)
    let share_title = '泰然城分享'
    let image_url = ''
    // 如果分享的页面是发送红包的页面，则设置 return_url
    if (options.webViewUrl.indexOf('/ecard/red/detail') != -1) {
      return_url = this.data.share_url
      share_title = this.data.share_title
      image_url = '../../../image/receiving.png'
    }
    var paths = 'pages/others/sharepage/sharepage?sharesssUrl=' + return_url
    return {
      title: share_title,
      path: paths,
      imageUrl: image_url,
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: "转发成功",
          icon: 'success',
          duration: 2000
        })
        that.setData({
          share_url: return_url,    //再次赋值分享内嵌网页的路径
          url: _baseurl
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
})