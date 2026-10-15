/* Anything Art class timetable.
 * All data comes from class-sessions.json (static). Square links + manual seat overrides live there. */
(function(){
  var WEEKS=4, DAYMS=864e5;
  function bne(){var n=new Date();return new Date(n.getTime()+n.getTimezoneOffset()*6e4+36e6);} // Brisbane UTC+10, no DST
  function ymd(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
  var DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function get(u){return fetch(u,{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.json();});}
  Promise.all([get('class-sessions.json?v='+Date.now())]).then(function(r){
    var cfg=r[0], live=null, ov={};
    (cfg.overrides||[]).concat(live&&live.sessions||[]).forEach(function(o){ov[o.date+' '+o.start]=o;});
    render(cfg,ov,!!live);
  }).catch(function(){document.getElementById('timetable').textContent='Timetable unavailable — call 0467 344 801 to book.';});
  function render(cfg,ov,isLive){
    var now=bne(), start=new Date(now); start.setHours(0,0,0,0); start.setDate(start.getDate()-((start.getDay()+6)%7)); // Monday this week
    var html='<div class="tt-grid"><div class="tt-h">Mon</div><div class="tt-h">Tue</div><div class="tt-h">Wed</div><div class="tt-h">Thu</div><div class="tt-h">Fri</div><div class="tt-h">Sat</div><div class="tt-h">Sun</div>';
    var next=null;
    for(var i=0;i<WEEKS*7;i++){
      var d=new Date(start.getTime()+i*DAYMS); d.setHours(0,0,0,0);
      var dl='<div class="tt-date">'+DN[d.getDay()]+' '+d.getDate()+' '+MN[d.getMonth()]+'</div>';
      var ws=cfg.weekly.filter(function(x){return x.dow===d.getDay();}).sort(function(a,b){return a.start<b.start?-1:1;});
      var cell='';
      ws.forEach(function(w){
      var hm=w.start.split(':'), t=new Date(d); t.setHours(+hm[0],+hm[1],0,0);
      var nm=w.name; if(w.kids&&cfg.kidsLessons){var wk=Math.floor((d-new Date(cfg.kidsRotationStart+'T00:00:00'))/(7*DAYMS)), L=cfg.kidsLessons; nm+=': '+L[((wk%L.length)+L.length)%L.length];}
      if(t<=now){cell+='<div class="tt-gone">'+nm+'<br>'+w.label+'</div>';return;}
      if(!next)next={t:t,w:{name:nm,label:w.label}};
      var o=ov[ymd(d)+' '+w.start]||{}, left=Math.max(0,cfg.capacity-(o.booked||0)), full=left===0;
      var early=(t-now)>=7*DAYMS, url=o.url||w.url; if(!url||/^PLACEHOLDER_/.test(url))url=w.kids?cfg.kidsFallbackUrl:cfg.fallbackUrl; else if(!o.url)url+=(url.indexOf('?')<0?'?':'&')+'dateStart='+((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate(),t.getHours(),t.getMinutes())/1000)-36000);
      var inner='<div class="tt-name">'+nm+'</div><div class="tt-time">'+w.label+'</div><div class="tt-price">'+(w.priceLabel||('A$'+cfg.price+' + materials'))+'</div>'+
        (full?'<div class="tt-full">FULL</div>':'<div class="tt-seats">'+left+' of '+cfg.capacity+' seats left</div>')+
        (w.note?'<div class="tt-note">'+w.note+'</div>':'')+(early&&!full&&!w.kids?'<div class="tt-badge">A$5 off — booked 7+ days ahead</div>':'');
      cell+=full?'<div class="tt-class is-full'+(w.kids?' tt-kids':'')+'">'+inner+'</div>':'<a class="tt-class'+(w.kids?' tt-kids':'')+'" href="'+url+'"'+(/^https?:/.test(url)?' target="_blank" rel="noopener"':'')+' aria-label="Book '+nm+' '+DN[d.getDay()]+' '+d.getDate()+' '+MN[d.getMonth()]+' '+w.label+'">'+inner+'<div class="tt-book">Book this class →</div></a>';
      });
      if(d.getDay()===0)cell+='<div class="tt-priv">Private bookings by arrangement<br><a href="tel:+61467344801">0467 344 801</a></div>';
      html+='<div class="tt-cell">'+dl+cell+'</div>';
    }
    document.getElementById('timetable').innerHTML=html+'</div>'+(isLive?'':'<p class="tt-src">Seats shown are a guide — final availability is confirmed on the booking page.</p>');
    if(next){var el=document.getElementById('tt-next');(function tick(){var s=Math.max(0,Math.floor((next.t-bne())/1e3));
      el.innerHTML='Next class: <strong>'+next.w.name+', '+DN[next.t.getDay()]+' '+next.t.getDate()+' '+MN[next.t.getMonth()]+' '+next.w.label+'</strong> — starts in <strong>'+Math.floor(s/86400)+'d '+Math.floor(s%86400/3600)+'h '+Math.floor(s%3600/60)+'m '+(s%60)+'s</strong>';
      setTimeout(tick,1000);})();}
  }
})();
