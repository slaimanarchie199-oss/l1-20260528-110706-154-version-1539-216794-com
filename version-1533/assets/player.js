(function () {
  function setStatus(box, text) {
    var status = box.querySelector(".player-status");
    if (status) {
      status.textContent = text || "";
    }
  }

  function playVideo(box) {
    var video = box.querySelector("video");
    var button = box.querySelector(".start-play");
    var source = video ? video.querySelector("source") : null;
    if (!video || !source) {
      return;
    }

    var url = source.getAttribute("src");
    setStatus(box, "正在加载影片...");
    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsPlayer) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hlsPlayer = hls;
      }
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else {
      video.src = url;
    }

    var request = video.play();
    if (request && typeof request.then === "function") {
      request.then(function () {
        setStatus(box, "");
      }).catch(function () {
        setStatus(box, "点击视频区域继续播放。");
      });
    }

    if (button) {
      button.classList.add("is-hidden");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var boxes = Array.prototype.slice.call(document.querySelectorAll(".player-card"));
    boxes.forEach(function (box) {
      var button = box.querySelector(".start-play");
      var video = box.querySelector("video");
      if (button) {
        button.addEventListener("click", function () {
          playVideo(box);
        });
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            playVideo(box);
          }
        });
        video.addEventListener("playing", function () {
          setStatus(box, "");
        });
        video.addEventListener("error", function () {
          setStatus(box, "播放遇到问题，请稍后重试。");
        });
      }
    });
  });
})();
