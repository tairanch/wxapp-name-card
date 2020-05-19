const {hideFlag} = getApp().globalData;
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        detail: {
            type: Object,
            value: {},
            observer(value){
                if(value.item_id){
                    let list =[];
                    if(value.country.imageUrl){
                        list.push({
                            text:value.country.text+'品牌',
                            img:value.country.imageUrl
                        })
                    }
                    if((value.trade_type === "OVERSEAS"||value.trade_type==="DIRECT") ? "海外直邮" :(value.trade_type==="BONDED"?"跨境保税":"")){
                        list.push({
                            text:value.trade_type === "OVERSEAS"||value.trade_type==="DIRECT" ? "海外直邮" : value.trade_type==="BONDED"?"跨境保税":"",
                            img:'/image/icon/trade-type-icon.png'
                        })
                    }
                    if(hideFlag){
                        if(value.shop.biz_model === 1){
                            list.push({
                                text:'泰然城自营',
                                img:'/image/icon/trc-logo-icon.png' 
                            })
                        }else{
                            list.push({
                                text:'泰然城精选商家',
                                img:'/image/icon/trc-logo-icon.png' 
                            })
                        }
                    }
                    this.setData({list})
                }
            }
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        list:[]
    },
    /**
     * 组件的方法列表
     */
    methods: {}
});
