import * as TYPES from "../action-types";
import api from "../../api/index";
export default {
  // 异步action：获取最新的全部订单，并更新redux中的orderList
  queryOrderList() {
    return async dispatch => {
      let data = await api.cart.list();
      // 此处在后端接口设计中，如果所获取的组件数据不存在（为空），则data.code不为0，为1
      // 原例：当data.code为不存在（为空）时，不会派发action任务对象赋值orderList，orderList会保持初始值null
      // 改进：
      if (parseInt(data.code) !== 0) {
        if (parseInt(data.code) === 1) {
          var orderList = [];
        }
        if (parseInt(data.code) === 0) {
          orderList = data.data;
        }
        dispatch({
          type: TYPES.CART_ORDERALL,
          payload: orderList
        });
      }
    };
  },
  // "非编辑"状态下：切换所有购物车订单的“全选/非全选”状态
  updateSelectAll(flag) {
    return {
      type: TYPES.CART_UPDATE_SELECT_ALL,
      flag
    };
  },
  // "非编辑"状态下：切换某个购物车订单的“选中/非选”状态
  updateSelect(cartId, flag) {
    return {
      type: TYPES.CART_UPDATE_SELECT,
      cartId,
      flag
    };
  },
  // "编辑"状态下：切换所有购物车订单的“全选/非全选”状态
  updateSelectAllEdite(flag) {
    return {
      type: TYPES.CART_UPDATE_SELECT_ALL_EDITE,
      flag
    };
  },
  // "编辑"状态下：切换某个购物车订单的“选中/非选”状态
  updateSelectEdite(cartId, flag) {
    return {
      type: TYPES.CART_UPDATE_SELECT_EDITE,
      cartId,
      flag
    };
  },
  // 修改编辑态
  updateEdite(flag) {
    return {
      type: TYPES.CART_UPDATE_EDITE,
      flag
    };
  },
  // 在Cart.jsx中：更新商品数量（同步redux方式②）
  updateCount(cartId, count) {
    return {
      type: TYPES.CART_UPDATE_COUNT,
      cartId,
      count
    };
  },
  // 在Computer.jsx中：删除当前"选中"状态的购物车订单，一次调用只能删除一个（同步redux方式②）
  removeCart(cartId) {
    return {
      type: TYPES.CART_REMOVE,
      cartId
    };
  }
};
