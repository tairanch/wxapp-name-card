// pages/product/item-detail/component/priceArea/notice/index.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        sellPrice:{
            type:String,
            value:""
        },
        marketPrice:{
            type:String,
            value:""
        },
        now_time:{
            type:String,
            value:""
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
        time:0
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
            let {end_time, now_time} = this.data;
            end_time = new Date(end_time.replace(/-/g, '/')).getTime();
            now_time = new Date(now_time.replace(/-/g, '/')).getTime() ;
            
            if (now_time < end_time) {
                this.setData({time: parseInt((end_time - now_time) / 1000)});
            }
            this.intervalTime();
        }
    },
    attached(){
        this.startTimer()
    },
    detached(){
        clearTimeout(this.timer);
        this.timer = null
    }
});
