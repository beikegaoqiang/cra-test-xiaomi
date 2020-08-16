import React from "react";
import ReactDOM from "react-dom";

/* 开启HashRouter */
import { HashRouter } from "react-router-dom";

/* redux挂载到上下文中 */
import { Provider } from "react-redux";
import store from "./store/index";

/* 入口组件 */
import App from "./App";

ReactDOM.render(
  <Provider store={store}>
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>,
  document.getElementById("root")
);
