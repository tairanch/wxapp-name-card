import ProductTask from '../../../../../AppService/productTask'



Component({
  /**
   * 组件的属性列表
   */
  properties: {
      promotion:{
          type:Object,
          value:{},
          observer(val){
              if(val.promotion&&val.promotion.length>0){
                  this.setPro(val.promotion[0])
              }

          }
      },
      detail:{
          type:Object,
          value:{}
      },
      itemId:{
          type:String,
          value:""
      },
      hideFlag:{
          type:Boolean,
          value:false
      }
  },

  /**
   * 组件的初始数据
   */
  data: {
      popShow:false,
      type:"",//coupon 购物券 promotion 促销
      title:"",
      tab:"",
      text:"",
      list:[],
      couponList:[]
  },

  /**
   * 组件的方法列表
   */
  methods: {
      setPro(data){
        let {tab,text,list}=this.data;
        switch (data.type) {
            case "DirectReduction":
                tab="直降";
                text="直降"+data.deduct_price+"元";
                break;
            case "SecKill":
                tab="秒杀";
                text="限时秒杀,每个ID限购"+data.rules.user_buy_limit+"件";
                break;
            case "FlashSale":
                tab="特卖";
                text="限时特卖正在火热抢购中...";
                break;
            case "OptionBuy":
                tab="N元任选";
                text=data.rules.amount+"元任选"+data.rules.quantity+"件";
                break;
            case "ExchangeBuy":
                tab="加价换购";
                text="满"+data.rules.exchange_full+"元加价可在购物袋换购热销商品";
                break;
            case "FullMinus":
                tab="满减";
                data.rules.rule.forEach(({limit_money,deduct_money},i)=>{
                    text = text+(i>0?';':'')+"满"+limit_money+"减"+deduct_money
                });
                break;
            case "FullDiscount":
                tab="满折";
                data.rules.forEach(({full,percent},i)=>{
                    text = text+(i>0?';':'')+full+"件"+percent*0.1+"折"
                });
                break;
            case "GiftBuy":
                tab="赠品";
                text="购买可获赠热销商品，赠完为止";
                Object.values(data.subItems).forEach((key)=>{
                    list = list.concat(Object.values(key))
                });
                break;
        }
        this.setData({
            tab,
            text,
            list
        })
      },
      popClose(){
          this.setData({popShow:false})
      },
      getCoupon(){
            wx.showLoading({
                title: '加载中',
            })
            ProductTask.loadCupon({ item_id: this.data.itemId},({code,data,message})=>{
                if(code==0){
                    this.setData({
                        popShow:true,
                        type:"coupon",
                        title:"领取优惠券",
                        couponList:data
                    })
                }
                wx.hideLoading()
            })
      },
      receiveCoupon({currentTarget:{dataset}}){
            let {coupon_id}=dataset,{detail}=this.data;
            ProductTask.getCoupon({ coupon_id,shop_id: detail.shop.id,source: "goods"},({code,message})=>{
                message = code==0?'领取成功':message;
                wx.showToast({
                    title: message,
                    icon: 'none'
                })
            })
      },
      getPromotion(){
          if(!this.data.hideFlag) return
          this.setData({
              popShow:true,
              type:"promotion",
              title:"促销活动",
          })
      },
      jumpDetail({currentTarget:{dataset}}){//跳转到赠品详情
          let {subItemStatus,item_id}=dataset.item;
          if(subItemStatus !== 'open') return;
          wx.navigateTo({
              url: "/pages/product/item-detail/index?itemId="+item_id
          });
      },
      jumpSearch(){//跳转到同种活动的商品

      }
  }
})
