// pages/product/exchangeItem/exchangeItem.js
const RequestManager = require('../../../utils/RequestHelper.js')
const app = getApp()
const ctxPath = app.globalData.ctxPath
const pageApi = `${ctxPath}/ncxcx/promotion/getExchangesList`
const DcpPage = require('../../../utils/dcp/dcpPage')

const errTost = (err) => {
  wx.showToast({
    title: err.data.message || '小泰发生错误，请稍后再试~',
    icon: 'none'
  })
}

// 换购商品数据
// exchangeItem: {
//   load: true,
//   data: null,
//   limit: 0
// }
DcpPage({

  /**
   * 页面的初始数据
   */
  data: {
    dcpTitle: '换购商品',
    promotion_id:'',
    buyNum: '',
    fullPrice: '',
    limit: '',
    look: '',
    load: true,
    exchangeData: null,
    hasData: false,
    windowHeight: wx.getSystemInfoSync().windowHeight
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { promotion_id, fullPrice, limit, look } = options // 获取url参数
    this.setData({
      promotion_id: promotion_id || '',
      fullPrice: fullPrice || '',
      limit: limit || '',
      look: look|| ''
    }, () => {
      this.initPage()
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
      wx.hideShareMenu();
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
  onShareAppMessage: function () {

  },
  // 换购商品存储相关
  getExchangeItem() {
    try {
      var value = wx.getStorageSync('exchangeItem')
      if (value) {
        return JSON.parse(value)
      } else {
        return ''
      }
    } catch (e) {
      return ''
    }
  },
  setExchangeItem(data) {
    try {
      wx.setStorageSync('exchangeItem', JSON.stringify(data))
    } catch (e) { }
  },
  deleteExchangeItem() {
    try {
      wx.removeStorageSync('exchangeItem')
    } catch (e) {
    }
  },

  // 获取页面数据
  initPage(hidenToast) {
    RequestManager.RequestGet(pageApi, {
      promotion_id: this.data.promotion_id
    }, (res) => {
      if (res.code === 0) {
        this.initData({
          data: res.data
        })
      }
    }, (err) => { // error
      errTost(err)
    }, hidenToast)
  },
  turnLink(event) {
    let _itemid = event.currentTarget.dataset.itemid
    wx.navigateTo({
      url: '/pages/product/item-detail/index?&itemId=' + _itemid
    })
  },
  toExchangeBuy(event) {
    // TODO:换购是否有问题
    wx.navigateTo({
      url: '/pages/wxpage/wxpage?type=searchResult&promotion_id=' + this.data.promotion_id
    })
  },
  submitHandle() {
    this.setExchangeItem(this.data.exchangeData)
    wx.navigateBack()
  },
  // 勾选
  itemCheck(event) {
    const index = event.currentTarget.dataset.index
    const { exchangeData, promotion_id, limit } = this.data;
    let newList = exchangeData[promotion_id].filter((item, i) => {
      if (index === i) {
        return !item.check;
      } else {
        return item.check;
      }
    });
    if (newList.length > limit) {
      wx.showToast({
        title: `您最多只能换购${limit}件` ,
        icon: 'none'
      })
      return true;
    } else {
      this.itemSelect(index)
    }
  },

  // 改变state的方法
  // 初始化数据
  initData(result) { //promotion_id
    let exchangeItem = this.getExchangeItem()
    exchangeItem = this.removeInvalid(result.data, exchangeItem, this.data.promotion_id)
    this.setData({
      exchangeData: exchangeItem
    }, () => {
      let { promotion_id, exchangeData } = this.data
      if (exchangeData && exchangeData[promotion_id] && result.data) {
        result.data.map((r) => {
          const { sku_id } = r
          exchangeData[promotion_id].some((d) => {
            if (d.sku_id === sku_id) {
              r.check = d.check
              return true
            } else {
              return false
            }
          })
        })
      }
      const _exchangeData = { ...exchangeData, [promotion_id]: result.data }
      const hasData = (_exchangeData && _exchangeData[promotion_id] && _exchangeData[promotion_id].length) ? true : false;
      const buyNum = this.getBuyNum(_exchangeData, promotion_id)
      this.setData({
        exchangeData: _exchangeData,
        buyNum: buyNum,
        load: false,
        hasData: hasData
      })
    })
  },
  // 剔除失效的数据
  removeInvalid(result, exchangeData, promotion_id) {
    let _exchangeData = JSON.parse(JSON.stringify(exchangeData))
    if (result && _exchangeData && _exchangeData[promotion_id]){
      let _data = _exchangeData[promotion_id]
      _data.map((item) => {
        if (item.check){
          result.map((s) => {
            if (result.item_id === item.item_id && (item.store <= 0 || item.shelf_status != 30)) {
              item.check = false
            }
          })
        }
      })
      this.setExchangeItem(_exchangeData)
    }
    return _exchangeData
  },

  // 计算出BuyNum
  getBuyNum(exchangeData, promotion_id) {
    let buyNum = (exchangeData && exchangeData[promotion_id]) ? exchangeData[promotion_id].filter((item, i) => {
      return item.check;
    }).length : 0;
    return buyNum
  },
  // 选择数据
  itemSelect(index) {
    const { promotion_id, exchangeData } = this.data
    let _exchangeData = JSON.parse(JSON.stringify(exchangeData))
    _exchangeData[promotion_id].forEach((item, i) => {
      if (i === index) {
        item.check = !item.check
      }
    })
    const buyNum = this.getBuyNum(_exchangeData, promotion_id)
    this.setData({
      exchangeData: _exchangeData,
      buyNum: buyNum
    })
  }
})
