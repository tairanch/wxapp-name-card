const app = getApp();
const MD5 = require('./md5.js');


/**
 * 原始时间格式化时间
 * @param date      时间格式
 * @param sepStr    分割符，默认使用斜杠: "/"
 * @returns timeStr 时间字符串："2019/04/22 15:42:24"
 */
const formatTime = (date, sepStr) => {

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    let str = sepStr ? sepStr : '/';

    return [year, month, day].join(str) + ' ' + [hour, minute, second].join(':');
};

/**
 * 按照传入格式，格式化时间
 * @param fmt 目标格式字符串
 * @returns timeStr 时间字符串："2019/04/22 15:42:24"
 */
const dateFormat = function (fmt) {
    let date = new Date();
    let o = {
        "M+": date.getMonth() + 1,               //月份
        "d+": date.getDate(),                    //日
        "h+": date.getHours(),                   //小时
        "m+": date.getMinutes(),                 //分
        "s+": date.getSeconds(),                 //秒
        "q+": Math.floor((date.getMonth() + 3) / 3),
        "S": date.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (let k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};

/**
 * [成功提示]调用微信成功toast提示，持续500毫秒
 * @param text 显示内容
 * @constructor
 */
function ToastSuccess(text){
    wx.showToast({
        title: text,
        icon: 'success',
        duration: 500
    });
}

/**
 * [普通提示]调用微信普通toast提示，持续2000毫秒
 * @param text 显示内容
 * @constructor
 */
function MessageToast(text)
{
    wx.showToast({
        title: text,
        icon: 'none',
        duration: 2000
    })
}

/**
 * md5加密
 * @param str 加密内容
 * @returns {*}
 */
function md5(str)
{
    return MD5.hex_md5(str)
}

/**
 * 图片拼接
 *
 * 大图 中图 小图 微图
 */
let addImageSuffix=(url, size)=> {
    return url = (/image.tairanmall.com\//.test(url)) ? url + size + ".jpg" : url
};

const timeUtils = {
    //获取格式化时间
    formatDate(time) {
        if (isNaN(Number(time))) return "";
        time = new Date(time * 1000);
        return {
            year: time.getFullYear(),
            month: this.toTwoDigit(time.getMonth() + 1),
            date: this.toTwoDigit(time.getDate()),
            hour: this.toTwoDigit(time.getHours()),
            minute: this.toTwoDigit(time.getMinutes()),
            second: this.toTwoDigit(time.getSeconds())
        }
    },
    toTwoDigit(num) {
        return num < 10 ? "0" + num : num;
    },
    //时间格式化
    timeFormat(time) {
        let dateObj = this.formatDate(time);
        if (!dateObj) {
            return "";
        }
        let { year, month, date } = dateObj;
        return year + "." + month + "." + date;
    },
    //具体时间格式化
    detailFormat(time) {
        let dateObj = this.formatDate(time);
        if (!dateObj) {
            return "";
        }
        let { year, month, date, hour, minute, second } = dateObj;
        return `${year}-${month}-${date} ${hour}:${minute}:${second}`;
    },
    //格式化中文时间
    cnFormat(time) {
        let dateObj = this.formatDate(time);
        if (!dateObj) {
            return "";
        }
        let { month, date, hour, minute } = dateObj;
        return `${month}月${date}日${hour}:${minute}`
    },
};

module.exports = {
    formatTime,
    ToastSuccess,
    MessageToast,
    dateFormat,
    md5: md5,
    addImageSuffix,
    timeUtils
};
