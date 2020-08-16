import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import Home from "./pages/home/Home";
import Detail from "./pages/home/Detail";
import Category from "./pages/category/Category";
import PinWei from "./pages/pinwei/PinWei";
import Cart from "./pages/cart/Cart";
import Personal from "./pages/personal/Personal";
import FooterNav from "./components/FooterNav";
/* 公共样式 */
import "./assets/reset.min.css";
import "./assets/basic.less";
import "swiper/css/swiper.css";
class App extends React.Component {
  render() {
    console.log(11111111111);
    return (
      <>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/detail/:id" component={Detail} />
          <Route path="/category" component={Category} />
          <Route path="/pinwei" component={PinWei} />
          <Route path="/cart" component={Cart} />
          <Route path="/personal" component={Personal} />
          <Redirect to="/" />
        </Switch>
        {/* 公共组件：底部导航栏 */}
        <FooterNav></FooterNav>
      </>
    );
  }
}
export default App;
