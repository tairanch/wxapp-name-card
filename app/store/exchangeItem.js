export default {
  data: {
    data: null
  },
  setData: function (exData) {
    if (exData){
      this.data.data = JSON.parse(JSON.stringify(exData))
    } else {
      this.data.data = null
    }  
  }
}