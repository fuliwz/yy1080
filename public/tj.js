(function () {
  'use strict';

  var lastUrl = '';

  window._Hasync = window._Hasync || [];

  window._Hasync.push([
    'Histats.start',
    '1,4657865,4,0,0,0,00010000'
  ]);

  window._Hasync.push([
    'Histats.fasi',
    '1'
  ]);

  window._Hasync.push([
    'Histats.track_hits',
    ''
  ]);

  function trackPage() {
    var url = window.location.href;

    if (url === lastUrl) {
      return;
    }

    lastUrl = url;

    window._Hasync.push([
      'Histats.track_hits',
      ''
    ]);
  }

  // 第一次访问
  trackPage();

  // Vue Router 使用 history.pushState
  var originalPushState = history.pushState;

  history.pushState = function () {
    var result = originalPushState.apply(
      history,
      arguments
    );

    setTimeout(trackPage, 100);

    return result;
  };

  // 浏览器前进 / 后退
  window.addEventListener(
    'popstate',
    function () {
      setTimeout(trackPage, 100);
    }
  );

  // 加载 Histats
  if (
    !document.querySelector(
      'script[data-histats="1"]'
    )
  ) {
    var hs = document.createElement('script');

    hs.type = 'text/javascript';
    hs.async = true;
    hs.dataset.histats = '1';
    hs.src =
      'https://s10.histats.com/js15_as.js';

    (
      document.head ||
      document.body
    ).appendChild(hs);
  }
})();
