import { request, requestGet } from "./request";
export default {
  getAppList(data) {
    return request("/api/platform/app/list", data);
  },
  saveDisclaimer(data) {
    return request("/api/disclaimer/save", data);
  },
  getDisclaimer() {
    return requestGet("/api/disclaimer/get", {});
  },
  logout() {
    return requestGet("/auth/logout", {});
  },
  changePassword(data) {
    return request("/auth/changePassword", data);
  },
  // 重置密码（带手机号验证）
  verifyIdentity(data) {
    return request("/auth/resetPasswordWithPhone1", data);
  },
  resetPasswordWithPhone(data) {
    return request("/auth/resetPasswordWithPhone2", data);
  },
  login(data) {
    return request("/auth/login/password", data);
  },
  passwordAndSmsLogin(data) {
    return request("/auth/login/passwordAndSms", data);
  },
  sendCode(data) {
    return request("/auth/sms/sendCode", data);
  },
  // 获取应用授权码
  getAuthCode() {
    return requestGet("/auth/getAuthCode", {});
  },
};
