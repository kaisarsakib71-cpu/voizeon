/* ============================================================
   app.js — পেজ রেন্ডারিং, ফিল্টার, ফর্ম ও অ্যাডমিন লজিক
   ============================================================ */

/* ফর্ম ফিল্ডের মান নেওয়ার নিরাপদ উপায় (form.name / form.title সরাসরি ব্যবহার করা যায় না) */
function fel(form, n) { return form.elements[n] || null; }
function fv(form, n) { var e = fel(form, n); return e ? String(e.value).trim() : ""; }

/* ---------- নেভিগেশন ---------- */
function initNav() {
  var btn = el("navToggle"), menu = el("navMobile");
  if (btn && menu) btn.onclick = function () { menu.classList.toggle("open"); };
  var page = document.body.getAttribute("data-page");
  var links = document.querySelectorAll(".nav-links a[data-nav]");
  for (var i = 0; i < links.length; i++) {
    if (links[i].getAttribute("data-nav") === page) links[i].classList.add("active");
  }
}

/* ---------- কার্ড টেমপ্লেট ---------- */
function demoCardHtml(demo, showArtist) {
  var c = catOf(demo.category);
  return '' +
    '<article class="card demo-card card-flat" data-demo="' + demo.id + '">' +
      '<div class="demo-top">' +
        '<button class="play-btn" onclick="Player.play(' + demo.id + ')" aria-label="প্লে করুন"></button>' +
        '<div style="min-width:0;flex:1">' +
          '<div class="tags">' +
            '<span class="tag">' + c.icon + " " + esc(c.label) + "</span>" +
            '<span class="muted" style="font-size:11px">' + esc(demo.language) + "</span>" +
            (isPlaceholder(demo)
              ? '<span class="tag tag-outline" title="আসল ফাইল আপলোড করলে সেটাই বাজবে">নমুনা টোন</span>'
              : '<span class="tag tag-leaf">আপলোডেড</span>') +
          "</div>" +
          "<h3>" + esc(demo.title) + "</h3>" +
          (showArtist !== false && demo.artist
            ? '<a class="artist-link" href="artist.html?slug=' + encodeURIComponent(demo.artist.slug) + '">' + esc(demo.artist.name) + "</a>"
            : "") +
          (demo.tone ? '<p class="tone">' + esc(demo.tone) + "</p>" : "") +
        "</div>" +
      "</div>" +
      (demo.description ? '<p class="desc">' + esc(demo.description) + "</p>" : "") +
      waveHtml((demo.synthSeed || demo.id) + demo.id, 44, false) +
      '<div class="demo-foot">' +
        "<span>⏱ " + fmtTime(demo.durationSec) + "</span>" +
        "<span>▶ " + bn(demo.plays || 0) + " বার শোনা হয়েছে</span>" +
        '<a href="#" class="dl-link" onclick="event.preventDefault();downloadDemo(' + demo.id + ')">ডাউনলোড</a>' +
      "</div>" +
    "</article>";
}

function renderDemos(container, list, showArtist) {
  if (!container) return;
  if (!list.length) {
    container.innerHTML = '<div class="empty">এই ফিল্টারে কোনো ডেমো পাওয়া যায়নি। অন্য ক্যাটাগরি চেষ্টা করুন।</div>';
    return;
  }
  container.innerHTML = list.map(function (d) { return demoCardHtml(d, showArtist); }).join("");
  Player.paint();
}

function artistCardHtml(a) {
  var count = demosOfArtist(a.id).length;
  var chips = a.specialties.slice(0, 3).map(function (s) {
    var c = catOf(s);
    return '<span class="tag">' + c.icon + " " + esc(c.label) + "</span>";
  }).join("");
  return '' +
    '<a class="card" href="artist.html?slug=' + encodeURIComponent(a.slug) + '">' +
      '<div class="artist-head">' +
        '<div class="avatar md acc-' + esc(a.accent) + '">' + esc(a.name.charAt(0)) + "</div>" +
        '<div style="min-width:0;flex:1">' +
          '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
            "<h3>" + esc(a.name) + "</h3>" +
            (a.featured ? '<span class="tag tag-gold">ফিচার্ড</span>' : "") +
          "</div>" +
          '<p class="tagline">' + esc(a.tagline) + "</p>" +
          '<p class="meta">📍 ' + esc(a.city) + " • " + bn(a.experienceYears) + " বছরের অভিজ্ঞতা</p>" +
        "</div>" +
      "</div>" +
      '<div class="tags">' + chips + "</div>" +
      '<div class="card-foot"><span>🎧 ' + bn(count) + " টি ডেমো</span><span>" + esc(a.languages) + '</span><span class="go">প্রোফাইল →</span></div>' +
    "</a>";
}

/* ---------- ফিল্টার বার ---------- */
function initFilters(opts) {
  var box = el("filterBox");
  if (!box) return;
  var state = {
    q: qs("q"), category: qs("category"), language: qs("language"), gender: qs("gender")
  };
  var chips = CATEGORIES.map(function (c) {
    return '<button class="chip' + (state.category === c.key ? " active" : "") + '" data-cat="' + c.key + '">' + c.icon + " " + c.label + "</button>";
  }).join("");
  var langs = LANGUAGES.map(function (l) {
    return '<option value="' + l + '"' + (state.language === l ? " selected" : "") + ">" + l + "</option>";
  }).join("");

  box.innerHTML =
    '<div class="filter-row">' +
      '<input type="search" id="fq" placeholder="' + esc(opts.placeholder) + '" value="' + esc(state.q) + '">' +
      '<select id="flang" style="max-width:190px"><option value="">সব ভাষা</option>' + langs + "</select>" +
      (opts.gender
        ? '<select id="fgender" style="max-width:170px"><option value="">সব কণ্ঠ</option>' +
          '<option value="male"' + (state.gender === "male" ? " selected" : "") + ">পুরুষকণ্ঠ</option>" +
          '<option value="female"' + (state.gender === "female" ? " selected" : "") + ">নারীকণ্ঠ</option></select>"
        : "") +
      '<button class="btn btn-dark" id="fgo">খুঁজুন</button>' +
    "</div>" +
    '<div class="chips"><button class="chip' + (!state.category ? " active" : "") + '" data-cat="">সব ক্যাটাগরি</button>' + chips +
      (state.q || state.category || state.language || state.gender
        ? '<button class="chip-clear" id="fclear">ফিল্টার মুছুন</button>' : "") +
    "</div>";

  function apply(next) {
    var merged = {
      q: el("fq").value.trim(),
      category: state.category,
      language: el("flang") ? el("flang").value : "",
      gender: el("fgender") ? el("fgender").value : ""
    };
    for (var k in next) merged[k] = next[k];
    var parts = [];
    for (var key in merged) if (merged[key]) parts.push(key + "=" + encodeURIComponent(merged[key]));
    window.location.href = opts.page + (parts.length ? "?" + parts.join("&") : "");
  }

  el("fgo").onclick = function () { apply({}); };
  el("fq").onkeydown = function (e) { if (e.key === "Enter") apply({}); };
  if (el("flang")) el("flang").onchange = function () { apply({}); };
  if (el("fgender")) el("fgender").onchange = function () { apply({}); };
  if (el("fclear")) el("fclear").onclick = function () { window.location.href = opts.page; };
  var cbtns = box.querySelectorAll("[data-cat]");
  for (var i = 0; i < cbtns.length; i++) {
    cbtns[i].onclick = function () { apply({ category: this.getAttribute("data-cat") }); };
  }
  return state;
}

/* ---------- পেজ: হোম ---------- */
function initHome() {
  var totalPlays = STATE.demos.reduce(function (s, d) { return s + (d.plays || 0); }, 0);
  var cats = {};
  STATE.demos.forEach(function (d) { cats[d.category] = (cats[d.category] || 0) + 1; });

  el("statArtists").textContent = bn(STATE.artists.length);
  el("statDemos").textContent = bn(STATE.demos.length);
  el("statCats").textContent = bn(Object.keys(cats).length);
  el("statPlays").textContent = bn(totalPlays);

  /* হিরোর ছোট লিস্ট */
  el("heroList").innerHTML = STATE.demos.slice(0, 5).map(function (d) {
    var c = catOf(d.category);
    return '<li><button class="mini-row" data-demo="' + d.id + '" onclick="Player.play(' + d.id + ')">' +
      '<span class="round-btn"></span>' +
      '<span class="txt"><span class="t1">' + esc(d.title) + "</span>" +
      '<span class="t2">' + esc(d.artist.name) + " • " + c.icon + " " + esc(c.label) + "</span></span>" +
      waveHtml((d.synthSeed || d.id) + d.id, 22, true) +
      '<span class="dur">' + fmtTime(d.durationSec) + "</span></button></li>";
  }).join("");

  /* ক্যাটাগরি কার্ড */
  el("catGrid").innerHTML = CATEGORIES.map(function (c) {
    return '<a class="card cat-card" href="demos.html?category=' + c.key + '">' +
      '<div class="cat-top"><span class="icon">' + c.icon + '</span><span class="tag">' + bn(cats[c.key] || 0) + " ডেমো</span></div>" +
      "<div><h3>" + c.label + '</h3><p class="en">' + c.labelEn + "</p><p>" + c.blurb + "</p></div>" +
      "</a>";
  }).join("");

  /* ফিচার্ড আর্টিস্ট */
  var featured = STATE.artists.filter(function (a) { return a.featured; }).slice(0, 4);
  if (!featured.length) featured = STATE.artists.slice(0, 4);
  el("featuredArtists").innerHTML = featured.map(artistCardHtml).join("");

  /* সর্বশেষ ডেমো */
  renderDemos(el("latestDemos"), STATE.demos.slice(0, 6), true);
  initBookingForm("bookingForm", null);
  Player.paint();
}

/* ---------- পেজ: আর্টিস্ট তালিকা ---------- */
function initArtists() {
  var st = initFilters({ page: "artists.html", gender: true, placeholder: "আর্টিস্টের নাম, শহর বা টোন..." });
  var list = STATE.artists.filter(function (a) {
    if (st.q) {
      var hay = (a.name + " " + a.tagline + " " + a.bio + " " + a.city).toLowerCase();
      if (hay.indexOf(st.q.toLowerCase()) === -1) return false;
    }
    if (st.category && a.specialties.indexOf(st.category) === -1) return false;
    if (st.language && a.languages.indexOf(st.language) === -1) return false;
    if (st.gender && a.gender !== st.gender) return false;
    return true;
  }).sort(function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.experienceYears - a.experienceYears; });

  el("artistCount").textContent = bn(list.length) + " জন আর্টিস্ট পাওয়া গেছে" +
    (st.category ? " • " + catOf(st.category).label : "");
  el("artistGrid").innerHTML = list.length
    ? list.map(artistCardHtml).join("")
    : '<div class="empty" style="grid-column:1/-1">এই ফিল্টারে কোনো আর্টিস্ট নেই। ফিল্টার বদলে আবার চেষ্টা করুন।</div>';
}

/* ---------- পেজ: ডেমো লাইব্রেরি ---------- */
function initDemos() {
  var st = initFilters({ page: "demos.html", gender: false, placeholder: "ডেমোর শিরোনাম, আর্টিস্ট বা কীওয়ার্ড..." });
  var list = STATE.demos.filter(function (d) {
    if (st.category && d.category !== st.category) return false;
    if (st.language && d.language !== st.language) return false;
    if (st.q) {
      var hay = (d.title + " " + d.description + " " + (d.artist ? d.artist.name : "")).toLowerCase();
      if (hay.indexOf(st.q.toLowerCase()) === -1) return false;
    }
    return true;
  });
  el("demoCount").textContent = bn(list.length) + " টি ডেমো" + (st.category ? " • " + catOf(st.category).label : "");
  el("totalClips").textContent = bn(STATE.demos.length);
  renderDemos(el("demoGrid"), list, true);

  var counts = {};
  STATE.demos.forEach(function (d) { counts[d.category] = (counts[d.category] || 0) + 1; });
  el("catLinks").innerHTML = CATEGORIES.map(function (c) {
    return '<a class="btn btn-outline btn-sm" style="background:#fff" href="demos.html?category=' + c.key + '">' +
      c.icon + " " + c.label + " <span class=\"muted\">(" + bn(counts[c.key] || 0) + ")</span></a>";
  }).join("");
}

/* ---------- পেজ: আর্টিস্ট প্রোফাইল ---------- */
function initArtistDetail() {
  var a = artistBySlug(qs("slug"));
  if (!a) {
    el("detailRoot").innerHTML = '<div class="wrap section"><div class="empty">আর্টিস্ট খুঁজে পাওয়া যায়নি। ' +
      '<a href="artists.html" style="color:var(--leaf-700);text-decoration:underline">সব আর্টিস্ট দেখুন</a></div></div>';
    return;
  }
  document.title = a.name + " — ভয়েস আর্টিস্ট | ধ্বনি স্টুডিও";
  var list = demosOfArtist(a.id);
  var plays = list.reduce(function (s, d) { return s + (d.plays || 0); }, 0);

  el("dAvatar").className = "avatar xl acc-" + a.accent;
  el("dAvatar").textContent = a.name.charAt(0);
  el("dName").textContent = a.name;
  el("dFeatured").style.display = a.featured ? "" : "none";
  el("dTagline").textContent = a.tagline;
  el("dChips").innerHTML = a.specialties.map(function (s) {
    var c = catOf(s);
    return '<span class="tag tag-dark">' + c.icon + " " + esc(c.label) + "</span>";
  }).join("");
  el("dStats").innerHTML =
    statBox("অভিজ্ঞতা", bn(a.experienceYears) + " বছর") +
    statBox("ডেমো", bn(list.length) + " টি") +
    statBox("মোট প্লে", bn(plays)) +
    statBox("রেট / মিনিট", "৳" + bn(a.ratePerMinute));
  el("dBio").textContent = a.bio;
  el("dMeta").innerHTML =
    '<span class="tag" style="padding:8px 16px">📍 ' + esc(a.city) + "</span>" +
    '<span class="tag" style="padding:8px 16px">🗣 ' + esc(a.languages) + "</span>" +
    '<span class="tag" style="padding:8px 16px">' + (a.gender === "female" ? "♀ নারীকণ্ঠ" : "♂ পুরুষকণ্ঠ") + "</span>";
  el("dDemoCount").textContent = "ভয়েস ডেমো (" + bn(list.length) + ")";
  renderDemos(el("dDemos"), list, false);
  el("dBookTitle").textContent = a.name + "-কে বুক করুন";
  el("bookingArtistNote").innerHTML = "🎙️ বুকিং রিকোয়েস্ট যাচ্ছে <strong>" + esc(a.name) + "</strong>-এর জন্য।";
  el("bookingArtistNote").style.display = "";
  initBookingForm("bookingForm", a);
}
function statBox(k, v) {
  return '<div class="stat-box"><dt>' + k + "</dt><dd>" + v + "</dd></div>";
}

/* ---------- বুকিং / কোট ফর্ম ---------- */
function initBookingForm(formId, artist) {
  var form = el(formId);
  if (!form) return;
  var catSel = form.querySelector('[name="projectType"]');
  if (catSel && !catSel.options.length) {
    catSel.innerHTML = CATEGORIES.map(function (c) {
      return '<option value="' + c.key + '"' + (c.key === "ads" ? " selected" : "") + ">" + c.label + " — " + c.labelEn + "</option>";
    }).join("");
  }
  var budgetSel = form.querySelector('[name="budget"]');
  if (budgetSel && !budgetSel.options.length) {
    budgetSel.innerHTML = BUDGETS.map(function (b, i) {
      return '<option' + (i === 1 ? " selected" : "") + ">" + b + "</option>";
    }).join("");
  }

  form.onsubmit = function (e) {
    e.preventDefault();
    var box = form.querySelector(".form-msg");
    var data = {
      id: Date.now(),
      name: fv(form, "name"),
      email: fv(form, "email"),
      phone: fv(form, "phone"),
      company: fv(form, "company"),
      projectType: fv(form, "projectType"),
      budget: fv(form, "budget"),
      message: fv(form, "message"),
      artistName: artist ? artist.name : "",
      status: "new",
      createdAt: Date.now()
    };
    if (!data.name || !data.email) {
      box.className = "form-msg alert alert-err";
      box.textContent = "নাম ও ইমেইল অবশ্যই দিতে হবে।";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      box.className = "form-msg alert alert-err";
      box.textContent = "সঠিক ইমেইল দিন।";
      return;
    }
    idbPut("inquiries", data).then(function () {
      box.className = "form-msg alert alert-ok";
      box.innerHTML = "ধন্যবাদ! আপনার অনুরোধ সংরক্ষিত হয়েছে। সরাসরি ইমেইলে পাঠাতে চাইলে " +
        '<a id="mailLink" style="text-decoration:underline" href="#">এখানে ক্লিক করুন</a>।';
      var subject = "ভয়েস বুকিং রিকোয়েস্ট — " + data.name;
      var body = "নাম: " + data.name + "\nইমেইল: " + data.email + "\nফোন: " + data.phone +
        "\nপ্রতিষ্ঠান: " + data.company + "\nপ্রজেক্ট: " + catOf(data.projectType).label +
        "\nবাজেট: " + data.budget + (data.artistName ? "\nপছন্দের আর্টিস্ট: " + data.artistName : "") +
        "\n\n" + data.message;
      el("mailLink").href = "mailto:hello@dhwanistudio.bd?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      form.reset();
    });
  };
}

/* ---------- পেজ: আপলোড ---------- */
function initUpload() {
  var form = el("uploadForm");
  if (!form) return;
  var sel = form.querySelector('[name="artistId"]');
  sel.innerHTML = STATE.artists.map(function (a) {
    return '<option value="' + a.id + '">' + esc(a.name) + "</option>";
  }).join("") + '<option value="new">➕ নতুন আর্টিস্ট যোগ করুন</option>';
  sel.onchange = function () {
    el("newArtistBox").style.display = this.value === "new" ? "" : "none";
  };
  form.querySelector('[name="category"]').innerHTML = CATEGORIES.map(function (c) {
    return '<option value="' + c.key + '">' + c.icon + " " + c.label + " — " + c.labelEn + "</option>";
  }).join("");
  form.querySelector('[name="language"]').innerHTML = LANGUAGES.map(function (l) {
    return "<option>" + l + "</option>";
  }).join("");

  var picked = null, pickedDuration = 0;
  form.querySelector('[name="file"]').onchange = function () {
    picked = this.files && this.files[0] ? this.files[0] : null;
    if (!picked) { el("fileInfo").style.display = "none"; return; }
    el("fileInfo").style.display = "";
    el("fileInfo").textContent = picked.name + " (" + (picked.size / 1048576).toFixed(2) + " MB)";
    var url = URL.createObjectURL(picked), a = new Audio();
    a.preload = "metadata";
    a.onloadedmetadata = function () {
      if (isFinite(a.duration)) {
        pickedDuration = Math.round(a.duration);
        el("fileInfo").textContent += " • " + fmtTime(pickedDuration);
      }
      URL.revokeObjectURL(url);
    };
    a.src = url;
  };

  form.onsubmit = function (e) {
    e.preventDefault();
    var box = el("uploadMsg"), bar = el("uploadProgress"), fill = el("uploadFill");
    var title = fv(form, "title");
    if (!title) {
      box.className = "alert alert-err"; box.textContent = "ডেমোর শিরোনাম দিন।"; return;
    }
    var artistId, saveArtist;
    if (sel.value === "new") {
      var nm = fv(form, "newArtistName");
      if (!nm) { box.className = "alert alert-err"; box.textContent = "নতুন আর্টিস্টের নাম দিন।"; return; }
      artistId = Date.now();
      saveArtist = idbPut("artists", {
        id: artistId,
        slug: "artist-" + artistId,
        name: nm,
        tagline: fv(form, "newArtistTagline"),
        bio: fv(form, "newArtistBio"),
        city: fv(form, "newArtistCity") || "ঢাকা",
        gender: fv(form, "newArtistGender"),
        languages: fv(form, "newArtistLanguages") || "বাংলা",
        specialties: [fv(form, "category")],
        experienceYears: parseInt(fv(form, "newArtistExperience"), 10) || 1,
        ratePerMinute: parseInt(fv(form, "newArtistRate"), 10) || 2000,
        accent: "olive",
        featured: false,
        custom: true
      });
    } else {
      artistId = parseInt(sel.value, 10);
      saveArtist = Promise.resolve();
    }

    bar.style.display = "";
    fill.style.width = "35%";

    saveArtist.then(function () {
      var demo = {
        id: Date.now() + 1,
        artistId: artistId,
        title: title,
        category: fv(form, "category"),
        language: fv(form, "language"),
        tone: fv(form, "tone"),
        description: fv(form, "description"),
        durationSec: pickedDuration || 12,
        synthSeed: Math.floor(Math.random() * 90000) + 11,
        plays: 0,
        custom: true,
        createdAt: Date.now()
      };
      if (picked) {
        if (picked.size > 15 * 1048576) {
          throw new Error("ফাইলের সর্বোচ্চ সাইজ ১৫ এমবি।");
        }
        demo.blob = picked;
        demo.mimeType = picked.type || "audio/mpeg";
      }
      fill.style.width = "80%";
      return idbPut("demos", demo);
    }).then(function () {
      fill.style.width = "100%";
      box.className = "alert alert-ok";
      box.innerHTML = '✅ ডেমো সফলভাবে যোগ হয়েছে! <a href="demos.html" style="text-decoration:underline">ডেমো লাইব্রেরিতে দেখুন</a>।';
      form.reset();
      el("fileInfo").style.display = "none";
      el("newArtistBox").style.display = "none";
      picked = null; pickedDuration = 0;
      setTimeout(function () { bar.style.display = "none"; fill.style.width = "0"; }, 800);
      loadAll();
    }).catch(function (err) {
      bar.style.display = "none";
      box.className = "alert alert-err";
      box.textContent = err && err.message ? err.message : "সংরক্ষণ করা যায়নি।";
    });
  };
}

/* ---------- পেজ: অ্যাডমিন ---------- */
function initAdmin() {
  var plays = STATE.demos.reduce(function (s, d) { return s + (d.plays || 0); }, 0);
  idbAll("inquiries").then(function (rows) {
    rows.sort(function (a, b) { return b.createdAt - a.createdAt; });
    el("aArtists").textContent = bn(STATE.artists.length);
    el("aDemos").textContent = bn(STATE.demos.length);
    el("aPlays").textContent = bn(plays);
    el("aNew").textContent = bn(rows.filter(function (r) { return r.status === "new"; }).length);

    var STATUS = { new: "নতুন", contacted: "যোগাযোগ হয়েছে", booked: "বুকড", closed: "ক্লোজড" };
    el("inquiryList").innerHTML = rows.length ? rows.map(function (r) {
      var opts = Object.keys(STATUS).map(function (k) {
        return '<option value="' + k + '"' + (r.status === k ? " selected" : "") + ">" + STATUS[k] + "</option>";
      }).join("");
      return '<div class="card card-flat" style="margin-bottom:12px">' +
        '<div class="flex-between" style="align-items:flex-start">' +
          "<div><h3>" + esc(r.name) + (r.company ? ' <span class="muted">• ' + esc(r.company) + "</span>" : "") + "</h3>" +
          '<p class="muted" style="margin:0">' + esc(r.email) + (r.phone ? " • " + esc(r.phone) : "") + "</p></div>" +
          '<div style="display:flex;gap:8px;align-items:center">' +
            '<select style="width:auto" onchange="setStatus(' + r.id + ',this.value)">' + opts + "</select>" +
            '<button class="btn btn-outline btn-sm" onclick="delInquiry(' + r.id + ')">মুছুন</button>' +
          "</div>" +
        "</div>" +
        '<div class="tags">' +
          '<span class="tag">' + esc(catOf(r.projectType).label) + "</span>" +
          (r.budget ? '<span class="tag">💰 ' + esc(r.budget) + "</span>" : "") +
          (r.artistName ? '<span class="tag">🎙 ' + esc(r.artistName) + "</span>" : "") +
          '<span class="tag">' + new Date(r.createdAt).toLocaleDateString("bn-BD") + "</span>" +
        "</div>" +
        (r.message ? '<p style="background:var(--sand-100);border-radius:12px;padding:12px;margin:0;font-size:14px">' + esc(r.message) + "</p>" : "") +
        "</div>";
    }).join("") : '<div class="empty">এখনো কোনো বুকিং রিকোয়েস্ট আসেনি।</div>';
  });

  el("demoRows").innerHTML = STATE.demos.map(function (d) {
    return "<tr><td><strong>" + esc(d.title) + "</strong>" +
      (isPlaceholder(d) ? ' <span class="tag tag-outline">নমুনা</span>' : "") + "</td>" +
      "<td>" + esc(d.artist ? d.artist.name : "") + "</td>" +
      "<td>" + esc(catOf(d.category).label) + "</td>" +
      "<td>" + bn(d.plays || 0) + "</td>" +
      '<td style="text-align:end">' + (d.custom
        ? '<button class="btn btn-outline btn-sm" onclick="delDemo(' + d.id + ')">মুছুন</button>'
        : '<span class="muted">বিল্ট-ইন</span>') + "</td></tr>";
  }).join("");

  el("exportBtn").onclick = function () {
    idbAll("inquiries").then(function (rows) {
      var blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "dhwani-inquiries.json";
      a.click();
    });
  };
}
function setStatus(id, status) {
  idbAll("inquiries").then(function (rows) {
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].id === id) { rows[i].status = status; return idbPut("inquiries", rows[i]).then(initAdmin); }
    }
  });
}
function delInquiry(id) {
  if (!confirm("রিকোয়েস্টটি মুছে ফেলবেন?")) return;
  idbDel("inquiries", id).then(initAdmin);
}
function delDemo(id) {
  if (!confirm("ডেমোটি মুছে ফেলবেন?")) return;
  idbDel("demos", id).then(function () { return loadAll(); }).then(initAdmin);
}

/* ---------- বুট ---------- */
document.addEventListener("DOMContentLoaded", function () {
  initNav();
  loadAll().then(function () {
    var page = document.body.getAttribute("data-page");
    if (page === "home") initHome();
    else if (page === "artists") initArtists();
    else if (page === "artist") initArtistDetail();
    else if (page === "demos") initDemos();
    else if (page === "upload") initUpload();
    else if (page === "contact") initBookingForm("bookingForm", null);
    else if (page === "admin") initAdmin();
    Player.restore();
  });
});
