const RequestManager = require('../../../utils/RequestHelper.js')
const app = getApp()
const ctxPath = app.globalData.ncxcxPath
const DcpPage = require('../../../utils/dcp/dcpPage');
const pageApi = {
    getNameCardQRCode: {url: `${ctxPath}/api/getNameCardQRCode`, method: "RequestGet"},
    getNameCardInfo: {url: `${ctxPath}/api/getNameCardInfo`, method: "RequestGet"}
};
const fs = wx.getFileSystemManager();
const errTost = (err) => {
    const message = (err && err.data && err.data.message) ? err.data.message : '小泰发生错误，请稍后再试'
    wx.showToast({
        title: message,
        icon: 'none'
    })
};

DcpPage({
    /**
     * 页面的初始数据
     */
    data: {
        code: '',
        info: {},
        screenWidth: 0,
        screenHeight: 0,
        qrCodeImage: '',
        qrPhoneImage: '',
        qrEmailImage: '',
        qrPortray: '',
        codeImage: '',
        dcpTitle: '二维码'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.hideShareMenu();
        wx.setNavigationBarColor({
            frontColor: "#000000",
            backgroundColor: '#ffffff'
        });
        if (!options.cardId) {
            wx.navigateBack({changed: true})
        }
        this.setData({
            cardId: options.cardId
        }, (rs) => {
            this.getCardInfo(this.data.cardId)
        });
        this.data.screenWidth = wx.getSystemInfoSync().screenWidth;
        this.data.screenHeight = wx.getSystemInfoSync().screenHeight;

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
    onShareAppMessage: function () {

    },
    getCode() {
        return new Promise((resolve, reject) => {
            wx.login({
                success: function (res) {
                    const code = res.code;
                    if (code) {
                        resolve(code)
                    } else {
                        errTost({
                            data: {
                                message: '获取用户登录态失败'
                            }
                        });
                        console.log('获取用户登录态失败：' + res.errMsg);
                    }
                }
            });
        })

    },
    getCardInfo() {
        const api = pageApi.getNameCardInfo;
        let that = this;
        this.getCode().then((code) => {
            RequestManager[api.method](api.url, {
                code: code,
                name_card_id: this.data.cardId
            }, (res) => {
                if (res.code === 0) {
                    app.globalData.inviteCode = res.data.invite_code || ''
                    this.setData({
                        info: res.data,
                        show: !res.data.is_followed
                    });
                    wx.getImageInfo({
                        src: res.data.portrait,
                        success: function (res) {
                            that.data.qrPortray = res.path;
                            console.log("qrPortray==" + that.data.qrPortray);
                        }
                    });
                    that.getNameCardQRCode();
                }
            }, (err) => {
                errTost(err)
            }, false)
        })
    },
    /**
     * 获取微信二维码
     */
    getNameCardQRCode() {
        const api = pageApi['getNameCardQRCode'];
        let that = this;
        RequestManager[api.method](api.url, {
            page: `pages/myCard/myCard`,
            scene: this.data.cardId
        }, (res) => {
            this.setData({
                codeImage: res
            });
            that.data.qrCode = res;
            that.getQrCodeImage();
        }, (err) => {
            errTost(err)
        }, true)
    },
    /**
     * 生成二维码
     */
    getQrCodeImage: function () {
        // 生成的base64二维码
        let src = this.data.qrCode.substring(this.data.qrCode.indexOf(",") + 1);
        let that = this;
        let timeDate = Date.parse(new Date());
        fs.writeFile({
            filePath: `${wx.env.USER_DATA_PATH}/` + timeDate + '.gif',
            data: src,
            encoding: 'base64',
            success(res) {
                console.log('writeFile:', res);
                let localPath = `${wx.env.USER_DATA_PATH}/` + timeDate + '.gif';
                wx.getImageInfo({
                    src: localPath,
                    success(res) {
                        that.data.qrCode = res.path;
                        console.log("qrCode==" + that.data.qrCode);
                    },
                    fail(err) {
                        console.error("qrCode-err0r:" + err)
                    },
                    complete() {
                        wx.hideLoading();
                    }
                })
            }, fail(err) {
                console.error(err)
            }
        })
    },

    onSaveQrImage() {
        if (this.data.qrCode != '') {
            this.saveQrImage(this.data.info, this.data.qrCode);
        }
    },
    /**
     * 保存绘图
     */
    saveQrImage(info, qrcode) {

        if (info == ' ' || this.data.qrPortray == ' ' || this.data.qrCode == '') {
            wx.showToast({
                title: this.data.qrCode == '' ? '没有二维码数据' : '请求数据有误'
            });
            return;
        }
        let that = this;
        try {
            wx.showLoading({
                title: '正在绘制...',
            });
            let canvas = wx.createCanvasContext('firstCanvas');
            let x = 40;
            let y = 30;
            let r = 10;
            let w = this.data.screenWidth - x * 2;
            let h = (this.data.screenWidth - x * 2) * 1.7;

            canvas.moveTo(x + r, y);
            canvas.arcTo(x + w, y, x + w, y + h, r);
            canvas.arcTo(x + w, y, x + w, y + h, r);
            canvas.arcTo(x + w, y + h, x, y + h, r);
            canvas.arcTo(x, y + h, x, y, r);
            canvas.arcTo(x, y, x + w, y, r);
            canvas.setFillStyle('white');
            canvas.fill();
            canvas.save();
            canvas.closePath();

            canvas.beginPath();
            canvas.setFontSize(16);
            canvas.setFillStyle('#000000');
            canvas.fillText(info.name, x + 30, y + 50);

            canvas.setFontSize(12);
            canvas.setFillStyle('#666666');
            canvas.fillText(info.job, x + 30, y + 70);

            canvas.drawImage("/image/myCard/dianhua3@2x.png", x + 30, y + 93, 8, 8);
            canvas.setFontSize(8);
            canvas.setFillStyle('#666666');
            canvas.fillText(info.mobile, x + 42, y + 100);

            canvas.drawImage('/image/myCard/youxiang3@2x.png', x + 30, y + 105, 8, 8);
            canvas.setFontSize(8);
            canvas.setFillStyle('#666666');
            canvas.fillText(info.email, x + 42, y + 112);

            let avatar_width = 60;
            let avatar_height = avatar_width;
            let avatar_x = x + w - avatar_width - 20;
            let avatar_y = y + 40;
            let avatarUrl = that.data.qrPortray ? that.data.qrPortray : '/image/nameCard/moren@2x.png';
            this.canvasRound(canvas, avatar_x, avatar_y, avatar_width, avatar_height, avatarUrl);


            canvas.setStrokeStyle('#E4E4E4');
            canvas.moveTo(x, y + 150);
            canvas.lineTo(x + w, y + 150);
            canvas.stroke();

            let qr_width = 150;
            let qr_x = this.data.screenWidth / 2 - qr_width / 2;
            let qr_y = y + 210;
            canvas.drawImage(that.data.qrCode, qr_x, qr_y, qr_width, qr_width);

            canvas.setFontSize(12);
            canvas.setFillStyle('#000000');
            canvas.setTextAlign('center');
            canvas.fillText('请扫码，收下我的二维码', this.data.screenWidth / 2, qr_y + qr_width + 26);

            canvas.draw(false);
            that.canvasToTempFilePath(x, y, w, h);
        } catch (e) {
            console.log("canvas-error:" + e);
        }
    },
    /**
     * 绘制圆形图片
     * @param {Object} ctx - canvas组件的绘图上下文
     * @param {Number} x - 绘制的头像宽度
     * @param {Number} y - 绘制的头像高度
     * @param {Number} w - 绘制的头像在画布上的位置
     * @param {Number} h - 绘制的头像在画布上的位置
     */
    canvasRound(ctx, x, y, w, h, url) {
        ctx.save();
        ctx.beginPath(); //开始绘制
        ctx.setStrokeStyle('red');
        //先画个圆   前两个参数确定了圆心 （x,y） 坐标  第三个参数是圆的半径  四参数是绘图方向  默认是false，即顺时针
        ctx.arc(w / 2 + x, h / 2 + y, w / 2, 0, Math.PI * 2, false);
        //画好了圆 剪切  原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内 这也是我们要save上下文的原因
        ctx.stroke();
        ctx.clip();
        // 推进去图片，必须是https图片
        ctx.drawImage(url, x, y, w, h);
        //恢复之前保存的绘图上下文 恢复之前保存的绘图上下午即状态 还可以继续绘制
        ctx.restore();
    },

    /**
     * 绘制图片
     */
    canvasToTempFilePath(x, y, w, h) {
        let that = this;
        setTimeout(function () {
            wx.canvasToTempFilePath({
                x: x,
                y: y,
                width: w,
                height: h,
                destWidth: w * 3,
                destHeight: h * 3,
                quality: 1,
                fileType: 'jpg',
                canvasId: 'firstCanvas',
                success(res) {
                    console.log(res.tempFilePath);
                    that.getAuthorize(res.tempFilePath);
                },
                fail(err) {
                    console.log("canvasToTempFilePath-err--" + err);
                }
            });
        }, 300);
    },
    /**
     * 查看是否授权
     */
    getAuthorize(tempFilePath) {
        let that = this;
        wx.getSetting({
            success(res) {
                // 曾经授权弹出框，但是关闭了授权
                if (res.authSetting.hasOwnProperty("scope.writePhotosAlbum") && !res.authSetting["scope.writePhotosAlbum"]) {
                    // 打开授权设置页面
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success(res) {
                            that.saveImg(tempFilePath);
                        },
                        fail(err) {
                            wx.hideLoading();
                            wx.showModal({
                                title: '授权',
                                content: '保存图片，请先授权',
                                success(res) {
                                    if (res.confirm) {
                                        wx.openSetting({
                                            success(res) {
                                                console.log(res.authSetting)
                                            }
                                        })
                                    } else {
                                        console.log("没有更新");
                                    }
                                }
                            });
                        }
                    })
                } else {
                    that.saveImg(tempFilePath);
                }
            }, fail(err) {
                wx.hideLoading();
                wx.showToast({
                    title: '授权失败'
                });
            }
        });
    },

    /**
     * 保存图片
     */
    saveImg(tempFilePath) {
        // 授权成功，保存相册
        wx.saveImageToPhotosAlbum({
            filePath: tempFilePath,
            success: function success(res) {
                wx.hideLoading();
                wx.showToast({
                    title: '图片保存成功'
                });
            },
            fail: function fail(error) {
                console.log(error);
                wx.showToast({
                    title: '图片保存失败'
                });
            },
            complete() {
                wx.hideLoading();
            }
        });
    },


});
