// pages/mine/address/index.js
import createPage from '../../../store/westore/createPage'


createPage({

    /**
    * 页面的初始数据
    */
    data: {

    },
    selectAdd(){
        console.log(this.store.data.params)
        /*this.store.orderConfirm.loadData({
            buyMode:"cart_buy",
            bizMode:"online",
            bizAttr:"trmall",
            subscribe:JSON.stringify([{"quantity":3,"cart_id":450574,"item_id":53524,"sku_id":103745,"extra":{"promotion":[]},"created_at":"2019-05-30 10:35:44"},{"quantity":2,"cart_id":450567,"item_id":66107,"sku_id":129020,"extra":{"promotion":[]},"created_at":"2019-05-30 10:35:44"}]),
            address:""
        },(res)=>{
            console.log(res);
            wx.navigateBack()
        },(error)=>{
            console.log(error)
        })*/

        // this.store.orderConfirm.loadData({a:5},(res)=>{
        //     this.store.data.orderConfirm.address=res;
        //     this.store.update();
        //     wx.navigateBack()
        // })
    },
    /**
    * 生命周期函数--监听页面加载
    */
    onLoad: function (options) {

    },
    /**
    * 生命周期函数--监听页面初次渲染完成
    */
    onReady: function () {

    },

    /**
    * 生命周期函数--监听页面显示
    */
    onShow: function () {

    },

    /**
    * 生命周期函数--监听页面隐藏
    */
    onHide: function () {

    },

    /**
    * 生命周期函数--监听页面卸载
    */
    onUnload: function () {

    },

    /**
    * 页面相关事件处理函数--监听用户下拉动作
    */
    onPullDownRefresh: function () {

    },

    /**
    * 页面上拉触底事件的处理函数
    */
    onReachBottom: function () {

    },

    /**
    * 用户点击右上角分享
    */
    onShareAppMessage: function () {

    }
})
