// pages/shopCart/components/index/component.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        promotion: {
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
    data: {},

    /**
     * 组件的方法列表
     */
    methods: {
        // 产品拼团规则
        onGroupRuleTap() {
            wx.navigateTo({
                url: "/pages/product/groupRule/index"
            });
        }
    }
});
