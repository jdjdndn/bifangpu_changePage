// ==UserScript==
// @name         yc-按键翻页脚本
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  yc-毕方铺翻页脚本
// @author       yyucheng
// @match        https://www.iizhi.cn/*
// @match        https://www.google.com/search?q=*
// @match        https://www.google.com.hk/search?q=*
// @match        https://search.bilibili.com/*
// @grant        none
// ==/UserScript==


// https://www.iizhi.cn/resource/search/%E5%9F%B9%E8%AE%AD?page=20&searchtype=1&searchway=1
// https://www.iizhi.cn/bbs?page=3
(function () {
  'use strict';

  class GetChangePage {
    constructor() {
      // 存放keyObj 和 valueObj的Map
      this.map = new Map()
      // 匹配到的keyObj
      this.matchKeys = null
      // 默认的keyObj
      this.defaultKeys = {
        key: 'page',
        start: 1,
        step: 1,
        current: 1
      }
      // 浏览器url ? 后面的参数解析成对象形式
      this.urlParams = null
      // url问号前面的部分
      this.origin = null
    }

    // 将keyObj与valueObj配对，存入weakMap中
    peiDui(keyObj, valueObj) {
      if (!Array.isArray(keyObj)) {
        keyObj = [keyObj]
      }
      this.map.set(keyObj, valueObj)
    }

    // 根据key获取valueObj
    getValueObj(host) {
      if (this.matchKeys) return
      this.map.keys().forEach(keyArr => {
        if (keyArr.includes(host)) {
          this.matchKeys = this.map.get(keyArr)
        }
      })
      if (!this.matchKeys) {
        this.matchKeys = this.defaultKeys
      }
      if (!this.matchKeys['current']) {
        this.matchKeys['current'] = this.matchKeys['start']
      }
    }


    // 重置参数
    resetUrlParams(hrefUrl) {
      this.urlParams = {}
      this.matchKeys['current'] = this.matchKeys['start']
      let hashArr = hrefUrl.split('?')
      if (hashArr.length < 2) {
        this.origin = hrefUrl
        return
      }
      let arr = hashArr[1].split('&');
      for (let i = 0; i < arr.length; i++) {
        const current = arr[i]
        const key = current.split('=')[0]
        const value = current.split('=')[1]
        if (key === this.matchKeys['key']) {
          this.matchKeys['current'] = value
          continue;
        }
        this.urlParams[key] = value;
      }
      this.origin = hashArr[0];
    }
    // 获取设置参数方法
    getHashStr(hrefUrl) {
      this.resetUrlParams(hrefUrl)
      const _this = this
      return {
        // 返回方法,每调用一次,page属性值增加并将 origin和遍历obj属性与值拼接
        up() {
          _this.matchKeys['current'] = parseInt(_this.matchKeys['current'], 10) + _this.matchKeys['step']
          const parms = Object.keys(_this.urlParams).map(key => key + '=' + _this.urlParams[key]).join('&')
          const href = _this.origin + '?' + (parms ? parms + '&' : '') + _this.matchKeys['key'] + '=' + parseInt(_this.matchKeys['current'], 10)
          location.href = href
        },
        down() {
          _this.matchKeys['current'] = parseInt(_this.matchKeys['current'], 10) - _this.matchKeys['step']
          if (parseInt(_this.matchKeys['current'], 10) <= 0) return
          const parms = Object.keys(_this.urlParams).map(key => key + '=' + _this.urlParams[key]).join('&')
          const href = _this.origin + '?' + (parms ? parms + '&' : '') + _this.matchKeys['key'] + '=' + parseInt(_this.matchKeys['current'], 10)
          location.href = href
        }
      }
    }
  }

  let delay = 500; // 间隔时间，单位毫秒
  let lastExecutionTime = 0;

  const changePageObj = new GetChangePage()
  // 配对代码
  changePageObj.peiDui(['www.google.com', 'www.google.com.hk'], {
    key: 'start',
    start: 0,
    step: 10,
  })

  changePageObj.getValueObj(location.host)
  const fn = changePageObj.getHashStr(location.href)

  //   function parseQuery(urlParamsString) {
  // const urlParams = new URLSearchParams(urlParamsString);

  // // 创建一个空对象来存储参数
  // const paramsObj = {};

  // // 遍历参数并添加到对象中
  // for (const [key, value] of urlParams) {
  //   paramsObj[key] = value;
  // }

  // console.log(paramsObj);
  //   }

  function callback(mutationsList, observer) {
    if (lastExecutionTime + delay < Date.now()) {
      // setHrefStr()
      lastExecutionTime = Date.now();
    }
  }

  let observer = new MutationObserver(callback);


  observer.observe(document.body, { childList: true, attributes: true });


  // 创建一个 History 实例
  const history = window.history;

  // 保存原始的 pushState 方法
  const originalPushState = history.pushState;

  // 重写 pushState 方法来触发自定义事件
  history.pushState = function () {
    const result = originalPushState.apply(this, arguments);
    window.dispatchEvent(new Event('urlChanged'));
    return result;
  };

  // 为自定义的 'urlChanged' 事件添加监听器
  window.addEventListener('urlChanged', function () {
    changePageObj.resetUrlParams(location.href)
    // setHrefStr()
  });
  // 监听键盘按键事件
  document.addEventListener('keyup', function (event) {
    event.preventDefault()
    // 判断按键
    switch (event.keyCode) {
      case 38: // 上键
        fn.down()
        break;
      case 40: // 下键
        fn.up()
        break;
    }
  })

  // 给所有a标签href属性值以？分割的链接拼接参数urlParams
  // function setHrefStr() {
  //   // 获取所有a链接
  //   const anchors = document.querySelectorAll('a[href]');
  //   for (let i = 0; i < anchors.length; i++) {
  //     const current = anchors[i]
  //     const href = current.getAttribute('href')
  //     // console.log(href);
  //     if (href.indexOf('?') > -1) {
  //       current.setAttribute('href', href + '&' + Object.keys(urlParams).map(key => key + '=' + urlParams[key]).join('&'))
  //     }
  //   }
  // }

})()
