import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import HeaderNav from "../../components/HeaderNav";
import "./Order.less";
import actions from "../../store/actions/index";
import api from "../../api/index";

function Order(props) {
  let {
    history,
    location,
    isLogin,
    baseInfo,
    queryBaseInfo,
    orderList,
    queryOrderList,
    queryIsLogin
  } = props;

  // useState状态作为筛选条件筛选组件数据（全部订单）为相应类型的订单
  // 一、根据传进来的问号参数初始化赋值useState状态
  let [active, changeActive] = useState(() => {
    let search = location.search || ""; // 兼容处理，下面使用了字符串下的replace方法
    // 用一个对象来存放正则匹配到的所有问号参数的参数名和参数值
    let searchObj = {};
    // 正则找到问号所传的参数：key为所传问号参数名，value为所传问号参数值
    search.replace(/([^?=&#]+)=([^?=&#]+)/g, (_, key, value) => {
      searchObj[key] = value;
    });
    // useState函数的参数可为函数，函数返回值为此useState状态的初始值
    return parseInt(searchObj.lx) || 0; // 如果没传参，此useState状态的默认值为0
  });

  // 二、根据useState状态（active）筛选订单数据（dataList）
  // 原例：当确实没有订单时，dataList会保持初始值null，则在return中通过三元运算符渲染“没有订单”内容。
  // 优化：在action中，如果依请求返回的code判断出没有订单，会改变dataList为[]
  // dataList与三个值：null、[]、有数据的数组
  let dataList = null;
  if (orderList && orderList.length > 0) {
    if (active === 0) {
      dataList = orderList;
    } else {
      // 根据所传参数渲染筛选相应类型的订单
      // 注：全部订单数据orderList中的各订单数据元素都有state字段，对应当前订单的类型
      dataList = orderList.filter(item => {
        // active是数字类型；dataeList数组（来自于服务端返回的orderList数组）中订单元素的数字属性值都是字符串格式的（Json格式），必要时也要通过parseInte() 进行转换。
        return parseInt(item.state) === active;
      });
    }
  } else if (orderList === []) {
    dataList = orderList;
  }

  // 第一次渲染时触发（包括页面刷新、路由跳转）（componentDidMount）："登录校验"、"获取组件数据（全部订单）"
  useEffect(() => {
    // "订单页"：登录态isLogin如果是true，根据组件数据orderList渲染“已登录”形态；登录态isLogin如果是false，则直接跳转到“登录页”（通过window,alert跳转）。
    async function fertchData() {
      // 第一次渲染这个组件（包括页面刷新、路由跳转）：需先进行“登录校验”
      // 1.“未登录”：直接跳转到“登录页”
      // 2.“已登录”：发送请求获取组件信息，并更新redux中的isLogin、baseInfo、orderList
      // 3.“页面刷新”：重新进行“登录校验”，且在“已登录”下进行数据请求
      // 原例中“第一次渲染”的弊端：
      // 1. 无论redux中的isLogin是何值（full/true/false），都发送了异步请求进行“登录校验”。
      // 2. 进行“登录校验”后没有赋值登录态为true/false。
      // 3. 路由切换回来的情况下，baseInfo、orderList都有，此时不需要“登录校验”，也不需要两个“组件数据获取”
      // 4. 不利于后期拓展。当拓展了能跳转到当前页面的页面组件时，他们的isLogin状态是"已登录"还是"未登录"，他们是否已经请求且赋值了当前页面需要的组件数据

      // 情况①：登录态isLogin为true（路由切换）（由其他"已登录"页面跳转过来，如"已登录"形态的个人中心页）
      if (isLogin) {
        // ！！！虽然当前"订单页"用不到数据baseInfo，但也进行了请求，减少了跳转到之后涉及到此数据的页面组件展示（请求）时间（如个人中心页）。
        if (!baseInfo) {
          queryBaseInfo();
        }
        if (!orderList) {
          queryOrderList();
        }
        return;
      }

      // 情况②：登录态isLogin为false（由其他"未登录"页面跳转过来，如"未登录"形态的个人中心页）
      if (isLogin === false) {
        window.alert("您当前还没有登录，请先登录~~", {
          handled: () => {
            history.push("/personal/login");
          }
        });
      }

      // 情况③：登录态isLogin为null（当前页面被刷新）
      // isLogin都为null了，则redux一定被刷新了，则需在"已登录"状态下"赋值isLogin为true同时，获取组件信息orderList并赋值
      if (isLogin === null) {
        let data = await api.personal.loginGET(); // 此处原例的syncLoginInfo中包括了“登录校验”和“获取组件数据”，所以在syncLoginInfo中多进行了一次请求“登录校验”
        if (parseInt(data.code) !== 0) {
          queryIsLogin(false);
          window.alert("您当前还没有登录，请先登录~~", {
            handled: () => {
              history.push("/personal/login");
            }
          });

          return;
        }
        queryIsLogin(true);
        queryBaseInfo(); // 获取组件信息-用户基本信息baseInfo
        queryOrderList(); // 获取组件信息-全部订单数据orderList
      }
    }
    fertchData();
  }, []);

  return (
    <>
      {isLogin ? (
        // “需登录但非组件数据渲染的公共部分”
        <section className="personalOrder">
          <HeaderNav title="我的订单" />
          <div className="navBox">
            {["全部订单", "待付款", "待收货", "待评价", "退款订单"].map(
              (item, index) => {
                return (
                  <Link
                    key={index}
                    to={"/personal/order?lx=" + index}
                    className={index === active ? "active" : ""}
                    onClick={ev => {
                      changeActive(index); // ！！更改userState状态值为对应标签订单类型的数字，使得组件重新渲染筛选渲染出对应订单类型
                    }}
                  >
                    {item}
                  </Link>
                );
              }
            )}
          </div>
          {/* 处理没有订单的情况（一般需服务器返回一个空数组给dataList） */}
          {dataList ? (
            <ul className="list">
              {/* ！！！遍历dataList数据数组，渲染其中的各订单元素数据 */}
              {dataList.map(item => {
                // li为某订单类型下展示的某个订单详情
                return (
                  <li key={item.id}>
                    {/*  一、订单详情 */}
                    <div className="info">
                      {/* LInk标签包裹，传递路径参数pid，跳转到“商品详情页”  */}
                      <Link to={"/detail/" + item.pid}>
                        {/* （1）订单详情顶部 */}
                        <div className="top">
                          {/* 1.订单商品图 */}
                          <div className="pic">
                            <img src={item.info.pic} alt="" />
                          </div>
                          {/* 2.订单标题 */}
                          <p className="title">{item.info.title}</p>
                          {/* 3.订单价格 */}
                          <div className="price">
                            <span>￥{item.info.discount}</span>
                            <span>x{item.count}</span>
                          </div>
                        </div>
                        {/* （2）订单详情底部 */}
                        <div className="bottom">
                          共{item.count}件商品，总金额
                          {/* 四则运算会把字符串类型转化为数字类型计算，结果是数字类型，如 “45” * “2” = 90   */}
                          <span>￥{item.count * item.info.discount}</span>
                        </div>
                      </Link>
                    </div>

                    {/* 二、按钮操作：根据订单元素中代表类型的state属性进行渲染 */}
                    <div className="handle">
                      {/* dataeList数组中订单元素的很多属性是字符串类型的数字（Json格式），必要时要进行转换 */}
                      {/* 待付款 */}
                      {item.state == 1 ? (
                        <>
                          <button className="cancel">取消</button>
                          <button>支付</button>
                        </>
                      ) : null}
                      {/* 待收获 */}
                      {item.state == 2 ? (
                        <>
                          <button>确认收货</button>
                        </>
                      ) : null}
                      {/* 待评价 */}
                      {item.state == 3 ? (
                        <>
                          <button>写评价</button>
                        </>
                      ) : null}
                      {/* 退款订单 */}
                      {item.state == 4 ? (
                        <>
                          <button>申请退款</button>
                        </>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="noTip">
              <i></i>
              目前没有任何订单哦~
            </div>
          )}
        </section>
      ) : (
        <div>正在进行组件数据（订单数据）请求，请等待</div>
      )}
    </>
  );
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
)(Order);
