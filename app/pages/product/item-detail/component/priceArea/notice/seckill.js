import {dateUtil} from '../../../sku'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
      detail: {
          type: Object,
          value: {}
      },
      flashsaleFlag:{
          type:Boolean,
          value: false
      },
      sellPrice:{
          type:String,
          value:""
      },
      marketPrice:{
          type:String,
          value:""
      },
      state:{
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
          observer(value){
              if(value){
                 this.setData({
                     unStartTime: dateUtil.format(new Date(value).getTime(), "M月D日H:F:S")
                 })
              }
          }
      },
      end_time:{
          type:String,
          value:""
      }
  },

  /**
   * 组件的初始数据
   *
   */
  data: {
      unStartTime:"",
      toEnd:0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
      intervalTime() {
          this.timer = setTimeout(() => {
              let toEnd = --this.data.toEnd;
              if (toEnd < 0) {
                  this.triggerEvent('onload')
              } else {
                  this.setData({toEnd});
                  this.intervalTime()
              }
          }, 1000)
      },
      startTimer(){
          let {end_time, now_time,start_time} = this.data,params={};
          end_time = new Date(end_time.replace(/-/g, '/')).getTime();
          start_time = new Date(start_time.replace(/-/g, '/')).getTime() ;
          now_time = new Date(now_time.replace(/-/g, '/')).getTime() ;
          if(now_time<start_time){
            params={toEnd: parseInt((start_time - now_time) / 1000)}
          }else{
            params={toEnd: parseInt((end_time - now_time) / 1000)}
          }
          this.setData(params,()=>{
            this.intervalTime();
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
