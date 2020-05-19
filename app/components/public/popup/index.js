
Component({
    options: {
        multipleSlots: true
    },
/**
* 组件的属性列表
*/
    properties: {
        show:{
            type:Boolean,
            vlaue:false,
            observer:function (value) {
                if(value){
                    this.setData({display:value})
                }
            }
        },
        position:{
            type:String,
            value:"bottom"
        }
    },
/**
* 组件的初始数据
*/
    data: {
        display:false,//false:隐藏 true:显示
    },
    /**
    * 组件的方法列表
    */
    methods: {
        closeMask(){
            this.triggerEvent('close')
        },
        onAnimationEnd(){
            if(!this.data.show){
                this.setData({display:false})
            }
        }
    },
});
