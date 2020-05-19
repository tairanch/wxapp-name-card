import {setExtraInfoGwc} from "../../../../../utils/dcp"
import ProductTask from '../../../../../AppService/productTask'
import {judgeSingleSku, isHasStore, getImg, chooseSpec,rangePrice} from "../../sku"
const {salesmanId,commissionUcenterId} = getApp().globalData;


Component({
    /**
    * 组件的属性列表
    */
    properties: {
        detail:{
            type: Object,
            value: {},
        },
        promotion:{
            type: Object,
            value: {},
            observer(value){
                let specArr = Object.values(value.info.specs),
                    skuArr = Object.values(value.info.skus);
                let params={specArr,skuArr};
                    
                if(value.promotion && value.promotion[0]){
                    let {now_time,start_time,end_time}=value.promotion[0],state=0;
                    now_time = new Date(now_time.replace(/-/g, "/")).getTime();
                    start_time = new Date(start_time.replace(/-/g, "/")).getTime();
                    end_time = new Date(end_time.replace(/-/g, "/")).getTime();
                    if (now_time < start_time) {
                        state = 0;  //未开始
                    } else if (now_time > end_time) {
                        state = 1  //已结束
                    } else {
                        state = 2  //进行中
                    }
                    Object.assign(params,{state})
                }
                this.setData(params)
            }
        },
        selectArr:{
            type:Array,
            value:[]
        },
        retState:{
            type:Object,
            value:{},
            observer(value) {
                this.getTax()
            }
        },
        areaData:{
            type:Object,
            value:{}
        },
        single:{
            type:Boolean,
            value:false
        },
        buyActive:{
            type:Number,
            value:-1
        },
        user_id:{
            type:String,
            value:''
        },
        object_id:{//图案详情需传递参数
            type:String,
            value:''
        },
        loadCaptcha:{
            type:Boolean,
            value:false
        }
    },

    /**
    * 组件的初始数据
    */
    data: {
        specArr:[],
        skuArr:[],
        taxStatus:false,//税率展开收起
        state:0,//0未开始 1已结束 2进行中
    },

    /**
    * 组件的方法列表
    */
    methods: {
        getDom(dom){
            let  query = this.createSelectorQuery();
            return query.select(dom);
        },
        skuClose(){
            this.triggerEvent('close');
        },
        bindPrev({currentTarget:{dataset}}){
            if(!this.data.retState.img) return;
            wx.previewImage({
                current: dataset.url,
                urls: [dataset.url]
            })
        },
        showToast(message){
            wx.showToast({title: message, icon: 'none'});
        },
        onSpecSelect({currentTarget:{dataset}}){
            let { retState ,promotion} = this.data,{ spec, index, speckey } = dataset;
            let judgeSingle = judgeSingleSku(promotion);
            let hasStore = isHasStore(spec, index, retState.newData, retState.selectArr);
            if (!judgeSingle && hasStore) {
                this.handleSpecSelect(spec, index, speckey);
            }
        },
        //选择规格属性
        // spec: 当前规格的spec_value_id
        // index 当前选中的第几组规格
        // key 当前组的spec_id
        handleSpecSelect(spec, index, key) {
            let { retState ,promotion,detail} = this.data;
            let { info:{skus} , realStore} = promotion;
            let {
                    selectArr,
                    specKey,
                    nowSku,
                    storeNum,
                    newData,
                    nowSkuId,
                    nowPrice,
                    num,
                    deductPrice,
                    originalPrice,
                    img,
                    selectTag,
                } = retState,
                newSpecKey;
            selectArr = selectArr.slice();

            if (selectArr[index]*1 === spec*1) {
                delete selectArr[index];
                delete specKey[index];
            } else {
                selectArr[index] = spec;
                specKey[index] = key;
            }
            // 选中一个商品规格，更新数据
            newSpecKey = selectArr.join("_");
            if (selectArr.length == newData[0].ids.length && skus[newSpecKey]) {
                //更新对应skuId及其价格  sku 库存
                nowSku = skus[newSpecKey];
                nowSkuId = skus[newSpecKey].sku_id;
                nowPrice = skus[newSpecKey].price;
                originalPrice = skus[newSpecKey].price;
                storeNum = skus[newSpecKey].store;
                //更新num
                num = num < storeNum ? num : storeNum;
                deductPrice = skus[newSpecKey].deduct_price;
            } else {
                //未选中一个商品规格，价格设为标准价
                nowPrice = rangePrice(promotion, true);
                storeNum = realStore;
                nowSkuId = "";
                nowSku = "";
                deductPrice = "";
                originalPrice = "";
                selectTag = "";
            }
            selectTag=chooseSpec({specKey,selectArr},promotion).join(" ");
            img=getImg(detail,{specKey,selectArr},promotion);
            let RetState = {
                ...this.data.retState,
                nowSku,
                selectArr,
                specKey,
                nowSkuId,
                nowPrice,
                num,
                storeNum,
                deductPrice,
                originalPrice,
                img,
                selectTag,
            };
            this.triggerEvent('setRetState',RetState)
        },
        reduceNum(){
            let {retState:{num}}=this.data;
            if(num<=1) return;
            num--;

            this.setData({
                retState:{...this.data.retState,num}
            })
        },
        plusNum(){
            let {retState:{storeNum,num}}=this.data;
            if(num>=storeNum) return;
            num++;
            this.setData({
                retState:{...this.data.retState,num}
            })
        },
        changeNum({detail:{value}}){
            let num = value*1,{retState:{storeNum}}=this.data;
            num = num>storeNum ? storeNum : (num<=0?1:num);
            this.setData({
                retState:{...this.data.retState,num}
            })
        },
        showTax(){
            this.setData({taxStatus:!this.data.taxStatus})
        },
        // 是否为字符串
        isString: function(str) {
            return typeof str == "string" && str.constructor == String;
        },
        getTax(){
            let {
                retState: { num, nowPrice },
                detail
            } = this.data;
            let rate = (Math.ceil((+detail.tax_rate).toFixed(5) * 10000) / 100).toFixed(2);
            let miniPrice;
            if (this.isString(nowPrice)) {
                miniPrice = nowPrice.split("-")[0];
            } else {
                miniPrice = nowPrice;
            }

            let tax = num * detail.tax_rate * parseFloat(miniPrice);
            tax = (
                +tax.toFixed(2) +
                (parseFloat((tax - tax.toFixed(2)).toFixed(10)) >= 0.00001
                    ? 0.01
                    : 0)
            ).toFixed(2);
            tax = Number(tax);

            this.setData({
                tax: tax,
                rate: rate
            });
        },
        //判断是否选择规格属性
        checkSpec(){
            let {retState:{nowSkuId}} = this.data;
            return !nowSkuId
        },
        //获取加入购物袋时的数据(普通商品/团购商品)
        getCartParams(){
            let {retState,detail:{item_id,shop_id},user_id}=this.data;
            /*加入购物袋数据*/
            let cartParams={
                "item_id": item_id,
                "sku_id": retState.nowSkuId,
                "quantity": retState.num || 1,
                "shop_id": shop_id,
                "extra": {
                    "price": retState.originalPrice,
                    "commission_user_id": user_id,
                    "name_card_salesman_id": salesmanId,  //名片业务员id
                    "commission_ucenter_id": commissionUcenterId
                }
            };
            return cartParams;

        },
        //拼团验证
        CheckGroupBuy(params,cb){
            ProductTask.CheckGroupBuy(params,({code,message})=>{
                if(code==0){
                    cb()
               }else{
                this.showToast(message)
               }
            })
        },
        //数据存入token
        setToken(params){
            ProductTask.setToken(params,({code,data})=>{
                if(code==0){
                    wx.navigateTo({
                        url: `/pages/wxpage/wxpage?type=orderConfirm&mode=fast_buy&buy_type=0&cartToken=${data.token}`
                    })
                }else{
                    this.showToast(message)
                }
            })
        },
        //商品立即购买数据  normal立即购买 group立即开团
        getParams(type='normal'){
            if(this.checkSpec()){
                this.showToast('请选择规格');
                return
            }
            let {retState,promotion,detail:{item_id},areaData,user_id,object_id}=this.data;
            let extraProArr=promotion.promotion.map(item=>{
                return{
                    "promotion_id": item.id,
                    "role": "main_good",
                    "type": item.type
                }
            });
            let extra_group = type=='normal'?{}:{
                "group_buy_params": {
                    "type": promotion.promotion[0].rules.group_type,  //普通拼团  新人团
                    "object_id": object_id || 0,  //团id 开团默认传0
                    "mode": object_id ? "join" : "open" //开团 open  参团 join
                }
            }
            let buyParams = {
                buyMode: "fast_buy",
                bizMode: "online",
                bizAttr: "trmall",
                address:areaData.selectAddress,
                subscribe:[{
                    "sku_id": retState.nowSkuId,
                    "item_id": item_id,
                    "quantity":(type=='normal'?(retState.num || 1):1) ,
                    "cart_id": 0,
                    "created_at": new Date().getTime(),
                    "extra": {
                        "promotion": extraProArr,
                        "commission_user_id": user_id,   // 添加分佣用户id
                        "name_card_salesman_id": salesmanId,  //名片业务员id
                        "commission_ucenter_id": commissionUcenterId,
                        ...extra_group
                    }
                }]
            };
            if(type=='normal'){
                this.setToken(buyParams)
            }
            if(type=='group'){
                let checkParams={
                    promotion_id:promotion.promotion[0].id,
                    object_id: object_id || 0,
                    group_type: promotion.promotion[0].rules.group_type
                }
                this.CheckGroupBuy(checkParams,()=>{
                    this.setToken(buyParams)
                })
            }
            
            
        },
        addCart(){
            if(this.checkSpec()){
                this.showToast('请选择规格');
                return
            }
            ProductTask.addCart({...this.getCartParams()},({code,data,message},result)=>{
                if(code==0){
                    this.showToast('成功加入购物袋');
                    this.triggerEvent('addCount',{count:data.count});
                    message='加入购物车成功'
                }else{
                    this.showToast('购物袋加入失败');
                }
                let {item_id, quantity, sku_id} = this.getCartParams(),{title}=this.data.detail;
                let extraInfo = setExtraInfoGwc(title, item_id, sku_id, quantity, result.statusCode, code, message);
                getApp().dcp.dispatch('customEvent',this.getDom('#dcp-cart'),extraInfo)
            })
        },
        purchase(){
            this.getParams('normal')
        },
        openGroup(){
            this.getParams('group')
        },
        loadCaptchas(){
            ProductTask.loadCaptchas({},({code,data})=>{
                if(code==0){
                    data = JSON.parse(data)
                    this.triggerEvent('loadCaptchas',{
                        loadCaptcha: true,
                        gt: data.gt,
                        challenge: data.challenge,
                        offline: !data.success
                    });
                }
            })
        },
        
        seckill(){
            if(this.checkSpec()){
                this.showToast('请选择规格');
                return
            }
            this.loadCaptchas()
        }
    }
})
