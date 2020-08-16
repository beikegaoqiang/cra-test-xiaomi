import React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import "./Login.less";
import api from "../../api/index";
import actions from "../../store/actions/index";

class Login extends React.Component {
  state = {
    // 登录的方式：  2短信验证码   1账号密码
    type: 2,
    // 存储账号/密码、手机号/验证码
    account: "",
    password: "",
    // 倒计时
    isRun: false,
    runTime: 30
  };
  render() {
    let { type, account, password, isRun, runTime } = this.state;
    return (
      <section className="loginBox">
        <div className="header">
          <h4>欢迎登录小米有品</h4>
        </div>

        <div className="main">
          {type === 2 ? ( // 短信登录方式
            <>
              <div className="inpBox">
                <input
                  type="text"
                  placeholder="手机号码"
                  // 双向数据绑定
                  value={account}
                  onChange={ev => {
                    this.setState({ account: ev.target.value });
                  }}
                />
              </div>
              <div className="inpBox">
                <input
                  type="text"
                  placeholder="短信验证码"
                  className="short"
                  value={password}
                  onChange={ev => {
                    this.setState({ password: ev.target.value });
                  }}
                />

                <a className={isRun ? "noClick" : ""} onClick={this.sendCode}>
                  {isRun ? `${runTime}S后重新获取` : `获取验证码`}
                </a>
              </div>
            </>
          ) : (
            // 账号密码登录方式
            <>
              <div className="inpBox">
                <input
                  type="text"
                  placeholder="用户名/手机号码"
                  value={account}
                  onChange={ev => {
                    this.setState({ account: ev.target.value });
                  }}
                />
              </div>
              <div className="inpBox">
                <input
                  type="password"
                  placeholder="密码"
                  value={password}
                  onChange={ev => {
                    this.setState({ password: ev.target.value });
                  }}
                />
              </div>
            </>
          )}

          <button className="submit" onClick={this.handleLogin}>
            立即登录
          </button>
          <span className="changeBtn" onClick={this.handleChange}>
            {type === 1 ? "用户名密码登录" : "短信验证码登录"}
          </span>
        </div>

        <div className="register">
          {/* Link路由跳转到注册页 */}
          <Link to="/personal/register">立即注册</Link>|<a>忘记密码</a>
        </div>

        <div className="other">
          <span>其他登录方式</span>
          <div>
            <a></a>
            <a></a>
            <a></a>
          </div>
        </div>

        <div className="footer">
          <span>首页</span>|<span>简体</span>|<span>English</span>|
          <span>常见问题</span>|<span>隐私政策</span>
        </div>
      </section>
    );
  }

  // 切换登录方式
  handleChange = () => {
    let { type } = this.state;
    // state私有状态，当前组件重新渲染
    this.setState({
      // 切换登录方式
      type: type === 1 ? 2 : 1,
      // 清空账号密码
      account: "",
      password: ""
    });
  };

  // 请求服务器发送短信验证码（与注册页的方法相同）：包括验证码输入倒计时
  sendCode = async () => {
    // 如果当前正在“倒计时”，则当再点击按钮时，直接退出此回调函数，不再进行操作
    let { account, isRun } = this.state;
    if (isRun) return;

    // 表单校验：手机号
    if (!/^1\d{10}$/.test(account)) {
      window.alert("手机号码格式不正确~~");
      return;
    }

    // 先发送请求①：“注册页”/“登录页”-验证手机号是否被注册过了
    let data = await api.personal.phone(account);
    if (parseInt(data.code) !== 0) {
      window.alert("当前手机号还没有被注册，请您先注册~~");
      return;
    }
    // 再发送请求②：“注册页”/“登录页”-请求服务器发送短信验证码
    data = await api.personal.code(account);
    if (parseInt(data.code) !== 0) {
      window.alert("发送失败，请稍后再试~~");
      return;
    }

    // 开始短信验证码输入的倒计时：更改按钮样式、设置倒计时效果（请求①和请求②顺利通过后才能进行此步操作）
    this.setState({ isRun: true });
    this.codeTimer = setInterval(() => {
      let time = this.state.runTime;
      time--;
      // 定时器终止条件
      if (time === 0) {
        clearInterval(this.codeTimer);
        this.setState({
          isRun: false,
          runTime: 30
        });
        return;
      }
      // 倒计时实现
      this.setState({ runTime: time });
    }, 1000);
  };

  // 登录
  handleLogin = async () => {
    let { type, account, password } = this.state;
    // 表单校验：若没满足校验条件就弹提示框，且退出函数，不进行下面的登录请求
    if (type === 2) {
      if (!/^1\d{10}$/.test(account)) {
        window.alert("手机号码格式不正确~~");
        return;
      }
      if (!/^\d{6}$/.test(password)) {
        window.alert("验证码格式不正确~~");
        return;
      }
    } else {
      if (account.length === 0) {
        window.alert("账号不能为空~~");
        return;
      }
      if (!/^\w{6,16}$/.test(password)) {
        window.alert("密码格式不正确~~");
        return;
      }
    }

    // 发送请求⑥：“登录页”-登录
    let data = await api.personal.loginPOST(account, password, type);
    if (parseInt(data.code) !== 0) {
      window.alert(
        `登录失败，${type === 2 ? "验证码输入有误！" : "账号密码不匹配！"}`
      );
      return;
    }
    window.alert("恭喜您登录成功！~~", {
      handled: () => {
        // 1. 修改/赋值redux中的登录态和当前用户基本信息
        this.props.loginSuccess(data.data);

        // 2. 登录成功后的页面跳转：(进行了优化)
        // 原例：在“登录页”中登录成功后直接跳转到“个人中页”
        // ！！！获取当前url中的问号参数
        const search = this.props.location.search;
        // 此处也可不做兼容，没有问好时，search也为空字符串""
        if (search && search.includes("noback")) {
          // ① 如果是在“注册页”中点击“立即登录”跳转过来，问号参数search中就有noback。在这种情况下，登录成功后直接进入“个人中心”页面
          this.props.history.push("/personal");
        } else {
          // ② 优化：如果是从其他页面跳转到此“登录页”的，登录成功后直接返回到之前的页面。因在其他页面也会触发让用户登录，登录成功后直接返回到触发页面的话，对用户更友好。
          this.props.history.go(-1);
        }
      }
    });
  };
}

export default connect(null, actions.personal)(Login);
