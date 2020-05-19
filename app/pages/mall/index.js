'use strict';

//获取应用实例
var app = getApp();
var RequestManager = require('../../utils/RequestHelper.js');
var common = require('../../utils/common.js');
var util = require('../../utils/util.js');
var Login = require('../../utils/login.js');
const DcpPage = require('../../utils/dcp/dcpPage');  // dcp封装的page
const dcpSdk = app.dcp

const ctxPath = app.globalData.ncxcxPath
const pageApi = {
    getNameCardQRCode: { url: `${ctxPath}/api/getNameCardQRCode`, method: "RequestGet" },
    getNameCardInfo: { url: `${ctxPath}/api/getNameCardInfo`, method: "RequestGet" },
    followNameCard: { url: `${ctxPath}/api/followNameCard`, method: "RequestGet" } ,
  getPosterList: { url: `${ctxPath}/api/poster/getPosterList`, method: "RequestGet" }// 收下名片
}

DcpPage({
  // 页面初始数据
  data: {
    page_title:'mall',
    homePageData: [],
    searchData: {},
    update: false,
    trcGuideShow: true
  },

  // 广告位方法
  advertisingClick: function advertisingClick(e) {
    // if (app.globalData.haslogin == false) {
    //   wx.navigateTo({
    //     url: '/pages/others/login/login?redirect_uri=switchTabMall'
    //   });
    //   return
    // }
      const reg = /^javascript/;
      if( !e.currentTarget.dataset.data.link || reg.test(e.currentTarget.dataset.data.link)) {
          return
      }
    wx.navigateTo({
      url: '/pages/others/out/out?url=' + encodeURIComponent(e.currentTarget.dataset.data.link), //路径必须跟app.json一致
      success: function success() {},
      fail: function fail() {}, //失败后的回调；
      complete: function complete() {} //结束后的回调(成功，失败都会执行)
    });
  },

  changeTrcGuideStatus: function changeTrcGuideStatus() {
    // if (app.globalData.haslogin == false) {
    //   wx.navigateTo({
    //     url: '/pages/others/login/login?redirect_uri=switchTabMall'
    //   });
    //   return
    // }
    this.setData({
      trcGuideShow: false
    });
  },

  downloadTrcAPP: function downloadTrcAPP() {
    // if (app.globalData.haslogin == false) {
    //   wx.navigateTo({
    //     url: '/pages/others/login/login?redirect_uri=switchTabMall'
    //   });
    //   return
    // }
    wx.navigateTo({
      url: '/pages/others/out/out?url=' + encodeURIComponent('https://m.tairanmall.com/guide'), //路径必须跟app.json一致
      success: function success() {},
      fail: function fail() {}, //失败后的回调；
      complete: function complete() {} //结束后的回调(成功，失败都会执行)
    });
  },

  onLoad: function onLoad(options) {
    wx.hideShareMenu()//隐藏分享
    //小程序注册完成后，加载页面，触发onLoad方法
    var self = this;
    // 分享进入的页面 默认收下名片 及 设置全局 cardid
    if (options && options.scene) {
      let  _scene=options.scene;
      if (_scene && _scene != '') {
        app.globalData.showInfoId = _scene
        app.globalData.cardId = _scene
        Login.getCode((data)=>{
          Login.receiveNameCard(data.code, _scene)
        })
        self.getCardInfo(_scene)
      }
    }
    common.gethomePageData(function (res) {
      wx.hideNavigationBarLoading();
      // 停止下拉动作
      wx.stopPullDownRefresh();
      // type=60 处理类目楼层数据
      res.data.map(function (item, i) {
        if (item.type == 60) {
          item.data.item_list.map(function (value, k) {
            if (value.item_id == item.data.img_bottom_item_id) {
              item.data.item_list.splice(k + 1, 0, { image: item.data.img_bottom_url, link: item.data.img_bottom_link, insertImg: true });
            }
          });
        }

        if (item.type == 10) {
          //搜索
          common.getSearchDefaultWord(function (searchData) {
            var newdata = {};
            newdata.text = searchData.data.word || "搜索： 商品 分类 品牌 国家";
            newdata.link = searchData.data.link || "";
            if (!searchData.data.word) {
              newdata.defaultWord = true;
            }
            self.setData({
              searchData: newdata
            });
          });
        }
      });
      self.setData({
        homePageData: res.data,
        update: true
      });
    });
    if (app.globalData.haslogin == false) {
      this.checkUseInfo() //静默登录
    }
  },
  checkUseInfo: function () {
    var _this = this
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          Login.getCode((data)=>{
            Login.didHasLoadFirst(data.ress, data.code, 'switchTabMall')
          })
        }
      },
      fail:res=>{
        console.log(res,'wrong')
      }
    })
  },
  onReady: function onReady() {//首次显示页面，会触发onReady方法，渲染页面元素和样式，一个页面只会调用一次

  },
  onShow: function onShow() {//页面载入后触发onShow方法，显示页面
    if (app.globalData.haslogin == true){
      // wx.navigateTo({
      //   url: '/pages/others/beforelogin/index?redirect_uri=switchTabMall'
      // });
      Login.isSalesmanLogin()
    }else{
      dcpSdk.storedUserId('')  // dcp采集userId
    }
  },

  getCardInfo(cardId) { // 获取名片信息
    const api = pageApi.getNameCardInfo
    wx.login({
      success: function (res) {
          const code = res.code;
            if (code) {
              RequestManager[api.method](api.url, {
                code: code,
                name_card_id: cardId
            }, (ress) => {
                if(ress.code === 0) {
                    app.globalData.salesmanId = ress.data.salesman_id
                    app.globalData.commissionUcenterId = ress.data.commission_ucenter_id
                    app.globalData.inviteCode = ress.data.invite_code || ''
                    let _params = {
                      commission_ucenter_id: ress.data.commission_ucenter_id
                    }
                    RequestManager.RequestGet(app.globalData.ncxcxPath +'/api/isSalesmanLogin', _params, function (getres) {
                        if(getres.code === 0){
                            let commissionUcenterLoginType = getres.data.is_salesman_login || false
                            app.globalData.commissionUcenterLoginType = commissionUcenterLoginType
                        } else {
                          app.globalData.commissionUcenterLoginType = false
                        }
                    },(err) => {
                        app.globalData.commissionUcenterLoginType = false
                    }, true)
                }else{
                  app.globalData.globtoken = null
                  app.globalData.haslogin = false
                }
            }, (err) => {
              app.globalData.globtoken = null
              app.globalData.haslogin = false
            }, false)
          } else {
            app.globalData.globtoken = null
            app.globalData.haslogin = false
          }
      }
  });
},

  // 下拉刷新
  onPullDownRefresh: function onPullDownRefresh() {
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    this.onLoad();
  },

  /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function onShareAppMessage(options) {
    var that = this;
    var return_url = encodeURIComponent(options.webViewUrl);
    var share_title = '泰然城分享';
    var image_url = '';
    // 如果分享的页面是发送红包的页面，则设置 return_url
    if (options.webViewUrl.indexOf('/ecard/red/detail') != -1) {
      return_url = this.data.share_url;
      share_title = this.data.share_title;
      image_url = '../../../image/receiving.png';
    }
    // end
    var paths = 'pages/others/sharepage/sharepage?sharesssUrl=' + return_url;
    return {
      title: share_title,
      path: paths,
      imageUrl: image_url,
      success: function success(res) {
        // 转发成功
        wx.showToast({
          title: "转发成功",
          icon: 'success',
          duration: 2000
        });
      },
      fail: function fail(res) {
        // 转发失败
      }
    };
  },

});
