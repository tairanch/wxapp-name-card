import {rangePrice} from '../../sku'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
      detail: {
          type: Object,
          value: {},
          observer(val) {
              this.setData({
                  groupSellPrice:parseFloat((val.sell_price*1).toFixed(2)),
                  groupMarketPrice:parseFloat((val.market_price*1).toFixed(2)),
              })
          }
      },
      promotion: {
          type: Object,
          value: {},
          observer(val){
              if(this.data.detail.item_id && val.info){
                  this.setParam()
              }
          }
      }
  },

  /**
   * 组件的初始数据
   */
  data: {
      sellPrice: "",
      marketPrice: "",
      groupSellPrice:"",
      groupMarketPrice:"",
      groupPerson:0,
      flashsaleFlag: false,//普通商品价格判断
      state:0,//0秒杀未开始,1秒杀已结束,2秒杀中
  },

  /**
   * 组件的方法列表
   */
  methods: {
      //秒杀市场价为最小活动价对应的市场价
      getMarketPrice(data, sellPrice) {
          let {skus} = data.info, marketPrice;
          for (let i in skus) {
              if (skus[i].price === sellPrice) {
                  marketPrice = skus[i].market_price;
                  break
              }
          }
          return marketPrice;
      },
      setParam(){
          let {promotion,detail,state}=this.data,params={
              sellPrice: rangePrice(promotion, true),
              marketPrice: detail.item_type === "seckill" ? this.getMarketPrice(promotion, rangePrice(promotion, true)) : rangePrice(promotion, false)
          };
          if(promotion.promotion[0]){
                let {start_time, now_time, end_time, type} = promotion.promotion[0];
                now_time = new Date(now_time.replace(/-/g, '/')).getTime();
                start_time = new Date(start_time.replace(/-/g, '/')).getTime();
                end_time = new Date(end_time.replace(/-/g, '/')).getTime();
                if (now_time < start_time) {
                  state = 0;
                } else if (now_time > end_time) {
                  state = 1
                } else {
                  state = 2
                }
                params.state=state;
                if (type === "FlashSale" && now_time > start_time && now_time < end_time) {
                  params={...params,flashsaleFlag: true}//处理普通商品
                }
              if(detail.item_type === "GroupBuy" && promotion.promotion[0].rules){
                  this.setData({
                      groupSellPrice:promotion.promotion[0].rules.group_price,
                      groupPerson:promotion.promotion[0].rules.group_person
                  })
              }
          }
          this.setData(params);
      },
      onload(){
          this.triggerEvent("onload")
      }
  }
});
