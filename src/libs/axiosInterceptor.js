import axios from 'axios';

const flags = { flag: false };

axios.interceptors.request.use(
  config => {
	let flag = flags.flag;
    // 在请求发送之前做一些处理，比如添加token等
	//console.log(config)
	if(flag){
		let token = sessionStorage.getItem('token')
		config.headers.Authentication = token;
	}
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => {
    // 对响应数据做一些处理
	//console.log('response:{}',response);
    return response;
  },
  error => {
	let flag = flags.flag;
	//console.log('error:{}',error.response.data.status);
	let status = error.response.data.status;
	if(flag){
    // 对响应错误做一些处理
		if(status === 500){
			if(localStorage.getItem('ssoconfig')){
				window.location.href = localStorage.getItem('ssoconfig');
			}else{
				window.location.href = 'https://federation-qa.corpnet4.com/as/authorization.oauth2?client_id=166dc5399942457a8eff18b68c9607b8&response_type=code';
			}
		}
	}
	return Promise.reject(error);
  }
);

export default axios;