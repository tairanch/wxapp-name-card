'use strict';

// pages/product/shareMiddlePage/shareMiddlePage.js
var common = require('../../../utils/common.js');
var RequestManager = require('../../../utils/RequestHelper.js');
var app = getApp();
var ctxPath = app.globalData.ncxcxPath;
var pageApi = {
  getNameCardQRCode: { url: ctxPath + '/api/getNameCardQRCode', method: "RequestGet" },
  getNameCardInfo: { url: `${ctxPath}/api/getNameCardInfo`, method: "RequestGetNoLoading" },
};
var item_id = '';
var commission_min_price = '';
const fs = wx.getFileSystemManager();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowHeight: '',
    windowWidth: '',
    phone: '',
    goodImg: '',
    img:'',
    goodTitle: '',
    goodPrice: '',
    qrCode: '',
    tempFilePath: '',
    imageH:0,
    imageW:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    item_id = options.item_id;
    commission_min_price = options.commission_min_price;
    this.getNameCardInfo();
    this.getDetailsInfo();
  },


  /**
  * 获取名片信息
  */
  getNameCardInfo() {
    let that = this;
    const api = pageApi.getNameCardInfo
    RequestManager[api.method](api.url, {
      name_card_id: app.globalData.cardId
    }, (res) => {
      if (res.code === 0) {
        if (!res.data.shop_name || res.data.shop_name === ''){
          if (res.data.mobile >= 11) {
            var sub = res.data.mobile.substring(0, 3) + '****' + res.data.mobile.substring(7, res.data.mobile.length);
            that.setData({
              phone: sub
            });
          }
        }else{
          that.setData({
            phone: res.data.shop_name
          });
        }
      }
    }, (err) => {
      errTost(err)
    }, false)
  },

  /**
   * 获取商品详情信息
   */
  getDetailsInfo: function getDetailsInfo() {
    var that = this;
    var _params = {
      item_id: item_id
    };
    RequestManager.RequestGet(app.globalData.ncxcxPath + '/ncxcx/item/detail', _params, function (res) {
      console.log(res.data);
      that.data.img = res.data.images[0]
      that.data.goodImg = res.data.images[0]
      that.data.goodTitle = res.data.title
      that.data.goodPrice = commission_min_price
      wx.getImageInfo({
        src: that.data.goodImg,
        success: function (res) {
          console.log(res.path)
          that.data.imageW = res.width
          that.data.imageH = res.height
          that.data.goodImg = res.path
          that.getNameCardQRCode();
        },
        fail: function (res) {
          console.log(res)
        }
      })
    });
  },

  /**
   * 获取二维码
   */
  getNameCardQRCode: function getNameCardQRCode() {
    var _this = this;
    var api = pageApi['getNameCardQRCode'];
    wx.showLoading({
      title: '加载中...',
    })
    RequestManager[api.method](api.url, {
      page: 'pages/wxpage/wxpage',
      scene: item_id + ',' + app.globalData.cardId + ',' + 0
    }, function (res) {
      var image = wx.arrayBufferToBase64(res); //对数据进行转换操作
      _this.data.qrCode = res
      _this.getQrCodeImage()
    }, function (err) {
      errTost(err);
    }, true);
  },

  /**
   * 生成二维码
   */
  getQrCodeImage: function () {
    // 生成的base64二维码
    this.QRCodeSrc = this.data.qrCode.substring(this.data.qrCode.indexOf(",") + 1)
    let that = this;
    let timeDate = Date.parse(new Date());
    fs.writeFile({
      filePath: `${wx.env.USER_DATA_PATH}/` + timeDate +'.gif',
      data: this.QRCodeSrc,
      encoding: 'base64',
      success(res) {
        console.log('writeFile:', res)
        let localPath = `${wx.env.USER_DATA_PATH}/` + timeDate + '.gif';
        that.data.qrCode = localPath
        setTimeout(() => {
          that.handleTapShareButton()
        }, 200)
      }, fail(err) {
        console.error(err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function onReady() {
    var that = this;
    wx.getSystemInfo({
      success: function success(res) {
        that.data.windowHeight = res.screenHeight;
        that.data.windowWidth = res.screenWidth;
      }
    });
  },

  /**
   * 绘制页面
   */
  handleTapShareButton: function handleTapShareButton() {

    var that = this;
    // 使用 wx.createContext 获取绘图上下文 context
    var ctx = wx.createCanvasContext('myShareCanvas', that);
    var path = '../../../image/shareMiddlePage/bg_pre.png';
    // 绘制图片
    ctx.drawImage(path, this.data.windowWidth * 0.16, this.data.windowHeight * 0.033, this.data.windowWidth * 0.68, this.data.windowWidth * 1.2);

    ctx.setFontSize(14);
    ctx.setFillStyle('black');
    ctx.fillText("有温度的好物", this.data.windowWidth * 0.38, this.data.windowWidth * 0.24);

    this.dealWords({
      ctx: ctx,//画布上下文
      fontSize: 12,//字体大小
      fontColor: '#999999',
      word: "来自" + this.data.phone + "的分享",//需要处理的文字
      maxWidth: 140,//一行文字最大宽度
      x: this.data.windowWidth * 0.32,//文字在x轴要显示的位置
      y: this.data.windowWidth * 0.25,//文字在y轴要显示的位置
      maxLine: 1//文字最多显示的行数
    });

    this.dealWords({
      ctx: ctx,//画布上下文
      fontSize: 14,//字体大小
      fontColor: 'black',
      word: this.data.goodTitle,//需要处理的文字
      maxWidth: 140,//一行文字最大宽度
      x: this.data.windowWidth * 0.20,//文字在x轴要显示的位置
      y: this.data.windowWidth * 0.95,//文字在y轴要显示的位置
      maxLine: 2//文字最多显示的行数
    });

    ctx.setFontSize(10);
    ctx.setFillStyle('#999999');
    ctx.fillText("商品价格以实际为准", this.data.windowWidth * 0.20, this.data.windowWidth * 1.11);

    ctx.setFontSize(18);
    ctx.setFillStyle('#E60A30');
    let price = parseFloat(parseFloat(this.data.goodPrice).toFixed(2))
    ctx.fillText('¥' + price, this.data.windowWidth * 0.20, this.data.windowWidth * 1.19);

    ctx.drawImage(this.data.qrCode, this.data.windowWidth * 0.60, this.data.windowWidth * 0.95, this.data.windowWidth * 0.2, this.data.windowWidth * 0.2);

    ctx.setFontSize(9);
    ctx.setFillStyle('#666666');
    ctx.fillText("扫描或长按二维码", this.data.windowWidth * 0.60, this.data.windowWidth * 1.19);

    this.dealImage(ctx);
    ctx.draw(false);

    this.canvasToTempFilePath();
  },

  /**
   * 绘制图片到本地路径
   */
  canvasToTempFilePath(){
    let that = this;
    setTimeout(function () {
      wx.canvasToTempFilePath({
        x: that.data.windowWidth * 0.16,
        y: that.data.windowHeight * 0.033,
        width: that.data.windowWidth * 0.68,
        height: that.data.windowWidth * 1.2,
        destWidth: that.data.windowWidth * 0.68 * 3,
        destHeight: that.data.windowWidth * 1.2 * 3,
        canvasId: 'myShareCanvas',
        quality: 1,
        success: function success(res) {

          wx.hideLoading();
          // 保存图片到相册
          that.data.tempFilePath = res.tempFilePath;
        },
        fail: function fail(res) {

          wx.showToast({
            title: '图片保存失败',
            icon: 'none'
          });
        }
      });
    }, 300);
  },

  /**
   * 等比缩放图片处理
   */
  dealImage(ctx){
    let that = this;
    let imageRectWidth = this.data.windowWidth * 0.53;
    // 计算图片应该绘制的宽度
    // 高度大于宽度
    // 图片真实绘制高度，宽度
    let imageRealW = 0;
    let imageRealH = 0;
    let x = 0;
    let y = 0;

    if (that.data.imageH > that.data.imageW) {

      imageRealH = imageRectWidth;
      imageRealW = (imageRectWidth * that.data.imageW) / that.data.imageH;

      // x = imageRealW -
      y = this.data.windowWidth * 0.34;
      x = (imageRectWidth - imageRealW) / 2 + this.data.windowWidth * 0.225;

    } else {

      imageRealW = imageRectWidth;
      imageRealH = (imageRectWidth * that.data.imageH) / that.data.imageW;
      x = this.data.windowWidth * 0.225;
      y = (imageRectWidth - imageRealH) / 2 + this.data.windowWidth * 0.32;

    }

    // 计算图片应该绘制的高度
    // 计算x，y位置
    ctx.drawImage(this.data.goodImg, x, y, imageRealW, imageRealH);
  },

  /**
   * 处理文字多出省略号显示
   */
  dealWords: function (options) {
    options.ctx.setFontSize(options.fontSize);//设置字体大小
    options.ctx.setFillStyle(options.fontColor);//设置字体颜色
    let allRow = Math.ceil(options.ctx.measureText(options.word).width / options.maxWidth);//实际总共能分多少行
    let count = allRow >= options.maxLine ? options.maxLine : allRow;//实际能分多少行与设置的最大显示行数比，谁小就用谁做循环次数
    let endPos = 0;//当前字符串的截断点
    for (var j = 0; j < count; j++) {
      var nowStr = options.word.slice(endPos);//当前剩余的字符串
      var rowWid = 0;//每一行当前宽度
      if (options.ctx.measureText(nowStr).width > options.maxWidth) {//如果当前的字符串宽度大于最大宽度，然后开始截取
        for (var m = 0; m < nowStr.length; m++) {
          rowWid += options.ctx.measureText(nowStr[m]).width;//当前字符串总宽度
          if (rowWid > options.maxWidth) {
            if (j === options.maxLine - 1) { //如果是最后一行
              options.ctx.fillText(nowStr.slice(0, m - 1) + '...', options.x, options.y + (j + 1) * 18);  //(j+1)*18这是每一行的高度
            } else {
              options.ctx.fillText(nowStr.slice(0, m), options.x, options.y + (j + 1) * 18);
            }
            endPos += m;//下次截断点
            break;
          }
        }
      } else {//如果当前的字符串宽度小于最大宽度就直接输出
        options.ctx.fillText(nowStr.slice(0), options.x, options.y + (j + 1) * 18);
      }
    }
  },

  /**
   * 保存图片到相册
   */
  saveImg: function saveImg() {
    var that = this;
    // 看看是否开启了授权
    wx.getSetting({
      success: function success(res) {

        // 曾经授权弹出框，但是关闭了授权
        if (res.authSetting.hasOwnProperty("scope.writePhotosAlbum") && !res.authSetting["scope.writePhotosAlbum"]) {
          // 打开授权设置页面
          wx.openSetting({});
        } else {

          // 授权成功，保存相册
          wx.saveImageToPhotosAlbum({
            filePath: that.data.tempFilePath,
            success: function success(res) {
              wx.showToast({
                title: '图片保存成功'
              });
            },
            fail: function fail(error) {
              wx.showToast({
                title: '图片保存失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  /**
   * 返回上一页
   */
  backDes: function backDes() {
    wx.navigateBack({
      delta: 1
    })
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function onShow() {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function onHide() {
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function onUnload() {
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function onPullDownRefresh() {
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function onReachBottom() {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function onShareAppMessage(ops) {
    if (ops.from === 'button') {
      // 来自页面内转发按钮
      console.log(ops.target);
    }
    var that = this;
    return {
      title: '我在泰然城发现' + this.data.goodTitle+'，赶快来看看吧',
      path: 'pages/wxpage/wxpage?scene=' + item_id + ',' + app.globalData.cardId + ',' + 0,
      imageUrl: this.data.img,
      success: function success(res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
        var shareTickets = res.shareTickets;
      },
      fail: function fail(res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    };
  }
});
