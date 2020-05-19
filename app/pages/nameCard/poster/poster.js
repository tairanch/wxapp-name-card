'use strict';

let RequestManager = require('../../../utils/RequestHelper.js');
let app = getApp();
let ctxPath = app.globalData.ncxcxPath;
let pageApi = {
  getNameCardQRCode: {
    url: ctxPath + '/api/getNameCardQRCode',
    method: "RequestGetNoLoading"
  },
  getNameCardInfo: {
    url: `${ctxPath}/api/getNameCardInfo`,
    method: "RequestGetNoLoading"
  },
  getPosterList: {
    url: `${ctxPath}/api/poster/getPosterList`,
    method: "RequestGetNoLoading"
  }
};
const fs = wx.getFileSystemManager();
//记录滚过海报的index
let number = [0];
let saveImgNumber = [];
let shop_id = '';
let name_card_id = '';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowHeight: '',
    windowWidth: '',
    usedHeight: '',
    portrait: '',
    shopName: '',
    phone: '',
    qrCode: '',
    canvasId: '',
    tempFilePath: '',

    depict: '',
    posterList: [],
    currentSwiper: 0,
    preIndex: 0,
    hideView: false,
    ht: '0px',
    marginTop: '0px',
    model: '',
    top: '0px'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    shop_id = options.shop_id;
    name_card_id = options.name_card_id;
    //清空数据(轮播的海报index、绘制的海报缓存链接)
    number = [0];
    saveImgNumber = [];
    this.getPosterList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function onReady() {
    let that = this;
    wx.getSystemInfo({
      success: function success(res) {
        that.data.windowHeight = res.screenHeight;
        that.data.windowWidth = res.screenWidth;
        that.data.usedHeight = res.windowHeight;
        that.data.model = res.model;
      }
    });
  },

  /**
   * 图片切换
   */
  swiperChange: function(e) {
    let that = this;
    this.setData({
      currentSwiper: e.detail.current,
      canvasId: that.data.posterList[e.detail.current].id,
      depict: that.data.posterList[e.detail.current].depict
    });
    console.log('index：' + e.detail.current);
    this.getLastHt();

    //滚动时，优化海报绘制
    if (number.indexOf(e.detail.current) <= -1) {
      wx.showLoading({
        title: '加载中...',
      });
      this.setData({
        hideView: false
      });
      wx.getImageInfo({
        src: that.data.posterList[that.data.currentSwiper].img_path,
        success: function(res) {
          that.data.posterList[that.data.currentSwiper].posterImg = res.path;
          that.getNameCardQRCode();
        }
      })
    }
    number.push(e.detail.current);
  },

  /**
   * 获取海报列表
   */
  getPosterList() {
    let that = this;
    wx.showLoading({
      title: '加载中...',
    });
    let api = pageApi['getPosterList'];
    RequestManager[api.method](api.url, {
      shop_id: shop_id
    }, function(res) {
      that.data.posterList = res.data.poster_list;
      that.getNameCardInfo();
    }, function(err) {
      errTost(err);
    }, true);
  },

  /**
   * 获取名片信息
   */
  getNameCardInfo() {
    let that = this;
    const api = pageApi.getNameCardInfo;
    RequestManager[api.method](api.url, {
      name_card_id: name_card_id
    }, (respones) => {
      //处理头像（为空时设置默认图片）
      if (respones.code === 0) {
        if (respones.data.portrait === '') {
          that.data.portrait = '/image/nameCard/moren@2x.png';
          that.initData(respones);
        } else {
          wx.getImageInfo({
            src: respones.data.portrait,
            success: function(res) {
              that.data.portrait = res.path;
              that.initData(respones);
            }
          })
        }
      }
    }, (err) => {
      errTost(err)
    }, false)
  },

  /**
   * 初始化数据
   */
  initData(respones) {
    let that = this;
    that.data.phone = respones.data.mobile;
    if (!respones.data.shop_name || respones.data.shop_name === '') {
      that.data.shopName = respones.data.mobile.substring(0, 3) + '****' + respones.data.mobile.substring(7, respones.data.mobile.length);
    } else {
      that.data.shopName = respones.data.shop_name;
    }

    for (let i = 0; i < that.data.posterList.length; i++) {
      if (respones.data.portrait === '') {
        that.data.posterList[i].portrait = '/image/nameCard/moren@2x.png';
      } else {
        that.data.posterList[i].portrait = respones.data.portrait;
      }
      if (!respones.data.shop_name || respones.data.shop_name === '') {
        that.data.posterList[i].phone = respones.data.mobile.substring(0, 3) + '****' + respones.data.mobile.substring(7, respones.data.mobile.length);
      } else {
        that.data.posterList[i].phone = respones.data.shop_name;
      }
    }

    this.setData({
      canvasId: that.data.posterList[that.data.currentSwiper].id,
      hideView: false,
      depict: that.data.posterList[that.data.currentSwiper].depict
    });
    this.getLastHt();

    wx.getImageInfo({
      src: that.data.posterList[that.data.currentSwiper].img_path,
      success: function(res) {
        that.data.posterList[that.data.currentSwiper].posterImg = res.path;
        that.getNameCardQRCode(that.data.currentSwiper);
      }
    })
  },

  /**
   * 获取剩余屏幕高度
   */
  getLastHt() {
    let that = this;
    let query = wx.createSelectorQuery();
    //选择id
    query.select('.header_des_pre').boundingClientRect(function(rect) {
      let height = rect.height;
      //iPhone SE机型的适配
      if (that.data.model.substring(0, 9) === 'iPhone SE') {
        that.setData({
          marginTop: height + 5 + 'px',
          ht: that.data.usedHeight - 55 - height + 'px',
          top: '-180px'
        })
      } else {
        that.setData({
          marginTop: height + 5 + 'px',
          ht: that.data.usedHeight - 55 - height + 'px'
        })
      }
    }).exec();
  },

  /**
   * 获取二维码
   */
  getNameCardQRCode: function getNameCardQRCode() {
    let _this = this;
    wx.showLoading({
      title: '加载中...',
    });
    let api = pageApi['getNameCardQRCode'];
    let page = '';
    let scene = '';
    this.setData({
      hideView: false
    });
    if (this.data.posterList[this.data.currentSwiper].type === 1) {
      page = 'pages/wxpage/wxpage';
      scene = this.data.posterList[this.data.currentSwiper].item_id + ',' + name_card_id
    } else {
      page = 'pages/mall/index';
      scene = name_card_id
    }
    RequestManager[api.method](api.url, {
      page: page,
      scene: scene
    }, function(res) {
      //往posterList里面存储对应的二维码(base64格式)，更新posterList刷新页面，隐藏loading、蒙层
      _this.data.qrCode = res;
      _this.data.posterList[_this.data.currentSwiper].qrCode = res;
      _this.setData({
        posterList: _this.data.posterList
      });
      _this.getQrCodeImage()
    }, function(err) {
      errTost(err);
    }, true);
  },

  /**
   * 生成二维码
   */
  getQrCodeImage: function() {
    // 生成的base64二维码
    this.QRCodeSrc = this.data.qrCode.substring(this.data.qrCode.indexOf(",") + 1);
    let that = this;
    let timeDate = Date.parse(new Date().toString());
    fs.writeFile({
      filePath: `${wx.env.USER_DATA_PATH}/` + timeDate + '.gif',
      data: this.QRCodeSrc,
      encoding: 'base64',
      success(res) {
        console.log('writeFile:', res);
        let localPath = `${wx.env.USER_DATA_PATH}/` + timeDate + '.gif';
        //往posterList里面存储对应的二维码(writeFile后的)
        that.data.qrCode = localPath;
        that.data.posterList[that.data.currentSwiper].qrCode = localPath;
        wx.hideLoading();
        that.setData({
          hideView: true
        });
      },
      fail(err) {
        console.error(err)
      }
    })
  },

  /**
   * 绘制页面
   */
  handleTapShareButton: function handleTapShareButton() {
    let that = this;
    // 使用 wx.createContext 获取绘图上下文 context
    let ctx = wx.createCanvasContext(that.data.canvasId, that);
    // 绘制图片
    ctx.drawImage(that.data.posterList[that.data.currentSwiper].posterImg, this.data.windowWidth * 0.16, this.data.windowWidth * 0.05, this.data.windowWidth * 0.68, this.data.windowWidth * 1.2);

    this.roundRect(ctx, this.data.windowWidth * 0.18, this.data.windowWidth * 1.02, this.data.windowWidth * 0.64, this.data.windowWidth * 0.21, 6, '#FFFFFF');

    ctx.setStrokeStyle('#E4E4E4');
    ctx.moveTo(this.data.windowWidth * 0.60, this.data.windowWidth * 1.04);
    ctx.lineTo(this.data.windowWidth * 0.60, this.data.windowWidth * 1.2);
    ctx.stroke();

    this.canvasRound(ctx, this.data.windowWidth * 0.21, this.data.windowWidth * 1.07, this.data.windowWidth * 0.12, this.data.windowWidth * 0.12);

    this.dealWords({
      ctx: ctx, //画布上下文
      fontSize: 14, //字体大小
      fontColor: '#353535',
      word: this.data.shopName, //需要处理的文字
      maxWidth: 80, //一行文字最大宽度
      x: this.data.windowWidth * 0.35, //文字在x轴要显示的位置
      y: this.data.windowWidth * 1.095, //文字在y轴要显示的位置
      maxLine: 1 //文字最多显示的行数
    });

    ctx.drawImage(that.data.posterList[that.data.currentSwiper].qrCode, this.data.windowWidth * 0.64, this.data.windowWidth * 1.03, this.data.windowWidth * 0.16, this.data.windowWidth * 0.16);

    ctx.setFontSize(8);
    ctx.setFillStyle('#999999');
    ctx.fillText("长按识别二维码", this.data.windowWidth * 0.64, this.data.windowWidth * 1.215);
    ctx.draw(false);
    this.canvasToTempFilePath();
  },

  /**
   * 绘制图片
   */
  canvasToTempFilePath() {
    let that = this;
    setTimeout(function() {
      wx.canvasToTempFilePath({
        x: that.data.windowWidth * 0.16,
        y: that.data.windowHeight * 0.033,
        width: that.data.windowWidth * 0.68,
        height: that.data.windowWidth * 1.2,
        destWidth: that.data.windowWidth * 0.68 * 3,
        destHeight: that.data.windowWidth * 1.2 * 3,
        canvasId: that.data.canvasId,
        quality: 1,
        success: function success(res) {
          // 保存图片到tempFilePath
          wx.hideLoading();
          that.data.tempFilePath = res.tempFilePath;
          that.data.posterList[that.data.currentSwiper].tempFilePath = res.tempFilePath;
          that.previewImage(that.data.tempFilePath)
        },
        fail: function fail(res) {
          wx.hideLoading();
          console.log('图片保存失败：' + JSON.stringify(res))
        }
      });
    }, 300);
  },

  /**
   * 生成预览图
   */
  previewImage(src) {
    let current = src;
    wx.previewImage({
      current: current,
      urls: [current]
    })
  },

  /**
   * 绘制保存图片
   */
  saveImg: function saveImg() {
    if (saveImgNumber.indexOf(this.data.currentSwiper) <= -1) {
      wx.showLoading({
        title: '图片生成中...',
      });
      setTimeout(() => {
        this.handleTapShareButton()
      }, 200);
    } else {
      this.previewImage(this.data.posterList[this.data.currentSwiper].tempFilePath);
    }
    saveImgNumber.push(this.data.currentSwiper);
  },

  /**
   * 保存图片
   */
  save() {
    let that = this;
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
            success: function success() {
              wx.showToast({
                title: '图片保存成功'
              });
            },
            fail: function fail() {
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
   * 处理文字多出省略号显示
   */
  dealWords: function(options) {
    options.ctx.setFontSize(options.fontSize); //设置字体大小
    options.ctx.setFillStyle(options.fontColor); //设置字体颜色
    let allRow = Math.ceil(options.ctx.measureText(options.word).width / options.maxWidth); //实际总共能分多少行
    let count = allRow >= options.maxLine ? options.maxLine : allRow; //实际能分多少行与设置的最大显示行数比，谁小就用谁做循环次数
    let endPos = 0; //当前字符串的截断点
    for (let j = 0; j < count; j++) {
      let nowStr = options.word.slice(endPos); //当前剩余的字符串
      let rowWid = 0; //每一行当前宽度
      if (options.ctx.measureText(nowStr).width > options.maxWidth) { //如果当前的字符串宽度大于最大宽度，然后开始截取
        for (let m = 0; m < nowStr.length; m++) {
          rowWid += options.ctx.measureText(nowStr[m]).width; //当前字符串总宽度
          if (rowWid > options.maxWidth) {
            if (j === options.maxLine - 1) { //如果是最后一行
              options.ctx.fillText(nowStr.slice(0, m - 1) + '...', options.x, options.y + (j + 1) * 18); //(j+1)*18这是每一行的高度
            } else {
              options.ctx.fillText(nowStr.slice(0, m), options.x, options.y + (j + 1) * 18);
            }
            endPos += m; //下次截断点
            break;
          }
        }
      } else { //如果当前的字符串宽度小于最大宽度就直接输出
        options.ctx.fillText(nowStr.slice(0), options.x, options.y + (j + 1) * 18);
      }
    }
  },

  /**
   * 绘制圆角矩形
   * @param {Object} ctx - canvas组件的绘图上下文
   * @param {Number} x - 矩形的x坐标
   * @param {Number} y - 矩形的y坐标
   * @param {Number} w - 矩形的宽度
   * @param {Number} h - 矩形的高度
   * @param {Number} r - 矩形的圆角半径
   * @param {String} [c = 'transparent'] - 矩形的填充色
   */
  roundRect(ctx, x, y, w, h, r, c) {
    if (w < 2 * r) {
      r = w / 2;
    }
    if (h < 2 * r) {
      r = h / 2;
    }

    ctx.beginPath();
    ctx.fillStyle = c;

    ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.lineTo(x + w, y + r);

    ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2);
    ctx.lineTo(x + w, y + h - r);
    ctx.lineTo(x + w - r, y + h);

    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5);
    ctx.lineTo(x + r, y + h);
    ctx.lineTo(x, y + h - r);

    ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI);
    ctx.lineTo(x, y + r);
    ctx.lineTo(x + r, y);

    ctx.fill();
    ctx.closePath();
  },

  /**
   * 绘制圆形图片
   * @param {Object} ctx - canvas组件的绘图上下文
   * @param {Number} x - 绘制的头像宽度
   * @param {Number} y - 绘制的头像高度
   * @param {Number} w - 绘制的头像在画布上的位置
   * @param {Number} h - 绘制的头像在画布上的位置
   */
  canvasRound(ctx, x, y, w, h) {
    ctx.save();
    ctx.beginPath(); //开始绘制
    //先画个圆   前两个参数确定了圆心 （x,y） 坐标  第三个参数是圆的半径  四参数是绘图方向  默认是false，即顺时针
    ctx.arc(w / 2 + x, h / 2 + y, w / 2, 0, Math.PI * 2, false);
    //画好了圆 剪切  原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内 这也是我们要save上下文的原因
    ctx.clip();
    // 推进去图片，必须是https图片
    ctx.drawImage(this.data.portrait, x, y, w, h);
    //恢复之前保存的绘图上下文 恢复之前保存的绘图上下午即状态 还可以继续绘制
    ctx.restore();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function onShareAppMessage(ops) {
    if (ops.from === 'button') {
      // 来自页面内转发按钮
      console.log(ops.target);
    }
    let page = '';
    if (this.data.posterList[this.data.currentSwiper].type === 1) {
      page = 'pages/wxpage/wxpage?scene=' + this.data.posterList[this.data.currentSwiper].item_id + ',' + name_card_id;
    } else {
      page = 'pages/mall/index?scene=' + name_card_id;
    }
    return {
      title: '我在泰然城发现，赶快来看看吧',
      path: page,
      imageUrl: this.data.img,
      success: function success(res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function fail(res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    };
  }
});
