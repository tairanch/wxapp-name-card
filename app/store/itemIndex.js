const initialState = {
    update: false,

    // 详情数据加载成功
    status: false,

    rateStatus: false,

    // 商品详细信息
    data: {},

    // 区域数据加载成功
    mixStatus: false,
    mix: {},

    // 活动数据是否加载成功
    proStatus: false,

    // 活动信息
    promotion: {},
    itemRules: {},
    // 评价
    rate: {},
    cartNum: {},

    promotionData: {}, //特卖秒杀直降促销数据
    itemId: "",
    weight: "",

    // modal是否显示
    promotionModal: false,
    couponsModal: false,
    searverModal: false,
    buyModal: false,
    buyActive: null,
    scrollHeight: 0,
    barrage: "",
    areaData: {
        area: "",
        areaCode: "",
        addressData: ""
    },

    // 用于记录当前用户选择的属性列表
    retState: {
        flag: false, // 该字段为跳转拼团详情页标记，若为true，可通用数据
        selectArr: [], // 当前选择的规格数组
        specKey: []   // 当前选择的第几组规格
    },
    secKillState: ""
};

const state = JSON.parse(JSON.stringify(initialState));

// 垃圾接口，不指明接口何用，就写混合接口，此接口包含地址列表，购物袋数量，收藏，仓库，是否无理由退货
function initMixData(mData, data) {
    let { addrList } = mData,
        areaCode = [];
    if (addrList.recent_addr.length > 0) {
        let { province, city, district } = addrList.recent_addr[0].area;
        areaCode.push(province.code),
            areaCode.push(city.code),
            district.code && areaCode.push(district.code);
        addrList.recent_addr[0].address_id = addrList.recent_addr[0].id;
    } else if (addrList.default_addr.area) {
        let { province, city, district } = addrList.default_addr.area;
        areaCode.push(province.code),
            areaCode.push(city.code),
            district.code && areaCode.push(district.code);
        addrList.default_addr.address_id = addrList.default_addr.id;
    } else {
        areaCode = ["330000", "330100"];
    }
    let defaultArea = {
        area: {
            district: {
                code: "330108",
                text: "滨江区"
            },
            province: {
                code: "330000",
                text: "浙江省"
            },
            city: {
                code: "330100",
                text: "杭州市"
            }
        },
        detail_address: "浙江省杭州市滨江区"
    };

    let areaData = {
        area:
            (addrList.recent_addr[0] &&
                addrList.recent_addr[0].detail_address) ||
            addrList.default_addr.detail_address ||
            "杭州市滨江区",
        areaCode: areaCode,
        addressData:
            addrList.recent_addr[0] ||
            (addrList.default_addr.detail_address && addrList.default_addr) ||
            defaultArea
    };

    data = Object.assign(state, {
        mix: mData,
        mixStatus: true,
        areaData: areaData,
        favorite: mData.favorite
    });
}

// 初始化活动数据
function initPromotionData(pData, data) {
    let ret = {
        flag: true,
        nowSku: {}, //规格sku信息
        newData: getNewData(pData),
        selectArr: [], //属性值key
        specKey: [], //属性key
        // nowSkuId: "",
        storeNum: pData.realStore,
        nowPrice: rangePrice(pData),
        groupPrice: pData.groupBuy && pData.promotion[0].rules.group_price,
        num: 1,
        originalPrice: "" //加入购物袋的原始价格
    };
    let retState = { ...state.retState, ...ret };
    //特卖秒杀直降promotion数据
    data = Object.assign(state, {
        promotion: pData,
        proStatus: true,
        retState,
        promotionData: getPromotionData(pData)
    });
}

//获取促销信息里的数据
function getPromotionData(data) {
    let { promotion, activity_type } = data;
    let promotionObj = {};
    promotion.some((item, i) => {
        if (item.type === activity_type) {
            promotionObj[item.type] = item;
            return;
        }
    });
    return promotionObj;
}

// 组合新数据结构
function getNewData(data) {
    let { skus } = data.info;
    let arr = Object.keys(skus);
    let newData = arr.map((item, i) => {
        let ids = item.split("_");
        let dataItem = skus[item];
        return {
            ids,
            skus: dataItem
        };
    });
    return newData;
}

// 获取区间价
function rangePrice(data) {

    let { skus } = data.info,
        priceArr = [],
        rangePrice;
    for (let i in skus) {
        priceArr.push(parseFloat(parseFloat(skus[i].price).toFixed(2)));
    }

    if (priceArr.length > 1) {
        priceArr = priceArr.sort((a, b) => {
            return a - b;
        });

        if (
            data.activity_type === "FlashSale" ||
            data.activity_type === "SecKill" ||
            data.groupBuy
        ) {
            //特卖  秒杀 拼团
            rangePrice = priceArr[0]; //普通售价对应最小价格
        } else {
            //直降通普通商品  显示区间价
            rangePrice =
                priceArr[0] !== priceArr[priceArr.length - 1]
                    ? priceArr[0] + "-" + priceArr[priceArr.length - 1]
                    : priceArr[0];
        }
    } else {
        rangePrice = priceArr[0];
    }
    return rangePrice;
}

// 用于数据更新
function itemIndex(type, action) {
    let ret, retState;
    switch (type) {
        case "initAndClearData": {
            this.data = Object.assign(state, {
                update: false,
                rateStatus: false,
                data: {},
                mixStatus: false,
                mix: {},
                proStatus: false,
                promotion: {},
                itemRules: {},
                rate: {},
                cartNum: "0",
                promotionData: {},
                itemId: "",
                weight: "",
                promotionModal: false,
                couponsModal: false,
                searverModal: false,
                buyModal: false,
                buyActive: null,
                scrollHeight: 0,
                barrage: "",
                areaData: {
                    area: "",
                    areaCode: "",
                    addressData: ""
                },
                retState: {
                    flag: false, // 该字段为跳转拼团详情页标记，若为true，可通用数据
                    selectArr: [],
                    specKey: []
                },
                secKillState: ""
            });
            break;
        }
        case "changeStatus":
            this.data = Object.assign(state, {
                update: action.update,
                status: action.status
            });
            break;
        case "initData":
            let { data, update, status } = action;
            retState = Object.assign(state.retState, {
                itemId: data.item_id,
                weight: data.weight
            });
            wx.setStorageSync("dcpPageTitle", JSON.stringify(data.title)); //存商品标题到storage中
            this.data = Object.assign(state, {
                data: data,
                status: status,
                update: update,
                retState: retState
            });
            break;
        case "mixData":
            initMixData(action.data, this.data);
            break;
        case "promotionData":
            initPromotionData(action.data, this.data);
            break;
        case "rateData":
            this.data = Object.assign(state, {
                rate: action.data,
                rateStatus: action.rateStatus
            });
            break;
        case "initState":
            this.data = Object.assign(state, { retState: action.newRetState });
            break;
        case "updateSecKillState":
            this.data = Object.assign(state, {
                secKillState: action.secKillState
            });
            break;
        case "changePromotionModal":
            this.data = Object.assign(state, {
                promotionModal: action.promotionModal
            });
            break;
        case "changeCouponsModal":
            this.data = Object.assign(state, {
                couponsModal: action.couponsModal
            });
            break;
        case "changeSearverModal":
            this.data = Object.assign(state, {
                searverModal: action.searverModal
            });
            break;
        case "getBarrageData":
            this.data = Object.assign(state, { barrage: action.data });
            break;
        case "updateBuyModal":
            this.data = Object.assign(state, {
                buyModal: action.buyModal,
                buyActive: action.buyActive
            });
            break;

        case "updateCartInfo":
            this.data = Object.assign(state, { cartNum: action.count });
            break;
        case "changeCollectStatus":
            this.data.mix = Object.assign(this.data.mix, {
                favorite: action.favorite
            });
            break;
        case "clearPageData": {
            this.data = Object.assign(state, {
                data: {}
            });
            break;
        }

        default:
            this.data = state;
    }
}

export default {
    data: state,
    itemIndex: itemIndex
};
