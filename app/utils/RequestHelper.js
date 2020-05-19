const app = getApp()
var util = require('./util.js');
//get请求
let RequestGet = function RequestGet(url, params, callBack, failueBack, hidenToast) {
  if (!hidenToast) {
    wx.showLoading({
      title: '加载中',
    })
  }
  var that = this;
  wx.request({
    url: url + "?" + paramsHandle(params),
    method: 'GET',
    header: setHeader(),
    success: function(res) {
      wx.hideLoading()
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh()
      resulHandle(res, callBack,failueBack)
    },
    fail: function(res) {
      wx.hideLoading()
      if (failueBack) {
        failueBack(res)
      } else {
          util.MessageToast(res.message)
      }
    },
    complete: function(res) {
      if (res.errMsg.indexOf('timeout') != -1 || res.errMsg.indexOf('time out') != -1) {
        wx.showModal({
          title: '提示',
          content: '请求超时，是否重试',
          success(res) {
            if (res.confirm) {
              if (params.code) {
                wx.login({
                  success(res) {
                    if (res.code) {
                      params.code = res.code
                      RequestGet(url, params, callBack, failueBack, hidenToast)
                    } else {
                      console.log('重新获取code失败！')
                    }
                  }
                })
              }else{
                RequestGet(url, params, callBack, failueBack, hidenToast)
              }
              
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    }
  })
}

//get请求
let RequestGetNoLoading = function RequestGet(url, params, callBack, failueBack, hidenToast) {
  var that = this;
  wx.request({
    url: url + "?" + paramsHandle(params),
    method: 'GET',
    header: setHeader(),
    success: function (res) {
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh()
      resulHandle(res, callBack)
    },
    fail: function (res) {
      if (failueBack) {
        failueBack(res)
      } else {
        util.MessageToast(res.message)
      }
    },
    complete: function (res) {
      if (res.errMsg.indexOf('timeout') != -1 || res.errMsg.indexOf('time out') != -1) {
        wx.showModal({
          title: '提示',
          content: '请求超时，是否重试',
          success(res) {
            if (res.confirm) {
              if (params.code) {
                wx.login({
                  success(res) {
                    if (res.code) {
                      params.code = res.code
                      RequestGet(url, params, callBack, failueBack, hidenToast)
                    } else {
                      console.log('重新获取code失败！')
                    }
                  }
                })
              } else {
                RequestGet(url, params, callBack, failueBack, hidenToast)
              }

            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    }
  })
}

// post请求
let RequestPost = function RequestPost(url, params, callBack, failueBack, hidenToast) {
  if (!hidenToast) {
    wx.showLoading({
      title: '加载中',
    })
  }
  wx.request({
    url: url,
    data: paramsHandlePost(params),
    method: 'POST',
    header: setHeader(),
    success: function (res) {
      wx.hideLoading()
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh()
      resulHandle(res, callBack, failueBack)

    },
    fail: function (res) {
      wx.hideLoading()
      if (failueBack) {
        failueBack(res)
      }
    },
    complete: function(res) {
      if (res.errMsg.indexOf('timeout') != -1 || res.errMsg.indexOf('time out') != -1) {
        wx.showModal({
          title: '提示',
          content: '请求超时，是否重试',
          success(res) {
            if (res.confirm) {
              if (params.code) {
                wx.login({
                  success(res) {
                    if (res.code) {
                      params.code = res.code
                      RequestPost(url, params, callBack, failueBack, hidenToast)
                    } else {
                      console.log('重新获取code失败！')
                    }
                  }
                })
              }else{
                RequestPost(url, params, callBack, failueBack, hidenToast)
              }
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    }
  })
}
// 请求参数处理
function paramsHandle(params) {
  return Object.keys(params).map(key => {
    return key + '=' + encodeURIComponent(params[key])
  }).join('&')
}

function paramsHandlePost(params) {
  return params
}

//请求头配置
function setHeader() {
    let token = ''
    try {
        const value = wx.getStorageSync('namecardtoken')
        if (getApp().globalData.globtoken) {
          token = getApp().globalData.globtoken
        }else if(value){
          let _datajson = JSON.parse(value)
            token = _datajson.token
            getApp().globalData.globtoken = _datajson.token
            getApp().globalData.haslogin = true
        }
    } catch (e) {
        // Do something when catch error
    }
  var header = {
    // "content-type": "application/x-www-form-urlencoded",
    "X-Channel": "TrMall",
    "X-Platform-Type": "XCX",
    "X-Platform-From": "TrMall",
    "X-Device-Info": "UserAgent",
    "Cookie": "token=" + token
  }

  if (getApp().globalData.addSpecHead == 'wxbind'){
    header.Authorization = 'Bearer ' + token;
  }
  return header
}
// 请求结果处理
function resulHandle(result, callBack, failueBack) {
    if(result.data.code === 401) { // 临时判断 需要优化 用户商品详情页
      getApp().globalData.globtoken = null
      getApp().globalData.haslogin = false
      try {
        wx.removeStorageSync('namecardtoken')
      } catch (e) {
        // Do something when catch error
      }
        callBack(result.data)
    } else if(result.data.code == 0 || (result.statusCode && result.statusCode == 200)){
      if (callBack) {
          callBack(result.data)
      }
    }else if (result.statusCode && result.statusCode == 400) {

        util.MessageToast(result.data.message);
    }else{
      if (result.data.message && result.data.message.indexOf('token') == -1) {
          if (failueBack) {
              failueBack(result)
          }
          if (result.data.message && result.data.message.indexOf('服务器') == -1) {
              util.MessageToast(result.data.message)
          }
      }else{
        util.MessageToast(result.data.message)
      }
    }

}



module.exports = {
    RequestGet: RequestGet,
    RequestGetNoLoading: RequestGetNoLoading,
    RequestPost: RequestPost,
    paramsHandle: paramsHandle,
    setHeader: setHeader,
}
