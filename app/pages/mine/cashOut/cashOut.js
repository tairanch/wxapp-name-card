// pages/mine/cashOut/cashOut.js
import AppService from '../../../AppService/index';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        tipsType: '0', // 0 可提现   1 不满足提现条件
        tipsText: '', // 不满足提现条件文案
        buttonEnable: false, // 提现按钮是否可以点击
        moneyCount: '', // 提现金额
        balanceCount: 0, // 全部金额
        isAndroid: false, // 是否是安卓设备
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.hideShareMenu();

        let that = this;
        wx.getSystemInfo({
            success (res) {
                if (res.platform == "android") {
                    that.setData({
                        isAndroid: true
                    })
                }
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
        this._getUserCommissionBasicStaticsData();
    },

    // 获取用户基本统计数据
    _getUserCommissionBasicStaticsData:function() {

        let that = this;
        AppService.NameCardTask.getUserCommissionBasicStaticsData(
            (result)=>{
                if (result && result.code == 0) {
                    let _data = result.data;
                    that.setData({
                        balanceCount: _data.amount
                    });
                }
            }, (error)=>{

            }
        );
    },

    // 键盘聚焦时触发
    onBindfocus: function (event) {
        let value = event.detail.value;

        if (value && value.substr(0, 1) === '0') {
            // 如果是以'0'开头，就删除
            this.setData({
                tipsType: '0',
                moneyCount: ''
            })
        }
    },

    // 输入框输入事件
    onTextInput: function (event) {

        let value = event.detail.value;

        // 去掉空格
        if (value && value.indexOf(' ') > -1) {
            value = value.replace(/ /g,'');
        }

        if (value && value.indexOf('.') > -1) {
            // 包含小数点
            let numberArr = value.split('.');

            // 超过1个小数点，就不让再输入小数点
            if (numberArr.length > 2) {
                // 超过1个小数点，只取前两段数字
                numberArr = numberArr.slice(0, 2);

                // 把前两段数字合并成字符串
                value = numberArr.join('.');
            }

            // 小数点超过两位，就不让输入
            let smallText = numberArr[1];
            if (smallText && smallText.length > 2) {

                smallText = smallText.substr(0, 2);
                // 超过两位小数了
                value = numberArr[0] + '.' + smallText;
            }
        }

        if (!parseFloat(value) || parseFloat(value) === 0) {
            this.setData({
                tipsType: '0',
                moneyCount: ''
            })
        } else if (parseFloat(value) > 0 && parseFloat(value) < 20) {
            this.setData({
                tipsType: '1',
                tipsText: '提现金额不能少于20元',
                moneyCount: value,
                buttonEnable: false
            })
        } else if (parseFloat(value) > 5000 ) {
            this.setData({
                tipsType: '1',
                tipsText: '提现金额不能超过5000元',
                moneyCount: value,
                buttonEnable: false
            })
        } else if (parseFloat(value) > 0 && parseFloat(this.data.balanceCount) < parseFloat(value)) {
            this.setData({
                tipsType: '1',
                tipsText: '提现金额超出余额',
                moneyCount: value,
                buttonEnable: false
            })
        } else if (this.data.tipsType != '0') {
            this.setData({
                tipsType: '0',
                tipsText: '',
                moneyCount: value,
                buttonEnable: true
            })
        } else {
            this.setData({
                moneyCount: value,
                buttonEnable: true
            })
        }
    },

    // 键盘失去焦点
    onBindblur: function (event) {
        let value = event.detail.value;

    },

    // 点击清除按钮
    clearBtnClick: function () {
        this.setData({
            moneyCount: '',
            tipsType: '0',
            tipsText: '',
            buttonEnable: false
        })
    },

    // 全部提现
    getAllBtnClick: function () {

        let nbCount = parseFloat(this.data.balanceCount);
        if (!nbCount || nbCount == 0) {
            this.setData({
                moneyCount: '0',
                buttonEnable: false,
                tipsType: '1',
                tipsText: ''
            })
        } else if (nbCount < 20) {
            this.setData({
                tipsType: '1',
                moneyCount: nbCount.toFixed(2),
                tipsText: '提现金额不能少于20元',
                buttonEnable: false
            })
        } else if (nbCount > 5000) {
            this.setData({
                tipsType: '1',
                moneyCount: nbCount.toFixed(2),
                tipsText: '提现金额不能超过5000元',
                buttonEnable: false
            })
        } else {
            this.setData({
                tipsType: '0',
                tipsText: '',
                buttonEnable: true,
                moneyCount: nbCount.toFixed(2)
            })
        }
    },

    // 点击提现按钮
    cashOutBtnClick: function () {

        if (!this.data.buttonEnable) {
            return;
        }

        wx.redirectTo({
            url: '../cashCode/cashCode?moneyCount='+this.data.moneyCount,
        })
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

    }
})
