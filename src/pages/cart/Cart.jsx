import React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import "./Cart.less";
// import Recoment from "./Recoment";
import Computed from "./Computed";
import HeaderNav from "../../components/HeaderNav";
import Pay from "../../components/Pay";
import actions from "../../store/actions/index";
import api from "../../api/index";

// 页面私有组件：提示组件封装
function Tip(props) {
  // type = 0 未登录
  // type = 1 没有数据
  const type = props.type;
  return (
    <div className="noTip">
      <i></i>
      {type === 0 ? (
        <>
          您还没有登录~
          <Link to="/personal/login">立即登录</Link>
        </>
      ) : (
        "购物车该没有信息哦，先去逛逛吧~"
      )}
    </div>
  );
}

class Cart extends React.Component {
  state = {
    payVisable: false
  };

  componentWillMount() {
    let {
      history,
      isLogin,
      baseInfo,
      orderList,
      queryIsLogin,
      queryBaseInfo,
      queryOrderList
    } = this.props;

    async function fertchData() {
      // 情况①：登录态isLogin为true（路由切换）（其他页面跳转过来）
      if (isLogin) {
        if (!baseInfo) {
          // 组件数据baseInfo为null
          queryBaseInfo();
        }
        if (!orderList) {
          // 组件数据orderList为null
          queryOrderList();
        }
        return; // redux中的组件数据都有值(一定是最新数据)，直接退出函数
      }

      // 情况③：登录态isLogin为null（页面刷新）
      if (isLogin === null) {
        let data = await api.personal.loginGET();
        if (parseInt(data.code) !== 0) {
          // '未登录"
          queryIsLogin(false);
          return;
        }
        queryIsLogin(true);
        queryBaseInfo();
        queryOrderList();
      }
    }
    // 注：不进行isLogin === false时的处理，直接渲染“未登录”形态下的组件
    fertchData();
  }

  render() {
    // 一、获取redux中的公共状态
    let {
      isLogin,
      // baseInfo,
      orderList,
      // queryOrderList,    // 原例
      updateSelect,
      updateSelectEdite,
      isEdite,
      updateEdite
    } = this.props;
    // 二、获取"支付蒙层"显示/隐藏的私有状态
    let { payVisable } = this.state;

    // if (baseInfo && !orderList) queryOrderList();   // 原例
    // 三、筛选全部订单orderList得出购物车订单
    if (orderList && orderList.length > 0) {
      orderList = orderList.filter(item => parseInt(item.state) === 1);
    }

    // 四、render渲染函数中的return语句
    return (
      <section className="cartBox">
        {/* 页面公共组件：页头 */}
        <HeaderNav title="购物车">
          {isLogin ? (
            <span
              onClick={ev => {
                updateEdite(!isEdite); // redux属性方法，切换"编辑/非编辑"
              }}
            >
              {isEdite ? "完成" : "编辑"}
            </span>
          ) : null}
        </HeaderNav>

        {/* 注：！！！此处未区分渲染isLogin为null或false，都统一渲染为“未登录” */}
        {!isLogin ? (
          <Tip type={0} />
        ) : orderList ? (
          orderList.length === 0 ? (
            <Tip type={1} />
          ) : (
            <div className="list">
              {orderList.map(item => {
                const S = isEdite ? item.isSelectEdite : item.isSelect,
                  US = isEdite ? updateSelectEdite : updateSelect;
                return (
                  <Link
                    to={"/detail/" + item.pid}
                    className="clearfix"
                    key={item.id}
                  >
                    {/* 一、订单的选中/非选（！！！设置当有类名active即为选中） */}
                    <i
                      className={S ? "check active" : "check"}
                      onClick={ev => {
                        ev.preventDefault();
                        US(item.id, !S);
                      }}
                    ></i>
                    {/* 二、订单中的商品图片 */}
                    <div className="pic">
                      <img src={item.info.pic} alt="" />
                    </div>
                    {/* 三、订单中的商品名、价格 */}
                    <div className="desc">
                      <p>{item.info.title}</p>
                      <p>￥{item.info.discount}</p>
                    </div>
                    {/* 四、订单中的商品数量 */}
                    <div className="count">
                      {/* // 1.减少商品数量 */}
                      <i
                        className={
                          // ！！！最小值处理：减到1之后就置灰，且在点击事件回调函数中进行判断，使得回调函数虽被触发但失效
                          parseInt(item.count) === 1 ? "minus disable" : "minus"
                        }
                        onClick={ev => {
                          ev.preventDefault();
                          this.handle("minus", item.count, item.id);
                        }}
                      ></i>
                      {/* // 2.展示商品数量 */}
                      <input type="number" disabled value={item.count} />
                      {/* // 3.增加商品数量 */}
                      <i
                        className="plus"
                        onClick={ev => {
                          ev.preventDefault();
                          this.handle("plus", item.count, item.id);
                        }}
                      ></i>
                    </div>
                  </Link>
                );
              })}
              {/* 底部结算栏：筛选后生成的购物车订单有订单时(> 0)才显示 */}
              {/* 子传父1：将Cart组件中改变state私有状态的属性方法传递给Pay子组件 */}
              <Computed updateVisable={this.updateVisable} />
            </div>
          )
        ) : (
          <div>正在进行“获取组件数据”(orderList)异步请求</div>
        )}
        {/* <Recomend /> */}

        {/* 支付蒙层：通过state私有状态、普通变量、含setState的属性方法实现父子通信 */}
        <Pay
          payVisable={payVisable}
          orderList={orderList} // 传入的是筛选之后得到的购物车订单
          // 子传父1：将Cart组件中改变state私有状态的属性方法传递给Pay子组件
          updateVisable={this.updateVisable}
        />
      </section>
    );
  }
  // 改变Cart组件的state私有状态payVisable
  updateVisable = flag => {
    this.setState({
      payVisable: flag
    });
  };
  // 增加/减少订单中的商品数量，点击事件的回调函数。
  handle = async (lx, count, cartId) => {
    if (lx === "minus") {
      if (count <= 1) return;
      count--;
    } else {
      count++;
    }
    // 1. 向服务器发请求修改订单状态信息
    let result = await api.cart.update(cartId, count);
    if (parseInt(result.code) === 1) {
      window.alert("当前网络繁忙，请稍后再试~~");
      return;
    }
    //2. 同步redux方式②
    // 原例：syncOrderList()
    this.props.updateCount(cartId, count);
  };
}
export default connect(
  state => {
    return {
      ...state.personal,
      ...state.cart
    };
  },
  {
    ...actions.personal,
    ...actions.cart
  }
)(Cart);
