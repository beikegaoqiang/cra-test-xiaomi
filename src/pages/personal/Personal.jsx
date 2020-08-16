import React from "react";
import { Switch, Route } from "react-router-dom";
import Info from "./Info";
import Login from "./Login";
import Register from "./Register";
import Order from "./Order";
export default function Personal(props) {
  return (
    <Switch>
      {/* 个人中心 */}
      <Route path="/personal" exact component={Info} />
      {/* 登录页 */}
      <Route path="/personal/login" component={Login} />
      {/* 注册页 */}
      <Route path="/personal/register" component={Register} />
      {/* 订单页 */}
      <Route path="/personal/order" component={Order} />
    </Switch>
  );
}
