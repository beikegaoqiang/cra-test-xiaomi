import axios from "./axios";
const suffix = "/product";
export default {
  // 传入id获取相应商品详情（默认id为0）
  info(id = 0) {
    return axios.get(`${suffix}/info`, {
      params: {
        id
      }
    });
  }
};
