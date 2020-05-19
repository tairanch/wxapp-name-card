// pages/mine/promote/promote-list.js
Page({
    /**
     * 页面的初始数据
     */
    data: {
        // 数据列表
        dataList: [
            {
                time: "111",
                amount: "1000",
                list: [
                    {
                        amount: "100",
                        date: "2019-03-10"
                    },
                    {
                        amount: "100",
                        date: "2019 - 03 - 10"
                    }
                ]
            },

            {
                time: "xxx",
                amount: "111",
                list: [
                    {
                        amount: "100",
                        date: "2019 - 03 - 10"
                    },
                    {
                        amount: "100",
                        date: "2019 - 03 - 10"
                    },
                    {
                        amount: "100",
                        date: "2019 - 03 - 10"
                    },
                    {
                        amount: "100",
                        date: "2019 - 03 - 10"
                    },
                    {
                        amount: "100",
                        date: "2019 - 03 - 10"
                    },
                    {
                        amount: "100",
                        date: "2019 - 03 - 10"
                    },
                    {
                        amount: "100",
                        date: "2019 - 03 - 10"
                    },
                    {
                        amount: "100",
                        date: "2019 - 03 - 10"
                    }
                ]
            },

            {
                time: "xxx",
                amount: "111",
                list: [
                    {
                        amount: "100",
                        date: "2019 - 03 - 10"
                    },
                    {
                        amount: "100",
                        date: "2019 - 03 - 10"
                    }
                ]
            }
        ]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
    
    },

    onShow: function() {
    
    },

    // 刷新页面
    onRefresh: function() {
    
    },

    // 我的卡片列表
    _getCustomerFollowNameCardListRequest: function() {
        wx.showLoading({
            title: "加载中..."
        });

        let _this = this;
        common.getCustomerFollowNameCardList(_res, callback => {
            wx.hideLoading();

            let _data = callback.data;
            _this.setData({
                cardList: _data
            });
        });
    },

    // actions
    onBindscrolltolower: function(e) {},

    onBindscrollupper: function(e) {}
});
