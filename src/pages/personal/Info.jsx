import React, { useEffect } from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import "./Info.less";
import actions from "../../store/actions/index";
import api from "../../api/index";

// 横幅标签封装：“个人中心”中用到的小组件封装（需转换为受路由管控组件才能获取到props下的history对象）
const TipBox = withRouter(function(props) {
  let { title, link, icon, history } = props;
  return (
    <div
      className="tipBox"
      onClick={ev => {
        if (link) {
          // 传了路径才能通过history.push进行跳转
          history.push(link);
        }
      }}
    >
      <div className="title">
        <i className={"icon " + (icon || "")}></i>
        <span>{title}</span>
      </div>
      <div className="arrow"></div>
    </div>
  );
});

function Info(props) {
  let {
    history,
    isLogin,
    baseInfo,
    queryIsLogin,
    queryBaseInfo,
    resetBaseInfo
  } = props;

  // 原例：
  // 参数二为空数组的useEffect：相当于周期函数compoentDidMount，只在第一次渲染（包括页面刷新、组件跳转）时触发
  // useEffect(() => {
  //   // 如果baseInfo为初始值null,则调用redux属性方法syncLoginInfo进行“登录校验”+“获取当前已登录用户信息”
  //   // 疑问：在“登录页”中已经通过syncLoginInfo获取了用户信息并赋给了baseInof，为何在“个人中心”页中还要进行判断获取？？？
  //   // 答：因若在“个人中心”页面进行刷新，redux会被清空重置，baseInof就为null，那么就需再进行“登录校验”+“获取当前已登录用户信息”
  //   // 注：在其他需要登录的页面也进行刷新时，redux也会被清空重置，故在生命周期内都需进行“登录校验”+“获取当前已登录用户信息”。
  //   if (baseInfo) {
  //     return;
  //   }
  //   syncLoginInfo(); // 在此redux属性方法中进行了“登录校验”和“组件数据获取”
  // }, []); // 第二个参数为空数组

  // state公共状态值细分优化：“登录校验”、“获取当前已登录用户信息”改进。一方面代码的语义化更好，另一方面是为了区分渲染state公共状态不同值下的组件渲染，使渲染情况更明确清晰，更对应真实情况。
  // ① isLogin初始化值改为null（原例是false），“登录校验”完成后，“已登录”时赋值isLogin为true，“未登录”时赋值isLogin为false。
  // ② 将action模块下的syncLoginInfo函数拆分成"登录校验"（await请求+同步action）、"获取当前已登录用户信息"（同步action）
  useEffect(() => {
    // "个人中心"：页面渲染情况介绍：登录态isLogin如果是true，根据组件数据baseInfo渲染“已登录”形态；登录态isLogin如果是false， 不做跳转，渲染“未登录”下的形态。
    async function fertchData() {
      // 情况①：登录态isLogin为true（路由切换）（由其他"已登录"页面跳转过来）
      if (isLogin) {
        // 组件数据baseInfo为null
        if (!baseInfo) {
          // redux属性方法：派发异步action赋值“组件数据”baseInfo
          queryBaseInfo();
        }
        return;
      }
      // 情况②：登录态isLogin为null（当前页面被刷新）
      if (isLogin === null) {
        let data = await api.personal.loginGET();
        if (parseInt(data.code) !== 0) {
          // redux属性方法：派发同步action赋值“登录态”isLogin为false
          queryIsLogin(false);
          return;
        }
        // redux属性方法：派发同步action赋值“登录态”isLogin为true
        queryIsLogin(true);
        // redux属性方法：派发异步action赋值“组件数据”baseInfo
        queryBaseInfo();
      }
    }
    // 注：不进行isLogin === false "未登录"情况的处理，直接渲染“未登录”形态下的组件
    fertchData();
  }, []);
  // 注：
  // 1. "登录校验"为await+同步action：是为了实现异步操作的先后顺序，即等"登录校验"完成后且登录态"已登录"时才进行组件数据请求
  // 2. 虽在queryBaseInfo（异步action的）中会将isLogin赋值为true（保险），但却不能省略queryIsLogin(true)的原因是：保证在组件数据请求的过程中，登录态isLogin是为true的，而不是等组件数据请求完成后再把登录态isLogin赋值为true。比如在“个人中心”/“订单页”中就能展示isLogin为true，但组件数据还未null的组件渲染状态。

  return (
    <div className="personalBox">
      {/* 一、头部 */}
      <div className="header">
        <div className="pic">
          {/* baseInfo没请求回来时(null)，展示图片就展示默认的背景图(background url)，如果请求回来了，用img标签进行覆盖*/}
          {baseInfo ? <img src={baseInfo.pic} alt="" /> : null}
        </div>
        <p
          className="account"
          onClick={ev => {
            // 如果“已登录true”：点击后啥事也不干
            if (isLogin) return;
            // 如果“正登录校验full”/“未登录false”：JS动态路由跳转，点击文字跳转到“个人中心-登录页”
            history.push("/personal/login");
          }}
        >
          {/* “已登录true”：展示用户名 、“未登录false”：“请登录”、“正登录校验”：“请等待”*/}
          {/* 避免在组件数据的请求过程中（isLogin为false，baseInfo为null时）也被统一渲染成“请登录” */}
          {isLogin
            ? baseInfo
              ? baseInfo.name
              : "正在进行组件数据请求baseInfo"
            : isLogin === null
            ? "正在进行登录校验"
            : "请登录"}
        </p>
      </div>

      {/* 二、横幅标签-“我的订单” */}
      <TipBox title="我的订单" icon="icon6" link="/personal/order" />

      {/* 三、中部导航栏 */}
      <div className="orderIcon">
        {/* 也可以把此map对象下的React元素封装成组件渲染 */}
        {["待付款", "待收货", "待评价", "退款/售后"].map((item, index) => {
          const text = "/personal/order?lx=" + (index + 1); // 此处的问号传参有参数名和参数值
          return (
            // ！！！map对象下的各React元素要设置key属性
            <Link to={text} className="item" key={index}>
              <i className="icon"></i>
              <span>{item}</span>
            </Link>
          );
        })}
      </div>

      {/* 四、中部广告图 */}
      <a className="guanggao">
        <img
          src="https://img.youpin.mi-img.com/yingkebao/90337d93e628939c590fbe1a1cf338bf.gif?w=1080&h=210"
          alt=""
        />
      </a>

      {/* 五、下拉列表，其他横幅标签 */}
      <TipBox title="我的资产" icon="icon1" />
      <TipBox title="拼团" icon="icon2" />
      <TipBox title="我的收藏" icon="icon3" />
      <TipBox title="地址管理" icon="icon4" />
      <TipBox title="资质证照" icon="icon5" />
      <TipBox title="协议规则" icon="icon6" />
      <TipBox title="帮助与反馈" icon="icon7" />

      {/* 退出登录：当“已登录”时才有这部分 */}
      {isLogin ? (
        <button
          className="singoutBtn"
          // await + 同步action
          onClick={async ev => {
            let data = await api.personal.signout();
            if (parseInt(data.code) !== 0) {
              window.alert("操作失败，请稍后再试!");
              return;
            }
            resetBaseInfo();
          }}
        >
          退出登录
        </button>
      ) : null}
    </div>
  );
}

export default connect(state => state.personal, actions.personal)(Info);
