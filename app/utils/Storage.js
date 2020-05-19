var md5 = require("./md5.js");

// 获取app唯一标示
/**
 * 生成规则，从缓存获取，如果没有获取到，根据当前时间戳生成md5的字符串
 */
function getUniqueKey() {
    let uniqueKey = wx.getStorageSync("APP_uniqueKey");
    if (!uniqueKey) {
        var timestamp = new Date().getTime();
        uniqueKey = md5.hex_md5(timestamp);
        wx.setStorage({
            key: "APP_uniqueKey",
            data: uniqueKey
        });
    }
    return uniqueKey;
}

// TODO:登录成功现在没有存储手机号
// 存储手机号
function setPhone(phone) {
    if (phone) {
        wx.setStorage({
            key: "phone_key",
            data: phone
        });
    }
}

// 获取手机号
function phone() {
    return wx.getStorageSync("phone_key");
}

// 清除手机号
function clearPhone() {
    wx.removeStorage({
        key: "phone_key"
    });
}

// 用户信息
function setUserInfo(userInfo) {
    if (userInfo) {
        wx.setStorage({
            key: "userInfo_key",
            data: userInfo
        });
    }
}

function userInfo() {
    return wx.getStorageSync("userInfo_key");
}

function clearUserInfo() {
    wx.removeStorage({
        key: "userInfo_key"
    });
}

// 保存openid
function setOpenID(openID) {
    if (openID) {
        wx.setStorage({
            key: "openID_key",
            data: openID
        });
    }
}

function openID() {
    return wx.getStorageSync("openID_key");
}

module.exports = {
    setPhone: setPhone,
    phone: phone,
    clearPhone: clearPhone,
    setUserInfo: setUserInfo,
    userInfo: userInfo,
    clearUserInfo: clearUserInfo,
    setOpenID: setOpenID,
    openID: openID,
    getUniqueKey: getUniqueKey
};
