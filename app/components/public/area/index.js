import Area from './area'
Component({
    /**
    * 组件的属性列表
    */
    properties: {
        AreaIndex:{
            type:Array,
            value:[0,0,0]
        },
        region:{
            type:Array,
            value:[]
        }
    },

    /**
    * 组件的初始数据
    */
    data: {
        AreaArray:[],
    },

    /**
    * 组件的方法列表
    */
    methods: {
        /**
         * 地区选择，确认操作
         */
        bindRegionChange({detail:{value}}) {
            let {AreaArray} = this.data,area={};
            let pName=AreaArray[0][value[0]].name,
                cName=AreaArray[1][value[1]].name,
                dName=AreaArray[2].length>0 ? AreaArray[2][value[2]].name : '';
            let _p=AreaArray[0][value[0]],
                _c=AreaArray[1][value[1]],
                _d=AreaArray[2].length>0?AreaArray[2][value[2]]:{code:"",name:""};
            area.province = {code:_p['code'],text:_p['name']};
            area.city = {code:_c['code'],text:_c['name']};
            area.district = {code:_d['code'],text:_d['name']};
            this.triggerEvent('setArea',{area,region:[pName,cName,dName]})


            // this.setData({
            //     region:[pName,cName,dName],
            //     AreaIndex:value,
            // })
        },
        /**
         * 地区选择变化后
         */
        bindRegionColumnChange({detail:{value,column}}) {
            let {AreaArray,AreaIndex} = this.data;
            let province = AreaArray[0], city = AreaArray[1], district = AreaArray[2];
            switch (column) {
                case 0:
                    city = province[value].cities;
                    district = city[0].districts || [];
                    // this.triggerEvent('setAreaIndex',{AreaIndex: [value, 0, 0] });
                    break;
                case 1:
                    district = city[value].districts || [];
                    // this.triggerEvent('setAreaIndex',{AreaIndex: [AreaIndex[0], value, 0] });
                    break;
                default:
                    break;
            }
            this.setData({AreaArray: [province, city,district]});
        },
        loadData(){
            this.setData({AreaArray: [Area, Area[0].cities,[]]});
        }
    },
    attached(){
        this.loadData()
    }
})
