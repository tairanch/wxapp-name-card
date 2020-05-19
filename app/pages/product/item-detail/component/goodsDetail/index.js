var WxParse = require("../../wxParse/wxParse.js");
Component({
    /**
    * 组件的属性列表
    */
    properties: {
        detail:{
            type:Object,
            value:{},
            observer(value){
                let html = value.desc.wap;
                let that = this;
                if (html) {
                    WxParse.wxParse("goodsDetail", "html", html, that, 0);
                }
            }
        },
        fixed:{
            type:Boolean,
            value:false
        },
        height:{
            type:Number,
            value:44
        }
    },

    /**
    * 组件的初始数据
    */
    data: {
        active:0,
        nav:['商品介绍','商品参数'],
        _height:0
    },

    /**
    * 组件的方法列表
    */
    methods: {
        scrollMes(dom){
            let  query = this.createSelectorQuery();
            query.select(dom).boundingClientRect();
            return new Promise((resolve)=>{
                query.exec((res)=>{
                    res[0] ? resolve(res[0]) : resolve({})
                })
            })
        },
        checkedTag({currentTarget:{dataset:{active}}}){
            this.scrollMes('.detail-nav').then((res)=>{
                //可视屏幕高度-(.detail-nav的高度+头部导航的高度)
                let _height = wx.getSystemInfoSync().windowHeight-(res.height+this.data.height);
                this.setData({active,_height});
                this.triggerEvent('scrollDetail',{index:2})
            })
        }
    },
    attached(){

    }
});
