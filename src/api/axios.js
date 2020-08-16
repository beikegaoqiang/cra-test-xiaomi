import axios from "axios";
import qs from "qs";
axios.defaults.baseURL = "http://127.0.0.1:9999";
axios.defaults.timeout = 10000;
// 跨域请求：允许在跨域资源请求的时候携带资源凭证，才能显示出cookie（说明此项目的后台配置的不是所有源*访问）
axios.defaults.withCredentials = true;
axios.defaults.headers["Content-Type"] = "application/x-www-form-urlencoded";
axios.defaults.transformRequest = data => qs.stringify(data);
/* 
axios.interceptors.request.use(config => {
	let token = localStorage.getItem('token');
	token && (config.headers.Authorization = token);
	return config;
}, error => {
	return Promise.reject(error);
}); 
axios.defaults.validateStatus = status => {
	return /^(2|3)\d{2}$/.test(status);
};
*/
// 响应拦截：异步请求失败下的操作
axios.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          break;
        case 403:
          break;
        case 404:
          break;
      }
    } else {
      if (!window.navigator.onLine) {
        return;
      }
      return Promise.reject(error);
    }
  }
);
export default axios;
