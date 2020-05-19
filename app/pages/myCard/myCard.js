// pages/pa ge/page.js
const RequestManager = require('../../utils/RequestHelper.js')
const app = getApp()
const DcpPage = require('../../utils/dcp/dcpPage');  // dcp封装的page
const ctxPath = app.globalData.ncxcxPath
const pageApi = {
    getNameCardQRCode: { url: `${ctxPath}/api/getNameCardQRCode`, method: "RequestGet" },
    getNameCardInfo: { url: `${ctxPath}/api/getNameCardInfo`, method: "RequestGet" },
    followNameCard: { url: `${ctxPath}/api/followNameCard`, method: "RequestGet" } ,
  getPosterList: { url: `${ctxPath}/api/poster/getPosterList`, method: "RequestGet" }// 收下名片
}

const errTost = (err) => {
    const message = (err && err.data && err.data.message) ? err.data.message : '小泰发生错误，请稍后再试'
    wx.showToast({
        title: message,
        icon: 'none'
    })
}

const dcpSdk = app.dcp

DcpPage({
    /**
     * 页面的初始数据
     */
    data: {
        downimg:'/image/common/downworld.png',
        dcpTitle: '名片',
        isLoad: false,  //是否首次加载
        onLoad: true,  // 加载中
        show: false,
        info: {},
        cardId: '',
        hasgetinfo: false, // 是否授权
        btnFollow: false, // 点击卡控
        shareImageUrl: '', // 分享的图片
        commissionUcenterLoginType: false // 是否登入且是否为名片业务员本人
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (app.globalData.haslogin == false){
            dcpSdk.storedUserId('')  // dcp采集userId
        }
        wx.hideShareMenu();
        wx.setNavigationBarColor({
            frontColor:"#ffffff",
            backgroundColor:'#2b2314'
        });
        // 设置 cardId
      const showInfoId = app.globalData.showInfoId

        if(options.scene || showInfoId){
            let scene = options.scene;
            let cardId = scene ? scene: (showInfoId ? showInfoId: "")
            this.setDcpOptions(cardId) // dcp传值
            this.setData({
                cardId: cardId
            })
        } else {
            this.redirectToList()
        }
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
        if(this.data.isLoad) { // 不是首次加载
            const showInfoId = app.globalData.showInfoId
            this.setDcpOptions(showInfoId || this.data.cardId) // dcp传值
            if((showInfoId != this.data.cardId) || app.globalData.isFromEditPage) { // 是否需要重新加载 或者 来自名片编辑页
                this.setData({
                    cardId: showInfoId
                }, () => {
                    app.globalData.isFromEditPage = false // 还原app.globalData.isFromEditPage
                    this.getCardInfo(this.data.cardId)
                })
            } else {
                this.isSalesmanLogin(this.data.info.commission_ucenter_id)
                this.setData({
                    onLoad: false
                })
            }
        } else {   // 首次加载
            this.checkUseInfo().then(() => {
                if(this.data.cardId) {
                    this.getCardInfo(this.data.cardId)
                }
            }).catch(() => {
                if(this.data.cardId) {
                    this.getCardInfo(this.data.cardId)
                }
            })
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        // isFromEditPage, 防止错乱
        app.globalData.isFromEditPage = false
        this.setData({
            btnFollow: false
        })
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
    onShareAppMessage:  function () {
        return {
            title:  `您好，我是泰然城的${this.data.info.job} ${this.data.info.name}。请收下我的名片`,
            path: `pages/myCard/myCard?scene=${this.data.cardId}`,
            imageUrl: this.data.info.share_image
        }
    },
    setDcpOptions: function(showInfoId) {  // 设置dcp Options
        this.dcpOptions = {
            showInfoId: showInfoId
        }
    },
    checkUseInfo: function () {  // 获取用户信息
        return new Promise((resolve, reject) => {
            wx.getSetting({
                success: res => {
                    if (res.authSetting['scope.userInfo']) {
                        // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                        this.setData({
                            hasgetinfo:true
                        }, () => {resolve()})
                    } else {
                        this.setData({
                            hasgetinfo: false
                        }, () => {resolve()})
                    }
                },
                fail: () => {
                    reject()
                }
            })
        })
    },
    turnCode(){
        wx.navigateTo({
            url: `/pages/nameCard/cardCode/cardCode?cardId=${this.data.cardId}`
        })
    },
    redirectToList() {
        wx.redirectTo({
            url: '/pages/nameCard/cardlist/index'
        })
    },
    // 跳转到名片编辑页面
    turnList(){
        wx.navigateTo({
            url: '/pages/nameCard/personCardEdit/personCardEdit?shop_id=' + this.data.info.shop_id
        })
    },
    getStorage() { // 判断是否有token
        try {
          const value = app.globalData.globtoken || wx.getStorageSync('namecardtoken')
            if (!value) { // 没有namecardtoken则说明没有登入
                return false
            } else {
                return true
            }
        } catch (e) {
            return false
        }
    },
    //判断登录的用户 是否登入且是否为名片业务员本人
    isSalesmanLogin (commission_ucenter_id){
        try {
            if (!this.getStorage()) { // 没有namecardtoken则说明没有登入
                this.setData({
                    commissionUcenterLoginType: false
                })

            } else {
                let _params = {
                    commission_ucenter_id: commission_ucenter_id
                }
                let that = this
                RequestManager.RequestGet(app.globalData.ncxcxPath +'/api/isSalesmanLogin', _params, function (res) {
                    if(res.code === 0){
                        let commissionUcenterLoginType = res.data.is_salesman_login || false
                        that.setData({
                            commissionUcenterLoginType
                        })
                    } else {
                        that.setData({
                            commissionUcenterLoginType: false
                        })
                    }
                },(err) => {
                    that.setData({
                        commissionUcenterLoginType: false
                    })
                }, true)
            }
        } catch (e) {
            // Do something when catch error
        }
    },
    getCode() {  // 获取code
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
                        })
                        console.log('获取用户登录态失败：' + res.errMsg);
                    }
                }
            });
        })
    },
    getCardInfo(cardId) { // 获取名片信息
        return new Promise((resolve , reject) => {
            this.setData({
                isLoad: true
            }, () => {
                const api = pageApi.getNameCardInfo
                this.getCode().then((code) => {
                    RequestManager[api.method](api.url, {
                        code: code,
                        name_card_id: cardId
                    }, (res) => {
                        if(res.code === 0) {
                            !res.data.is_followed && wx.hideTabBar({})
                            app.globalData.salesmanId = res.data.salesman_id
                            app.globalData.commissionUcenterId = res.data.commission_ucenter_id
                            app.globalData.cardId = cardId
                            app.globalData.showInfoId = cardId
                            app.globalData.inviteCode = res.data.invite_code || ''
                            this.isSalesmanLogin(res.data.commission_ucenter_id)
                            this.setData({
                                info: res.data,
                                show: !res.data.is_followed,
                                onLoad: false
                            }, function () {
                                resolve(res.data)
                            })
                        }
                    }, (err) => {
                        errTost(err)
                    }, false)
                })
            })
        })
    },
    beforeReceiveCard(e) {
        if (e.detail.userInfo) {
            this.setData({
                hasgetinfo: true
            }, () => {
                this.receiveCard()
            })
        }
    },
    receiveCard(e){ // 收下名片
        const api = pageApi.followNameCard
        if(!this.data.btnFollow){ // 点击卡控
            this.setData({
                btnFollow: true
            }, () => {
                this.getCode().then((code) => {
                    RequestManager[api.method](api.url, {
                        code: code,
                        name_card_id: this.data.cardId
                    }, (res) => {
                        if(res.code === 0) {
                            wx.showTabBar({})
                            this.setData({
                                show: false
                            }, () =>{
                                setTimeout(() => {
                                    this.setData({
                                        btnFollow: false
                                    })
                                }, 500)
                            })
                        }
                    }, (err) => {
                        this.setData({
                            show: false
                        }, () =>{
                            setTimeout(() => {
                                this.setData({
                                    btnFollow: false
                                })
                            }, 500)
                        })
                        errTost(err)
                    }, false)
                })
            })
        }
    },
    makePhoneCall(){ // 呼叫
        wx.makePhoneCall({
            phoneNumber: this.data.info.mobile
        })
    },
    copyText(){
        wx.setClipboardData({
            data: this.data.info.email,
            success: function (res) {
                wx.showToast({
                    title: '内容已复制',
                    icon: 'none'
                })
            }
        })
    },
    addPhoneContact() { // 存入通讯录
        wx.addPhoneContact({
            firstName: this.data.info.name,
            mobilePhoneNumber: this.data.info.mobile
        })
    },
    goPoster: function (e) {
      let _id = this.data.cardId
      let _shopid = e.currentTarget.dataset.shopid
      var api = pageApi['getPosterList'];
      RequestManager[api.method](api.url, {
        shop_id: _shopid
      }, function (res) {
        if (res.data.poster_list && res.data.poster_list.length > 0) {
          wx.navigateTo({
            url: '/pages/nameCard/poster/poster?shop_id=' + _shopid + '&name_card_id=' + _id,
          })
        } else {
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
})
