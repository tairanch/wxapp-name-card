//事件埋点方法

//埋点商品收藏
export const setExtraInfoScj=(itemId, goodsName, shopId, httpcode, serviceCode, message)=> {
    let extraInfo;
    if(itemId)
        extraInfo = {
            type: "ds-scj",
            goodsId: itemId,
            goodsName:goodsName,
            httpcode: httpcode,
            serviceCode: serviceCode,
            message: message
        };
    if(shopId)
        extraInfo =  {
            type: "ds-scj",
            shopId: shopId,
            httpcode: httpcode,
            serviceCode: serviceCode,
            message: message
        };
    return extraInfo
}

//埋点加入购物车
export const setExtraInfoGwc=(goodsName, itemId, skuId, quantity, httpcode, serviceCode, message)=> {
    return {
        type: "ds-gwc",
        goodsName:goodsName,
        goodsId: itemId,
        skuId: skuId,
        goodsCounts: quantity,
        httpcode: httpcode,
        serviceCode: serviceCode,
        message: message
    }
}