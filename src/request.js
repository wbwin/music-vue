import axios from "axios";
// import { getCookie } from "./common";
import qs from "qs";
// import api from "./api";
var instance = axios.create({
  timeout: 50000, //请求超时的时间
  baseURL:
    process.env.NODE_ENV === "production"
      ? "http://www.xiaopangjs.top:3000"
      : "http://www.xiaopangjs.top:3000", //请求的域名
  headers: { "Content-Type": "application/x-www-form-urlencoded" }
});

var showAlert = "";
axios.defaults.withCredentials = true
instance.interceptors.request.use(
  function(config) {
    
    const key = '';
    // const key = 'dd3f0f8a77cc8031e51af961fa48850b';
    // 判断如果存在showAlert 那么保存
    showAlert = true;

    if (config.method.toUpperCase() == "POST") {
      if (config.data.__proto__.hasOwnProperty("append")) {
      } else {
        if (config.data && config.data.hasOwnProperty("showAlert")) {
          showAlert = config.data.showAlert;
          delete config.data.showAlert;
        }
        // 序列化
        config.data = qs.stringify(
          Object.assign(
            {
              key: key,
              client: "wap"
            },
            qs.parse(config.data)
          )
        );
      }
    } else {
      if (config.params && config.params.hasOwnProperty("showAlert")) {
        showAlert = config.params.showAlert;
        delete config.params.showAlert;
      }
      config.params = Object.assign(
        {
          key: key,
          client: "wap"
        },
        config.params
      );
    }
    return config;
  },
  function(error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    setTimeout(() => {
      // window.vm.$vux.loading.hide();
    }, 200);
    if (response.data.code != 200) {
      if (response.data.message === "请登录") {
        try {
          app.login();
        } catch (err) {
          console.log('请登录')
          // window.vm.$vux.toast.show({
          //   text: "请登录",
          //   type: "text"
          // });
          // 错误抛出
          console.log("====调用原生app.login()失败！====");
        }
      } else {
        if (showAlert) {
          // window.vm.$vux.toast.show({
          //   text: response.data.message,
          //   type: "text"
          // });
        }
        return Promise.reject(response);
      }
    } else {
      return Promise.resolve(response);
    }
  },
  error => {
    // window.vm.$vux.loading.hide();
    // 对响应错误做点什么
    // window.vm.$vux.alert.show({
    //   title: "提示信息",
    //   content: "请求超时"
    // });
    console.log('请求超时')
    return Promise.reject("请求超时");
  }
);
export default instance;