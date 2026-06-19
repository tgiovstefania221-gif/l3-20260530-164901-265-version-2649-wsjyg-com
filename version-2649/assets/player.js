(function () {
  function startPlayer(shell) {
    var video = shell.querySelector('video');
    var stream = shell.getAttribute('data-stream');
    if (!video || !stream) {
      return;
    }
    function playVideo() {
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video.hlsPlayer) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video.hlsPlayer = hls;
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      } else {
        playVideo();
      }
    } else {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', stream);
      }
      playVideo();
    }
    shell.classList.add('playing');
  }

  document.querySelectorAll('.player-shell').forEach(function (shell) {
    var button = shell.querySelector('.player-start');
    var video = shell.querySelector('video');
    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayer(shell);
      });
    }
    shell.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }
      startPlayer(shell);
    });
    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('playing');
      });
    }
  });
})();
