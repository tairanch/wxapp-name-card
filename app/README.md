#泰然城小程序

##项目地址：

https://rep.360taihe.com/ds/wxapp-trmall.git

##开发分支：

feature-mini-program

###登录逻辑及流程
加载权限判断页面 pages/others/beforelogin/index
如果未授权就展示授权内容 授权就用授权信息进行登录校验
登录成功拿到token 跳转首页 否则跳转登录页

跳转登录页： 为校验从 h5 进登录，再次进行了授权校验，
未授权 跳授权页
授权 登录校验 
新用户走注册登录一体
