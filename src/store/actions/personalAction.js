import * as TYPES from "../action-types";
import api from "../../api/index";
export default {
  // 同步action：在"登录页"登录成功后，修改“登录态”、存储用户信息
  loginSuccess(data) {
    return {
      type: TYPES.PERSONAL_LOGIN_SUCCESS,
      payload: data
    };
  },
  // 同步action："登录校验"
  queryIsLogin(payload) {
    return {
      type: TYPES.PERSONAL_LOGIN_ISLOGIN,
      isLogin: payload
    };
  },
  // 异步action：当登录态为"已登录"的时候再"获取当前已登录用户信息"
  queryBaseInfo() {
    return async dispatch => {
      let data = await api.personal.info();
      if (parseInt(data.code) === 0) {
        dispatch({
          type: TYPES.PERSONAL_LOGIN_INFO,
          isLogin: true,
          baseInfo: data.data
        });
      }
    };
  },
  // 退出登录
  resetBaseInfo() {
    return {
      type: TYPES.PERSONAL_LOGIN_INFO,
      isLogin: false,
      baseInfo: null
    };
  }
};
