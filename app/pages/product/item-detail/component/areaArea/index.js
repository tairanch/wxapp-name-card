
Component({
  /**
   * 组件的属性列表
   */
  properties: {
      hideFlag:{
          type:Boolean,
          value:false
      },
      detail:{
          type:Object,
          value: {},
          observer(value){
              let rate = (Math.ceil((+value.tax_rate).toFixed(5) * 10000) / 100).toFixed(2);
              this.setData({rate})
          }
      },
      mix:{
          type:Object,
          value: {}
      },
      areaData:{
          type:Object,
          value:{},
          observer(value) {
              if(value.code){
                  this.computedFreight(value)
              }
          }
      },
      retState:{
          type:Object,
          value:{}
      }
  },

  /**
   * 组件的初始数据
   */
  data: {
      showPop:false,
      showType:'',//tag 标签弹窗 area区域弹窗
      rate:0,//利率
      assignArea:[],
      text:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
      popClose(){
          this.setData({showPop:false})
      },
      showTag({currentTarget:{dataset}}){
          this.setData({showType:dataset.key,showPop:true})
      },
      showChargeMsg (num, money, quantity) {
          let text = "";
          switch (num) {
              case 0:
                  text="该商品已包邮";
                  break;
              case 1:
                  text=`满 ${ quantity } 件包邮`;
                  break;
              case 2:
                  text=`满 ${ money } 元包邮`;
                  break;
              case 3:
                  text=`满 ${quantity} 件，且满 ${ money }元包邮`;
                  break;
              case 4:
                  text=`${ quantity } kg内包邮`;
                  break;
              case 5:
                  text=`满 ${ money } 元包邮`;
                  break;
              case 6:
                  text=`${quantity} kg内，且满 ${ money }元包邮`;
                  break;
          }
          this.setData({text})
      },
      //包邮规则
      chooseChargeRule1(assignArea){
          if (assignArea.limit_quantity) {
              switch (assignArea.free_type) {
                  case 1:
                      return this.showChargeMsg(1, null, assignArea.limit_quantity);
                  case 2:
                      return this.showChargeMsg(2, assignArea.limit_money, null);
                  case 3:
                      return this.showChargeMsg(3, assignArea.limit_money, assignArea.limit_quantity);
                  default :
                      break;
              }
          } else {
              switch (assignArea.free_type) {
                  case 1:
                      return this.showChargeMsg(4, null, assignArea.limit_weight);
                  case 2:
                      return this.showChargeMsg(5, assignArea.limit_money, null);
                  case 3:
                      return this.showChargeMsg(6, assignArea.limit_money, assignArea.limit_weight);
                  default :
                      break;
              }
          }

      },
      //按件数（重量）计算运费
      chooseChargeRule2 (assignArea, valuation_type) {
          let {start_standard, start_freight, add_standard, add_freight} = assignArea;
          let charge;
          let {num, weight} = this.data.retState;
          if (add_standard && add_freight && (valuation_type === 1 ? (+assignArea.start_standard < num * weight) : (+assignArea.start_standard < num))) {
              charge = valuation_type === 1 ? (+start_freight + Math.ceil((num * weight - start_standard) / add_standard) * add_freight) : (+start_freight + (add_standard && add_freight && Math.ceil((num - start_standard) / add_standard) * add_freight) );  //最终运费
          } else {
              charge = +start_freight;  //首件运费
          }
          this.setData({text:`预计运费${charge}元`})
      },

      //按金额计算运费
      chooseChargeRule3(assignArea){
          let {rules} = assignArea;
          if (!(rules instanceof Array)) { //默认地区运费规则
              let rulesArr = [];
              for (let i in rules) {
                  rulesArr.push(rules[i])
              }
              rules = rulesArr;
          }
          let {nowPrice, num, groupPrice} = this.data.retState;
          nowPrice = groupPrice ? groupPrice : nowPrice;
          let rangeLen = String(nowPrice).split("-").length;//区间价取标准售价算运费
          nowPrice = rangeLen === 1 ? nowPrice * num : this.data.detail.sell_price * num;
          let charge;
          rules.filter((val, index) => {
              if (val.upper ? (nowPrice >= +val.boundary && nowPrice < +val.upper) : (nowPrice >= +val.boundary)) {
                  charge = val.freight;
              }
          });
          this.setData({text:`预计运费${charge}元`})
      },
      //根据地区设置运费
      chooseAssignArea (free_conf, areaCode) {
          return free_conf.filter((val, index) => {
              let rowArea = val.area && val.area.split(",");
              return rowArea && rowArea.some((v) => {
                  if (v === areaCode[0] || v === areaCode[1]) {
                      return free_conf[index]
                  }
              })
          });
      },
      //计算运费【重量1 件数2 金额3】
      computedFreight(areaData){
          let {freight_conf, free_conf, valuation_type, is_free}=this.data.mix.dlytmplInfo;
          if(is_free){//包邮之后不再计算运费
              return
          }
          // //为指定地区设置包邮规则 free_conf:true
          // //为指定地区城市设置运费+默认运费
          let conf = !free_conf ? freight_conf : free_conf;
          let assignArea = this.chooseAssignArea(conf, areaData.code);
          if(valuation_type === 1 || valuation_type === 2){//按重量,按件数
              if(free_conf){
                  if (assignArea.length > 0 && ((assignArea[0].free_type === 3 && (assignArea[0].limit_weight || assignArea[0].limit_quantity) && assignArea[0].limit_money) || (assignArea[0].free_type === 2 && assignArea[0].limit_money) || (assignArea[0].free_type === 1 && (assignArea[0].limit_quantity || assignArea[0].limit_weight)))) {//指定地区设置包邮规则
                      return this.chooseChargeRule1(assignArea[0])
                  } else if (free_conf[0] && ((free_conf[0].free_type === 3 && (free_conf[0].limit_weight || free_conf[0].limit_quantity) && free_conf[0].limit_money) || (free_conf[0].free_type === 2 && free_conf[0].limit_money) || (free_conf[0].free_type === 1 && (free_conf[0].limit_quantity || free_conf[0].limit_weight)))) {
                      return this.chooseChargeRule1(free_conf[0])
                  }
              }else {
                  let {start_standard, start_freight, add_standard, add_freight} = assignArea.length > 0 && assignArea[0];
                  if (assignArea.length && ((start_standard != "" && start_freight != "" && add_standard != "" && add_freight != "") || (add_standard != "" && add_freight != "" && (valuation_type === 1 ? weight <= start_standard : num <= start_standard)))) { //指定地区城市
                      return this.chooseChargeRule2(assignArea[0], valuation_type);
                  } else {  //全国
                      return this.chooseChargeRule2(freight_conf[0], valuation_type);
                  }
              }
          }else{
              assignArea = assignArea.length ? assignArea[0] :freight_conf[0];
              this.chooseChargeRule3(assignArea)
          }
      },
      selected({currentTarget:{dataset}}){
          this.popClose();
          this.triggerEvent('setArea',dataset)
      },
      //选择省市区
      setArea({detail}){
          this.popClose();
          this.triggerEvent('setArea',detail);
      },
      selectArea(){
          this.popClose();
      }
  }
});
