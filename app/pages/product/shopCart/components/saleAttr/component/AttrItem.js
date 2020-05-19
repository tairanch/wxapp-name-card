// pages/product/shopCart/components/saleAttr/component/AttrItem.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    attrData: {
      type: Object
    },
    skus: {
      type: Array
    },
    specs: {
      type: Array
    },
    allAttr: {
      type: Array
    },
    selectedSpecs: {
      type: Object,
      observer: function (newVal, oldVal, changedPath) {
        this.initAttr()
      }
    }
  },
  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
      this.initAttr()
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    ret: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initAttr() {
      let ret = [];
      const { attrData } = this.properties
      const { values, spec_id } = attrData
      let judgeSingleSku = this.judgeSingleSku()
      if (values && values.length > 0) {
        values.map((value, i) => {
          let spec_value_id = value.spec_value_id
          let className = "off" //on no
          let judgeSelect = this.judgeSelect()
          let judgeNoSku = this.judgeNoSku(spec_value_id)
          if (judgeSingleSku) {
            className = "on"
          } else {
            if (judgeSelect == spec_value_id) {
              className = "on"
            }
            if (judgeNoSku) {
              className = "no"
            }
          }
          let hasStore = (className != "no") ? true : false
          ret.push({
            className,
            spec_value_id,
            spec_id,
            image: value.image ? value.image:'',
            text: value.text,
            onClick: !judgeSingleSku && hasStore
          })
        })
      }
      console.log(ret)
      this.setData({
        ret: ret
      })
    },
     //判断是否是单规格(无规格)
    judgeSingleSku() {
      let specs = this.properties.specs;
      let isSingleSku
      if (specs) {
        if (specs.length === 1 && specs[0].values.length === 1) {
          isSingleSku =  true;
        } else {
          isSingleSku = false
        }
      } else {
        isSingleSku = true
      }
      return isSingleSku
    },
    judgeNoSku(spec_value_id) {
      const { allAttr, selectedSpecs, attrData} = this.properties
      const { spec_id } = attrData
      let isNo = true
      let selectedSpecsKeys = Object.keys(selectedSpecs)
      let other_spec_value_id = []
      selectedSpecsKeys.map((s) => {
        if (s !== spec_id.toString()) {
          other_spec_value_id.push(selectedSpecs[s])
        }
      })
      allAttr.some((ar) => {
        let hasOther = true
        other_spec_value_id.some((other) => {
          if ((other || other === 0 || other === '0') && ar.indexOf(other.toString()) < 0) {
            hasOther = false
            return true
          } else {
            return false
          }
        })
        if (hasOther) {
          if (ar.indexOf(spec_value_id.toString()) > -1) {
            isNo = false
          }
        }
        if (!isNo) {
          return true
        } else {
          return false
        }
      })
      return isNo
    },
    judgeSelect () {
      const { attrData, selectedSpecs } = this.properties
      const { spec_id } = attrData
      return selectedSpecs[spec_id]
    },
    attrSelect(event) { //选择属性
      const dataset = event.currentTarget.dataset
      const { specid, specvalueid, onclick } = dataset
      if (onclick){
        this.triggerEvent('saleAttrSelect', {
          spec_id: specid,
          spec_value_id: specvalueid
        })
      }
    },
    selectSingleAttr(event) {
      const dataset = event.currentTarget.dataset
      const { specid, specvalueid, onclick, classname } = dataset
      let isSelected = classname === 'on' ? true : false
      if (onclick) {
        this.triggerEvent('selectSingleAttr', {
          spec_id: specid,
          spec_value_id: specvalueid,
          is_selected: isSelected
        })
      }
    }
  }
})
