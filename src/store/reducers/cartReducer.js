import * as TYPES from "../action-types";
const initState = {
  orderList: null,
  isSelectAll: true,
  isEdite: false,
  isSelectAllEdite: false
};
export default function cartReducer(state = initState, action) {
  // 函数中的引用类型的参数变量state跟传入的引用类型变量initState存储的是同一个内存地址，所以需要深拷贝一个新的
  // 保证swtich/case操作中不直接操作ininState，从而造成多次组件重新刷新。
  // 直接在函数的最后return返回swtich/case操作后的state进行一次性覆盖。
  state = JSON.parse(JSON.stringify(state));

  switch (action.type) {
    // 赋值更新orderList
    case TYPES.CART_ORDERALL:
      state.orderList = action.payload;
      state.orderList = state.orderList.map(item => {
        // 把从服务器获取的各商品订单自定义一个是否被选中的属性
        item.isSelect = true; // "非编辑"状态下，默认为"选中"状态
        item.isSelectEdite = false; // "编辑"状态下，默认为"非选中"状态
        return item;
      });
      break;

    // "非编辑"状态下：切换所有购物车订单的“全选/非全选”状态
    case TYPES.CART_UPDATE_SELECT_ALL:
      // 1. 更改表示“全选/非全选”的state公共状态
      state.isSelectAll = action.flag;
      // 2. 由“全选/非全选”，更改各个购物车订单的“选中/未选”
      state.orderList = state.orderList.map(item => {
        if (parseInt(item.state) === 1) {
          item.isSelect = state.isSelectAll;
        }
        return item;
      });
      break;

    // "非编辑"状态下：切换某个购物车订单的“选中/非选”状态
    case TYPES.CART_UPDATE_SELECT:
      // 1. 修改目标订单的“选中/未选”状态
      state.orderList = state.orderList.map(item => {
        if (parseInt(item.id) === parseInt(action.cartId)) {
          item.isSelect = action.flag;
        }
        return item;
      });
      // 2. 当有一个购物车订单是“未选”时，更改购物车订单为相应的的“非全选”
      const result = state.orderList.find(
        item => parseInt(item.state) === 1 && item.isSelect === false
      );
      state.isSelectAll = result ? false : true;
      break;

    // "编辑"状态下：切换所有购物车订单的“全选/非全选”状态
    case TYPES.CART_UPDATE_SELECT_ALL_EDITE:
      state.isSelectAllEdite = action.flag;
      state.orderList = state.orderList.map(item => {
        if (parseInt(item.state) === 1) {
          item.isSelectEdite = state.isSelectAllEdite;
        }
        return item;
      });
      break;

    // "编辑"状态下：切换某个购物车订单的“选中/非选”状态
    case TYPES.CART_UPDATE_SELECT_EDITE:
      state.orderList = state.orderList.map(item => {
        if (parseInt(item.id) === parseInt(action.cartId)) {
          item.isSelectEdite = action.flag;
        }
        return item;
      });
      const result2 = state.orderList.find(
        item => parseInt(item.state) === 1 && item.isSelectEdite === false
      );
      state.isSelectAllEdite = result2 ? false : true;
      break;

    case TYPES.CART_UPDATE_EDITE:
      state.isEdite = action.flag;
      break;

    case TYPES.CART_UPDATE_COUNT:
      state.orderList = state.orderList.map(item => {
        if (parseInt(item.id) === parseInt(action.cartId)) {
          item.count = action.count;
        }
        return item;
      });
      break;

    case TYPES.CART_REMOVE:
      state.orderList = state.orderList.filter(item => {
        return parseInt(item.id) !== parseInt(action.cartId);
      });
      break;
  }
  return state;
}
