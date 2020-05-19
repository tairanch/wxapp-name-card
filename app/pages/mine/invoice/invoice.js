/*
 * @Author: zhufengyi
 * @Date: 2019-05-28 14:52:34
 * @Last Modified by: zhufengyi
 * @Last Modified time: 2019-05-28 16:17:19
 */

import mineTask from "../../../AppService/mineTask.js";
Page({
    /**
     * Page initial data
     */
    data: {
        shop_ids: [],

        /**
         * 当前选中的下标
         */
        selectedIndex: 0
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function(options) {
        this.data.shop_ids = options.shop_ids;

        // TODO:测试店铺
        this.data.shop_ids = [8];

        // 获取发票列表
        this._getInvoiceListRequest();
    },

    /**
     * 获取发票列表
     */
    _getInvoiceListRequest() {
        
        mineTask.getInvoice(
            this.data.shop_ids,
            function(result) {                
            },

            function(error) {                
            }                                   
        );
    },

    /**
     * action 选择tap
     */
    onSelectInvoiceTap: function(e) {
        let index = parseInt(e.currentTarget.dataset.index);
        this.setData({
            selectedIndex: index
        });
    },

    /**
     * 滚动改变时调用
     */
    onSwiperValueChanged: function(e) {
        let currentIndex = parseInt(e.detail.current);
        this.setData({
            selectedIndex: currentIndex
        });
    },

    // 点击确定按钮
    onSureButtonTap: function() {
        switch (this.data.selectedIndex) {
            case 0:
                {
                    let component = this.selectComponent("#elec");
                    component._sureButton();
                }
                break;
            case 1:
                {
                    let component = this.selectComponent("#normal");
                    component._sureButton();
                }
                break;
            case 2:
                {
                    let component = this.selectComponent("#vat");
                    component._sureButton();
                }
                break;

            default:
                break;
        }
    }
});
