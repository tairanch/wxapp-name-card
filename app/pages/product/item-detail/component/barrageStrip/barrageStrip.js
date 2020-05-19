import ProductTask from '../../../../../AppService/productTask'


Component({
    /**
     * 组件的属性列表
     */
    properties: {},

    ready: function() {},

    lifetimes: {
        attached() {
            // 在组件实例进入页面节点树时执行
            this.getBarrageData();
        }
    },
    pageLifetimes:{
        show(){
            //组件所在的页面被展示时执行
            this.getBarrageData();
        },
        hide(){
            //组件所在的页面被隐藏时执行
            clearTimeout(this.timer);
            clearTimeout(this.showTimer);
            clearTimeout(this.hideIimer);
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        list: "",
        data: [],
        show: false
    },

    /**
     * 组件的方法列表
     */
    methods: {
        //Barrage数据
        getBarrageData() {
            ProductTask.loadBarrage({},({code,data})=>{
                if(code==0){
                    this.setData({ data: data });
                    this.addAnimate();
                    this.oneTimer();
                }
            })
        },
        addAnimate: function() {
            this.showTimer = setTimeout(() => {
                this.setData({ show: true });
            }, 500);
            this.hideIimer = setTimeout(() => {
                this.setData({ show: false });
            }, 3000);
        },
        oneTimer: function() {
            this.timer = setTimeout(() => {
                let list = this.data.data.shift();
                if (list) {
                    this.setData({ list: list });
                    this.addAnimate();
                    this.oneTimer();
                } else {
                    clearTimeout(this.timer);
                    this.getBarrageData();
                }
            }, (Math.ceil(Math.random() * 4) + 6) * 1000);
        }
    }
});
