import {setExtraInfoScj} from "../../../../../utils/dcp"
import ProductTask from '../../../../../AppService/productTask'

Component({
    /**
    * 组件的属性列表
    */
    properties: {
        mix:{
            type:Object,
            value:{},
            observer(value){
                this.setData({collect:!!value.favorite})
            }
        },
        detail:{
            type:Object,
            value:{},
        },
        retState:{
            type:Object,
            value:{}
        },
        promotion:{
            type:Object,
            value:{},
            observer(value) {
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
                    this.setData({state})
                }
            }
        },
    },

    /**
    * 组件的初始数据
    */
    data: {
        collect:false,
        state:0
    },

    /**
    * 组件的方法列表
    */
    methods: {
        getDom(dom){
            let  query = this.createSelectorQuery();
            return query.select(dom);
        },
        // 检查登录
        _checkLogin() {
            if (!getApp().globalData.haslogin) {
                wx.navigateTo({
                    url: `/pages/others/login/login?redirect_uri=item-detail`
                })
                return false;
            }
            return true;
        },
        collectGoods(){
            if(!this._checkLogin()) return
            let {collect,detail}=this.data;

            ProductTask.goodsCollect(collect,{item_id: detail.item_id},({code,message},result)=>{
                if(code==0){
                    this.setData({collect:!collect});
                    message='商品加入收藏成功';
                }
                //商品收藏dcp埋点
                let {item_id,title} = detail;
                let extraInfo = setExtraInfoScj(item_id, title, null, result.statusCode,code, message);
                !collect ? getApp().dcp.dispatch('customEvent',this.getDom('#dcp-collect'),extraInfo) :null
            })
        },
        // 获取客服链接
        getServiceUrl(queue, loginName, isLogin) {
            let servicePreURL = "https://ncwxapp.tairanmall.com/webchat/jsp/standard/interfacePools.jsp";
            return `${servicePreURL}?from=chat&queue=${queue}&loginName=${loginName}&password=&device=mobile&visit=${isLogin}`;
        },

        onCustomServiceTap(){
            //客服中心接待组队列号serviceQueue
            let serviceQueue = { 1: 3101, 2: 3201 },
                shopAttr=this.data.detail.shop.attr,
                visitorUrl = "";
            shopAttr = shopAttr == 2 ? 2 : 1;
            let globOpenID=getApp().dcp.getDeviceId();//设备id
            globOpenID=encodeURI(globOpenID);
            let that =this;
            if (getApp().globalData.haslogin) {
                wx.showLoading({
                    title:"客服加载中"
                })
                wx.request({
                    url: getApp().globalData.UCUrl + '/foundation-user/user',
                    data: { needPhone: true },
                    method: 'GET',
                    header: { 'Authorization': "Bearer " + getApp().globalData.globtoken },
                    success({data:{code,body,message}}){
                        wx.hideLoading();
                        console.log(that.getServiceUrl(serviceQueue[shopAttr], body.phone, true));
                        
                        if(code==200){
                            visitorUrl = encodeURIComponent(that.getServiceUrl(serviceQueue[shopAttr], body.phone, true));
                            wx.navigateTo({
                                url: "./service/service?serviceUrl=" + visitorUrl
                            });
                        }else{
                            visitorUrl = encodeURIComponent(that.getServiceUrl(serviceQueue[shopAttr], globOpenID, false));
                            wx.navigateTo({
                                url: "./service/service?serviceUrl=" + visitorUrl
                            });
                        }
                    }
                })
            } else {

                visitorUrl = encodeURIComponent(that.getServiceUrl(serviceQueue[shopAttr], globOpenID, false));
                wx.navigateTo({
                    url: "/pages/product/item-detail/service/service?serviceUrl=" + visitorUrl
                });
            }
        },
        onGoHomeTap(){
            wx.switchTab({
                url: "/pages/mall/index"
            });
        },
        btnClick({currentTarget:{dataset}}){
            if(!this._checkLogin()) return
            this.triggerEvent('btnClick',dataset)
        }
    }
})
