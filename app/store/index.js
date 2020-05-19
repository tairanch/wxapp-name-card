import exchangeItem from './exchangeItem.js'
import shopCart from './shopCart.js'
import itemIndex from './itemIndex.js'
import orderConfirm from './orderConfirm'
const commonData = {}

// 页面和组件上同样需要声明依赖的 data，这样 westore 会按需局部更新。如 Page 的 data
// 比起原生小程序增强的功能是提供了 data 函数属性
function storeMixin(options) {
  let result = {
    data: commonData,
    globalData: []    // globalData 里声明的 path，只要修改了对应 path 的值，就会刷新所有页面和组件 eg: globalData: ['globalPropTest', 'ccc.ddd'],
  }
  for (let k in options) {
    let value = options[k];
    if (value.data) {
      result.data[k] = value.data
    }
    Object.assign(result, {
      [k]: value
    })
  }
  return result;
}

export default storeMixin({ exchangeItem, shopCart,itemIndex,orderConfirm})
