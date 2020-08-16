import * as TYPES from "../action-types";
const initState = {
  // 本地“登录态”标识符
  isLogin: null,
  // 用户信息
  baseInfo: null
};
export default function personalReducer(state = initState, action) {
  state = JSON.parse(JSON.stringify(state));
  switch (action.type) {
    // 同步action：在“登录页”登录成功后，修改“登录态”和“当前已登录用户信息”
    case TYPES.PERSONAL_LOGIN_SUCCESS:
      state.isLogin = true;
      state.baseInfo = action.payload;
      break;

    // 异步action：“登录校验”
    case TYPES.PERSONAL_LOGIN_ISLOGIN:
      state.isLogin = action.isLogin;

    // 异步action：“获取当前已登录用户信息”
    case TYPES.PERSONAL_LOGIN_INFO:
      state.isLogin = action.isLogin;
      state.baseInfo = action.baseInfo;
      break;
  }
  return state;
}
