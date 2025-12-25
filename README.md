# view-ui-project

This project is build for Vue.js 2 + vue-router + webpack2 + View UI (iView) 4, just install and run.

## Install
```bush
// install dependencies
npm install
```
## Run
### Development
```bush
// For the first time, run init to create index.html
npm run init
npm run dev
```
### Production(Build)
```bush
npm run init

npm run build
```







### 编译代码(npm run build有问题，未解决)
```bash
npm run init

npm run dev
```
### 构建镜像
```bash
 docker -H 192.168.191.44 build -t  bespin/bot-manager:latest .
```
### 部署镜像
```bash
 docker run --restart=always -itd -p8061:80 -v/tmp/web:/weblog --name haleon-bot-manager bespin/bot-manager
```

###
docker login --username=lsy01426683@1862559946566560 registry.cn-shanghai.aliyuncs.com
Haleon@0106
8T9*ZXGD1v
docker tag  5fc8fb63d5d7 registry.cn-shanghai.aliyuncs.com/ai-copilot/ai-copilot-manage:test
docker push registry.cn-shanghai.aliyuncs.com/ai-copilot/ai-copilot-manage:test

docker tag a4d219211488 registry.cn-shanghai.aliyuncs.com/ai-copilot/ai-copilot-manage:prod
docker push registry.cn-shanghai.aliyuncs.com/ai-copilot/ai-copilot-manage:prod
### 访问测试
```bash
http://192.168.191.44:8065/login

http://192.168.191.44:8065/
```