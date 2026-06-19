
(function () {
  var video = document.getElementById('moviePlayer');
  var overlay = document.getElementById('playOverlay');
  var message = document.getElementById('playerMessage');
  var hls = null;
  var loaded = false;

  function showMessage(text) {
    if (message) {
      message.textContent = text || '';
    }
  }

  function loadVideo() {
    if (!video || loaded || !pageVideoUrl) {
      return;
    }
    loaded = true;
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(pageVideoUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }
        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }
        showMessage('视频加载失败，请稍后再试。');
      });
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = pageVideoUrl;
      return;
    }
    showMessage('视频加载失败，请稍后再试。');
  }

  function startVideo() {
    loadVideo();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    if (video) {
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          showMessage('点击播放按钮开始观看。');
        });
      }
    }
  }

  if (overlay) {
    overlay.addEventListener('click', startVideo);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
