import React from "react";
import { connect } from "react-redux";
import "./Computed.less";
import actions from "../../store/actions/index";
import api from "../../api/index";

// 函数方法封装 1：
// "非编辑状态"：统计显示非编辑"状态下的"选中"状态的"待付款"订单金额
function computedPrice(orderList) {
  // 如果redux中的全部订单orderList数量就是0，那么就不进行之后的filter筛选操作
  if (orderList.length === 0) {
    return 0;
  }
  // 筛选全部订单得出"待付款"订单(购物车订单)
  orderList = orderList.filter(item => parseInt(item.state) === 1);
  if (orderList.length === 0) return 0;
  return orderList.reduce((result, item) => {
    // ！！！兼容处理：如果某一项计算值出错就返回其计算结果为0
    if (item.isSelect) {
      return result + parseFloat(item.count * item.info.discount) || 0;
    }
    // ！！！如果是“未选中”状态，也许返回累加值
    return result;
  }, 0);
}

// 函数方法封装 2：
// "非编辑状态"：子传父调用父级传过来的属性方法控制父组件弹出支付蒙层前，验证筛选当前"非编辑"状态是否有"选中"状态的订单。当有订单时，才弹出支付蒙层。
function handlePay(orderList) {
  // redux中的全部订单orderList数量就是0：不用再进行之后的filter筛选操作
  if (orderList.length === 0) {
    window.alert("当前没有可以支付的购物车订单哦~~");
    return;
  }
  // 筛选"非编辑"状态下的"选中"状态的"待付款"订单(购物车订单)
  orderList = orderList.filter(
    item => parseInt(item.state) === 1 && item.isSelect === true
  );
  // 筛选得到的购物车订单orderList的数量为0：返回为false，不再打开蒙层
  if (orderList.length === 0) {
    window.alert("请选择您要支付的选项~~");
    return false;
  }
  return true;
}

// 函数方法封装 3：
// "编辑状态"：在服务端和redux中删除"选中"状态的购物车订单
function handleRemove(orderList, props) {
  // 如果redux中的全部订单orderList数量就是0，那么就不进行之后的filter筛选操作
  if (orderList.length === 0) {
    window.alert("当前没有可以删除的购物车订单哦~~");
    return;
  }
  orderList = orderList.filter(
    item => parseInt(item.state) === 1 && item.isSelectEdite === true
  );
  // 筛选之后得到的购物车订单orderList的数量为0
  if (orderList.length === 0) {
    window.alert("请选择您要删除的选项~~");
    return;
  }
  // 递归async函数：多次发送异步请求一个个删掉在"编辑"状态下，"选中"状态的购物车订单
  async function remove(orderList) {
    // ！！！递归函数结束条件
    if (orderList.length === 0) {
      window.alert("选中的全部商品都已经被移除~~");
      return;
    }
    const item = orderList[0];
    const result = await api.cart.remove(item.id);
    if (parseInt(result.code) !== 0) {
      window.alert("删除失败，请稍后重试~~");
      return;
    }
    // 去掉数组中的第一个元素
    orderList.shift();
    // 同步redux方式②
    props.removeCart(item.id);
    // 递归：只要没在此之前return接受执行，每次执行完async函数后，重复调用一次
    remove(orderList);
  }
  // 触发递归函数
  remove(orderList);
}

function Computed(props) {
  const {
    isSelectAll,
    updateSelectAll,
    orderList,
    isEdite,
    isSelectAllEdite,
    updateSelectAllEdite
  } = props;
  const SA = isEdite ? isSelectAllEdite : isSelectAll,
    USA = isEdite ? updateSelectAllEdite : updateSelectAll;

  return (
    <div className="computedBox">
      {/* 一、所有购物车订单的“全选/非全选”状态 */}
      <div
        className="check"
        onClick={ev => {
          USA(!SA); // 调用redux属性方法切换“全选/非全选”
        }}
      >
        <i className={SA ? "active" : ""}></i>
        <span>全选</span>
      </div>
      {/* 二、"编辑/非编辑"状态下的差别渲染 */}
      {isEdite ? (
        // "编辑"状态：删除"选中"状态的购物车订单
        <div className="result">
          <button
            onClick={ev => {
              window.alert("真的要删除当前选中的购物车订单吗~~", {
                confirm: true,
                handled: type => {
                  if (type === "CONFIRM") {
                    handleRemove(orderList, props); // 传入redux中的全部订单lorderList、redux中的状态和方法
                  }
                }
              });
            }}
          >
            删除
          </button>
        </div>
      ) : (
        // "非编辑"状态：所有"选中"状态的购物车订单的统计金额 + "去支付"
        <div className="result">
          <p>
            {/* 传入redux中的全部订单lorderList、redux中的状态和方法 */}
            合计：<span>￥{computedPrice(orderList)}</span>
          </p>
          <button
            onClick={ev => {
              // 调用属性方法handlePay判断当前是否有“选中”状态的购物车订单
              if (handlePay(orderList)) {
                // 子传父2：调用父组件中改变state私有状态的属性方法，打开蒙层
                props.updateVisable(true);
              }
            }}
          >
            去支付
          </button>
        </div>
      )}
    </div>
  );
}

export default connect(state => state.cart, actions.cart)(Computed);
