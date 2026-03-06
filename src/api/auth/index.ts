import request from "@/utils/request";
import {
  CaptchaResult,
  LoginData,
  LoginResult,
  SiginData,
  ResetData,
} from "./model";

class AuthAPI {
  /**
   * 登录API
   *
   * @param data {LoginData}
   * @returns
   */
  static login(data: LoginData) {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);
    formData.append("captchaKey", data.captchaKey || "");
    formData.append("captchaCode", data.captchaCode || "");
    return request<any, LoginResult>({
      url: "/api/v1/auth/login",
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  /**
   * 注销API
   */
  static logout() {
    return request({
      url: "/api/v1/auth/logout",
      method: "delete",
    });
  }

  /**
   * 获取验证码
   */
  static getCaptcha() {
    return request<any, CaptchaResult>({
      url: "/api/v1/auth/captcha",
      method: "get",
    });
  }

  /**
   * 验证用户名
   */
  static checkName(username: string) {
    return request<any, CaptchaResult>({
      url: "/api/v1/users/check/" + username,
      method: "get",
    });
  }

  /**
   * 发送邮箱
   */
  static postEmailCode(data: SiginData) {
    const formData = new FormData();
    formData.append("toEmail", data.email);
    formData.append("username", data.username);
    return request<any, CaptchaResult>({
      url: "/api/v1/email/captcha",
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  /**
   * 注册
   */
  static register(data: SiginData) {
    return request<any, CaptchaResult>({
      url: "/api/v1/auth/register",
      method: "post",
      data,
    });
  }

  /**
   * 重置密码获取验证码
   */
  static resetPswCheck(data: ResetData) {
    const formData = new FormData();
    formData.append("username", data.username);
    return request<any, CaptchaResult>({
      url: "/api/v1/auth/check",
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  /**
   * 重置密码
   * @param {string} username 用户名
   * @param {string} password 新密码
   * @param {string} captcha 邮箱验证码
   * @returns
   */
  static resetPsw(data: ResetData) {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);
    formData.append("captcha", data.captcha);
    return request<any, LoginResult>({
      url: "/api/v1/auth/reset",
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

export default AuthAPI;
