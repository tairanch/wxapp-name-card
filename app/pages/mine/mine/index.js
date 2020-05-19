'use strict';

var common = require('../../../utils/common.js');
var util = require('../../../utils/util.js');
var RequestManager = require('../../../utils/RequestHelper.js');
var app = getApp();
var Login = require('../../../utils/login.js');
const DcpPage = require('../../../utils/dcp/dcpPage');
const dcpSdk = app.dcp
DcpPage({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    messgeInfo: {},
    orderCountData: {},
    stripData: {},
    totalUsableAmount: 0,
    isSalesman: false,
    isLogin: app.globalData.haslogin,
    dcpTitle: '个人中心',
    eCardCount: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    if (app.globalData.haslogin == false) {
      this.checkUseInfo() //静默登录
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function onShow() {
    wx.hideShareMenu(); //隐藏分享
    this.getUserLoginStatus();
    this.getNdata();
    if (app.globalData.haslogin) {
      Login.isSalesmanLogin()
    } else {
      dcpSdk.storedUserId('') // dcp采集userId
    }
  },

  checkUseInfo: function() {
    var _this = this
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          Login.getCode((data) => {
            // 拿到微信的信息后，直接调用服务端登录
            Login.generalLoginAndCallBack(
              data.ress,
              data.code,
              () => {
                // 登录成功，刷新界面
                _this.getUserLoginStatus();
                _this.getNdata();
              }, () => {
                // 登录失败，Do nothing!!!
              })
          })
        } else {
          // 未授权，弹出授权页面
        }
      },
      fail: res => {
        console.log(res, 'wrong')
      }
    })
  },

  getNdata: function() {
    var self = this;
    if (app.globalData.haslogin) {

      common.getMoreCount(function(res) {
        if (app.globalData.haslogin) {
          self.setData({
            stripData: res.data
          });
        }
      });

      if (!self.data.loginFlag) {
        common.getUserInfo(function(res) {
          self.getUserLoginStatus(res);
          if (!app.globalData.haslogin) {
            return
          }
          if (self.data.userInfo.avatar == undefined) {
            self.setData({
              userInfo: res.data.body,
              globalUserInfo: app.globalData.userInfo,
              loginFlag: false
            });
          } else if (res.data.body.avatar.split("?")[0] !== self.data.userInfo.avatar.split("?")[0]) {
            self.setData({
              userInfo: res.data.body,
              globalUserInfo: app.globalData.userInfo,
              loginFlag: false
            });
          }
        });
      }

      common.getOrderCount(function(res) {
        self.getUserLoginStatus(res);
        if (app.globalData.haslogin) {
          self.setData({
            orderCountData: res.data
          });
        }
      });

      common.eCardCount(function(res) {
        self.getUserLoginStatus(res);
        if (app.globalData.haslogin) {
          self.setData({
            totalUsableAmount: res.totalUsableAmount
          });
        }
      });

      common.isSalesman(function(res) {
        self.getUserLoginStatus(res);
        if (app.globalData.haslogin) {
          self.setData({
            isSalesman: res.data.is_salesman
          });
        }
      });
    } else {
      // 隐藏顶部刷新图标
      wx.hideNavigationBarLoading();
      // 停止刷新
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function onShareAppMessage() {},

  //获取用户信息
  getUserInfo: function getUserInfo() {},

  // 去订单列表
  checkOrderList: function checkOrderList(event) {
    // type 全部 0 待付款 1 待发货 2 待收货 3 带评价 4 退货 5
    if (app.globalData.haslogin == false) {
      wx.navigateTo({
        url: '/pages/others/login/login?redirect_uri=switchTabMine'
      });
      return
    }
    var type = event.currentTarget.dataset.type;
    wx.navigateTo({
      url: '/pages/wxpage/wxpage?type=' + type
    });
  },

  /**
   * 跳转到我的拼团
   */
  clickToPieceSale: function clickToPieceSale(event) {
    if (app.globalData.haslogin == false) {
      wx.navigateTo({
        url: '/pages/others/login/login?redirect_uri=switchTabMine'
      });
      return
    }
    var type = event.currentTarget.dataset.type;
    wx.navigateTo({
      url: '/pages/product/pieceSale/pieceSale'
    });
  },

  // 列表被点击
  listItemClick: function(event) {
    if (!app.globalData.haslogin) {
      wx.navigateTo({
        url: '/pages/others/login/login?redirect_uri=switchTabMine'
      });
      return
    }
    // index list0 我的拼团 list1 我的收藏 list2  卡券包 list3 e卡管理 list4 联系客服 listuser 用户头像
    var _list = event.currentTarget.dataset.list;

    if (_list == 'shopCart') {
      // 我的购物袋
      wx.navigateTo({
        url: '/pages/product/shopCart/index'
      });
    } else {
      wx.navigateTo({
        url: '/pages/wxpage/wxpage?type=' + _list
      });
    }
  },

  /**
   * 开具发票
   */
  invoiceItemClick:function() {

    wx.navigateTo({
      url: '../invoice/invoice',
      success: function(res){
        // success
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })
  },


  // 点击头像，未登录状态下，跳转登录；已登录，不操作
  onHeaderClick: function() {
    if (!app.globalData.haslogin) {
      wx.navigateTo({
        url: '/pages/others/login/login?redirect_uri=switchTabMine'
      });
    }
  },

  // 点击名片按钮
  onNameCardBtnClick: function() {
    wx.navigateTo({
      url: "/pages/nameCard/cardlist/index"
    });
  },

  // 点击未登录按钮
  onNotLoginClick: function() {
    wx.navigateTo({
      url: '/pages/others/login/login?redirect_uri=switchTabMine'
    });
  },

  // 营销管理
  onPromoteManagerTap: function() {

    // 未登录
    if (app.globalData.haslogin == false) {
      wx.navigateTo({
        url: '/pages/others/login/login?redirect_uri=switchTabMine'
      });
      return
    }

    wx.navigateTo({
      url: '/pages/mine/promote/index'
    });
  },


  // 查看消息列表
  checkInforList: function checkInforList() {
    if (app.globalData.haslogin == false) {
      wx.navigateTo({
        url: '/pages/others/login/login?redirect_uri=switchTabMine'
      });
      return
    }

    if (app.globalData.login.accessToken) {
      wx.navigateTo({
        url: '../../informationList/informationList'
      });
    } else {
      wx.switchTab({
        url: '/pages/mine/mine/index',
      });
    }
  },

  // 获取用户登录状态
  getUserLoginStatus: function(res) {

    if (res && res.hasOwnProperty('data') && res.data.hasOwnProperty('code') && res.data.code == '401') {
      // 未登录
      app.globalData.haslogin = false;
      this.setData({
        isLogin: false,
        userInfo: {},
        messgeInfo: {},
        orderCountData: {},
        stripData: {},
        totalUsableAmount: 0,
        isSalesman: false
      })
    } else if (app.globalData.haslogin) {
      this.setData({
        isLogin: true
      })
    } else {
      this.setData({
        isLogin: false,
        userInfo: {},
        messgeInfo: {},
        orderCountData: {},
        stripData: {},
        totalUsableAmount: 0,
        isSalesman: false
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function onUnload() {},


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function onReachBottom() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function onPullDownRefresh() {
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    this.getUserLoginStatus();
    if (app.globalData.haslogin) {
      // this.onLoad();
      this.getNdata();
    } else {
      // 隐藏顶部刷新图标
      wx.hideNavigationBarLoading();
      // 停止刷新
      wx.stopPullDownRefresh();
    }
  },

});