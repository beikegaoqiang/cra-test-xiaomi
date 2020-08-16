import React from "react";
import { Link } from "react-router-dom";
import "./Login.less";
import api from "../../api/index";

class Register extends React.Component {
  state = {
    // 用户输入信息
    name: "高强",
    phone: "18800179419",
    code: "",
    password: "1234567890",
    passwordPay: "888888",
    // 发送验证码按钮状态
    isRun: false, // 切换按钮的样式和内容
    runTime: 30
  };
  render() {
    let {
      name,
      phone,
      code,
      password,
      passwordPay,
      isRun,
      runTime
    } = this.state;
    return (
      <section className="loginBox">
        <div className="header">
          <h4>小米有品账号注册</h4>
        </div>
        <div className="main">
          <div className="inpBox">
            <input
              type="text"
              placeholder="用户名"
              value={name}
              onChange={ev => {
                this.setState({ name: ev.target.value });
              }}
            />
          </div>
          <div className="inpBox">
            <input
              type="text"
              placeholder="手机号码"
              value={phone}
              onChange={ev => {
                this.setState({ phone: ev.target.value });
              }}
            />
          </div>
          <div className="inpBox">
            <input
              type="text"
              placeholder="短信验证码"
              className="short"
              value={code}
              onChange={ev => {
                this.setState({ code: ev.target.value });
              }}
            />
            <a className={isRun ? "noClick" : ""} onClick={this.sendCode}>
              {isRun ? `${runTime}S后重发` : "获取验证码"}
            </a>
          </div>
          <div className="inpBox">
            <input
              type="password"
              placeholder="登录密码"
              value={password}
              onChange={ev => {
                this.setState({ password: ev.target.value });
              }}
            />
          </div>
          <div className="inpBox">
            <input
              type="password"
              placeholder="支付密码"
              value={passwordPay}
              onChange={ev => {
                this.setState({ passwordPay: ev.target.value });
              }}
            />
          </div>
          <button className="submit" onClick={this.handleRegister}>
            立即注册
          </button>
          <Link to="/personal/login?noback" className="changeBtn">
            已有账号，去登录！
          </Link>
        </div>
        <div className="footer">
          <span>首页</span>|<span>简体</span>|<span>English</span>|
          <span>常见问题</span>|<span>隐私政策</span>
        </div>
      </section>
    );
  }

  // 表单校验方法封装
  checkPhone = () => {
    return /^1\d{10}$/.test(this.state.phone); // 11位数字
  };
  checkName = () => {
    return /^.{2,20}$/.test(this.state.name); // 2~20位任意字符
  };
  checkCode = () => {
    return /^\d{6}$/.test(this.state.code);
  };
  checkPassword = () => {
    return /^\w{6,16}$/.test(this.state.password); // 6~16位字母/数字/下划线
  };
  checkPasswordPay = () => {
    return /^\d{6}$/.test(this.state.passwordPay);
  };

  // 请求服务器发送短信验证码
  sendCode = async () => {
    // 如果当前正在“倒计时”，则当再点击按钮时，直接退出此回调函数，不再进行操作
    if (this.state.isRun) return;

    // 表单验证：校验所输入的手机号格式
    if (!this.checkPhone()) {
      window.alert("必须保证手机号码不为空或者格式正确！");
      return;
    }

    // 先发送请求①：“注册页”/“登录页”-验证手机号是否被注册过了
    let data = await api.personal.phone(this.state.phone);
    if (parseInt(data.code) === 0) {
      window.alert("当前手机号已经被注册，您可以选择登录或者找回密码！");
      return;
    }
    // 再发送请求②：“注册页”/“登录页”-请求服务器发送短信验证码
    data = await api.personal.code(this.state.phone);
    if (parseInt(data.code) !== 0) {
      window.alert("服务器发送短信验证码失败，请稍后再试！");
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
        // setState方法在异步操作中是同步的，在周期函数和合成事件中是异步的
        this.setState({
          isRun: false,
          runTime: 30
        });
        return;
      }
      this.setState({ runTime: time });
    }, 1000);
  };

  // 注册
  handleRegister = async () => {
    // 校验所输入的注册信息格式
    if (!this.checkName()) {
      window.alert("用户名必须是2~20位字符！");
      return;
    }
    if (!this.checkPhone()) {
      window.alert("手机号码格式不正确！");
      return;
    }
    if (!this.checkPassword()) {
      window.alert("密码不符合格式，正确规则：6~16位数字、字母、下划线");
      return;
    }
    if (!this.checkPasswordPay()) {
      window.alert("支付密码不符合格式，正确规则：6位数字");
      return;
    }
    if (!this.checkCode()) {
      window.alert("请输入有效格式的验证码（6位数字）");
      return;
    }

    // 先发送请求③：“注册页”-验证输入的验证码是否正确
    let data = await api.personal.checkCode(this.state.phone, this.state.code);
    if (parseInt(data.code) !== 0) {
      window.alert("请输入有效验证码（30分钟内有效）");
      return;
    }
    // 后发送请求④：“注册页”-注册信息发送
    data = await api.personal.register(
      this.state.name,
      this.state.phone,
      this.state.password,
      this.state.passwordPay
    );
    if (parseInt(data.code) !== 0) {
      window.alert("注册失败，请稍后再试！");
      return;
    }
    // 注册成功，路由跳转到登录页
    window.alert(
      "恭喜您注册成功，请登录您的账号！",
      // 弹出框消失时会触发名为handled函数
      {
        handled: type => {
          // 当点击“确定”时，type值为CANCEL；当点击“取消”时，type值为CONFIRM
          this.props.history.push("/personal/login?noback");
        }
      }
    );
  };
}

export default Register;
