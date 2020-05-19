// pages/product/shopCart/components/oneItem/OneItem.js
// popupSaleAttr 销售属性弹窗 this.triggerEvent('handleCheck', { data: 1 })
const utils = require('../../../../../utils/util.js')

//函数延迟
function delay(fn, wait) {
    let _self = fn,
        timer,
        args;
    return function () {
        let _me = this;
        args = arguments;
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            clearTimeout(timer);
            timer = null;
            _self.apply(_me, args);
        }, wait || 500);
    }
}

const _formatDate = function (time) {
    if (isNaN(Number(time))) return "";
    if (time.toString().length == 10) {
        time = new Date(time * 1000);
    } else {
        time = new Date(time);
    }
    return {
        year: time.getFullYear(),
        month: utils.timeUtils.toTwoDigit(time.getMonth() + 1),
        date: utils.timeUtils.toTwoDigit(time.getDate()),
        hour: utils.timeUtils.toTwoDigit(time.getHours()),
        minute: utils.timeUtils.toTwoDigit(time.getMinutes()),
        second: utils.timeUtils.toTwoDigit(time.getSeconds())
    }
}

const _cnFormat = function (time) {
    let dateObj = _formatDate(time);
    if (!dateObj) {
        return "";
    }
    let { year, month, date, hour, minute } = dateObj;
    return `${month}月${date}日${hour}:${minute}`
}

Component({
    externalClasses: ['item-class', 'info-class'],
    /**
     * 组件的属性列表
     */
    properties: {
        edit: {  //是否编辑状态
            type: Boolean,
            value: false,
            observer: function (newVal, oldVal, changedPath) {
                if (oldVal && !newVal) {
                    this.setData({ isOpen: false });
                }
                if (oldVal && newVal) {
                    this.setData({
                        quantity: this.properties.itemData.quantity
                    });
                }
            }
        },
        type: {
            type: String
        },
        promotionId: {
            type: Number
        },
        itemData: {
            type: Object,
            observer: function (newVal, oldVal, changedPath) {
                if (this.properties.itemData.quantity) {
                    this.setData({
                        quantity: newVal.quantity
                    });
                }
            }
        },
        scrollOpen: {  // 左滑打开状态
            type: Boolean,
            value: false,
            observer: function (newVal, oldVal, changedPath) {
                if (!newVal && this.data.isOpen) {
                    this.setData({
                        isOpen: false
                    })
                }
            }
        },
        isCheck: {
            type: Boolean,
            value: false,
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        quantity: 1, // 数量
        initQuantity: '', // 初始数量
        isOpen: false,  // 操作打开状态
        store: null,   // 库存
        price: null,   //价格
        buyLimit: '',  // 限购数量
        realStore: '',
        disMove: false, // 禁止页面左滑
        isEnd: false,
        end_time: '',
        isStart: false,
        start_time: '',
        activitiTime: '', // 特卖时间
        timer: null
    },
    lifetimes: {
        attached() {
            // 在组件实例进入页面节点树时执行
            this.initData()
        },
        detached() {
            // 在组件实例被从页面节点树移除时执行
        },
    },

    /**
     * 组件的方法列表
     */
    methods: {
        // 独立的方法
        initData(val) {  // 初始化数据
            this.setData({
                quantity: this.properties.itemData.quantity,
                initQuantity: this.properties.itemData.quantity
            }, () => {
                this.getStore()
            })
        },
        initBuyLimit() { //初始化商品可购买最大数量
            const { itemData } = this.properties;
            let { promotion_single, store } = itemData;
            if (promotion_single && (promotion_single.type === 'FlashSale' || promotion_single.type === 'SecKill')) {
                if ((new Date(promotion_single.start_time.replace(/-/g, '/')).getTime() <= new Date().getTime()) && (new Date().getTime() <= new Date(promotion_single.end_time.replace(/-/g, '/')).getTime())) {
                    store = promotion_single.store
                }
            }
            let buyLimit = store;
            if (promotion_single && promotion_single.user_buy_limit && promotion_single.user_buy_limit > 0) {
                buyLimit = promotion_single.user_buy_limit
            }
            if (buyLimit && parseFloat(buyLimit) > parseFloat(store)) {
                buyLimit = store
            }
            return buyLimit
        },
        getStore() { // 计算出store库存
            let { store, promotion_single } = this.properties.itemData
            if (promotion_single && (promotion_single.type === 'FlashSale' || promotion_single.type === 'SecKill')) {
                if ((new Date(promotion_single.start_time.replace(/-/g, '/')).getTime() <= new Date().getTime()) && (new Date().getTime() <= new Date(promotion_single.end_time.replace(/-/g, '/')).getTime())) {
                    store = promotion_single.store
                }
            }
            this.setData({
                store: store || 0
            })
            return store
        },
        controlOpen(event) { // getIsOpen 获取打开状态
            this.setData({
                isOpen: event.detail.status
            }, () => {
                this.triggerEvent('scrollCtrl', {
                    status: event.detail.status
                })
            })

        },
        startTough(event) {
            if (event.detail.status) { // 开始滑动
                this.triggerEvent('scrollCtrl', { // 关闭所有左滑的按钮
                    status: false
                })
            }
        },
        // 改变总状态的方法
        handleCheck(event) { //切换check
            this.triggerEvent('handleCheck', {
                cartId: this.properties.itemData.cart_id,
                itemId: this.properties.itemData.item_id
            })
        },
        numValid(detail) {  // num检验
            let { itemData } = this.properties,
                { initQuantity } = this.data;
            let buyLimit = this.initBuyLimit()
            let quantity = detail.val
            let min = detail["min"] || 1;
            let max = detail["max"] || buyLimit || 999999999;
            if (!Number.isInteger(+quantity)) {
                wx.showToast({
                    title: '请输入正确的数量哦',
                    icon: 'none'
                })
                this.setData({
                    quantity: 1
                }, () => { this.updateItemNum(1) });
                return 1;
            }
            if (quantity < min) {
                wx.showToast({
                    title: '至少需要1件哦',
                    icon: 'none'
                })
                this.setData({
                    quantity: 1
                }, () => { this.updateItemNum(1) });
                return 1;
            }
            if (max && quantity > max) {
                wx.showToast({
                    title: '已超出可购数量',
                    icon: 'none'
                })
                this.setData({
                    quantity: max
                }, () => { this.updateItemNum(max) });
                return max;
            }
            return quantity;
        },
        handleNum(e) { //input数量 change 变化
            let detail = e.detail
            let value = +detail.val
            if (!Number.isInteger(value) && value !== "") {
                return;
            }
            const max = 999999999
            if (value <= max) {
                this.setData({
                    quantity: value
                });
                this.updateItemNum(value)
            }
        },
        handleInputNum(e) { //input数量 blur 变化
            let detail = e.detail || {};
            let { itemData } = this.properties
            let quantity = detail.val
            let newNumber = this.numValid(detail);
            this.numUpdate({
                cartId: itemData.cart_id,
                num: newNumber
            });
        },
        handleReduce() { //点击减少
            let { itemData } = this.properties
            let { cart_id } = itemData
            let { quantity } = this.data;
            if (quantity - 1 > 0) {
                this.setData({ quantity: quantity - 1 })
                this.updateItemNum(quantity - 1)
                this.numUpdate({
                    cartId: cart_id,
                    num: quantity - 1
                });
            }
        },
        handlePlus (){  //点击增加
            let { itemData } = this.properties
            let { cart_id } = itemData
            let { quantity, buyLimit } = this.data;
            let max = buyLimit || 999999999;
            if ((+quantity + 1) <= max) {
                this.setData({ quantity: +quantity + 1 })
                this.updateItemNum(quantity + 1)
                this.numUpdate({
                    cartId: cart_id,
                    num: quantity + 1
                });
            }
        },
        handleCollect(event) { //移入收藏夹
            let { itemData } = this.properties;
            this.triggerEvent('handleItemCollect', {
                cart_id: itemData.cart_id,
                promotionId: this.properties.promotionId
            })
        },
        handleDelete(event) {  //点击删除
            let { itemData } = this.properties;
            this.triggerEvent('handleItemDelete', {
                cart_id: itemData.cart_id,
                promotionId: this.properties.promotionId
            })
        },
        updateItemNum(num) {  // 单个商品 改变state
            this.triggerEvent('handleItemNum', {
                cartId: this.properties.itemData.cart_id,
                num: num
            })
        },
        numUpdate(data) {  //改变商品数量 api
            let timer = this.data.timer
            if (timer) {
                clearTimeout(timer);
            }
            this.setData({
                timer: setTimeout(() => {
                    clearTimeout(timer);
                    this.triggerEvent('oneNumUpdate', data)
                }, 500)
            })
        },
        popupSaleAttr(event) { // 销售属性弹窗
            if (!this.properties.edit) {
                return
            }
            const itemData = this.properties.itemData
            const image = itemData.image
            this.triggerEvent('popupSaleAttr', {
                item_id: itemData.item_id,
                img: image,
                sku_id: itemData.sku_id,
                cart_id: itemData.cart_id
            })
        },
        //  跳转详情
        goodetail(event) {
            if (this.properties.edit) return
            let _itemid = event.currentTarget.dataset.itemid
            wx.navigateTo({
                url: '/pages/product/item-detail/index?&itemId=' + _itemid
            })
        }
    }
})
