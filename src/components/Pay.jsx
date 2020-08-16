import React, { useState } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import "./Pay.less";
import api from "../api/index";
import actions from "../store/actions/index";

// 自定义函数方法封装：点击一次九宫格中的键就触发一次
function handle(ev, arr, changeArr, orderList, props) {
  const target = ev.target,
    text = target.innerHTML;
  // 一、事件冒泡验证：只有通过span标签触发的点击事件才有效
  if (target.tagName !== "SPAN") return;
  // 二、点击的是“数字”
  if (!isNaN(text)) {
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      if (item === null) {
        arr[i] = parseInt(text);
        break;
      }
    }
    changeArr([...arr]);
    return;
  }
  // 三、点击的是“删除”
  if (text === "删除") {
    for (let i = arr.length - 1; i >= 0; i--) {
      let item = arr[i];
      if (item !== null) {
        arr[i] = null;
        break;
      }
    }
    changeArr([...arr]);
    return;
  }
  // 四、点击的是“确认”：支付
  if (text === "确认") {
    // 1. 发送请求验证支付密码的正确性（但此处没写这个后台接口），所以此处直接写死：888888
    if (arr.join("") !== "888888") {
      window.alert("密码不正确~~");
      return;
    }
    // 2. 筛选购物车订单orderList，得出"非编辑"状态-"选中"状态的购物车订单
    orderList = orderList.filter(item => item.isSelect === true);
    // 3. 发送多个请求改变当前"非编辑"状态-"选中"状态的购物车订单的状态
    let PromiseArr = orderList.map(item => {
      return api.cart.state(item.id, 2);
    });
    // 4.
    Promise.all(PromiseArr)
      .then(results => {
        // 最好还需要验证一下，每一个的code是都都为0
        const flag = results.find(item => {
          return parseInt(item.code) !== 0;
        });
        if (!flag) {
          // 成功
          window.alert("支付成功~~", {
            handled: () => {
              props.queryOrderList();
              props.history.push("/personal/order?lx=2");
            }
          });
          return;
        }
        // ！！！返回Promise错误，触发catch
        return Promise.reject();
      })
      .catch(reason => {
        window.alert("部分订单支付失败，请稍后再试~~");
      });
  }
}

function Pay(props) {
  const { payVisable = false, orderList = [], updateVisable } = props;

  let [arr, changeArr] = useState(new Array(6).fill(null));

  return (
    <div
      className="payBox"
      style={{
        display: payVisable ? "block" : "none"
      }}
    >
      {/* "支付蒙层"：关闭 */}
      <a
        className="closeBtn"
        onClick={ev => {
          changeArr(new Array(6).fill(null));
          updateVisable(false);
        }}
      >
        关闭
      </a>
      {/* "支付蒙层"：标题 */}
      <h4>请输入支付密码（六位数字）</h4>
      {/* "支付蒙层"：密码显示区域 */}
      <div className="center">
        {arr.map((item, index) => {
          return (
            <input
              type="password"
              disabled
              key={index}
              value={item !== null ? item : ""}
            />
          );
        })}
      </div>
      {/* "支付蒙层"：九宫格键盘 */}
      <div
        className="keyBox clearfix"
        // 事件冒泡
        onClick={ev => {
          // 传入自定义函数：useState状态、useState状态方法、变量、props
          handle(ev, arr, changeArr, orderList, props);
        }}
      >
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
        <span>6</span>
        <span>7</span>
        <span>8</span>
        <span>9</span>
        <span>0</span>
        <span>删除</span>
        <span>确认</span>
      </div>
    </div>
  );
}

export default withRouter(connect(null, actions.cart)(Pay));
