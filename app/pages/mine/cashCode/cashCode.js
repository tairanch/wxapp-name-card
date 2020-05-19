// pages/mine/cashCode/cashCode.js
// 提现验证码页
const app = getApp();
import AppService from '../../../AppService/index'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        moneyCount: 0, // 提现金额
        userInfo: null, // 用户信息
        canSendCode: true, // 是否能发送验证码
        countDownText: 0, // 多少秒后重新发送
        showClearBtn: false, // 是否显示清除按钮
        buttonEnable: false, // 提交按钮是否可点击
        numberCodeText: '', // 验证码
        generate_id: '', // 验证码流水号
        isRequest: false, // 正在请求
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.hideShareMenu();

        let moneyCount = options && options.hasOwnProperty('moneyCount') ? parseFloat(options.moneyCount) : 0;

        this.setData({
            moneyCount:moneyCount
        });

        this._getUserBindPhoneNumber();
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

    // 获取微信绑定的手机号
    _getUserBindPhoneNumber: function () {
        let that = this;
        AppService.MineTask.getUserInfo(
            true,
            (result)=>{
                that.setData({
                    userInfo: result
                })
            }, (error)=>{

            }
        )
    },

    // 获取手机验证码
    _getPhoneCode: function () {
        let that = this;
        wx.showLoading();
        AppService.OtherTask.captchaGenerate(
            this.data.userInfo.phone,
            (result)=>{
                if (result && result.code == 200) {
                    wx.showToast({
                        icon:'none',
                        title: '发送成功',
                    });
                    that.data.generate_id = result.body.generateId;

                    // 获取验证码成功，开始倒计时
                    that._beginCodeTimer();
                } else {
                    let msg = result.message;
                    wx.showToast({
                        icon: 'none',
                        title: msg,
                    })
                }
            }, (error)=>{
                wx.showToast({
                    icon: 'none',
                    title: '获取失败，请重试',
                })
            }
        )
    },

    // 提现
    _applyWithdrawal: function () {

        if (this.data.isRequest) {
            return;
        }
        this.data.isRequest = true;

        let that = this;
        wx.showLoading();
        wx.login({
            success(res) {
                if (res.code) {
                    let params = {
                        amount: that.data.moneyCount,
                        captcha: that.data.numberCodeText,
                        generate_id: that.data.generate_id,
                        phone: that.data.userInfo.phone,
                        code: res.code
                    };

                    AppService.OtherTask.applyWithdrawal(
                        params,
                        (result) => {
                            wx.hideLoading();
                            that.data.isRequest = false;
                            if (result && result.code == 0) {
                                // 跳转到提现完成页
                                wx.redirectTo({
                                    url: '../cashOK/cashOK?moneyCount='+that.data.moneyCount,
                                })
                            } else {
                                let msg = result.message;
                                wx.showToast({
                                    icon: 'none',
                                    title: msg,
                                })
                            }
                        }, (error)=>{
                            that.data.isRequest = false;
                            wx.hideLoading();
                        }
                    )
                } else {
                    console.log('重新获取code失败！')
                }
            }
        });
    },


    // 键盘输入事件
    onTextInput: function (event) {
        let value = event.detail.value;
        this.setData({
            numberCodeText: value,
            buttonEnable: value && value.length >= 4
        })
    },

    // 键盘失去焦点
    onBindblur: function (event) {
        let value = event.detail.value;

        if (!value || value.length == 0) {
            this.setData({
                showClearBtn: false
            })
        }
    },

    // 键盘聚焦
    onindfocus: function (event) {
        this.setData({
            showClearBtn: true
        })
    },

    // 点击清除按钮
    clearBtnClick: function () {
        this.setData({
            numberCodeText: '',
            buttonEnable: false
        })
    },

    // 点击发送验证码
    sendCodeBtnClick: function () {

        this._getPhoneCode();

        // this._beginCodeTimer();
    },

    // 开启验证码计时器
    _beginCodeTimer: function () {
        this.setData({
            canSendCode: false,
            countDownText: 59,
        }, () => {

            let that = this;
            this.intervalTimer = setInterval(()=>{

                if (that.data.countDownText <= 0) {
                    that.setData({
                        canSendCode: true
                    });

                    this.intervalTimer && clearInterval(this.intervalTimer);
                } else {
                    that.setData({
                        countDownText: that.data.countDownText - 1
                    })
                }
            }, 1000)
        });
    },

    // 点击提交按钮
    submitBtnClick: function () {
        // 提交提现申请，成功：跳转成功页； 失败：在当前页给出提示

        if (!this.data.buttonEnable) {
            return;
        }


        if (!this.data.generate_id || this.data.generate_id.length == 0) {
            wx.showToast({
                icon: 'none',
                title: '请先获取验证码',
            });
            return;
        }

        // 提现
        this._applyWithdrawal();
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
        this.intervalTimer && clearInterval(this.intervalTimer);
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

    }
})
