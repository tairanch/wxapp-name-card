// pages/component/swiperCtrlWidgetCom/swiperCtrlWidget.js
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    ctrlWidth: {  //编辑区域宽度
      type: Number
    }, 
    disMove: {   // 禁止move
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal, changedPath) {
        if (!oldVal && newVal) {
          this.setData({
            scrollLeft: 0
          })
        }
      }
    },
    isOpen: {    //是否打开编辑区域
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal, changedPath) {
        if (!newVal) {
          this.setData({
            scrollLeft: 0
          })
        }
      }
    },
    isNeedAddClassifyButton: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    touchStartPageX: 0,
    touchStartPageY: 0,
    scrollLeft: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getIsOpen(status) {
      this.triggerEvent('controlOpen', {
        status: status
      })
    },
    _touchStart(e) {
      //判断是否只有一个触摸点
      if (this.properties.disMove) return
      if (e.touches.length == 1) {
        this.triggerEvent('startTough', {
          status: true
        })
        this.setData({
          touchStartPageX: e.changedTouches[0].pageX,
          touchStartPageY: e.changedTouches[0].pageY
        })
      }
    },
    _touchmove(e) {
      if (this.properties.disMove) return
      let touchEndPageX = e.changedTouches[0].pageX,
        offSetStartToEndX = touchEndPageX - this.data.touchStartPageX;
      const ctrlWidth = this.properties.ctrlWidth
      // 左滑动
      if (!this.properties.isOpen && offSetStartToEndX < -10) {  
        if (-ctrlWidth  <= offSetStartToEndX ) {
          this.setData({
            scrollLeft: offSetStartToEndX + 'rpx',
          });
        } 
      } 
    },
    _touchEnd(e) {
      if (this.properties.disMove) return
      let touchEndPageX = e.changedTouches[0].pageX,
          touchEndPageY = e.changedTouches[0].pageY,
          offSetStartToEndY = touchEndPageY - this.data.touchStartPageY,
          offSetStartToEndX = touchEndPageX - this.data.touchStartPageX;
      if (Math.abs(offSetStartToEndY) > Math.abs(offSetStartToEndX)){
        this.closeScroll()
        return
      }
      const halfCtrlWidth = this.properties.ctrlWidth / 2
      if (offSetStartToEndX > this.properties.ctrlWidth & offSetStartToEndX < -(this.properties.ctrlWidth)) {
        return;
      };
      if (offSetStartToEndX > 10) { // 右滑
        this.closeScroll()
      }  
      if (offSetStartToEndX < -10) { // 左滑
        if (offSetStartToEndX <= -(halfCtrlWidth)) {
          this.openScroll()
        } else {
          this.closeScroll()
        }
      }
    },
    closeScroll() {
      this.triggerEvent('controlOpen', {
        status: false
      })
      if (this.data.scrollLeft === 0) return;
      this.setData({
        scrollLeft: 0
      });
    },
    openScroll() {
      this.setData({
        scrollLeft: -this.properties.ctrlWidth + 'rpx',
      }, () => {
        this.triggerEvent('controlOpen', {
          status: true
        })
      })
    },
    onTap(event, cb) { // 是否执行点击事件
      let touchEndPageX = event.changedTouches[0].pageX,
        offSetStartToEnd = touchEndPageX - this.data.touchStartPageX;
      if (offSetStartToEnd < 10 & offSetStartToEnd > -10) {
        cb && cb()
      } else {
        // cb && cb()
        return
      }
    }
  }
})
