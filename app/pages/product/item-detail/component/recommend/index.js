import ProductTask from '../../../../../AppService/productTask'

Component({
    /**
    * 组件的属性列表
    */
    properties: {
        itemId:{
            type:String,
            value:""
        },
    },

    /**
    * 组件的初始数据
    */
    data: {
        list:[]
    },

    /**
    * 组件的方法列表
    */
    methods: {
        loadData(){
            let params={
                terminal:'H5',
                page_count:6,
                item_id:this.data.itemId
            };
            ProductTask.getViewBack(params,({code,data})=>{
                if(code==0){
                    this.setData({list:data.items})
                }
            })
        },
        goDetail({currentTarget:{dataset}}){
            wx.navigateTo({
                url: '/pages/product/item-detail/index?&itemId=' + dataset.id
            })
        }
    },
    attached() {
        // this.loadData()
    }
})
