'use strict';

//logs.js
var util = require('../../../utils/util.js');
// var staticdata = require('../staticdata/index.js');
var common = require('../../../utils/common.js');
var RequestManager = require('../../../utils/RequestHelper.js');
var Login = require('../../../utils/login.js');
const app = getApp()
var ctxPath = app.globalData.ncxcxPath;
var pageApi = {
  getPosterList: { url: `${ctxPath}/api/poster/getPosterList`, method: "RequestGet" }
};
const DcpPage = require('../../../utils/dcp/dcpPage');
const dcpSdk = app.dcp

DcpPage({
  data: {
    showBtnType:2, //0新加 1 登录 2 列表
    mycardlist:[],
    dcpTitle: '名片夹',
    list: [],
    animationData: "",
    headbar:'../../../image/nameCard/head_logo2.png',
    bgimg:'../../../image/nameCard/namecardbg@2x.png',
    usephone:'../../../image/trctrcMine2@2x.png', //静态头像
    phonecall:'../../../image/nameCard/list_dianhua@2x.png',
    fenxiangimg:'../../../image/nameCard/list_fenxiang@2x.png',
    smallphoneimg: '../../../image/nameCard/list_dianhua3@2x.png',
    smallemailimg: '../../../image/nameCard/list_youxiang3@2x.png',
    noCardImg: '../../../image/nameCard/nocard@2x.png',
    download:'/image/common/download.png',
    mycardtext:'我的名片',
    cardtext :'其他名片',
    imgUrls: [
      '../../../image/nameCard/head_logo2.png'
    ],
    indicatorDots: false,
    autoplay: false,
    circular: false,
    interval: 5000,
    duration: 1000,
    tempFilePath:[],
    refresh:false,
    refreshmy: false,
  },
  onLoad: function onLoad() {
    wx.hideShareMenu()//隐藏分享
    
  },

  // 我的卡片列表
  _getCardListRequest: function () {
    
    let _this = this
    if (_this.data.mycardlist.length > 0) {
      return
    }
    try {
      const value = wx.getStorageSync('namecardtoken') || app.globalData.globtoken
      if (value) {
        RequestManager.RequestGet(app.globalData.ncxcxPath + '/api/getSalesmanNameCardList', {}, function (res) {
          let _data = []
          let _showBtnType = 1
          if (res.code == 401 || res.code == 404 ) {
            util.MessageToast(res.message)
          } else {
            _data = res.data
            _showBtnType = res.data.length > 0 ? 2 : 0
          }
          _this.setData({
            mycardlist: _data,
            showBtnType: _showBtnType,
            refreshmy: true
          });
        }, true, true)
      }else{
        dcpSdk.storedUserId('')  // dcp采集userId
        _this.setData({
          showBtnType: 1
        })
      }
    } catch (e) {
      // Do something when catch error
    }
  },

  _getCustomerFollowNameCardList:function(){
    let _this = this
    wx.login({
      success: function success(res) {
        let _res = res.code
        wx.showLoading({
          title: '加载中',
        })
        common.getCustomerFollowNameCardList(_res, (callback) => {
          wx.hideLoading()
          let _data = callback.data
          _this.setData({
            list: _data,
            refresh:true
          });
        })
      }
    });
  },

  onShow:function(){
    this.checkUseInfo() //静默登录
    this._getCustomerFollowNameCardList()
  },
  checkUseInfo: function () {
    var _this = this
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          Login.getCode((data)=>{
            // 拿到微信的信息后，直接调用服务端登录
            Login.generalLoginAndCallBack(
                data.ress,
                data.code,
                ()=>{
                    // 登录成功
                    _this._getCardListRequest()
                }, ()=>{
                    // 登录失败，Do nothing!!!
                    _this._getCardListRequest()
                })
          })
        }else{
          _this._getCardListRequest()
        }
      },
      fail:res=>{
        console.log(res,'wrong')
        _this._getCardListRequest()
      }
    })
},
  makePhoneCall:function(e){
    let _phone = e.currentTarget.dataset.phonenum + ''
    wx.makePhoneCall({
      phoneNumber: _phone //仅为示例，并非真实的电话号码
    })
  },
  goInfo:function(e){
    let _id = e.currentTarget.dataset.id
    app.globalData.showInfoId = _id
    wx.switchTab({
      url: '/pages/myCard/myCard?cardId=' + _id,
    })
  },
  goPoster:function(e){
    let _id = e.currentTarget.dataset.id
    let _shopid = e.currentTarget.dataset.shopid
    app.globalData.showInfoId = _id
    var api = pageApi['getPosterList'];
    RequestManager[api.method](api.url, {
      shop_id: _shopid
    }, function (res) {
      if (res.data.poster_list && res.data.poster_list.length > 0){
        wx.navigateTo({
          url: '/pages/nameCard/poster/poster?shop_id=' + _shopid + '&name_card_id=' + _id,
        })
      }else{
        wx.showToast({
          title: '店铺暂未配置海报',
          icon: 'none',
          duration: 2000
        })
      }
    }, function (err) {
      errTost(err);
    }, true);
  },
  applyNewCard:function(){
    wx.navigateTo({
      url: '/pages/nameCard/personCardEdit/personCardEdit?shop_id=1'
    });
  },

  goLogin:function () {
    wx.redirectTo({
      url: '/pages/others/login/login?redirect_uri=cardlist'
    })
  },
 
  /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function onShareAppMessage(options) {
    var that = this;
    let info = options.target.dataset.item
    let _index = options.target.dataset.index
    if (options.from === 'button') {
      // 来自页面内转发按钮
      // console.log(options.target)
      // console.log(that.data.tempFilePath)
    }

    var share_title = `您好，我是泰然城的${info.job} ${info.name}。请收下我的名片`;
    var image_url = info.share_image;
    var paths = `pages/myCard/myCard?scene=${info.id}`;
    return {
      title: share_title,
      path: paths,
      imageUrl: image_url,
      success: function success(res) {
        // 转发成功
        // wx.showToast({
        //   title: "转发成功",
        //   icon: 'success',
        //   duration: 2000
        // });
      },
      fail: function fail(res) {
        // 转发失败
      }
    };
  },
  drawShareImage(info , index, _datas) {
    // return new Promise((resolve, reject) => {
      // 420 336
      let _this = this
      const { name, job, mobile, email, portrait } = info
      const context = wx.createCanvasContext('shareCanvas')
      const textX = 58
      const textX2 = 58 + 28
      context.clearRect(0,0,500,400)
      // bg
      context.drawImage('../../../image/myCard/shareBg.jpg', 0, 0, 500, 400)
      // bgImage
      context.drawImage('../../../image/myCard/nameCard/bg@2x.png', 12, 0, 476, 312)
      // name
      context.setFillStyle('#000000')
      context.setFontSize(25)
      context.fillText(name, textX, 102)
      // job
      context.setFillStyle('#b7b7b7')
      context.setFontSize(18)
      context.fillText(job, textX, 130)
      // mobile
      context.drawImage('../../../image/myCard/dianhua3@2x.png', textX, 188, 16, 16)
      context.setFillStyle('#a1a1a1')
      context.setFontSize(16)
      context.fillText(mobile, textX2, 202)
      // email
      context.drawImage('../../../image/myCard/youxiang3@2x.png', textX, 221, 16, 16)
      context.setFillStyle('#a1a1a1')
      context.setFontSize(16)
      context.fillText(email, textX2, 235)


      context.save()
      context.beginPath()
      context.arc(400, 96, 48, 0, 2 * Math.PI)
      context.clip()
      context.drawImage(portrait, 352, 48, 96, 96)
      context.restore()
      // text
      context.drawImage('../../../image/myCard/textBg.jpg', 128, 308, 244, 72)
      context.setFillStyle('#ffffff')
      context.setFontSize(24)
      context.fillText('查看名片', 200, 355)

      context.draw(true);
      setTimeout(function () {
        wx.canvasToTempFilePath({
          canvasId: 'shareCanvas',
          success: function (res) {
            var tempFilePath = res.tempFilePath;
            let _data = _this.data.tempFilePath || []
            _data.push(tempFilePath)
            _this.setData({
              tempFilePath: _data,
            });
            if (index < _datas.length - 1){
              _this.drawShareImage(_datas[index + 1], index + 1, _datas)
            }
          },
          fail: function (res) {
            console.log(res);
          }
        }, _this);
      }, 1000);
    // })
  },
  canvasToTempFilePath() {
    return new Promise((resolve, reject) => {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: 500,
        height: 400,
        destWidth: 500,
        destHeight: 400,
        canvasId: 'shareCanvas',
        success(res) {
          resolve(res.tempFilePath)
        },
        fail(e) {
          
        }
      })
    })
  },
  // rotate:function(){
  //   //创建动画
  //   var animation = wx.createAnimation({
  //     duration: 500,
  //     timingFunction: "linear",
  //     delay: 0,
  //     // transformOrigin: "50% 50%",
  //   })

  //   //设置动画
  //   animation.rotate(180).step();     //旋转90度
  //   //animation.scale(1.5).step();        //放大1.5倍
  //   //animation.translate(-30,-50).step();        //偏移x,y,z
  //   //animation.skew(30,50).step();        //倾斜x,y

  //   // animation.rotate(45).scale(0.8).translate(10, 10).step();     //边旋转边放大


  //   //导出动画数据传递给组件的animation属性。
  //   this.setData({
  //     animationData: animation.export(),
  //   });
  // },
});
