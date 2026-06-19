(function(){
var menu=document.querySelector('.menu-toggle');
var mobile=document.querySelector('.mobile-menu');
if(menu&&mobile){menu.addEventListener('click',function(){mobile.classList.toggle('open')})}
var slides=[].slice.call(document.querySelectorAll('.hero-slide'));
var dots=[].slice.call(document.querySelectorAll('.hero-dot'));
if(slides.length){var current=0;var show=function(i){slides[current].classList.remove('active');if(dots[current])dots[current].classList.remove('active');current=(i+slides.length)%slides.length;slides[current].classList.add('active');if(dots[current])dots[current].classList.add('active')};dots.forEach(function(dot,i){dot.addEventListener('click',function(){show(i)})});setInterval(function(){show(current+1)},5200)}
var input=document.querySelector('[data-search-input]');
var genre=document.querySelector('[data-genre-select]');
var year=document.querySelector('[data-year-select]');
var cards=[].slice.call(document.querySelectorAll('[data-movie-card]'));
var empty=document.querySelector('[data-empty]');
var apply=function(){var q=input?input.value.trim().toLowerCase():'';var g=genre?genre.value:'';var y=year?year.value:'';var visible=0;cards.forEach(function(card){var text=(card.getAttribute('data-title')+' '+card.getAttribute('data-tags')+' '+card.getAttribute('data-region')).toLowerCase();var ok=(!q||text.indexOf(q)>-1)&&(!g||card.getAttribute('data-genre').indexOf(g)>-1)&&(!y||card.getAttribute('data-year')===y);card.classList.toggle('hide',!ok);if(ok)visible++});if(empty)empty.classList.toggle('show',visible===0)};
[input,genre,year].forEach(function(el){if(el)el.addEventListener('input',apply);if(el)el.addEventListener('change',apply)});
var video=document.querySelector('[data-player-video]');
var cover=document.querySelector('[data-player-cover]');
var started=false;
var begin=function(){if(!video||started)return;started=true;var src=video.getAttribute('data-src');if(cover)cover.classList.add('hidden');if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=src;var p=video.play();if(p&&p.catch)p.catch(function(){})}else if(window.Hls&&window.Hls.isSupported()){var hls=new window.Hls();hls.loadSource(src);hls.attachMedia(video);hls.on(window.Hls.Events.MANIFEST_PARSED,function(){var p=video.play();if(p&&p.catch)p.catch(function(){})})}else{video.src=src;var p2=video.play();if(p2&&p2.catch)p2.catch(function(){})}};
if(cover)cover.addEventListener('click',begin);
if(video)video.addEventListener('click',function(){if(video.paused)begin()});
var topBtn=document.querySelector('[data-top]');
if(topBtn)topBtn.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'})});
})();