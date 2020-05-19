// setData
const RequestManager = require('../../../utils/RequestHelper.js');
const app = getApp();
const DcpPage = require('../../../utils/dcp/dcpPage');
const ctxPath = app.globalData.ctxPath;
import util from '../../../utils/util';

const pageApi = {
    init: { url: `${ctxPath}/ncxcx/cart/getCartInfo`, method: "RequestGet" },
    coupon: { url: `${ctxPath}/ncxcx/cart/getCouponsSuitShop`, method: "RequestGet" },
    recommend: { url: `${ctxPath}/ncxcx/cart/getRecommendItems`, method: "RequestGet" },
    collect: { url: `${ctxPath}/ncxcx/cart/moveToCollect`, method: "RequestPost" },
    update: { url: `${ctxPath}/ncxcx/cart/modify`, method: "RequestPost" },
    remove: { url: `${ctxPath}/ncxcx/cart/remove`, method: "RequestPost" },
    receiveCoupon: { url: `${ctxPath}/ncxcx/promotion/obtainCoupon`, method: "RequestPost" },
    clear: { url: `${ctxPath}/ncxcx/cart/clearTrash`, method: "RequestPost" },
    saleAttributes: { url: `${ctxPath}/ncxcx/cart/getSaleAttributes`, method: "RequestGet" },
    replaceSku: { url: `${ctxPath}/ncxcx/cart/replaceSku`, method: "RequestPost" },
    subscriptionInfoToken: { url: `${ctxPath}/ncxcx/order/subscriptionInfoToken`, method: "RequestPost" }
};

// 用于数据排序
const compare = function (prop, sort) {
    return function (obj1, obj2) {
        const val1 = parseFloat(obj1[prop]);
        const val2 = parseFloat(obj2[prop]);
        if (val1 < val2) {
            if (sort) {
                return -1;
            } else {
                return 1
            }
        } else if (val1 > val2) {
            if (sort) {
                return 1;
            } else {
                return -1
            }

        } else {
            return 0;
        }
    }
}
const toJS = (data) =>{
    return JSON.parse(JSON.stringify(data))
}
const errTost = (err) => {
    const message = (err && err.data && err.data.message) ? err.data.message : '小泰发生错误，请稍后再试'
    wx.showToast({
        title: message,
        icon: 'none'
    })
}

const addInfoToSubscribe = (shop, shopCheckObj, _exchangeItem) => {
    let { promotion_list, shop_info } = shop
    let shop_id = shop_info.shop_id
    let promotionObj = shopCheckObj[shop_id].promotionObj
    let subscribe = []
    promotion_list.map((promotion) => {
        let { cart_list, group_promotion_id, type } = promotion
        let promotion_cart_id = promotion.cart_id
        let isGift = false
        let single_promotion_id = null
        cart_list.map((cart) => {
            let { quantity, cart_id, item_id, sku_id, extra, promotion_single, promotion_gift_buy } = cart
            let check = promotionObj[cart_id]
            isGift = (promotion_gift_buy && promotion_gift_buy.type === "GiftBuy") ? true : false
            single_promotion_id = (promotion_gift_buy && promotion_gift_buy.type === "GiftBuy") ? promotion_gift_buy.single_promotion_id : null
            let commission_user_id = null
            if (extra && extra['commission_user_id']) {
                commission_user_id = extra['commission_user_id']
            }

            let name_card_salesman_id = null
            if (extra && extra['name_card_salesman_id']) {
                name_card_salesman_id = extra['name_card_salesman_id']
            }

            let commission_ucenter_id = null
            if (extra && extra['commission_ucenter_id']) {
                commission_ucenter_id = extra['commission_ucenter_id']
            }

            let _promotion = []
            let _extra = {}
            _extra['promotion'] = _promotion
            if (commission_user_id) {
                _extra['commission_user_id'] = commission_user_id
            }
            if (name_card_salesman_id) {
                _extra['name_card_salesman_id'] = name_card_salesman_id
            }
            if (commission_ucenter_id) {
                _extra['commission_ucenter_id'] = commission_ucenter_id
            }

            let isSecKill = false
            if (promotion_single && promotion_single.type === "SecKill") {
                isSecKill = true
            }
            if (check && !isSecKill) {
                if (type === 'ExchangeBuy' || isGift) {
                    _extra['promotion'] = [{
                        "promotion_id": isGift ? single_promotion_id : group_promotion_id,
                        "role": "main_good",
                        "type": isGift ? 'GiftBuy' : 'ExchangeBuy'
                    }]
                    subscribe.push({
                        quantity: quantity,
                        cart_id: cart_id,
                        item_id: item_id,
                        sku_id: sku_id,
                        extra: _extra,
                        created_at: util.dateFormat('yyyy-MM-dd hh:mm:ss')
                    })
                } else {
                    subscribe.push({
                        quantity: quantity,
                        cart_id: cart_id,
                        item_id: item_id,
                        sku_id: sku_id,
                        extra: _extra,
                        created_at: util.dateFormat('yyyy-MM-dd hh:mm:ss')
                    })
                }
            }
            if (extra && extra['promotion']) {
                _promotion = [].concat(extra['promotion'])
            }
        })
        if (_exchangeItem.data) {
            let _exchangeData = JSON.parse(JSON.stringify(_exchangeItem.data))
            if (_exchangeData[group_promotion_id]) {
                _exchangeData[group_promotion_id].map((ex) => {
                    if (ex.check) {
                        if (type === 'ExchangeBuy') {
                            subscribe.push({
                                quantity: 1,
                                cart_id: 0,
                                item_id: ex.item_id,
                                sku_id: ex.sku_id,
                                extra: {
                                    promotion: [{
                                        "promotion_id": group_promotion_id,
                                        "role": "exchange_good",
                                        "type": "ExchangeBuy"
                                    }]
                                },
                                created_at: util.dateFormat('yyyy-MM-dd hh:mm:ss')
                            })
                        }
                    }
                })
            }
        }
    })
    return subscribe
}

DcpPage({
    /**
     * 页面的初始数据
     */
    data: {
        dcpTitle: '购物袋',
        loadMask: false, //加载gif
        load: true,
        onloaded: false,
        recommendLoad: false, // 推荐商品加载状态
        recommendScrollLeft: 0, // 推荐商品滚动位置
        isLogin: true,
        error: false,
        netError: false,
        edit: false,    // 是否编辑状态
        editNum: false,      // 编辑中的数量
        shopCartData: '', // 购物车数据 shop_cart unable count_cart cartCheck
        shopCheckObj: {}, // 商品check
        // 购物车列表
        shop_cart: [],   //商品列表
        // 失效商品
        unable: [],  //失效商品列表
        invalidEdit: false, //失效商品编辑状态
        // 换购商品数据
        exchangeItem: {
            load: true,
            data: null,
            limit: 0
        },
        // 购物车总和
        cartTotal: { //购物车总数
            commonNum: 0,
            commonPrice: 0,
            num: 0,
            strip: 0,
            disPrice: 0, //合计（不含税）不含换购
            price: 0,    //总额
            tax: 0,
            discount: 0  //优惠
        },
        cartCheck: false, //购物车选中状态
        cartEdit: false,  //购物车编辑状态
        cartData: '',

        // 销售属性
        saleAttr: {
            data: "",
            show: false,
            img: "",
            select: "",
            sku_id: ""
        },

        // 优惠券
        coupon: {
            data: "",
            shopName: "",
            show: false
        },

        // 推荐列表
        recommendList: [],
        // 滚动条开始滚动的高度
        scrollStartTop: 0,
        // 左滑动打开状态
        scrollOpen: false,
        // scrollTop
        scrollTopObj: '',
        isIPhoneX: false,

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;
        wx.getSystemInfo({
            success(res) {

                let modelStr = res.model;

                if (modelStr.indexOf('iPhone X') > -1) {
                    that.setData({
                        isIPhoneX: true
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
        wx.hideShareMenu();
        if (this.data.onloaded){
            this.componentOnShow()
        } else {
            this.componentOnLoad()
        }
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
        wx.showNavigationBarLoading();
        this.getCartInfo(true)
        if (this.data.recommendList && this.data.recommendList.length <= 0) {
            this.initRecommend();
        }
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

    onPageScroll: function (e) {

    },

    // 生命周期中执行的方法
    componentOnLoad() {
        this.deleteExchangeItem()
        this.getCartInfo(true)
        if (this.data.recommendList && this.data.recommendList.length <= 0) {
            this.initRecommend();
        }
    },

    componentOnShow() {
        this.getCartInfo()
        this.initStoreEdit()
        let exchangeItem = this.getExchangeItem()
        if (exchangeItem) {
            this.setData({
                exchangeItem: Object.assign(this.data.exchangeItem, {
                    data: exchangeItem
                })
            }, () => {
                this.setData({ // 加上换购的商品价格
                    cartTotal: this.computeTotal2()
                })
            })
        }
    },

    // 购物车状态等交互方法
    getCartInfo(onload) { // 获取购物车列表
        this.showLoadMask()
        RequestManager.RequestGet(pageApi.init.url, {},  (res) => {
            this.destroyLoadMask()
            if (res.code === 0) {
                this.initialData(res, onload)
            } else {
                this.initialError(res)
            }
        }, (err) => { // error
            this.destroyLoadMask()
            if (err && err.data && err.data.code === 504) {
                this.initialNetError()
            } else {
                this.initialError()
            }
        }, true)
    },
    handleCheck(event) { // 勾选
        let dataset = event.currentTarget.dataset
        let _data =  this.data.shopCheckObj
        let _exchangeItem = this.data.exchangeItem
        let imData = toJS(_data);
        if (dataset.shopid) {
            this.updateShopCheck2(dataset.shopid, _exchangeItem)
        } else {
            this.updateCartCheck2(imData, _exchangeItem)
        }
    },

    // 单个商品相关
    oneNumUpdate(event) {  // 改变商品数量
        let detail = event.detail
        let cart_id = detail ? detail.cartId : ''
        let num = detail ? detail.num : ''
        let cb = detail ? detail.cb : ''
        this.updateData('update', {
            cart_id: cart_id,
            num: num
        }, (res) => {
            cb && cb(res)
        })
    },
    oneHandleCheck(event) {  // 单个商品勾选
        let detail = event.detail
        let cartId = detail ? detail.cartId : ''
        let shopId = detail ? detail.shopId : ''
        this.updateSingleCheck2(shopId, cartId)
    },
    handleItemCollect(event) {  // 单个商品移入收藏
        let self = this
        let detail = event.detail
        let cart_id = detail ? detail.cart_id : ''
        let promotionId = detail ? detail.promotionId : ''
        if (cart_id) {
            wx.showModal({
                title: '提示',
                content: '当前选中的商品移入收藏夹成功后，将从购物袋删除哦',
                success(res) {
                    if (res.confirm) {
                        self.updateData('collect', {
                            cart_ids: [cart_id]
                        }, () => {
                            promotionId && self.exchangeItemDelete(promotionId) // 删除换购
                            self.getCartInfo()
                        })
                    } else if (res.cancel) { }
                }
            })
        }
    },
    handleItemDelete(event) {  // 单个商品删除
        let self = this
        let detail = event.detail
        let cart_id = detail ? detail.cart_id : ''
        let promotionId = detail ? detail.promotionId : ''
        if (cart_id) {
            wx.showModal({
                title: '提示',
                content: '确定将这1件商品删除？',
                success(res) {
                    if (res.confirm) {
                        self.updateData('remove', {
                            cart_ids: [cart_id]
                        }, () => {
                            promotionId && self.exchangeItemDelete(promotionId) // 删除换购
                            self.getCartInfo()
                        })
                    } else if (res.cancel) { }
                }
            })
        }
    },


    // 优惠券相关
    popupCoupon(event) {  //获取优惠券弹窗
        let detail = event.detail
        let shopId = detail ? detail.shopId : ''
        let shopName = detail ? detail.shopName : ''
        if (!shopId) return
        this.updateData('coupon', {
            shop_id: shopId
        }, (res) => {
            this.ctrlCoupon({
                data: res.data,
                shopName: shopName,
                show: true
            })
        })
    },
    receiveCoupon(event) {  // 领取优惠券
        let detail = event.detail
        let couponId = detail ? detail.couponId : ''
        let cb = detail ? detail.cb : ''
        this.updateData('receiveCoupon', {
            coupon_id: couponId,
            source: "other"
        }, () => {
            typeof cb === "function" && cb();
        } , '领取成功')
    },
    closeCoupon() {  //关闭优惠券弹窗
        this.ctrlCoupon({
            data: '',
            show: false
        })
    },
    computeEditNum(event) { // 触发改变edit
        let detail = event.detail
        let status = detail ? detail.status : ''
        this.computeEdit(status)
    },

    // 失效商品相关
    clearInvItem() { //清空失效商品
        this.updateData('clear', '', () => {
            this.getCartInfo()
        })
    },
    toggleInvalidEdit() {  //切换失效商品编辑状态
        this.setData({
            invalidEdit: !this.data.invalidEdit
        })
    },


    // 换购商品相关
    //删除改主品下全部换购商品
    _exchangeItemDelete(event) {
        let detail = event.detail
        let promotionId = detail ? detail.promotionId : ''
        this.exchangeItemDelete(promotionId)
    },
    handleSecItemCollect(event) { // 收藏单个换购商品
        let self = this
        let detail = event.detail
        let promotionId = detail ? detail.promotionId : ''
        let itemId = detail ? detail.itemId : ''
        if (promotionId && itemId){
            wx.showModal({
                title: '提示',
                content: '当前换购商品移入收藏夹成功后，将从购物袋删除哦',
                success(res) {
                    if (res.confirm) {
                        self.updateData('collect', {
                            cart_ids: [itemId]
                        }, () => {
                            self.exchangeSingleItemDelete(promotionId, itemId) // 移除
                        })
                    } else if (res.cancel) { }
                }
            })
        }
    },
    handleSpecItemDelete(event) { // 删除单个换购商品
        let self = this
        let detail = event.detail
        let promotionId = detail ? detail.promotionId : ''
        let itemId = detail ? detail.itemId : ''
        if (promotionId && itemId) {
            this.exchangeSingleItemDelete(promotionId, itemId) // 移除
        }
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

    // 商品属性相关
    popupSaleAttr(event) {  // 获取商品属性数据
        let detail = event.detail
        let { item_id, img, sku_id, cart_id } = detail
        let scrollTop = 0;
        this.updateData('saleAttributes', {
            item_id: item_id
        }, (res) => {
            let { specs, skus } = res.data
            let selectList = []
            let select = {}
            skus.map((s) => {
                if (s.sku_id == sku_id) {
                    selectList = s.select_spec_id.split('_')
                }
            })
            specs.map((sp) => {
                let values = sp.values
                values.map((v) => {
                    if (selectList.indexOf((v.spec_value_id + "")) > -1) {
                        select[sp['spec_id']] = v['spec_value_id']
                    }
                })
            })
            this.ctrlSaleAttr({
                data: res.data,
                show: true,
                img: img,
                sku_id: sku_id,
                select: select,
                cart_id: cart_id
            })
        })
    },
    closeSaleAttr() { // 关闭销售属性弹窗
        this.ctrlSaleAttr({
            data: [],
            show: false
        })
    },
    replaceSku(event) {  //  提交销售属性
        let detail = event.detail
        let { cart_id, sku_id } = detail
        this.updateData('replaceSku', {
            cart_id,
            sku_id
        }, () => {
            this.closeSaleAttr()
            this.getCartInfo()
        })
    },
    attrSelect(event) { // 选择销售属性
        let detail = event.detail
        let { spec_id, spec_value_id } = detail
        this.saleAttrSelect(spec_id, spec_value_id)
    },

    // 初始化推荐商品列表
    initRecommend(hidenToast) {
        if (this.data.recommendLoad) {
            return;
        }
        this.setData({ recommendLoad: true });
        this.showLoadMask()
        RequestManager.RequestGet(pageApi.recommend.url, {}, (res) => {
            this.destroyLoadMask()
            this.setData({
                recommendLoad: false
            })
            if (res.code === 0) {
                this.setData({
                    recommendList: res.data,
                    recommendScrollLeft: 0
                })
            }
        }, (err) => { // error
            this.destroyLoadMask()
            this.setData({
                recommendLoad: false
            })
            errTost(err)
        }, true)
    },
    goodstail(event) {  //  跳转详情
        let _itemid = event.currentTarget.dataset.itemid
        wx.navigateTo({
            url: '/pages/product/item-detail/index?&itemId=' + _itemid
        })
    },

    // 其他
    errorPageClick() {  // 点击报错组件
        this.resetState(() => {
            this.getCartInfo()
            if (this.data.recommendList && this.data.recommendList.length <= 0) {
                this.initRecommend();
            }
        })
    },
    // 展示加载gif
    showLoadMask() {
        this.setData({
            loadMask: true
        })
    },
    // 隐藏加载gif
    destroyLoadMask() {
        this.setData({
            loadMask: false
        })
    },

    // 更改data api
    updateData(name, params, cb, message) {
        const api = pageApi[name]
        this.showLoadMask()
        RequestManager[api.method](api.url, params, (res) => {
            this.destroyLoadMask()
            if (res.message) {
                wx.showToast({
                    title: res.message || message,
                    icon: 'none'
                })
            } else if (message){
                wx.showToast({
                    title: message,
                    icon: 'none'
                })
            }
            if(res.code === 0) {
                if (cb && typeof cb === "function") cb(res);
            }
        }, (err) => {
            this.destroyLoadMask()
            errTost(err)
        }, true)
    },

    // 购物车管理state的方法
    // 购物车全局状态方法
    // 重置购物车
    resetState(cb) {
        this.deleteExchangeItem()
        this.setData({
            loadMask: false, //加载gif
            load: true,
            onloaded: false,
            recommendLoad: false, // 推荐商品加载状态
            recommendScrollLeft: 0, // 推荐商品滚动位置
            isLogin: true,
            error: false,
            netError: false,
            edit: false,    // 是否编辑状态
            storeEdit: false,
            editNum: 0,      // 编辑中的数量
            shopCartData: '', // 购物车数据 shop_cart unable count_cart
            shopCheckObj: '', // 商品check
            // 购物车列表
            shop_cart: [],   //商品列表
            // 失效商品
            unable: [],  //失效商品列表
            invalidEdit: false, //失效商品编辑状态
            // 换购商品数据
            exchangeItem: {
                load: true,
                data: null,
                limit: 0
            },
            // 购物车总和
            cartTotal: { //购物车总数
                commonNum: 0,
                commonPrice: 0,
                num: 0,
                strip: 0,
                disPrice: 0, //合计（不含税）不含换购
                price: 0,    //总额
                tax: 0,
                discount: 0  //优惠
            },
            cartCheck: false, //购物车选中状态
            cartEdit: false,  //购物车编辑状态
            cartData: '',
            // 销售属性
            saleAttr: {
                data: "",
                show: false,
                img: "",
                select: "",
                sku_id: ""
            },
            // 优惠券
            coupon: {
                data: "",
                shopName: "",
                show: false
            },
            // 推荐列表
            recommendList: [],
            // 滚动条开始滚动的高度
            scrollStartTop: 0,
            // 左滑动打开状态
            scrollOpen: false,
            // scrollTop
            scrollTopObj: ''
        }, () => {
            cb && cb()
        })
    },
    // 计算购物车数据
    initialData(result, onload) {
        let shopCheckObj = onload ? {} : toJS(this.data.shopCheckObj);
        let load = false;  //加载完成
        let { data } = result;
        let initShopCheckObj = this.initShopCheckObj(data)  // 生成初始化shopCheckObj
        let cartCheck = false
        if (shopCheckObj) {
            let _compareCheck2 = this._compareCheck2(shopCheckObj, initShopCheckObj)
            initShopCheckObj = _compareCheck2.newData;
            cartCheck = _compareCheck2.cartCheck;
        }
        let cartTotal = this.computeTotal2(data.shop_cart, initShopCheckObj, this.data.exchangeItem);
        if (onload) {
            let scrollTopObj = null
            if (data && data.shop_cart.length > 0 && data.shop_cart[0]['shop_info']) {
                scrollTopObj = data.shop_cart[0]['shop_info']['shop_id']
            }
            this.setData({
                load: load,
                onloaded: true,      // 初始化加载完成
                shopCartData: data,
                shopCheckObj: initShopCheckObj,
                unable: data.unable,
                cartTotal: cartTotal,
                cartCheck: cartCheck,
                scrollOpen: false,    // 关闭左滑编辑状态
                scrollTopObj: scrollTopObj
            });
        } else {
            this.setData({
                load: load,
                shopCartData: data,
                shopCheckObj: initShopCheckObj,
                unable: data.unable,
                cartTotal: cartTotal,
                cartCheck: cartCheck,
                scrollOpen: false     // 关闭左滑编辑状态
            });
        }
    },
    // 生成初始化shopCheckObj
    initShopCheckObj(data) {
        let shopCheckObj = {}
        if (data.shop_cart && data.shop_cart.length > 0) {
            data.shop_cart.forEach((shop) => {
                let { shop_info, promotion_list } = shop
                let promotionObj = {}
                promotion_list.forEach((promotion) => {
                    promotion.cart_list.forEach((cart) => {
                        promotionObj[cart.cart_id] = false
                    })
                })
                shopCheckObj[shop_info.shop_id] = {
                    check: false,
                    promotionObj: promotionObj
                }
            })
        }
        return shopCheckObj
    },
    // 还原购物车编辑状态
    initStoreEdit(status) {
        this.setData({
            storeEdit: false,
            editNum: false
        })
    },
    // 改变编辑中的数量
    computeEdit(status){
        this.setData({
            editNum: !this.data.storeEdit,
            storeEdit: !this.data.storeEdit
        })
    },
    // 更新购物车所有商品的选中状态
    updateCartCheck2(shopCheckObj, exchangeItem){
        let _shopCheckObj = toJS(shopCheckObj);
        let cartCheck = !this.data.cartCheck
        Object.values(_shopCheckObj).forEach((store) => {
            store.check = cartCheck
            Object.keys(store.promotionObj).forEach(key => {
                store.promotionObj[key] = cartCheck
            })
        })
        let cartTotal = this.computeTotal2('', _shopCheckObj, exchangeItem || this.data.exchangeItem);
        this.setData({
            cartCheck: cartCheck,
            shopCheckObj: _shopCheckObj,
            cartTotal: cartTotal
        })
    },
    // 更新购物车某个店铺的选中状态
    updateShopCheck2(id, exchangeItem) {
        let shopCheckObj = toJS(this.data.shopCheckObj)
        shopCheckObj[id].check = !shopCheckObj[id].check
        let promotionObj = shopCheckObj[id].promotionObj
        Object.keys(promotionObj).forEach((key) => {
            promotionObj[key] = shopCheckObj[id].check
        })
        let cartCheck = null
        if (!shopCheckObj[id].check ){
            cartCheck = false
        }
        this._setDataAndTotal2(shopCheckObj, exchangeItem, cartCheck)
    },
    // 更新购物车某个商品的选中状态
    updateSingleCheck2(shopId, cartId) {
        let shopCheckObj = toJS(this.data.shopCheckObj)
        if (shopId && cartId && shopCheckObj[shopId]) {
            let check = true
            let promotionObj = shopCheckObj[shopId].promotionObj
            promotionObj[cartId] = !promotionObj[cartId]
            Object.keys(promotionObj).some((key) => {
                if (!promotionObj[key]){
                    check = false
                }
            })
            shopCheckObj[shopId].check = check
            this._setDataAndTotal2(shopCheckObj)
        }
    },
    // 更新购物车某个商品的数量
    handleItemNum(id, num, exchangeItem){
        let cart_id
        let cart_num
        if( typeof id === 'object') { //oneitem 传入
            cart_id = id.detail.cartId
            cart_num = id.detail.num
        }  else {
            cart_id= id
            cart_num = num
        }
        let shopCartData = toJS(this.data.shopCartData)
        let { shop_cart } = shopCartData
        shop_cart.map((shop, i) => {
            let { promotion_list, shop_info } = shop
            promotion_list.map((promotion) => {
                let { cart_list } = promotion
                cart_list.map((cart) => {
                    if (cart.cart_id == cart_id) {
                        cart.quantity = cart_num
                    }
                })
            })
        })
        this._setDataAndTotal(shopCartData, exchangeItem)
    },
    // 改变优惠券相关数据
    ctrlCoupon(data) {
        this.setData({
            coupon: Object.assign({}, {
                data: data.data,
                shopName: data.shopName,
                show: data.show
            })
        })
    },
    // 改变销售属性相关数据
    ctrlSaleAttr(data){
        this.setData({
            saleAttr: Object.assign({}, this.data.saleAttr, data)
        })
    },
    // 选择销售属性
    saleAttrSelect(spec_id, spec_value_id){
        let select = toJS(this.data.saleAttr.select)
        select[spec_id] = spec_value_id
        this.setData({
            saleAttr: Object.assign({}, this.data.saleAttr, {
                select: select
            })
        })
    },
    // 改变左滑状态
    scrollCtrl(event) {
        this.setData({
            scrollOpen: event.detail.status
        })
    },

    // 换购商品状态相关方法
    // 初始化换购商品相关数据
    resetExchangeState(){
        this.setData({
            exchangeItem:{
                load: true,
                data: null,
                limit: 0
            }
        })
    },
    // 设置换购商品相关数据
    initExchangeData(promotionId, result, rules){
        let data = toJS(this.data.exchangeItem)
        if (data && data[promotionId] && result) {
            result.map((r) => {
                const { sku_id } = r
                data[promotionId].some((d) => {
                    if (d.sku_id === sku_id) {
                        r.check = d.check
                        return true
                    } else {
                        return false
                    }
                })
            })
        }
        this.setData({
            exchangeItem: {
                load: false,
                data: Object.assign({}, this.data.exchangeItem.data, {
                    [promotionId]: result
                }),
                limit: rules.limit,
                fullPrice: rules.fullPrice
            }
        })
    },
    // 选择换购商品
    exchangeItemSelect(promotionId, index) {
        let exchangeItem = toJS(this.data.exchangeItem);
        let imData = exchangeItem.data[promotionId]
        imData[index].check = !imData[index].check
        this.setData({
            exchangeItem: exchangeItem
        })
    },
    // 删除换购商品
    exchangeItemDelete(promotionId) {
        let exchangeItemData = this.data.exchangeItem.data ? toJS(this.data.exchangeItem.data):''
        exchangeItemData && delete exchangeItemData[promotionId]
        let exchangeItem =  Object.assign({}, this.data.exchangeItem, {
            data: exchangeItemData
        })
        this.setExchangeItem(exchangeItem.data)
        this.setData({
            exchangeItem: exchangeItem
        })
    },
    // 购物车总和相关方法
    computeTotal2(shopCart, check, exchangeData) {     // 获取购物车总和
        let cartTotal = { //购物车总数
            commonNum: 0,
            commonPrice: 0,
            num: 0,
            strip: 0,
            disPrice: 0, //合计（不含税）不含换购
            price: 0,    //总额
            tax: 0,
            discount: 0,  //优惠
        }
        let data = toJS(shopCart || this.data.shopCartData.shop_cart)
        let checkObj = toJS(check || this.data.shopCheckObj)
        let exchangeItem = exchangeData ? exchangeData : toJS(this.data.exchangeItem)
        if (!(data && data.length)) {
            return cartTotal;
        }
        //满减
        //满折
        //N元任选
        //加价换购
        let allPrice = 0
        let perPrice = 0
        let total_quantity = 0
        data.forEach((shop) => {
            let promotion_list = shop.promotion_list
            let shop_info = shop.shop_info
            let promotionCheckObj = checkObj[shop_info.shop_id].promotionObj
            promotion_list.map((promotion) => {
                let _cart_list = promotion.cart_list
                let cart_list = toJS(_cart_list)
                let price = 0;
                let promotionQuantity = 0;
                cart_list.map((cart) => {
                    let { promotion_single, quantity, sell_price, biz_rules, cart_id } = cart
                    let check = promotionCheckObj[cart_id]
                    let isSingle = promotion_single && ['FlashSale', 'DirectReduction', 'SecKill'].indexOf(promotion_single.type) > -1 ? true : false
                    quantity = parseFloat(quantity)
                    let isSecKill = false
                    if (cart.promotion_single && cart.promotion_single.type === "SecKill") {
                        isSecKill = true
                    }
                    let _price = 0
                    if (check && !isSecKill) {
                        total_quantity += quantity;
                        promotionQuantity += quantity;
                        if (promotion_single && promotion_single.price && promotion_single.price > 0) {
                            price += quantity * parseFloat(promotion_single.price)
                        } else {
                            price += parseFloat(sell_price) * parseFloat(quantity)
                        }
                    }
                })
                switch (promotion.type) {
                    case 'FullMinus': //满减
                        let FullMinus = promotion.rules['FullMinus']
                        let perDeductTmp = 0;
                        FullMinus.sort(compare('limit_money', true))
                        if (promotion.rules['has_high_limit'] == 0) { //无限制
                            let multiple = Math.floor((price / (FullMinus[FullMinus.length - 1].limit_money)))
                            if (multiple > 0) {
                                perDeductTmp = multiple * FullMinus[FullMinus.length - 1].deduct_money
                            } else {
                                FullMinus.some((full) => {
                                    const { limit_money, deduct_money } = full
                                    if (price < parseFloat(limit_money)) {
                                        return true
                                    } else {
                                        perDeductTmp = +deduct_money
                                        return false
                                    }
                                })
                            }
                        } else {
                            FullMinus.some((full) => {
                                const { limit_money, deduct_money } = full
                                if (price < parseFloat(limit_money)) {
                                    return true
                                } else {
                                    perDeductTmp = +deduct_money
                                    return false
                                }
                            })
                        }
                        allPrice += price
                        perPrice += perDeductTmp
                        break;
                    case 'FullDiscount': //满折
                        let FullDiscount = promotion.rules['FullDiscount']
                        let tmpFull = 1
                        let tmpPercent = 0
                        FullDiscount.map((discount) => {
                            if (tmpFull <= parseFloat(discount.full)) {
                                tmpFull = parseFloat(discount.full)
                            }
                            if (promotionQuantity >= parseFloat(discount.full) && tmpFull <= parseFloat(discount.full)) {
                                tmpFull = parseFloat(discount.full)
                                tmpPercent = parseFloat(discount.percent)
                            }
                        })
                        allPrice += price
                        if (tmpPercent) {
                            perPrice += price * (1 - tmpPercent / 100)
                        } else {
                            perPrice += 0
                        }
                        break;
                    case 'OptionBuy': //N元任选
                        let OptionBuy = promotion.rules['OptionBuy']
                        let tmpBuyQuantity = 0
                        let perBuyPrice = 0
                        if (price >= parseFloat(OptionBuy.amount)) {
                            let _cart_list = toJS(cart_list)
                            _cart_list.sort(compare('sell_price', false))
                            for (let i = 0; i < _cart_list.length; i++) {
                                let cart = _cart_list[i]
                                let { promotion_single, sell_price, quantity, cart_id, biz_rules } = cart
                                let check = promotionCheckObj[cart_id]
                                quantity = parseFloat(quantity)
                                let isSecKill = false
                                if (cart.promotion_single && cart.promotion_single.type === "SecKill") {
                                    isSecKill = true
                                }
                                let cart_price = +sell_price;
                                if (promotion_single && promotion_single.price && promotion_single.price > 0) {
                                    if (promotion_single.type === "SecKill") {
                                        if (new Date(promotion_single.start_time).getTime() <= new Date().getTime() < new Date(promotion_single.end_time).getTime()) {
                                            cart_price = +promotion_single.price
                                        }
                                    } else {
                                        cart_price = +promotion_single.price
                                    }
                                }
                                let isSingle = promotion_single && ['FlashSale', 'DirectReduction', 'SecKill'].indexOf(promotion_single.type) > -1 ? true : false
                                if (check && !isSecKill) {
                                    if (tmpBuyQuantity < parseFloat(OptionBuy.quantity)) {
                                        for (let j = 0; j < quantity; j++) {
                                            if (tmpBuyQuantity < parseFloat(OptionBuy.quantity)) {
                                                tmpBuyQuantity++
                                                if (promotion_single && promotion_single.price && promotion_single.price > 0) {
                                                    perBuyPrice += parseFloat(promotion_single.price)
                                                } else {
                                                    perBuyPrice += parseFloat(sell_price)
                                                }
                                            } else {
                                                break
                                            }
                                        }
                                    } else {
                                        break
                                    }
                                }
                            }
                        }
                        allPrice += price
                        if (price >= parseFloat(OptionBuy.amount) && tmpBuyQuantity >= parseFloat(OptionBuy.quantity)) {
                            perPrice += (perBuyPrice - parseFloat(OptionBuy.amount))
                        } else {
                            perPrice += 0
                        }
                        break;
                    case 'ExchangeBuy': //加价换购
                        let full = parseFloat(promotion.rules['ExchangeBuy']['exchange_full'])
                        let group_promotion_id = promotion['group_promotion_id']
                        let exchangePrice = 0
                        if (price >= full) {
                            if (exchangeItem && exchangeItem.data && exchangeItem.data[group_promotion_id]) {
                                exchangeItem.data[group_promotion_id].map((ex) => {
                                    if (!ex.check || ex.is_deleted || ex.store <= 0 || ex.shelf_status != 30) {
                                        return
                                    } else {
                                        exchangePrice += parseFloat(ex.price)
                                    }
                                })
                            }
                        }
                        allPrice += price
                        allPrice += exchangePrice
                        break;
                    default:
                        allPrice += price
                        break;
                }
            })
        })
        cartTotal = {
            num: total_quantity,
            strip: 0,
            disPrice: allPrice - (parseFloat(perPrice)), //合计（不含税）不含换购
            price: allPrice,    //总额
            tax: 0,
            discount: parseFloat(perPrice),  //优惠
            perPrice: perPrice,
            commonNum: total_quantity,
            commonPrice: allPrice
        };
        return cartTotal;
    },
    handleCollects() {  // 购物车总和移入收藏夹
        const self = this
        let _num = false
        let shopCheckObj = this.data.shopCheckObj
        let { shop_cart } = this.data.shopCartData
        let cart_ids = []
        shop_cart.map((shop) => {
            let { promotion_list, shop_info } = shop
            let shop_id = shop_info.shop_id
            let promotionObj = shopCheckObj[shop_id].promotionObj
            promotion_list.map((promotion) => {
                let { cart_list } = promotion
                cart_list.map((cart) => {
                    let { cart_id } = cart
                    let check = promotionObj[cart_id]
                    if (check) {
                        _num = true
                        cart_ids.push(cart_id)
                    }
                })
            })
        })
        if (!_num) {
            wx.showToast({
                title: '您还没有选择商品哦',
                icon: 'none'
            })
            return;
        }
        wx.showModal({
            title: '提示',
            content: '当前选中的商品移入收藏夹成功后，将从购物袋删除哦',
            success(res) {
                if (res.confirm) {
                    self.updateData('collect', {
                        cart_ids: cart_ids
                    }, () => {
                        self.getCartInfo()
                    })
                } else if (res.cancel) { }
            }
        })
    },
    handleRemoves() {   // 购物车总和删除商品
        const self = this
        let _num = 0
        let shopCheckObj = this.data.shopCheckObj
        let { shop_cart } = this.data.shopCartData
        let cart_ids = []
        shop_cart.map((shop) => {
            let { promotion_list, shop_info } = shop
            let shop_id = shop_info.shop_id
            let promotionObj = shopCheckObj[shop_id].promotionObj
            promotion_list.map((promotion) => {
                let { cart_list } = promotion
                cart_list.map((cart) => {
                    let { cart_id } = cart
                    let check = promotionObj[cart_id]
                    if (check) {
                        _num += cart.quantity
                        cart_ids.push(cart_id)
                    }
                })
            })
        })
        if (!_num) {
            wx.showToast({
                title: '您还没有选择商品哦',
                icon: 'none'
            })
            return;
        }
        wx.showModal({
            title: '提示',
            content: `确定将这${_num}件商品删除？`,
            success(res) {
                if (res.confirm) {
                    self.updateData('remove', {
                        cart_ids: cart_ids
                    }, () => {
                        // self.setExchangeItem({})
                        self.getCartInfo()
                    })
                } else if (res.cancel) { }
            }
        })
    },
    cartSubmit(hidenToast) {   // 提交购物车
        let cartTotal = this.data.cartTotal
        let _exchangeItem = this.data.exchangeItem
        let shop_cart = this.data.shopCartData.shop_cart
        let shopCheckObj = this.data.shopCheckObj
        let subscribe = []
        shop_cart.map((shop) => {
            let { promotion_list, shop_info } = shop
            subscribe = subscribe.concat(addInfoToSubscribe(shop, shopCheckObj, _exchangeItem))
        })
        let orderInfo = {
            buyMode: 'cart_buy',
            bizMode: 'online',
            bizAttr: 'trmall',
            address: {},
            subscribe: subscribe
        }
        this.showLoadMask()
        RequestManager.RequestPost(pageApi.subscriptionInfoToken.url, {
            buyMode: 'cart_buy',
            bizMode: 'online',
            bizAttr: 'trmall',
            subscribe: subscribe
        }, (res) => {
            this.destroyLoadMask()
            if (res.message) {
                wx.showToast({
                    title: res.message || message,
                    icon: 'none'
                })
            }
            if (res.code === 0 && res.data && res.data.token){
                let token = res.data.token
                
                wx.navigateTo({
                    url: `/pages/wxpage/wxpage?type=orderConfirm&mode=cart_buy&buy_type=0&cartToken=${token}`
                  // url: `/pages/mine/order/confirm/index?type=orderConfirm&mode=cart_buy&buy_type=0`
                })
            }
        }, (err) => { // error
            this.destroyLoadMask()
            errTost(err)
        }, true)
    },
    initialError() {
        this.setData({
            load: false,
            error: true
        })
    },
    initialNetError() {
        this.setData({
            load: false,
            netError: true
        })
    },
    // 私有处理数据的方法
    // 私有勾选购物车状态
    _compareCheck2(oldData, newData) {
        let cartCheck = true
        let _oldData = toJS(oldData)
        let _newData = toJS(newData)
        Object.keys(_newData).forEach((storeKey) => {
            let storeCheck = true
            let newPromotionObj = _newData[storeKey].promotionObj
            let oldPromotionObj = _oldData[storeKey] ? _oldData[storeKey].promotionObj: null
            if (oldPromotionObj) {
                Object.keys(newPromotionObj).forEach((key) => {
                    newPromotionObj[key] = oldPromotionObj[key] ? true : false
                    if (!newPromotionObj[key]){
                        storeCheck = false
                    }
                })
            }
            _newData[storeKey].check = _oldData[storeKey] && storeCheck ? true: false
            if (!_newData[storeKey].check) {
                cartCheck = false
            }
        })
        return {
            newData: _newData,
            cartCheck: cartCheck
        }
    },
    // 改变购物车状态和总和 shopCartData
    _setDataAndTotal(shopCartData, exchangeItem){
        let cartTotal = this.computeTotal2(shopCartData.shop_cart, '',exchangeItem || this.data.exchangeItem);
        this.setData({
            cartTotal: cartTotal,
            shopCartData
        })
    },
    // 改变购物车状态和总和 shopCheckObj
    _setDataAndTotal2(shopCheckObj, exchangeItem, cartCheck) {
        let cartTotal = this.computeTotal2('', shopCheckObj, exchangeItem || this.data.exchangeItem);
        if (cartCheck !== null && cartCheck !== undefined) {
            this.setData({
                shopCheckObj: shopCheckObj,
                cartTotal: cartTotal,
                cartCheck: cartCheck
            })
        } else {
            let _cartCheck = true
            Object.values(shopCheckObj).some((val) => {
                if(!val.check){
                    _cartCheck = false
                    return true
                }
                return false
            })
            this.setData({
                shopCheckObj: shopCheckObj,
                cartTotal: cartTotal,
                cartCheck: _cartCheck
            })
        }
    },
})
