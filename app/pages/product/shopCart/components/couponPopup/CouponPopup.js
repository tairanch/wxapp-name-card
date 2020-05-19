// pages/product/shopCart/components/couponPopup/CouponPopup.js
let dateUtil = {

  formatNum: function (n) {
    if (n < 10) return '0' + n;
    return n;
  },

  parse: function (dateStr, formatStr) {
    if (typeof dateStr === 'undefined') return null;
    if (typeof formatStr === 'string') {
      var _d = new Date(formatStr);

      var arrStr = formatStr.replace(/[^ymd]/g, '').split('');
      if (!arrStr && arrStr.length != 3) return null;

      var formatStr = formatStr.replace(/y|m|d/g, function (k) {
        switch (k) {
          case 'y':
            return '(\\d{4})';
          case 'm':
          case 'd':
            return '(\\d{1,2})';
        }
      });

      var reg = new RegExp(formatStr, 'g');
      var arr = reg.exec(dateStr)

      var dateObj = {};
      for (var i = 0, len = arrStr.length; i < len; i++) {
        dateObj[arrStr[i]] = arr[i + 1];
      }
      return new Date(dateObj['y'], dateObj['m'] - 1, dateObj['d']);
    }
    return null;
  },

  format: function (date, format) {
    if (!date) {
      return null
    }
    if (arguments.length == 2 && typeof format === 'boolean') {
      format = date;
      date = new Date();
    }
    if (!date.getTime) {
      date = new Date(parseInt(date));
    }

    typeof format != 'string' && (format = 'Y年M月D日 H时F分S秒');
    return format.replace(/Y|y|M|m|D|d|H|h|F|f|S|s/g, function (a) {
      switch (a) {
        case "y":
          return (date.getFullYear() + "").slice(2);
        case "Y":
          return date.getFullYear();
        case "m":
          return date.getMonth() + 1;
        case "M":
          return dateUtil.formatNum(date.getMonth() + 1);
        case "d":
          return date.getDate();
        case "D":
          return dateUtil.formatNum(date.getDate());
        case "h":
          return date.getHours();
        case "H":
          return dateUtil.formatNum(date.getHours());
        case "f":
          return date.getMinutes();
        case "F":
          return dateUtil.formatNum(date.getMinutes());
        case "s":
          return date.getSeconds();
        case "S":
          return dateUtil.formatNum(date.getSeconds());
      }
    });
  }
};
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    couponData: {  // 优惠券信息
      type: Object,
      observer: function (newVal, oldVal, changedPath) {
        this.changeData(newVal)
      }
    },
    shopName: {    // 店铺名称
      type: String
    }
  },

  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
      this.setData({
        show: true
      })
      this.changeData()
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false, // 是否展示
    selfData: '',
    receive: {}  // 优惠券使用列表
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getPrice(num) {
      return parseFloat(num).toString().split(".")
    },
    onSure() { //关闭
      this.setData({
        show: false
      }, () => {
        this.triggerEvent('close')
      });
    },
    _stopPropagation(event) {
      return
    },
    turnLink(event) {
      let couponid = event.currentTarget.dataset.couponid
      wx.navigateTo({
        url: '/pages/wxpage/wxpage?type=searchResult&coupon_id=' + couponid
      })
    },
    receiveCoupon(event) { //领取优惠券
      let dataset = event.currentTarget.dataset
      let couponid = dataset.couponid
      let receive = Object.assign({}, this.data.receive)
      receive[couponid] = false
      this.triggerEvent('receiveCoupon',{
        couponId: couponid,
        cb: () => {
          this.setData({ receive: receive });
        }
      })
    },
    changeData(val) {
      let couponData = JSON.parse(JSON.stringify(val || this.properties.couponData))
      const receive = {}
      if (couponData.coupons && couponData.coupons.length) {
        if (couponData.coupons) {
          couponData.coupons.forEach((coupon) => {
            receive[coupon.coupon_id] = true
          })
        }
        couponData.coupons.forEach((item) => {
          if (item.use_start_time){
            item.use_start_time = dateUtil.format(new Date(item.use_start_time.replace(/-/g, '/')).getTime(), "Y/M/D H:F").slice(2)
          }
          if (item.use_end_time) {
            item.use_end_time = dateUtil.format(new Date(item.use_end_time.replace(/-/g, '/')).getTime(), "Y/M/D H:F").slice(2)
          }
        })
        
      }
      this.setData({
        receive: receive,
        selfData: couponData
      })
    }
  }
})
