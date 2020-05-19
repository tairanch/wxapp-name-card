//该页面用于存放内嵌网页
var app = getApp();
var ctxPath = app.globalData.ctxPath;
var ctxPathPay = app.globalData.ctxPathPay
var Login = require('../../utils/login.js');
const RequestManager = require('../../utils/RequestHelper.js')
const DcpPage = require('../../utils/dcp/dcpPage');  // dcp封装的page

const pageApi = {
    getNameCardInfo: { url: `${ctxPath}/api/getNameCardInfo`, method: "RequestGet" }
}
const errTost = (err) => {
    const message = (err && err.data && err.data.message) ? err.data.message : '小泰发生错误，请稍后再试'
    wx.showToast({
        title: message,
        icon: 'none'
    })
}

var Login = require('../../utils/login.js');
const dcpSdk = app.dcp
var hasShow = ""

DcpPage({
    /**
     * 页面的初始数据
     */
    data: {
        web_src: '',
        share_title: '', // 分享的标题
        share_url: '', // 分享的图片
        getmessagesUrl:null,  //分享方法调用的url
        systemInfo: '',
        urlHasChange:false,
        itemId:'',// 如果是从商品详情页面进来的，需要重定向到商品详情页面
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
        wx.hideShareMenu()//隐藏分享
        let that = this;
        if (app.globalData.haslogin == false){
            dcpSdk.storedUserId('')  // dcp采集userId
        }
        that.getSystem()
        // type 0 待付款 1 待发货 2 待收货 3 带评价 4 退货
        // type list0 我的拼团 list1 我的收藏 list2 卡券包 lis3 e卡管理 list4 联系客服
        // type ecardred E卡管理 - 红包分享
        let _tourl = ''
        switch (options.type) {
            case '0':
                _tourl = '/tradeList/0'
                break;
            case '1':
                _tourl = '/tradeList/1'
                break;
            case '2':
                _tourl = '/tradeList/2'
                break;
            case '3':
                _tourl = '/tradeList/3'
                break;
            case '4':
                _tourl = '/tradeList/4'
                break;
            case '5':
                _tourl = '/afterSale/list'
                break;

            case 'list0':
                _tourl = '/groupList/0'
                break;
            case 'list1':
                _tourl = '/myCollection?page=1'
                break;
            case 'list2':
                _tourl = '/couponList'
                break;
            case 'list3':
                _tourl = '/fund_h5/#/ecard/index'
                break;
            case 'list4':
                _tourl = '/customerService'
                break;
            case 'list5':
                _tourl = '/redList'
                break;
            case 'listuser':
                _tourl = '/userInfo'
                break;

            // case 'itemdetails'://商品详情页 h5
            //     _tourl = '/item?item_id=' + options.itemid
            //     break;
            case 'identityManage':
                _tourl = '/goodsReceiveInfo/identityManage';
                break;

            case 'addressManage':
                _tourl = '/goodsReceiveInfo/addressManage';
                break;

            case 'identityExample':
                _tourl = '/goodsReceiveInfo/identityExample';
                break;

            case 'search':
                options.text = encodeURIComponent(options.text)
                options.link = encodeURIComponent(options.link)
                _tourl = `/search?text=${options.text}&link=${options.link}`
                break;

            case 'searchResult':
                _tourl = `/searchResult?promotion_id=${options.promotion_id || ''}&coupon_id=${options.coupon_id}`
                break;

            case 'orderConfirm':
                _tourl = `/orderConfirm?mode=${options.mode}&buy_type=${options.buy_type}&cartToken=${options.cartToken}`
                break;

            case 'storeHome':
                _tourl = `/store/home?shop=${options.shop_id}`
                break;

            case 'backtowx':
                _tourl = that.parseQueryString(decodeURIComponent(options.backtowx))
                break;

            case 'bags':
                _tourl = "/shopCart"
                break;

            case 'tradeDetail':
                _tourl = `/tradeDetail?tid=${options.order_shop_no}&orderflag=2`
                break;
            case 'groupDetail':
                _tourl = `/groupDetail?object_id=${options.object_id}`
                break;
            case 'pintuanRules':
                _tourl='/pintuan-rules'
                break;
            case "evaluate": {                
                _tourl = `/evaluate?item_id=${options.item_id}`;
                break;
            }
            default:
                break;
        }
        
        if (options.scene) {
            const _scene=decodeURIComponent(options.scene); //_scene = '1-23-333'
            let _scenearray = _scene.split(',')
            let _itemId = _scenearray[0];   //商品详情页 商品ID 拼团详情页 object_id            
            let _cardId = _scenearray[1];
            let _pagetype = _scenearray[2]; //0 商品详情页 1 拼团详情页
            // 商品详情页面
            if (_pagetype == 0) {
                this.data.itemId = _itemId;
            }
            // let _itemId = 33918;
            // let _cardId = 2;
            app.globalData.showInfoId = _cardId
            app.globalData.cardId = _cardId
            // 收下名片
            if (_cardId != '') {
                Login.getCode((data)=>{
                    Login.receiveNameCard(data.code, _cardId)
                })
                that.getCommissionUcenterId(_cardId)
            }



            if (_pagetype == 1 || _pagetype == "1") {
                _tourl = `/groupDetail?object_id=${_itemId}`
            }else{
                wx.redirectTo({
                    url: '/pages/product/item-detail/index?itemId=' + _itemId
                })
            }

            // 不做登录验证
            // if (app.globalData.haslogin == false) {
            //   let _rediecturl = encodeURIComponent(app.globalData.ncxcxPath + '/item?item_id=' + _itemId)
            //   wx.navigateTo({
            //     url: '/pages/others/login/login?redirect_uri=' + _rediecturl
            //   });
            //   return
            // }else{
            //   _tourl = '/item?item_id=' + _itemId
            // }
            setTimeout(() => {
                wx.getSetting({
                    success: res => {
                        if (res.authSetting['scope.userInfo']) {
                            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                            // Login.getCode((data)=>{
                            // Login.didHasLoadFirst(data.ress, data.code, 'space')
                            // setTimeout(() => {
                            if (_cardId != '' && app.globalData.globtoken != '') {
                                // that.isSalesmanLogin(options.scene,options,_tourl).then(() => {
                                //   that.showUrl(options,_tourl)
                                // })
                                that.getCardInfo(_cardId,options,_tourl)

                            }else{
                                that.showUrl(options,_tourl)
                            }
                            // }, 1000);
                            // })
                        }else{
                            that.showUrl(options,_tourl)
                        }
                    },fail:res=>{
                        that.showUrl(options,_tourl)
                    }
                })
            }, 100);
        }else{
            that.showUrl(options,_tourl)
        }
    },

    onShow:function(){
        let _this = this
        // 处理拼团 手机未刷新
        _this.afterOnShow();
    },

    afterOnShow:function(){
        
        let _this = this
        let _urlHasChange = this.data.urlHasChange
        if (!_urlHasChange) {
            setTimeout(() => {
                _this.afterOnShow()
            }, 500);
        }else{
            if (hasShow.indexOf('/groupDetail') != -1) {
              this.setData({
                web_src: ''
              });
            }
            setTimeout(() => {
                _this.setData({
                    web_src: hasShow
                })
            }, 100);
        }
    },


    showUrl:function (options,_tourl){
        let that = this
        if (app.globalData.globtoken == null || app.globalData.haslogin == false) {
            app.globalData.commissionUcenterLoginType = false //分享进来的 先置位 false
        }
        let _url = options.type == 'list3' ? ctxPathPay + _tourl : ctxPath + _tourl
        let _tokenIdInfo = app.globalData.globtoken + "&openid=" + app.globalData.globOpenID + "&mini=true" + "&salesmanId=" + app.globalData.salesmanId + "&commissionUcenterId=" + app.globalData.commissionUcenterId +  "&commissionUcenterLoginType=" + app.globalData.commissionUcenterLoginType + "&cardId=" + app.globalData.showInfoId
        if (_tourl.indexOf('?') != -1) {
            let _token = "&token=" + _tokenIdInfo
            _url = _url + _token
        } else {
            let _token = "?token=" + _tokenIdInfo
            _url = _url + _token
        }
        if (options.type == 'backtowx') {
            let _token = "?token=" + _tokenIdInfo
            if (_tourl.indexOf('?') != -1) {
                if (_tourl.indexOf('=') != -1) {
                    _token = "&token=" + _tokenIdInfo
                } else {
                    _token = "token=" + _tokenIdInfo
                }
            }
            _url = _tourl + _token
        }
        // E卡红包分享页面 begin
        if (options.type == 'ecardred') {
            _url = decodeURIComponent(options.url)
            this.setData({
                share_url: options.shareUrl,
                share_title: options.mainTitle
            })
        }
        // E卡红包分享页面 end
        // 收银台跳转页面 begin
        if (options.type == 'payresult') {
            _url = decodeURIComponent(options.url)
        }
        // 收银台跳转页面 end
        console.log(_url)
        hasShow = _url
        this.setData({
            urlHasChange:true
        })
        // that.setData({
        //     web_src: _url
        // })
    },
    //判断登录的用户是不是名片业务员本人
    isSalesmanLogin (scene,options,_tourl){
        let that = this
        return new Promise((resolve, reject) => {
            let _params = {
                commission_ucenter_id:app.globalData.commissionUcenterId
            }
            RequestManager.RequestGet(app.globalData.ncxcxPath +'/api/isSalesmanLogin', _params, function (res) {
                if(res.code === 0){
                    app.globalData.commissionUcenterLoginType = res.data.is_salesman_login || false
                    resolve()
                } else {
                    app.globalData.commissionUcenterLoginType = false
                    // wx.redirectTo({
                    //     url: '/pages/login/login?wxpage='+ scene
                    // });
                    that.showUrl(options,_tourl)
                }

            },(err) => {
                // wx.navigateTo({
                //     url: '/pages/login/login?wxpage='+ scene
                // });
                that.showUrl(options,_tourl)
            },false)
        })

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
                    }
                }
            });
        })
    },

    getCardInfo(cardId,options,_tourl) { // 获取名片信息
        let _this = this
        const api = pageApi.getNameCardInfo
        wx.login({
            success: function (res) {
                const code = res.code;
                if (code) {
                    RequestManager[api.method](api.url, {
                        code: code,
                        name_card_id: cardId
                    }, (ress) => {
                        if(ress.code === 0) {
                            app.globalData.salesmanId = ress.data.salesman_id
                            app.globalData.commissionUcenterId = ress.data.commission_ucenter_id
                            app.globalData.inviteCode = ress.data.invite_code || ''
                            let _params = {
                                commission_ucenter_id: ress.data.commission_ucenter_id
                            }
                            RequestManager.RequestGet(app.globalData.ncxcxPath +'/api/isSalesmanLogin', _params, function (getres) {
                                if(getres.code === 0){
                                    let commissionUcenterLoginType = getres.data.is_salesman_login || false
                                    app.globalData.commissionUcenterLoginType = commissionUcenterLoginType
                                    _this.showUrl(options,_tourl)
                                } else {
                                    app.globalData.commissionUcenterLoginType = false
                                    _this.showUrl(options,_tourl)
                                }
                            },(err) => {
                                app.globalData.commissionUcenterLoginType = false
                                _this.showUrl(options,_tourl)
                            }, true)
                        }else{
                            _this.showUrl(options,_tourl)
                        }
                    }, (err) => {
                        _this.showUrl(options,_tourl)
                    }, false)
                } else {
                    _this.showUrl(options,_tourl)
                }
            }
        });
    },
    getCommissionUcenterId: function (_cardId) { // 获取 commissionUcenterId
        return new Promise((resolve, reject) => {
            const api = pageApi.getNameCardInfo
            this.getCode().then((code) => {
                RequestManager[api.method](api.url, {
                    code: code,
                    name_card_id: _cardId
                }, (res) => {
                    if(res.code === 0) {
                        app.globalData.commissionUcenterId = res.data.commission_ucenter_id
                        app.globalData.salesmanId = res.data.salesman_id
                        app.globalData.inviteCode = res.data.invite_code || ''
                        resolve()
                    }
                }, (err) => {

                }, false)
            })
        })
    },
    getSystem:function(){
        let that = this
        let _systeminfo = 'android' //手机系统
        wx.getSystemInfo({
            success: function (res) {
                if (res.platform == "devtools") {
                    _systeminfo =  'PC'
                } else if (res.platform == "ios") {
                    _systeminfo = 'IOS'
                } else if (res.platform == "android") {
                    _systeminfo = 'android'
                }
                that.setData({
                    systemInfo: _systeminfo,
                })
            }
        })
    },
    parseQueryString: function (url) {
        let _this = this
        var obj = {};
        var keyvalue = [];
        var key = "", value = "";
        var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
        var _host = url.substring(0, url.indexOf("?") + 1)
        for (var i in paraString) {
            keyvalue = paraString[i].split("=");
            key = keyvalue[0];
            value = keyvalue[1];
            obj[key] = value;
        }
        obj.openid = app.globalData.globOpenID
        obj.token = app.globalData.globtoken
        obj.mini = "true"
        obj.salesmanId = app.globalData.salesmanId
        obj.commissionUcenterId = app.globalData.commissionUcenterId
        obj.commissionUcenterLoginType = app.globalData.commissionUcenterLoginType
        obj.cardId = app.globalData.showInfoId

        delete obj.openid
        delete obj.token
        delete obj.mini
        delete obj.salesmanId
        delete obj.commissionUcenterId
        delete obj.commissionUcenterLoginType
        delete obj.cardId
        return _host + _this.paramsHandle(obj);
    },
    paramsHandle: function (params) {
        return Object.keys(params).map(key => {
            let _val = (params[key] && params[key] != undefined) ? key + '=' + encodeURIComponent(params[key]) : key
            return _val
        }).join('&')
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (options) {
        let that = this
        let _baseurl = that.data.systemInfo == 'IOS' ? that.data.getmessagesUrl : options.webViewUrl
        let return_url = encodeURIComponent(_baseurl)
        let share_title =  '泰然城分享'
        let image_url = ''
        // 如果分享的页面是发送红包的页面，则设置 return_url
        if (options.webViewUrl.indexOf('/ecard/red/detail') != -1) {
            return_url = this.data.share_url
            share_title = this.data.share_title
            image_url = '../../image/receiving.png'
        }
        var paths = 'pages/others/sharepage/sharepage?sharesssUrl=' + return_url
        return {
            title: share_title,
            path: paths,
            imageUrl: image_url,
            success: function (res) {
                // 转发成功
                wx.showToast({
                    title: "转发成功",
                    icon: 'success',
                    duration: 2000
                })
                that.setData({
                    share_url: return_url ,   //再次赋值分享内嵌网页的路径
                    web_src: _baseurl
                })
            },
            fail: function (res) {
                // 转发失败
            }
        }
    },

    bindmessage (e) {//接收web-view传递的参数
        let _this = this
        if (e && e.detail){
            let _url = e.detail.data.slice(-1)[0]
            let _tokenIdInfo = app.globalData.globtoken + "&openid=" + app.globalData.globOpenID + "&mini=true" + "&salesmanId=" + app.globalData.salesmanId + "&commissionUcenterId=" + app.globalData.commissionUcenterId +  "&commissionUcenterLoginType=" + app.globalData.commissionUcenterLoginType + "&cardId=" + app.globalData.showInfoId
            let _tourl = _url.url
            if (_tourl.indexOf('?') != -1) {
                let _token = "&token=" + _tokenIdInfo
                _tourl = _tourl + _token
            } else {
                let _token = "?token=" + _tokenIdInfo
                _tourl = _tourl + _token
            }
            _this.setData({//存储状态
                getmessagesUrl: _tourl
            })
            setTimeout(() => {
                this.setData({
                    web_src: _tourl
                })
            }, 100);
        }
    }
})
