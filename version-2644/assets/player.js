
(function () {
  function initPlayer(shell) {
    const video = shell.querySelector('video');
    const overlay = shell.querySelector('.player-overlay');
    const button = shell.querySelector('.player-button');
    if (!video) return;
    const source = video.dataset.src;
    let hls = null;

    function hideOverlay() {
      if (overlay) overlay.classList.add('is-hidden');
    }

    function showOverlay() {
      if (overlay) overlay.classList.remove('is-hidden');
    }

    function playVideo() {
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }

    if (source) {
      const canNative = video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');
      if (canNative) {
        video.src = source;
      } else if (window.Hls && typeof window.Hls.isSupported === 'function' && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_event, data) {
          if (data && data.fatal) {
            showOverlay();
          }
        });
      } else {
        video.src = source;
      }
    }

    if (button) {
      button.addEventListener('click', function () {
        hideOverlay();
        playVideo();
      });
    }

    video.addEventListener('play', hideOverlay);
    video.addEventListener('pause', function () {
      if (!video.ended) showOverlay();
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        hideOverlay();
        playVideo();
      }
    });
    video.addEventListener('loadedmetadata', function () {
      hideOverlay();
    });
  }

  document.querySelectorAll('[data-player-shell]').forEach(initPlayer);
})();
