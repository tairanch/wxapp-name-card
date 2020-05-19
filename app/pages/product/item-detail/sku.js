//组合新数据结构
export const getNewData=(data)=>{
    let {skus} = data.info;
    let arr = Object.keys(skus);
    let newData = arr.map((item, i) => {
        let ids = item.split("_");
        let dataItem = skus[item];
        return {
            ids,
            skus: dataItem
        }
    });
    return newData;
};


//获取已选属性
export const chooseSpec=(retState, promotion)=> {
    let {specKey, selectArr}=retState,{specs}=promotion.info;
    let list = [], spec;
    specKey && specKey.map((val, key) => {
        if(!val) return list;
        spec = specs[val].values.filter((item, i) => {
            return item.spec_value_id == selectArr[key];
        });
        list.push(spec[0].text)
    });
    return list
};


//获取图片
export const getImg=(detail,retState,promotion)=>{
    let {specKey, selectArr}=retState,{specs}=promotion.info;
    let ret, spec;
    specKey&&specKey.some((val,key)=>{
        if(!val) return ret;
        spec = specs[val].values.filter(item=>item.spec_value_id == selectArr[key]);
        ret = spec[0].image?spec[0].image:ret;
    });
    return !ret ? detail.primary_image : ret


}


// 判断是否是单规格(无规格)
export const judgeSingleSku=(promotion)=>{
    let { skus } = promotion.info;
    let keys = Object.keys(skus);
    let skusArr = keys.filter(item=>skus[`${item}`].store*1 !== 0);
    return  (keys.length === 1 || skusArr.length === 1)
};

//单规格或者无规格初始化价格和skuId 及规格属性

export const changeBusinessPrice = (promotion) => {
    let {skus,specs}=promotion.info,newSate={};
    let keys = Object.keys(skus), key;
    keys.forEach((item) => {
        if (skus[`${item}`].store !== 0) {
            key = item;
        }
    });
    key = key ? key : keys[0];

    newSate.nowPrice = skus[key].price;
    newSate.originalPrice = skus[key].price;
    newSate.deductPrice = skus[key].deductPrice;
    newSate.nowSkuId = skus[key].sku_id;
    newSate.storeNum = skus[key].store;
    newSate.selectArr = key.split("_");
    newSate.specKey = Object.keys(specs);
    return newSate
};


//判断库存
export const isHasStore =(spec,index, data, select)=>{
    return data && data.some((list) => {
        if (list.ids[index] == spec) {
            let newSelect = select.slice();
            if (newSelect[index]) {
                delete newSelect[index];
            }
            if (newSelect.every((item, j) => {
                return !item?true:select[j] == list.ids[j]
            })) {
                return list.skus.store > 0
            } else {
                return false;
            }
        } else {
            return false;
        }
    });
};



// 根据商品的获取区间价
/**
 * sellPrice true 获取标准售价
 * sellPrice false 市场价
 */
export const rangePrice=(data, sellPrice)=>{
    let { skus } = data.info,
        priceArr = [],
        rangePrice;
    for (let i in skus) {
        if (sellPrice) {
            //标准售价
            priceArr.push(parseFloat(parseFloat(skus[i].price).toFixed(2)));
        } else {
            //市场价
            priceArr.push(
                parseFloat(parseFloat(skus[i].market_price).toFixed(2))
            );
        }
    }

    if (priceArr.length > 1) {
        //多规格
        priceArr = priceArr.sort((a, b) => {
            return a - b;
        });

        if (
            data.activity_type === "FlashSale" ||
            data.activity_type === "SecKill" ||
            data.groupBuy
        ) {
            //特卖 秒杀 拼团
            rangePrice = priceArr[0]; //普通售价对应最小价格
        } else {
            //直降同普通商品
            rangePrice =
                priceArr[0] !== priceArr[priceArr.length - 1]
                    ? priceArr[0] + "-" + priceArr[priceArr.length - 1]
                    : priceArr[0];
        }
    } else {
        //单规格
        rangePrice = priceArr[0];
    }
    return rangePrice;
}



export const dateUtil = {
    formatNum: function(n) {
        if (n < 10) return "0" + n;
        return n;
    },

    parse: function(dateStr, formatStr) {
        if (typeof dateStr === "undefined") return null;
        if (typeof formatStr === "string") {
            var _d = new Date(formatStr);

            var arrStr = formatStr.replace(/[^ymd]/g, "").split("");
            if (!arrStr && arrStr.length != 3) return null;

            var formatStr = formatStr.replace(/y|m|d/g, function(k) {
                switch (k) {
                    case "y":
                        return "(\\d{4})";
                    case "m":
                    case "d":
                        return "(\\d{1,2})";
                }
            });

            var reg = new RegExp(formatStr, "g");
            var arr = reg.exec(dateStr);

            var dateObj = {};
            for (var i = 0, len = arrStr.length; i < len; i++) {
                dateObj[arrStr[i]] = arr[i + 1];
            }
            return new Date(dateObj["y"], dateObj["m"] - 1, dateObj["d"]);
        }
        return null;
    },

    format: function(date, format) {
        if (!date) {
            return null;
        }
        if (arguments.length == 2 && typeof format === "boolean") {
            format = date;
            date = new Date();
        }
        if (!date.getTime) {
            date = new Date(parseInt(date));
        }

        typeof format != "string" && (format = "Y年M月D日 H时F分S秒");
        return format.replace(/Y|y|M|m|D|d|H|h|F|f|S|s/g, function(a) {
            switch (a) {
                case "y":
                    return (date.getFullYear() + "").slice(2);
                case "Y":
                    return date.getFullYear();
                case "m":
                    return date.getMonth() + 1;
                case "M":
                    return dateUtil.formatNum(date.getMonth() + 1);
                case "d":
                    return date.getDate();
                case "D":
                    return dateUtil.formatNum(date.getDate());
                case "h":
                    return date.getHours();
                case "H":
                    return dateUtil.formatNum(date.getHours());
                case "f":
                    return date.getMinutes();
                case "F":
                    return dateUtil.formatNum(date.getMinutes());
                case "s":
                    return date.getSeconds();
                case "S":
                    return dateUtil.formatNum(date.getSeconds());
            }
        });
    }
};




