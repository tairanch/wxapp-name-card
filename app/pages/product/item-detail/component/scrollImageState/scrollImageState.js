Component({
    /**
     * 组件的属性列表
     */
    properties: {
        data: {
            type: Object,
			value: {},
        },
        promotion:{
            type: Object,
			value: {},
        },
        current: {
            type: Number,
            value: 0
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        index: 0 //banner
    },

    /**
     * 组件的方法列表
     */
    methods: {
        bannerClick: function(e) {
            let { url } = e.currentTarget.dataset;
            wx.previewImage({
                current: url, // 当前显示图片的http链接
                urls: this.data.data.images // 需要预览的图片http链接列表
            });
        },

        swiperChange: function(e) {
            if (e.detail.source == "touch") {
                //防止swiper控件卡死
                if (this.data.current == 0 && this.data.index > 1) {
                    //卡死时，重置current为正确索引
                    this.setData({ current: this.data.index });
                } else {
                    //正常轮转时，记录正确页码索引
                    this.setData({ index: e.detail.current });
                }
            }
        }
    }
});
