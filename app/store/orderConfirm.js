// import RequestManager from '../utils/RequestHelper'
import  AppService  from '../AppService/index'
export default {
    data:{
        params:{},
        address:{a:1},
    },
    /*
    * 地址切换后需要再次请求接口
    * */
    loadData:function(cb,failCb){
        console.log(this.data.params)
        // AppService.MineTask.getOrderInit(this.data.params,(res)=>{
        //     typeof cb == "function" && cb(res)
        // },(error)=>{
        //     typeof failCb == "function" && failCb(error)
        // });
    }
}
