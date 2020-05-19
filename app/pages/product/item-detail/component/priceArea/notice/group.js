// pages/product/item-detail/component/priceArea/notice/group.js
Component({
    /**
    * 组件的属性列表
    */
    properties: {
        detail: {
            type: Object,
            value: {}
        },
        groupSellPrice:{
            type:String,
            value:""
        },
        groupMarketPrice:{
            type:String,
            value:""
        },
        groupPerson:{
            type:Number,
            value:0
        },
        now_time:{
            type:String,
            value:"",
        },
        start_time:{
            type:String,
            value:"",
        },
        end_time:{
            type:String,
            value:""
        }
    },

    /**
    * 组件的初始数据
    */
    data: {
        time: 0,
        startFlag: false
    },

    /**
    * 组件的方法列表
    */
    methods: {
        intervalTime() {
            this.timer = setTimeout(() => {
                let time = --this.data.time;
                if (time < 0) {
                    this.triggerEvent('onload')
                } else {
                    this.setData({time});
                    this.intervalTime()
                }
            }, 1000)
        },
        startTimer(){
            let {end_time, now_time,start_time} = this.data,params={};
            end_time = new Date(end_time.replace(/-/g, '/')).getTime();
            start_time = new Date(start_time.replace(/-/g, '/')).getTime() ;
            now_time = new Date(now_time.replace(/-/g, '/')).getTime();
            if (now_time < start_time) {
                params={time: parseInt((start_time - now_time) / 1000), startFlag: true}
            } else {
                params={time: parseInt((end_time - now_time) / 1000), startFlag: false}
            }
            this.setData(params,()=>{
                this.intervalTime()
            });
        }
    },
    attached(){
        this.startTimer()
    },
    detached(){
        clearTimeout(this.timer);
        this.timer = null
    }
})
