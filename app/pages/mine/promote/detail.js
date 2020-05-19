// pages/mine/promote/detail.js

// pages/mine/mine/index.js
/**
 * <pre>
 *      Copyright    : Copyright (c) 2019.
 *      Author       : zhufengyi.
 *      Created Time : 2019/3/12.
 *      Desc         : 佣金明细
 * </pre>
 */
//index.js
// 参考https://www.cnblogs.com/till-the-end/p/8935152.html
//获取应用实例
const app = getApp()

Page({
  data: {

    navData: [
      {
        text: '全部'
      },
      {
        text: '待入账'
      },
      {
        text: '已入账'
      },
      {
        text: '取消入账'
      }
    ],

    currentTab: 0,
    navScrollLeft: 0
  },


  //事件处理函数
  onLoad: function () {

    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          pixelRatio: res.pixelRatio,
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      },
    })
  },

  // getUserCommissionList

// 点击切换导航
  onSwitchNav(event) {

    var cur = event.currentTarget.dataset.current;
    //每个tab选项宽度占1/5
    var singleNavWidth = this.data.windowWidth / 5;
    //tab选项居中
    this.setData({
      navScrollLeft: (cur - 2) * singleNavWidth
    })

    if (this.data.currentTab == cur) {
      return false;
    } else {
      this.setData({
        currentTab: cur
      })
    }
  },

  // 滚动swiper
  onSwitchTab(event) {

    let cur = event.detail.current;

    let promote_list_pomponent = this.selectComponent('#key_' + cur);

    promote_list_pomponent.onRefresh();

    let singleNavWidth = this.data.windowWidth / 5;
    this.setData({
      currentTab: cur,
      navScrollLeft: (cur - 2) * singleNavWidth
    });
  }
})
