// import createPage from "../../../store/westore/createPage";

import { getNewData ,getImg ,chooseSpec,judgeSingleSku,changeBusinessPrice,rangePrice} from './sku'
import ProductTask from '../../../AppService/productTask'
const DcpPage = require('../../../utils/dcp/dcpPage')
const app = getApp();
const {hideFlag,salesmanId,commissionUcenterId} = app.globalData;

DcpPage({
    data:{

        promotionData: {}, //特卖秒杀直降促销数据
        status: false,// 详情数据加载成功
        proStatus: false,// 活动数据是否加载成功

        detail:{},//商品详情
        promotion:{},//促销和规格数据
        count:0,//购物车数量

        retState:{
            flag:false,//是否为单规格或无规格 false 是
            newData:[],//sku组合新数据结构
            selectArr: [], // 当前选择的规格数组
            specKey:[],
            storeNum:0,/*库存storeNum件*/
            nowPrice:0,//sku显示的价格
            originalPrice:0,//加入购物袋的原始价格
            groupPrice:0,
            deductPrice:0,//直降价格
            nowSkuId:"",
            nowSku:{}, //规格sku信息
            num:1,//选择的库存数量,
            weight:'',
            img:"",//sku图片,
            selectTag:"",//选中的规格即显示的文字
        },

        backLoad:false,//判断是否是返回到详情页

        opacity:0,//导航
        navIndex:0,//导航
        nav:['商品','评价','详情'],
        scrollTop:0,
        fixed:false,//true 商品介绍固定 false不固定
        height:44,//头部导航高度

        commissionUcenterLoginType: false,// 判断是否显示分享浮动蒙层
        isLogin: false,
        hideFlag: hideFlag,
        itemId:"",
        user_id:"",
        loading:false,// 是否正在加载
        specsArr: [],
        groupPrice:0,
        single:false,//是否是单规格  promotion.info.specs为数组是单规格 对象是多规格
        skuPop:false,
        buyActive:-1,// 点击位置不同显示的弹窗的按钮也不同  页面选择规格点击为0  footer加入购物袋点击为1 购买/拼团/秒杀2
        mix:{},
        areaData:{//默认值
            text:"浙江省杭州市滨江区",
            code:[330000,330100,330108],
            selectAddress:{
                "area": {
                    "province": {
                        "code": "330000",
                        "text": "浙江省"
                    },
                    "city": {
                        "code": "330100",
                        "text": "杭州市"
                    },
                    "district": {
                        "code": "330108",
                        "text": "滨江区"
                    }
                },
                "detail_address": "浙江省杭州市滨江区"
            },
            recent_addr:[]
        },
        rate:{},
        loadCaptcha:false,//图形验证码
    },
    onLoad(option){
        let {itemId,user_id}=option;
        wx.hideShareMenu();
        if(!itemId){//倒计时结束时重新调用onload
            itemId=this.data.itemId;
            user_id=this.data.user_id;
        }
        let params={
            itemId,
        };
        if(user_id){
            Object.assign(params,{user_id: user_id})
        }
        this.setData(params);
        this.getDetailData(itemId);
        this.loadMix(itemId);
        this.loadRate(itemId);
        /*倒计时结束时 刷新当前页面使用*/
        this.setData({
            itemId,
            user_id:user_id||'',
            backLoad:true,
        });
        
    },
    onShow(){
        let {backLoad,itemId}=this.data;
        //登录状态 下 加载购物车商品数量 和 收藏状态
        this.setData({
            isLogin:getApp().globalData.haslogin,
            commissionUcenterLoginType:getApp().globalData.commissionUcenterLoginType
        });
        if(getApp().globalData.haslogin){
            this.getCartCount();
            if(backLoad){//登录之后重新加载收藏状态,收货地址
                this.loadMix(itemId);
            }
        }
    },
    getDetailData(item_id){//详情
        this.setData({loading: true});
        ProductTask.loadDetail({ item_id },({code,data})=>{
            if(code==0){
                this.setData({
                    detail: data,
                    status: true,
                });
                this.getPromotionData(item_id);//价格计算是需要用到detail中的值,放置在内部请求了
            }else{
                this.setData({
                    loading: false,
                    status: false,
                });
            }
        })
    },
    getPromotionData(item_id) {    //promotion 数据
        ProductTask.loadPromotion({ item_id, salesman_id: getApp().globalData.salesmanId },({code,data})=>{
            if(code==0){
                this.promotionData(data)
            }
            this.setData({loading:false})
        })
    },

    promotionData(data){
        let single=data.info.specs instanceof Array;
        let flag = judgeSingleSku(data),{retState}=this.data,newSate={};
        if(flag){
            newSate ={...changeBusinessPrice(data),flag};
        }
        retState={
            ...retState,
            newData: getNewData(data),
            storeNum:data.realStore,
            nowPrice:rangePrice(data, true),
            groupPrice:data.groupBuy && data.promotion[0].rules.group_price,
            deductPrice:data.promotion[0]&&data.promotion[0].deduct_price,
            img:getImg(this.data.detail,newSate,data),
            selectTag:chooseSpec(newSate,data).join(" "),
            weight:this.data.detail.weight,
            ...newSate
        };
        this.setData({
            promotion:data,
            single:single,
            specsArr:Object.keys(data.info.specs),
            groupPrice:rangePrice(data, true),
            retState
        });
    },

    //购物车商品数量
    getCartCount() {
        ProductTask.loadCount({},({code,data})=>{
            if(code==0){
                this.setData({count:data.count})
            }
        })
    },
    getAreaData({addrList:{recent_addr}}){
        let {text,code,selectAddress}=this.data.areaData,load_recent_addr=this.data.areaData.recent_addr;

        if(load_recent_addr.length>0){//加载之后的数据
            let newAddres=load_recent_addr.filter(v=>v['checked']);
            if(newAddres[0]&&newAddres[0].area){
                selectAddress = newAddres[0];
                code = [selectAddress.area.province.code,selectAddress.area.city.code,selectAddress.area.district.code];
                text = selectAddress['detail_address'];
                recent_addr=load_recent_addr;
            }
        }else{
            if(recent_addr.length>0){//第一次加载并且存在地址列表
                selectAddress = recent_addr.filter(v=>v['is_default'])[0];
                code = [selectAddress.area.province.code,selectAddress.area.city.code,selectAddress.area.district.code];
                text = selectAddress['detail_address'];
                recent_addr.forEach((v)=>{
                    v['checked']=!!v['is_default']
                })
            }
        }
        this.setData({
            areaData:{recent_addr,text,code,selectAddress}
        })
    },


    //混合接口
    loadMix(item_id){
        ProductTask.loadMix({item_id},({code,data})=>{
            if(code==0){
                this.setData({mix:data});
                this.getAreaData(data)
            }
        })
    },
    //加载评价
    loadRate(item_id){
        ProductTask.loadRate({item_id},({code,data})=>{
            if(code==0){
                this.setData({rate:data});
            }
        })
    },

    
    //sku弹窗
    skuShow(buyActive){
        let {detail,promotion} = this.data;
        if(detail.status !== 'SHELVING' || !promotion.realStore) return;
        let params={
            buyActive,
            skuPop:!this.data.skuPop,
        };
        this.setData(params)
    },
    //页面点击选择
    skuChange(){
        if(this.data.skuPop){//关闭弹窗时 隐藏图形验证码按钮
            this.setData({loadCaptcha:false})
        }
        this.skuShow(0)
    },
    //点击购买/购物袋
    btnClick({detail}){
        let config = {
            "addCart":1,
            "buy":2
        };
        this.skuShow(config[detail.key]);
    },
    setRetState({detail}){
        this.setData({
            retState:detail
        })
    },
    setArea({detail:{index,area,region}}){
        let {recent_addr,text,code,selectAddress}=this.data.areaData;
        recent_addr.forEach((v,i)=>{
            v['checked'] = i==index ? true : false;
        });
        if(region&&area){
            text = region[0]+'/'+region[1]+(region[2]?('/'+region[2]):'');
            code = [area.province.code,area.city.code,area.district.code];
            selectAddress={area,detail_address:region[0]+region[1]+region[2]};
        }else {
            text = recent_addr[index]['detail_address'];
            code = [recent_addr[index].area.province.code,recent_addr[index].area.city.code,recent_addr[index].area.district.code];
            selectAddress = recent_addr.filter(v=>v['checked'])[0];
        }
        this.setData({
            areaData:{recent_addr,text,code,selectAddress}
        })

    },
    scrollMes(dom){
        let  query = this.createSelectorQuery();
        query.select(dom).boundingClientRect();
        return new Promise((resolve)=>{
            query.exec((res)=>{
                res[0] ? resolve(res[0]) : resolve({})
            })
        })
    },
    //导航点击
    navClickEvent({detail:{index}}){
        let {scrollTop,navIndex}=this.data;
        if(navIndex == index) return;
        Promise.all([
            this.scrollMes('#evaluate'),
            this.scrollMes('#goods-detail'),
            this.scrollMes('#item-nav'),
        ]).then((res)=>{
            let top1 = Math.ceil(res[0].top),
                top2 = Math.ceil(res[1].top),
                height1 = Math.ceil(res[2].height);
            //评价/详情 导航切换 dom的距离相差 小于100 不用做动画
            // let duration =(([1,2].includes(navIndex) && [1,2].includes(index)) && Math.abs(top2-top1) <=100) ? 0 : 300;
            switch (index) {
                case 0:
                    scrollTop = 0;
                    break;
                case 1:
                    scrollTop = scrollTop + top1-height1;
                    break;
                case 2:
                    scrollTop = scrollTop + top2-height1;
                    break;
            }
            let that = this;
            wx.pageScrollTo({
                scrollTop: scrollTop,
                duration:0,
                complete(){ //真机可以执行回调  工具端不触发
                    that.setData({navIndex:index});
                }
            });
            // that.setData({navIndex:index});
        });

    },
    onPageScroll({scrollTop}){
        let opacity = scrollTop/375;
        this.setData({opacity,scrollTop:Math.ceil(scrollTop)});
        Promise.all([
            this.scrollMes('#evaluate'),
            this.scrollMes('#goods-detail'),
            this.scrollMes('#item-nav'),
        ]).then((res)=>{
            //top1 评价距离顶部的高度() top2商品详情评价距离顶部的高度 height1 头部导航的高度
            let top1 = res[0].top,
                top2 = res[1].top,
                height1 = res[2].height,
                {navIndex} = this.data;
            if(top1>height1){
                navIndex = 0
            }else if(top1<=height1 && top2>height1){
                navIndex = 1
            }else {
                navIndex = 2
            }
            let fixed = navIndex === 2;
            this.setData({navIndex,fixed,height:height1})
        });
    },
    /*点击加入购物车 count数值改变*/
    addCount({detail:{count}}){
        this.setData({count,skuPop:false})
    },
    loadCaptchas({detail}){
        this.setData(detail)
    },
    captchaReady() {
        console.log('captcha-Ready!')
    },
    captchaClose() {
        console.log('captcha-Close!')
    },
    captchaError({detail}){
        if(detail.code===21){
            this.setData({loadCaptcha:false});
        }
    },
    //图形验证码二次验证 
    captchaSuccess({detail}){
        let {retState,promotion,itemId}=this.data;
        let extraProArr= promotion.promotion.map(item=>{
            return{
                "promotion_id": item.id, 
                "role": "main_good", 
                "type": item.type 
            }
        })
        let params ={
            captcha_data:detail,
            extra:{
                'promotion':extraProArr
            },
            sku_record: {
				"quantity": retState.num || 1,
				"price": retState.nowPrice,
				"sku_id": retState.nowSkuId,
				"item_id": itemId,
			},
        }
        ProductTask.checkAgain(params,({code})=>{
            if(code==0){
                this.setToken();
            }
        })
    },
    //数据存入token
    setToken(){
        let {retState,promotion,areaData,user_id,itemId}=this.data;
        let extraProArr=promotion.promotion.map(item=>{
            return{
                "promotion_id": item.id,
                "role": "main_good",
                "type": item.type
            }
        });
        let params={
            buyMode: "fast_buy",
			bizMode: "online",
			bizAttr: "trmall",
            address: areaData.selectAddress,
            subscribe:[{
                "quantity": retState.num || 1,
				"cart_id": 0,
				"sku_id": retState.nowSkuId,
				"item_id": itemId,
                "created_at": new Date().getTime(),
                "extra": {
					"promotion": extraProArr,
					"commission_user_id": user_id,   // 添加分佣用户id
					"name_card_salesman_id": salesmanId,  //名片业务员id
					"commission_ucenter_id": commissionUcenterId
				}
            }]
        };
        ProductTask.setToken(params,({code,data,message})=>{
            if(code==0){
                this.setData({loadCaptcha:false})
                wx.navigateTo({
                    url: `/pages/wxpage/wxpage?type=orderConfirm&mode=fast_buy&buy_type=0&cartToken=${data.token}`
                })
            }else{
                this.showToast(message)
            }
        })
    },
});