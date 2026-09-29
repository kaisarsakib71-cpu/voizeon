/* ============================================================
   engine.js — হেল্পার + অডিও জেনারেটর + লোকাল স্টোরেজ + প্লেয়ার
   কোনো সার্ভার লাগে না, সব ব্রাউজারেই চলে।
   ============================================================ */

/* ---------- ছোট হেল্পার ---------- */
function bn(v) {
  var d = "০১২৩৪৫৬৭৮৯";
  return String(v).replace(/[0-9]/g, function (x) { return d[+x]; });
}
function fmtTime(sec) {
  sec = Math.max(0, Math.floor(sec || 0));
  var m = Math.floor(sec / 60), s = sec % 60;
  return m + ":" + (s < 10 ? "0" + s : s);
}
function esc(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function catOf(key) {
  for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].key === key) return CATEGORIES[i];
  return { key: key, label: key, labelEn: key, icon: "🎧", blurb: "" };
}
function qs(name) {
  var m = new RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search);
  return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : "";
}
function el(id) { return document.getElementById(id); }

/* ---------- ওয়েভফর্ম বার ---------- */
function rng(seed) {
  var a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    var t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function waveBars(seed, count) {
  var r = rng(seed * 977 + 13), out = [], i;
  for (i = 0; i < count; i++) {
    var swell = Math.sin((i / count) * Math.PI * 2.4) * 0.22 + 0.55;
    out.push(Math.min(1, Math.max(0.16, swell + (r() - 0.5) * 0.55)));
  }
  return out;
}
function waveHtml(seed, count, dark) {
  var bars = waveBars(seed, count), html = "", i;
  for (i = 0; i < bars.length; i++) {
    html += '<span style="height:' + Math.round(bars[i] * 100) + '%;animation-delay:' + ((i % 7) * 80) + 'ms"></span>';
  }
  return '<div class="wave' + (dark ? " dark wave-mini" : "") + '">' + html + "</div>";
}

/* ---------- নমুনা ভয়েস টোন জেনারেটর (WAV) ----------
   যেসব ডেমোতে আসল ফাইল নেই, তাদের জন্য ব্রাউজারেই একটি
   ছোট "ভয়েস-টেক্সচার" তৈরি হয় যাতে প্লেয়ার সবসময় কাজ করে। */
var SR = 22050;
var PRESETS = {
  news: { pitch: 118, syl: 4.4, bright: 1.0, vib: 0.15 },
  ads: { pitch: 142, syl: 5.4, bright: 1.25, vib: 0.4 },
  documentary: { pitch: 96, syl: 3.4, bright: 0.82, vib: 0.2 },
  drama: { pitch: 128, syl: 3.9, bright: 1.1, vib: 0.55 },
  ivr: { pitch: 168, syl: 3.6, bright: 1.05, vib: 0.12 },
  audiobook: { pitch: 108, syl: 3.8, bright: 0.9, vib: 0.25 },
  elearning: { pitch: 154, syl: 4.0, bright: 1.0, vib: 0.18 },
  podcast: { pitch: 124, syl: 4.2, bright: 0.95, vib: 0.3 }
};

function synthWav(seed, category, gender, durationSec) {
  var p = PRESETS[category] || PRESETS.news;
  var rand = rng(seed * 2654435761 + 7);
  var duration = Math.min(Math.max(durationSec || 10, 4), 22);
  var total = Math.floor(duration * SR);
  var basePitch = p.pitch * (gender === "female" ? 1.65 : 1) * (0.94 + rand() * 0.12);

  var syllables = [], t = 0.12;
  while (t < duration - 0.25) {
    var len = (0.7 + rand() * 0.7) / p.syl;
    var gap = (0.12 + rand() * 0.5) / p.syl;
    syllables.push({ start: t, end: t + len, pm: 0.86 + rand() * 0.32, open: 0.35 + rand() * 0.65, fric: rand() < 0.22 });
    t += len + gap;
    if (rand() < 0.14) t += 0.22 + rand() * 0.35;
  }

  var pcm = new Int16Array(total);
  var ph0 = 0, ph1 = 0, ph2 = 0, ph3 = 0, nlp = 0;

  for (var s = 0; s < syllables.length; s++) {
    var sy = syllables[s];
    var a = Math.floor(sy.start * SR), b = Math.min(Math.floor(sy.end * SR), total);
    var len2 = b - a;
    if (len2 <= 0) continue;
    var f1 = (320 + sy.open * 480) * (gender === "female" ? 1.15 : 1);
    var f2 = (900 + sy.open * 900) * (gender === "female" ? 1.18 : 1);
    var f3 = 2500 * p.bright;
    var pos = sy.start / duration;
    var contour = 1 + 0.12 * Math.cos(pos * Math.PI * 2.3) - 0.1 * pos;
    var pitch = basePitch * sy.pm * contour;

    for (var i = 0; i < len2; i++) {
      var q = i / len2;
      var env = Math.pow(Math.sin(Math.PI * Math.min(Math.max(q, 0), 1)), 0.55);
      var time = (a + i) / SR;
      var f0 = pitch * (1 + p.vib * 0.012 * Math.sin(2 * Math.PI * 5.2 * time));

      ph0 += (2 * Math.PI * f0) / SR;
      ph1 += (2 * Math.PI * f1) / SR;
      ph2 += (2 * Math.PI * f2) / SR;
      ph3 += (2 * Math.PI * f3) / SR;

      var buzz = 0.55 * Math.sin(ph0) + 0.22 * Math.sin(ph0 * 2) + 0.1 * Math.sin(ph0 * 3);
      var form = 0.5 * Math.sin(ph1) * (0.6 + 0.4 * Math.sin(ph0)) +
        0.28 * Math.sin(ph2) * (0.5 + 0.5 * Math.sin(ph0 * 0.5)) +
        0.12 * Math.sin(ph3) * p.bright;

      nlp = nlp * 0.82 + (rand() * 2 - 1) * 0.18;
      var breath = sy.fric && q < 0.28 ? nlp * 0.7 : nlp * 0.06;
      var v = env * (buzz * 0.5 + form * 0.45 + breath) * 0.42;
      pcm[a + i] = Math.round(Math.max(-1, Math.min(1, v)) * 32767 * 0.9);
    }
  }

  for (var k = 0; k < total; k++) {
    var room = (rng(seed + k * 31)() * 2 - 1) * 260;
    var fade = k < 800 ? k / 800 : (k > total - 2200 ? Math.max(0, (total - k) / 2200) : 1);
    pcm[k] = Math.max(-32768, Math.min(32767, Math.round((pcm[k] + room) * fade)));
  }

  /* WAV হেডার */
  var bytes = new ArrayBuffer(44 + pcm.length * 2);
  var dv = new DataView(bytes);
  function wstr(off, str) { for (var j = 0; j < str.length; j++) dv.setUint8(off + j, str.charCodeAt(j)); }
  wstr(0, "RIFF"); dv.setUint32(4, 36 + pcm.length * 2, true); wstr(8, "WAVE");
  wstr(12, "fmt "); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
  dv.setUint32(24, SR, true); dv.setUint32(28, SR * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true);
  wstr(36, "data"); dv.setUint32(40, pcm.length * 2, true);
  for (var n = 0; n < pcm.length; n++) dv.setInt16(44 + n * 2, pcm[n], true);
  return new Blob([bytes], { type: "audio/wav" });
}

/* ---------- ব্রাউজার স্টোরেজ (IndexedDB) ---------- */
var DB_NAME = "dhwani-studio", DB_VER = 1;
function openDB() {
  return new Promise(function (resolve, reject) {
    var req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = function () {
      var db = req.result;
      if (!db.objectStoreNames.contains("demos")) db.createObjectStore("demos", { keyPath: "id" });
      if (!db.objectStoreNames.contains("inquiries")) db.createObjectStore("inquiries", { keyPath: "id" });
      if (!db.objectStoreNames.contains("artists")) db.createObjectStore("artists", { keyPath: "id" });
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error); };
  });
}
function idbAll(store) {
  return openDB().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(store, "readonly").objectStore(store).getAll();
      tx.onsuccess = function () { resolve(tx.result || []); };
      tx.onerror = function () { reject(tx.error); };
    });
  }).catch(function () { return []; });
}
function idbPut(store, value) {
  return openDB().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(store, "readwrite");
      tx.objectStore(store).put(value);
      tx.oncomplete = function () { resolve(value); };
      tx.onerror = function () { reject(tx.error); };
    });
  });
}
function idbDel(store, key) {
  return openDB().then(function (db) {
    return new Promise(function (resolve) {
      var tx = db.transaction(store, "readwrite");
      tx.objectStore(store).delete(key);
      tx.oncomplete = function () { resolve(true); };
    });
  });
}

/* প্লে-কাউন্ট localStorage-এ */
function playCounts() {
  try { return JSON.parse(localStorage.getItem("dhwani-plays") || "{}"); } catch (e) { return {}; }
}
function bumpPlay(id) {
  var m = playCounts();
  m[id] = (m[id] || 0) + 1;
  try { localStorage.setItem("dhwani-plays", JSON.stringify(m)); } catch (e) {}
}

/* সব আর্টিস্ট = বিল্ট-ইন + ব্রাউজারে যোগ করা */
var STATE = { artists: ARTISTS.slice(), demos: [], ready: false };

function loadAll() {
  return Promise.all([idbAll("artists"), idbAll("demos")]).then(function (res) {
    var extraArtists = res[0], extraDemos = res[1], counts = playCounts();
    STATE.artists = ARTISTS.concat(extraArtists);
    STATE.demos = DEMOS.concat(extraDemos).map(function (d) {
      var copy = {};
      for (var k in d) copy[k] = d[k];
      copy.plays = (d.plays || 0) + (counts[d.id] || 0);
      copy.artist = artistById(copy.artistId) || { name: "অজানা", slug: "", gender: "male", accent: "olive" };
      return copy;
    });
    STATE.demos.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0) || b.id - a.id; });
    STATE.ready = true;
    return STATE;
  });
}
function artistById(id) {
  for (var i = 0; i < STATE.artists.length; i++) if (STATE.artists[i].id === id) return STATE.artists[i];
  return null;
}
function artistBySlug(slug) {
  for (var i = 0; i < STATE.artists.length; i++) if (STATE.artists[i].slug === slug) return STATE.artists[i];
  return null;
}
function demoById(id) {
  for (var i = 0; i < STATE.demos.length; i++) if (STATE.demos[i].id === id) return STATE.demos[i];
  return null;
}
function demosOfArtist(id) {
  return STATE.demos.filter(function (d) { return d.artistId === id; });
}

/* ---------- অডিও সোর্স তৈরি ---------- */
var urlCache = {};
function demoAudioUrl(demo) {
  if (urlCache[demo.id]) return Promise.resolve(urlCache[demo.id]);
  var p;
  if (demo.blob) {
    p = Promise.resolve(URL.createObjectURL(demo.blob));
  } else if (demo.audioUrl) {
    p = Promise.resolve(demo.audioUrl);
  } else {
    p = Promise.resolve(URL.createObjectURL(
      synthWav(demo.synthSeed || demo.id, demo.category, (demo.artist && demo.artist.gender) || "male", demo.durationSec)
    ));
  }
  return p.then(function (u) { urlCache[demo.id] = u; return u; });
}
function isPlaceholder(demo) { return !demo.blob && !demo.audioUrl; }

function downloadDemo(id) {
  var demo = demoById(id);
  if (!demo) return;
  demoAudioUrl(demo).then(function (url) {
    var ext = ".wav";
    if (demo.blob && demo.blob.name) {
      var m = /\.[a-z0-9]+$/i.exec(demo.blob.name);
      if (m) ext = m[0];
    } else if (demo.audioUrl) {
      var m2 = /\.[a-z0-9]+$/i.exec(demo.audioUrl);
      if (m2) ext = m2[0];
    }
    var a = document.createElement("a");
    a.href = url;
    a.download = (demo.artist ? demo.artist.name + "-" : "") + demo.title + ext;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  });
}

/* ---------- গ্লোবাল প্লেয়ার ---------- */
var Player = (function () {
  var audio = null, currentId = null, playing = false;

  function icons(kind) {
    return kind === "pause"
      ? '<svg viewBox="0 0 24 24"><path d="M7 4h3.5v16H7zM13.5 4H17v16h-3.5z"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M8 5.14v13.72c0 .78.85 1.26 1.52.86l11.1-6.86a1 1 0 0 0 0-1.72L9.52 4.28A1 1 0 0 0 8 5.14Z"/></svg>';
  }

  function mount() {
    if (el("player")) return;
    var bar = document.createElement("div");
    bar.className = "player";
    bar.id = "player";
    bar.innerHTML =
      '<div class="player-inner">' +
        '<button class="big-play" id="pl-toggle" aria-label="প্লে/পজ">' + icons("play") + "</button>" +
        '<div class="player-mid">' +
          '<div class="player-title"><span class="t" id="pl-title"></span>' +
          '<a class="a" id="pl-artist" href="#"></a>' +
          '<span class="tag" id="pl-cat" style="margin-inline-start:auto"></span></div>' +
          '<div class="player-bar-row">' +
            '<span class="time" id="pl-cur" style="text-align:end">0:00</span>' +
            '<div class="seek"><div class="fill" id="pl-fill"></div>' +
            '<input type="range" id="pl-seek" min="0" max="100" step="0.1" value="0" aria-label="সিক"></div>' +
            '<span class="time" id="pl-dur">0:00</span>' +
          "</div>" +
        "</div>" +
        '<div class="player-actions">' +
          '<span class="badge-sample" id="pl-sample" style="display:none">নমুনা টোন</span>' +
          '<a href="#" id="pl-dl">ডাউনলোড</a>' +
          '<button id="pl-close" aria-label="বন্ধ">✕</button>' +
        "</div>" +
      "</div>";
    document.body.appendChild(bar);

    audio = document.createElement("audio");
    audio.preload = "metadata";
    document.body.appendChild(audio);

    el("pl-toggle").onclick = toggle;
    el("pl-close").onclick = stop;
    el("pl-dl").onclick = function (e) { e.preventDefault(); if (currentId) downloadDemo(currentId); };
    el("pl-seek").oninput = function () { if (audio) audio.currentTime = parseFloat(this.value); };

    audio.addEventListener("timeupdate", tick);
    audio.addEventListener("loadedmetadata", tick);
    audio.addEventListener("play", function () { playing = true; sync(); save(); });
    audio.addEventListener("pause", function () { playing = false; sync(); save(); });
    audio.addEventListener("ended", function () { playing = false; sync(); });
  }

  function tick() {
    if (!audio) return;
    var dur = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : (demoById(currentId) || {}).durationSec || 1;
    el("pl-cur").textContent = fmtTime(audio.currentTime);
    el("pl-dur").textContent = fmtTime(dur);
    el("pl-seek").max = dur;
    el("pl-seek").value = audio.currentTime;
    el("pl-fill").style.width = Math.min(100, (audio.currentTime / dur) * 100) + "%";
    paintCards(audio.currentTime / dur);
    if (Math.floor(audio.currentTime * 2) % 6 === 0) save();
  }

  function sync() {
    el("pl-toggle").innerHTML = icons(playing ? "pause" : "play");
    paintCards(null);
  }

  /* কার্ডগুলোর প্লে-বাটন ও ওয়েভফর্ম আপডেট */
  function paintCards(progress) {
    var nodes = document.querySelectorAll("[data-demo]");
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var id = parseInt(node.getAttribute("data-demo"), 10);
      var on = id === currentId;
      node.classList.toggle("active", on);
      var btn = node.querySelector(".play-btn, .round-btn");
      if (btn) {
        btn.classList.toggle("playing", on && playing);
        btn.innerHTML = icons(on && playing ? "pause" : "play");
      }
      var wave = node.querySelector(".wave");
      if (wave) {
        wave.classList.toggle("eq", on && playing);
        var bars = wave.children, p = on && progress != null ? progress : (on ? 0 : -1);
        for (var j = 0; j < bars.length; j++) {
          bars[j].classList.toggle("played", p >= 0 && j / bars.length <= p);
        }
      }
    }
  }

  function play(id) {
    mount();
    var demo = demoById(id);
    if (!demo) return;
    if (currentId === id) { toggle(); return; }
    currentId = id;
    el("player").classList.add("show");
    el("pl-title").textContent = demo.title;
    el("pl-artist").textContent = demo.artist ? demo.artist.name : "";
    el("pl-artist").href = demo.artist ? "artist.html?slug=" + encodeURIComponent(demo.artist.slug) : "#";
    var c = catOf(demo.category);
    el("pl-cat").textContent = c.icon + " " + c.label;
    el("pl-sample").style.display = isPlaceholder(demo) ? "" : "none";
    bumpPlay(id);
    demoAudioUrl(demo).then(function (url) {
      audio.src = url;
      audio.currentTime = 0;
      audio.play().catch(function () { playing = false; sync(); });
    });
  }

  function toggle() {
    if (!audio || !currentId) return;
    if (audio.paused) audio.play().catch(function () {}); else audio.pause();
  }

  function stop() {
    if (audio) { audio.pause(); audio.removeAttribute("src"); audio.load(); }
    currentId = null; playing = false;
    el("player").classList.remove("show");
    paintCards(null);
    try { sessionStorage.removeItem("dhwani-player"); } catch (e) {}
  }

  function save() {
    if (!currentId || !audio) return;
    try {
      sessionStorage.setItem("dhwani-player", JSON.stringify({
        id: currentId, pos: audio.currentTime, playing: playing
      }));
    } catch (e) {}
  }

  /* এক পেজ থেকে আরেক পেজে গেলে যেখানে ছিল সেখান থেকেই চালু হয় */
  function restore() {
    var raw;
    try { raw = sessionStorage.getItem("dhwani-player"); } catch (e) { return; }
    if (!raw) return;
    var st;
    try { st = JSON.parse(raw); } catch (e) { return; }
    var demo = demoById(st.id);
    if (!demo) return;
    mount();
    currentId = st.id;
    el("player").classList.add("show");
    el("pl-title").textContent = demo.title;
    el("pl-artist").textContent = demo.artist ? demo.artist.name : "";
    el("pl-artist").href = demo.artist ? "artist.html?slug=" + encodeURIComponent(demo.artist.slug) : "#";
    var c = catOf(demo.category);
    el("pl-cat").textContent = c.icon + " " + c.label;
    el("pl-sample").style.display = isPlaceholder(demo) ? "" : "none";
    demoAudioUrl(demo).then(function (url) {
      audio.src = url;
      audio.currentTime = st.pos || 0;
      if (st.playing) audio.play().catch(function () { playing = false; sync(); });
      else { playing = false; sync(); tick(); }
    });
  }

  return { play: play, mount: mount, restore: restore, paint: function () { paintCards(null); }, currentId: function () { return currentId; } };
})();
