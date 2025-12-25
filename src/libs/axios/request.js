import axios from "axios";
import Util from "../util";

// baseUrl 设置为当前域名
const isProduct = import.meta.env.MODE === "production";
const productBaseUrl = window.location.origin + "/platform/chat-platform-api";
const baseUrl = isProduct ? productBaseUrl : "";

// 增加可以传入method的axios方法
export const requestWithMethod = (url, method, data) => {
  return new Promise((resolve, reject) => {
    axios({
      method: method.toUpperCase(),
      url: baseUrl + url,
      data: method.toUpperCase() !== "GET" ? data : undefined,
      params: method.toUpperCase() === "GET" ? data : undefined,
      headers: {
        "Content-Type": "application/json",
        Authentication: Util.getSession("tmp_access_token"),
      },
    })
      .then((res) => {
        resolve(res);
      })
      .catch((res) => {
        reject(res);
      });
  });
};

export const request = (url, data) => {
  return new Promise((resolve, reject) => {
    axios
      .post(baseUrl + url, data, {
        headers: {
          "Content-Type": "application/json",
          Authentication: Util.getSession("tmp_access_token"),
        },
      })
      .then((res) => {
        resolve(res);
      })
      .catch((res) => {
        reject(res);
      });
  });
};

export const requestPost = (url, data) => {
  let param = {
    param: data,
    channel: "backend",
  };
  return new Promise((resolve, reject) => {
    axios
      .post(baseUrl + url, data, {
        headers: {
          "Content-Type": "application/json",
          Authentication: Util.getSession("tmp_access_token"),
        },
      })
      .then((res) => {
        resolve(res);
      })
      .catch((res) => {
        reject(res);
      });
  });
};

export const requestMedia = (url, params) => {
  return new Promise((resolve, reject) => {
    axios({
      method: "GET", // 请求方式
      url: baseUrl + url,
      data: {},
      params,
      responseType: "blob", // 服务器返回的数据类型
      headers: {
        Authentication: Util.getSession("tmp_access_token"),
      },
    })
      .then((res) => {
        resolve(res);
      })
      .catch((res) => {
        reject(res);
      });
  });
};

export const requestGet = (url, data) => {
  return new Promise((resolve, reject) => {
    axios
      .get(baseUrl + url, {
        headers: {
          Authentication: Util.getSession("tmp_access_token"),
        },
        params: data,
      })
      .then((res) => {
        resolve(res);
      })
      .catch((res) => {
        reject(res);
      });
  });
};

export const requestMedia2 = (url, data) => {
  return new Promise((resolve, reject) => {
    axios({
      method: "POST",
      url: baseUrl + url + "?groupDate=" + data,
      responseType: "blob",
      headers: {
        "Content-Type": "application/json",
        Authentication: Util.getSession("tmp_access_token"),
      },
      data: data,
    })
      .then((res) => {
        resolve(res);
      })
      .catch((res) => {
        reject(res);
      });
  });
};

export const requestMedia3 = (url, data) => {
  return new Promise((resolve, reject) => {
    axios({
      method: "POST",
      url: baseUrl + url,
      responseType: "blob",
      headers: {
        "Content-Type": "application/json",
        Authentication: Util.getSession("tmp_access_token"),
      },
      data: data,
    })
      .then((res) => {
        resolve(res);
      })
      .catch((res) => {
        reject(res);
      });
  });
};
