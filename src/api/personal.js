import axios from "./axios";
import md5 from "blueimp-md5";
const suffix = "/user";
export default {
  // 1.“注册页”/“登录页”-验证手机号是否被注册过了
  phone(phone) {
    return axios.post(`${suffix}/phone`, {
      phone
    });
  },
  // 2.“注册页”/“登录页”-发送短信验证码
  code(phone) {
    return axios.post(`${suffix}/code`, {
      phone
    });
  },
  // 3.“注册页”-验证输入的验证码是否正确
  checkCode(phone, code) {
    return axios.post(`${suffix}/checkCode`, {
      phone,
      code: md5(code)
    });
  },
  // 4.“注册页”-注册信息发送
  register(name, phone, password, passwordPay) {
    return axios.post(`${suffix}/register`, {
      name,
      phone,
      password: md5(password),
      passwordPay: md5(passwordPay)
    });
  },
  // 5.“登录页”-验证是否登录
  loginGET() {
    return axios.get(`${suffix}/login`);
  },
  // 6.“登录页”-登录
  loginPOST(account, password, type = 1) {
    // type=1 :默认登录方式为账号密码登录
    return axios.post(`${suffix}/login`, {
      account,
      password: md5(password), // 也可以在组件传参前将密码参数进行加密
      type
    });
  },
  // 7.“登录页”-退出登录
  signout() {
    return axios.get(`${suffix}/signout`);
  },
  // 8.“登录页”-获取所传id对应下的用户信息
  info(id) {
    // 如果不传参，获取的是当前登录者的信息
    let params = {};
    if (id) {
      params.id = id;
    }
    return axios.get(`${suffix}/info`, {
      params
    });
  }
};
