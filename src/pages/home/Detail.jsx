import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import Swiper from "swiper";
import "./Detail.less";
import api from "../../api/index";
import actions from "../../store/actions/index";

function Detail(props) {
  let {
    history,
    isLogin,
    baseInfo,
    orderList,
    queryIsLogin,
    queryBaseInfo,
    queryOrderList
  } = props;

  const [data, changeData] = useState(null);

  // 一、DidMount：发送异步请求获取商品详细信息，并赋值useState状态data
  useEffect(() => {
    //=>useEffect传递的函数不允许直接async，需要在里面单独定义函数处理
    async function fetchData() {
      // const id = props.match.params.id || 0;  只要是受路由管控的组件，props下都会多三个对象属性，match对象属性下的param默认值为空对象

      // ？？？？在订单页Order.jsx中：<Link to={"/detail/" + item.pid}>
      const id = props.match.params ? props.match.params.id : 0; // 此处也可不做兼容，没有路径参数时，params也为空对象
      const data = await api.product.info(id);
      if (parseInt(data.code) === 0) {
        //=>获取数据成功
        changeData(data.data);
        return;
      }
      //=>获取数据失败
      window.alert("当前商品数据获取失败，请检查地址的有效性~~");
    }
    fetchData();
  }, []);

  // 二、限定的compoentDidMount+componentDidUpdate：当依赖项useState状态data改变时触发。SWIPER5轮播图
  useEffect(() => {
    // 必须保证data有值的时候才将容器传入new Swiper
    if (data) {
      // 轮播图的目标容器为detail-swiper，可多次使用
      new Swiper(".detail-swiper", {
        // direction: 'vertical',    // 垂直切换，默认为水平切换
        // 循环模式打开
        loop: true,
        // 分页器配置项
        pagination: {
          el: ".swiper-pagination" // 其实是.detail-swiper .swiper-pagination
          // type: 'fraction'    // 分页器样式
        },
        // 自动播放配置项
        autoplay: {
          delay: 2000,
          disableOnInteraction: false
        }
      });
    }
  }, [data]);

  // 原例：
  // const baseInfo = props.personal.baseInfo;
  // useEffect(() => {
  //   if (!baseInfo) {
  //     props.syncLoginInfo();
  //   }
  // }, []);
  // 原例：
  // let orderList = props.cart.orderList;
  // if (baseInfo) {
  //   if (!orderList) {
  //     props.syncOrderList();
  //   }
  // }
  // 三、DidMount："登录校验"、"获取组件数据（全部订单）"
  useEffect(() => {
    // "商品详情页"（类同个人中心页）：登录态isLogin如果是true，根据组件数据orderList、data渲染“已登录”形态；登录态isLogin如果是false， 则不做跳转，渲染“未登录”下的形态。
    async function fetchData() {
      // 情况①：登录态isLogin为true（路由切换）（由其他"已登录"页面跳转过来，如"已登录"形态的个人中心页）
      if (isLogin) {
        if (!baseInfo) {
          queryBaseInfo();
        }
        if (!orderList) {
          queryOrderList();
        }
        return;
      }
      // 情况③：登录态isLogin为null（当前页面被刷新）
      // isLogin都为null了，则redux一定被刷新了，则需在"已登录"状态下"赋值isLogin为true同时，获取组件信息orderList并赋值
      if (isLogin === null) {
        let data = await api.personal.loginGET();
        if (parseInt(data.code) !== 0) {
          queryIsLogin(false);
          return;
        }
        queryIsLogin(true);
        queryBaseInfo(); // 获取组件信息-用户基本信息baseInfo
        queryOrderList(); // 获取组件信息-全部订单数据orderList
      }
    }
    // 注：不进行isLogin === false "未登录"情况的处理，直接渲染“未登录”形态下的组件
    fetchData();
  }, []);

  // 四、DidMount+DidUpdate：选"全部订单"出状态为1的订单（待付款订单）
  if (orderList.length > 0) {
    orderList = orderList.filter(item => {
      return parseInt(item.state) === 1;
    });
  }

  // 五、点击按钮-"加入购物车"
  async function handle(ev, type) {
    ev.preventDefault(); // 阻止a链接的默认跳转行为
    // 1. "登录校验"还未完成：点击时不做任何操作
    if (isLogin === null) {
      return;
    }
    // 2. "未登录"（isLogin为false）：点击时跳转到登录页
    if (!isLogin) {
      window.alert("请您先登录~~", {
        handled: () => {
          history.push("/personal/login");
        }
      });
      return;
    }
    // 3. "已登录"：“加入购物车”，向服务器发送api异步请求增加订单（成功后同步REDUX） data.id=>当前商品ID
    let result = await api.cart.add(data.id);
    if (parseInt(result.code) !== 0) {
      window.alert("网络繁忙，请稍后再试~~");
      return; // 如果‘加入购物车’请求失败，下面就不需要再同步redux了
    }
    // 同步redux方式①：同步redux中的全部订单数据orderList
    queryOrderList();
  }

  return (
    <>
      {data ? (
        <section className="detailBox">
          {/*    */}
          {/* 第一层容器 .detail-swiper */}
          <div className="swiper-container detail-swiper">
            {/* 第二层容器 .swiper-wrapper */}
            <div className="swiper-wrapper">
              {/* map渲染各个图片：div.swiper-slide */}
              {data.images.map((item, index) => {
                return (
                  <div className="swiper-slide" key={index}>
                    <img src={item} alt="" />
                  </div>
                );
              })}
            </div>
            {/* 分页器 */}
            <div className="swiper-pagination"></div>
          </div>
          {/* 二、商品信息 */}
          <div className="info">
            <div className="price">
              <span className="price1">￥{data.discount}</span>
              {data.discount === data.price ? null : (
                <span className="price2">￥{data.price}</span>
              )}
              {data.tag.split("|").map((item, index) => {
                return item ? ( // "".split('|') === [""]
                  <span className="tag" key={index}>
                    {item}
                  </span>
                ) : null;
              })}
            </div>
            <h5 className="title">{data.title}</h5>
            <p className="desc">{data.detail.text}</p>
          </div>
          {/* 三、固定广告图 */}
          {/* 在JSX中导入静态资源图片（相对地址），需要基于CommonJS/ES6Module规范导入，保证webpack编译的时候地址的正确性 */}
          <img
            src={require("../../assets/images/ce497b9d0341ac785d77e343dddab7e7.png")}
            alt=""
            className="guanggao"
          />
          {/* 四、商品图片详情 */}
          <div className="xiangxi">
            {/* ！！！注意一定要保证images是个数组，才能对其使用map方法。可以后端搞定，也可以前端添加校验 */}
            {data.detail.images.map((item, index) => {
              return <img src={item} alt="" key={index} />;
            })}
          </div>
          {/* 五、页面顶部 */}
          <div className="topBtn">
            <a
              className="return"
              onClick={ev => {
                props.history.go(-1); // 返回上一页
              }}
            ></a>
            <a
              className="home"
              onClick={ev => {
                props.history.push("/"); // 回到主页
              }}
            ></a>
          </div>
          {/* 六、页面底部 */}
          <div className="bottomBtn">
            {/* 6.1 购物车 */}
            <div
              className="cartIcon"
              onClick={ev => {
                props.history.push("/cart");
              }}
            >
              {orderList && orderList.length > 0 ? (
                <em>
                  {orderList.reduce((result, item) => {
                    return result + parseInt(item.count);
                  }, 0)}
                </em>
              ) : null}
              <i></i>
              <span>购物车</span>
            </div>
            {/* 按钮 */}
            <div className="btn">
              <a
                onClick={ev => {
                  handle(ev, "ADD");
                }}
              >
                加入购物车
              </a>
              <a
                onClick={ev => {
                  handle(ev, "PAY");
                }}
              >
                立即购买
              </a>
            </div>
          </div>
        </section>
      ) : (
        <div>正在进行组件数据请求（当前商品详情）</div>
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
)(Detail);
