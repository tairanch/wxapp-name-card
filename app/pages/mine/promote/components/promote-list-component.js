// pages/mine/promote/components/promote-list-component.js
var common = require('../../../../utils/common.js');

Component({
  /**
   * 组件的属性列表
   */
  properties: {

    type: {
      type: String,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {


    dataList: [],

    // 是否处于滚动状态
    loading: false,

    // 当前页面
    currentPage: 1,

    totalPage: 1

  },

  /**
   * 组件的方法列表
   */
  methods: {


    // 我的卡片列表
    _getCustomerFollowNameCardListRequest: function() {

      this.data.loading = true;

      wx.showLoading({
        title: '加载中...',
      })

      let _this = this
      common.getUserCommissionList({

        type: _this.data.type,
        page: this.data.currentPage

      }, (callback) => {

        _this.data.loading = false;

        wx.hideLoading()

        let _data = callback.data.data;
        _this.data.totalPage = Math.ceil(callback.data.count / 25);

        if (_this.data.currentPage === 1) {

          let mapDatas = _this._mapDatas([], _data);
          // 加载第一页数据
          _this.setData({
            dataList: mapDatas
          });

        } else {
          // 加载更多数据
          _this.data.dataList = _this._mapDatas(_this.data.dataList, _data);

          _this.setData({
            dataList: _this.data.dataList
          })
        }
      })
    },


  // 数据匹配
    _mapDatas: function(oldArr = [], newArr = []) {

      newArr.forEach(function(oldData, i) {
        var index = -1;
        var createTime = oldData.created_at.substring(0, 7);
        var alreadyExists = oldArr.some(function(newData, j) {

          if (oldData.created_at.substring(0, 7) === newData.created_at.substring(0, 7)) {
            index = j;
            return true;
          }
        });
        if (!alreadyExists) {
          oldArr.push({
            created_at: oldData.created_at.substring(0, 7),
            month_unPocket_settlement: oldData.month_unPocket_settlement,
            month_Pocket_settlement: oldData.month_Pocket_settlement,
            res: [oldData]
          });
        } else {
          oldArr[index].res.push(oldData);
        }
      });
      return oldArr;
    },


    // 刷新页面
    onRefresh: function() {

      this.data.currentPage = 1;
      // 加载更多数据
      this._getCustomerFollowNameCardListRequest();

    },


    // scrollerview滚动到底部
    onBindscrolltolower: function(e) {

      if (this.data.totalPage > this.data.currentPage && !this.data.loading) {

        this.data.currentPage++

          // 加载更多数据
          this._getCustomerFollowNameCardListRequest();
      }
    }

  },


  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名

    // 在组件实例刚刚被创建时执行
    created() {

    },

    attached() {

      this._getCustomerFollowNameCardListRequest();
/*
      let list = [{
          "id": 47676,
          "user_id": 574998,
          "type": 10,
          "status": 20,
          "amount": "1.00",
          "updated_at": "2019-04-03 15:11:05",
          "month_unPocket_settlement": 19,
          "month_Pocket_settlement": 6
        },
        {
          "id": 47673,
          "user_id": 574998,
          "type": 10,
          "status": 20,
          "amount": "1.00",
          "updated_at": "2019-04-03 15:11:05",
          "month_unPocket_settlement": 19,
          "month_Pocket_settlement": 6
        },
        {
          "id": 47672,
          "user_id": 574998,
          "type": 10,
          "status": 20,
          "amount": "1.00",
          "updated_at": "2019-05-03 15:11:05",
          "month_unPocket_settlement": 19,
          "month_Pocket_settlement": 6
        }
      ]

      let _that = this
      this.setData({

        dataList: _that._mapDatas(list)
      })*/
  }
  }

})
