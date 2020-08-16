import React from "react";
import { withRouter, NavLink } from "react-router-dom";
import "./FooterNav.less";
function FooterNav(props) {
  let pathName = props.location.pathname,
    flag = /(DETAIL|PAY|CART|SEARCH|LOGIN|REGISTER|ORDER)/i.test(pathName);
  return (
    <>
      {/* 如果pathname满足以上正则表达式，则不渲染(null) */}
      {flag ? null : (
        <div className="FooterNavBox">
          <NavLink to="/" exact>
            <i className="icon"></i>
            <span>首页</span>
          </NavLink>
          <NavLink to="/category">
            <i className="icon"></i>
            <span>分类</span>
          </NavLink>
          <NavLink to="/pinwei">
            <i className="icon"></i>
            <span>品味</span>
          </NavLink>
          <NavLink to="/cart">
            <i className="icon"></i>
            <span>购物车</span>
          </NavLink>
          <NavLink to="/personal">
            <i className="icon"></i>
            <span>个人中心</span>
          </NavLink>
        </div>
      )}
    </>
  );
}
export default withRouter(FooterNav);
