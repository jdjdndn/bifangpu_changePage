// ==UserScript==
// @name         yc-毕方铺翻页脚本
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  yc-毕方铺翻页脚本
// @author       yyucheng
// @match        https://www.iizhi.cn/*
// @grant        none
// ==/UserScript==


// https://www.iizhi.cn/resource/search/%E5%9F%B9%E8%AE%AD?page=20&searchtype=1&searchway=1
// https://www.iizhi.cn/bbs?page=3
(function () {
  'use strict';


  let delay = 500; // 间隔时间，单位毫秒
  let lastExecutionTime = 0;
  // url问号前面的部分
  let origin = ''
  // url中的页码
  let page = 1
  // url问号后的参数，不带page
  let urlParams = {}
  let fn = { up() { }, down() { } }

  function callback(mutationsList, observer) {
    if (lastExecutionTime + delay < Date.now()) {
      fn = getHashStr(location.href)
      setHrefStr()
      // console.log(decodeURIComponent(location.href), 'location.href');
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
    resetUrlParams(location.href)
  });
  // 监听键盘按键事件
  document.addEventListener('keydown', function (event) {
    // 判断按键
    switch (event.key) {
      case 'ArrowLeft': // 左箭头键
        fn.down()
        break;
      case 'ArrowRight': // 右箭头键
        fn.up()
        break;
    }
  })

  // 给所有a标签href属性值以？分割的链接拼接参数urlParams
  function setHrefStr() {
    // 获取所有a链接
    const anchors = document.querySelectorAll('a[href]');
    for (let i = 0; i < anchors.length; i++) {
      const current = anchors[i]
      const href = current.getAttribute('href')
      // console.log(href);
      if (href.indexOf('?') > -1) {
        current.setAttribute('href', href + '&' + Object.keys(urlParams).map(key => key + '=' + urlParams[key]).join('&'))
      }
    }
  }



  // url变化重置参数
  function resetUrlParams(hrefUrl) {
    urlParams = {}
    page = 1
    let hashArr = hrefUrl.split('?')
    if (hashArr.length < 2) return
    let arr = hashArr[1].split('&');
    for (let i = 0; i < arr.length; i++) {
      const current = arr[i]
      const key = current.split('=')[0]
      const value = current.split('=')[1]
      if (key === 'page') {
        page = value
        continue;
      }
      urlParams[key] = value;
    }
    origin = hashArr[0];
    console.log('urlParams', urlParams);
  }

  /**
   * string: https://www.iizhi.cn/resource/search/%E5%9F%B9%E8%AE%AD?page=20&searchtype=1&searchway=1
   * return {searchtype:1,searchway:1}
   */

  function getHashStr(hrefUrl) {
    resetUrlParams(hrefUrl)
    return {
      // 返回方法,每调用一次,page属性值增加并将 origin和遍历obj属性与值拼接
      up() {
        page++
        const parms = Object.keys(urlParams).map(key => key + '=' + urlParams[key]).join('&')
        const href = origin + '?page=' + page + (parms ? '&' + parms : '')
        location.href = href
        // console.log(href);
      },
      down() {
        page--
        if (page <= 0) return
        const parms = Object.keys(urlParams).map(key => key + '=' + urlParams[key]).join('&')
        const href = origin + '?page=' + page + (parms ? '&' + parms : '')
        location.href = href
        // console.log(href);
      }
    }
  }
})()
