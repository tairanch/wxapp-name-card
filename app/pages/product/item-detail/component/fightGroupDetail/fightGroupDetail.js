// pages/shopCart/components/index/component.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        item: {
            type: Object,
            value: {}
        },
        user_id: {
            type: String,
            value: ""
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        unUpdate: false,
        time: 0,
        timer: null
    },

    ready() {
        let { expire_time, now_time } = this.data.item;
        expire_time = new Date(expire_time.replace(/-/g, "/")).getTime();
        now_time = new Date(now_time.replace(/-/g, "/")).getTime();
        if (now_time > expire_time) {
            this.setData({ unUpdate: true });
        } else {
            this.setData({ time: (expire_time - now_time) / 1000 });
            this.intervalTime();
        }
    },
    detached() {
        // 页面被被销毁的时候，清除定时器
        clearInterval(this.data.timer);
    },

    /**
     * 组件的方法列表
     */
    methods: {
        intervalTime: function() {
            this.timer = setTimeout(() => {
                let t = --this.data.time;
                if (t < 0) {
                    this.setData({ unUpdate: true });
                } else {
                    this.setData({ time: t });
                    this.intervalTime();
                }
            }, 1000);
        },

        // 跳转到拼团详情页面
        goGroupDetail: function() {
            let { item } = this.data;
            let path = `/pages/wxpage/wxpage?type=groupDetail&object_id=${item.id}&user_id=${item.user_id}&itemFlag=true`;
            wx.navigateTo({                
                url: path
            });
        }
    }
});
