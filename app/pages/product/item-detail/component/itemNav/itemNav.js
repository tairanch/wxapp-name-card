Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		navIndex:{
			type:Number,
			value:0
		},
        opacity:{
		    type:Number,
            value:0
        }
	},

	/**
	 * 组件的初始数据
	 */
	data: {
        nav:['商品','评价','详情']
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
        navClickEvent({currentTarget:{dataset}}) {
			this.triggerEvent('navClickEvent', {index:dataset.index})
		},
	}
})
