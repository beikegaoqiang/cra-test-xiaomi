import axios from "./axios";
const suffix = "/cart";
export default {
  // “订单页”-获取全部订单信息
  // 默认参数为0.     0：全部订单
  list(state = 0) {
    return axios.get(`${suffix}/list`, {
      params: {
        state
      }
    });
  },
  // 新增订单
  add(pid, count = 1) {
    return axios.post(`${suffix}/add`, {
      pid,
      count
    });
  },
  // 修改订单数量
  update(id, count = 1) {
    return axios.post(`${suffix}/update`, {
      id,
      count
    });
  },
  // 移除订单
  remove(id) {
    return axios.get(`${suffix}/remove`, {
      params: {
        id
      }
    });
  },
  // 修改订单状态
  state(id, state = 1) {
    return axios.get(`${suffix}/state`, {
      params: {
        id,
        state
      }
    });
  }
};
