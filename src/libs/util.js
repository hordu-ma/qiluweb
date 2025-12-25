let util = {
    title(title) {
        title = title ? title : 'View UI project';
        window.document.title = title;
    },
    setLocal(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    getLocal(key) {
        try {
            return JSON.parse(localStorage.getItem(key))
        } catch (e) {
            return null
        }
    },
    removeLocal(key) {
        localStorage.removeItem(key);
    },
    setSession(key, value) {
        sessionStorage.setItem(key, JSON.stringify(value));
    },
    getSession(key) {
        try {
            return JSON.parse(sessionStorage.getItem(key))
        } catch (e) {
            return null
        }
    },
    removeSession(key) {
        sessionStorage.removeItem(key);
    },
    downloadMedia(content, fileName) {
        const blob = new Blob([content]); //创建一个类文件对象：Blob对象表示一个不可变的、原始数据的类文件对象
        const url = window.URL.createObjectURL(blob); //URL.createObjectURL(object)表示生成一个File对象或Blob对象
        let dom = document.createElement('a'); //设置一个隐藏的a标签，href为输出流，设置download
        dom.style.display = 'none';
        dom.href = url;
        dom.setAttribute('download', fileName); //指示浏览器下载url,而不是导航到它；因此将提示用户将其保存为本地文件
        document.body.appendChild(dom);
        dom.click();
    },
    trimRequstObj(obj) {
        for (let key in obj) {
            if (typeof(obj[key]) == "string") {
                obj[key] = obj[key].trim();
            }
        }
        return obj;
    },
};

export default util;