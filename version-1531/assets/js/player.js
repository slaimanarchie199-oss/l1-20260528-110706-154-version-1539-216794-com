(function () {
  function attachVideo(video, source) {
    if (video.dataset.ready === "1") {
      return;
    }
    video.dataset.ready = "1";
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsController = hls;
      return;
    }
    video.src = source;
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".play-layer");
      var source = shell.getAttribute("data-video");
      if (!video || !source) {
        return;
      }
      function start() {
        attachVideo(video, source);
        shell.classList.add("is-playing");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }
      shell.addEventListener("click", function (event) {
        if (event.target === video && video.dataset.ready === "1") {
          return;
        }
        start();
      });
      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          start();
        });
      }
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0) {
          shell.classList.remove("is-playing");
        }
      });
    });
  }

  if (document.readyState !== "loading") {
    initPlayers();
  } else {
    document.addEventListener("DOMContentLoaded", initPlayers);
  }
})();
