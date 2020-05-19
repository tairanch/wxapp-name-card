import create from './create.js'
import store from '../index.js'

//包含dcp埋点
const createPage = (opts) => {
  return create(store, opts)
};
export default createPage
