// pages/mine/invoice/components/elec-invoice/index.js
import MineTask from "../../../../../AppService/mineTask.js";

Component({
    /**
     * Component properties
     */
    properties: {
        // 发票信息
        invoiceInfo: {
            type: Object
        }
    },

    /**
     * Component initial data
     */
    data: {
        selectedIndex: 0, // 0 个人、1 企业
        title: "", // 发票名称
        type: "", // type 发票类型 ：1 普通发票；2 增值税发票；3 电子发票
        action: "", // 开票行为：1 个人；2 公司
        content_option: "", // 发票内容,
        unit_name: "", // 单位名称
        receiver_name: "", // 收件人姓名
        taxpayer_idNumber: "", // 纳税人编号
        reg_address: "", // 注册地址
        reg_tel: "", // 注册电话
        open_bank: "", // 开户行
        bank_account: "", // 银行卡号
        receiver_region: "", // 收货信息
        receiver_address: "", // 收货地址
        receiver_email: "", // 邮箱
        receiver_tel: "", // 电话
        invoice_id: "" // 发票id
    },

    /**
     * Component methods
     */
    methods: {
        // 发票
        onRadioChange: function(e) {
            let index = parseInt(e.detail.value);
            this.setData({
                selectedIndex: index
            });
        },

        // 确定
        _sureButton: function() {
            let params = this._getInvoiceParams();

            MineTask.saveInvoice(
                params,
                function(result) {
                    wx.navigateBack({
                        delta: 1 // 回退前 delta(默认为1) 页面
                    });
                },
                function(error) {
                    wx.showToast({
                        title: "发票保存失败",
                        icon: "none"
                    });
                }
            );
        },

        // 获取发票参数
        _getInvoiceParams: function() {
            // 个人电子发票
            if (this.data.selectedIndex === 0) {
                if (!this.data.title) {
                    this._showMessage("请输入发票抬头");
                    return;
                }

                if (!this.data.receiver_email) {
                    this._showMessage("请输入收票人邮箱");
                    return;
                }
            } else {
                // 企业电子发票
                if (!this.data.title) {
                    this._showMessage("请输入纳税人识别码");
                    return;
                }
            }

            return {
                title,
                type: 3,
                action: this.data.selectedIndex == 0 ? 1 : 2,
                content_option: "明细",
                taxpayer_idNumber: this.data.taxpayer_idNumber
                    ? this.data.taxpayer_idNumber
                    : "",
                reg_address: this.data.reg_address ? this.data.reg_address : "",
                reg_tel: this.data.reg_tel ? this.data.reg_tel : "",
                open_bank: this.data.open_bank ? this.data.open_bank : "",
                bank_account: this.data.bank_account
                    ? this.data.bank_account
                    : ""
            };
        },

        // 显示提示信息
        _showMessage(message) {
            wx.showToast({
                title: message,
                icon: "none"
            });
        }
    }
});
