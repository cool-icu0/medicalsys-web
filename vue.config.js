const {  
  defineConfig  
} = require('@vue/cli-service')  
  
module.exports = defineConfig({  
  transpileDependencies: true,  
  devServer: {  
    port: 5173,  
    proxy: {  
      '/api': { // 当请求以/api开头时，代理到目标服务器  
        target: 'http://localhost:8039', // 目标服务器地址  
        ws: true, // 如果你的应用使用websockets，设置为true  
        changeOrigin: true, // 如果接口跨域，需要进行这个参数配置  
        pathRewrite: {  
          '^/api': '' // 重写路径，例如将/api/xxx重写为/xxx  
        }  
      }  
    }  
  },  
  chainWebpack: config => {  
    config.plugin('html')  
      .tap(args => {  
        args[0].title = "大郎!!!该喝药了 ~";
        return args;  
      })  
  }  
})