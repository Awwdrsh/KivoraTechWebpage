(function () {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EMAIL = "info@kivoratech.com.np";

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---- tech stack marquee (built from the 26 local SVGs) ---- */
  (function stack() {
    const track = document.getElementById("stackTrack");
    if (!track) return;
    const chip = (label, file, hidden) => {
      const d = document.createElement("div");
      d.className = "chip";
      if (hidden) d.setAttribute("aria-hidden", "true");
      d.innerHTML =
        '<img src="icons/tech/' + file + '.svg" alt="" aria-hidden="true" width="20" height="20" ' +
        'onerror="this.parentNode.classList.add(\'noimg\')" />' +
        "<span>" + label + "</span>";
      return d;
    };
    // [display name, icon file] — keep the two separate so labels stay properly
    // cased. Using the icon slug as the label rendered everything lowercase.
    const STACK = [
      ["Kubernetes", "kubernetes"], ["Docker", "docker"], ["Terraform", "terraform"],
      ["AWS", "aws"], ["Azure", "azure"], ["Grafana", "grafana"],
      ["Prometheus", "prometheus"], ["Vault", "vault"], ["ArgoCD", "argocd"],
      ["Istio", "istio"], ["Kafka", "kafka"], ["Elasticsearch", "elasticsearch"],
      ["Snowflake", "snowflake"], ["PostgreSQL", "postgresql"], ["Redis", "redis"],
      ["GraphQL", "graphql"], ["gRPC", "grpc"], ["Python", "python"], ["Go", "go"],
      ["Rust", "rust"], ["TypeScript", "typescript"], ["React", "react"],
      ["Node.js", "node-js"], ["TensorFlow", "tensorflow"], ["PyTorch", "pytorch"],
      ["WebAssembly", "webassembly"],
    ];
    STACK.forEach(function (pair) {
      track.appendChild(chip(pair[0], pair[1], false));
    });
    // duplicate for a seamless -50% loop, hidden from assistive tech
    STACK.forEach(function (pair) {
      track.appendChild(chip(pair[0], pair[1], true));
    });
    // Keep the accessible label in step with the chips. If someone edits the
    // list above and forgets the aria-label, fix the markup rather than
    // letting a screen reader hear a stale list.
    const box = document.querySelector(".marquee");
    if (box) {
      const label = "Technologies we build on: " + STACK.map(function (p) { return p[0]; }).join(", ");
      if (box.getAttribute("aria-label") !== label) box.setAttribute("aria-label", label);
    }
    if (reduce) track.style.animation = "none";
  })();

  /* ---- nav: shadow once past the top ---- */
  const nav = document.getElementById("nav");
  const sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:1px";
  document.body.prepend(sentinel);
  new IntersectionObserver(function (e) {
    nav.classList.toggle("scrolled", !e[0].isIntersecting);
  }, { threshold: 0 }).observe(sentinel);

  /* ---- scroll progress ---- */
  const progress = document.getElementById("progress");
  const end = document.createElement("div");
  end.setAttribute("aria-hidden", "true");
  end.style.cssText = "position:absolute;bottom:0;left:0;width:1px;height:1px";
  document.body.append(end);
  new IntersectionObserver(function (e) {
    progress.style.width = e[0].isIntersecting ? "100%" : "0%";
  }, { threshold: 0 }).observe(end);

  /* ---- reveal on scroll ----
     Stagger siblings sharing a parent so a grid cascades instead of firing
     as one block. --d is read by .rv in CSS. */
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.06, rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll(".rv").forEach(function (el) {
    const group = el.parentElement;
    const sibs = group
      ? [].slice.call(group.children).filter(function (c) { return c.classList.contains("rv"); })
      : [el];
    const i = sibs.indexOf(el);
    el.style.setProperty("--d", Math.min(i < 0 ? 0 : i, 8) * 55 + "ms");
    io.observe(el);
  });

  /* ---- hero load sequence ----
     querySelectorAll, not querySelector: both the hero copy and the
     deliverable card carry .load, and toggling only one would leave the
     other stuck at opacity 0. */
  const loads = document.querySelectorAll(".load");
  if (loads.length) {
    requestAnimationFrame(function () {
      setTimeout(function () {
        loads.forEach(function (el) { el.classList.add("on"); });
      }, 60);
    });
  }

  /* ---- magnetic buttons (pointer devices only) ---- */
  if (!reduce && matchMedia("(hover:hover) and (pointer:fine)").matches) {
    document.querySelectorAll(".btn").forEach(function (el) {
      let raf = 0, tx = 0, ty = 0;
      el.addEventListener("pointermove", function (e) {
        const r = el.getBoundingClientRect();
        tx = e.clientX - (r.left + r.width / 2);
        ty = e.clientY - (r.top + r.height / 2);
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0;
          el.style.setProperty("--mx", (tx * 0.14).toFixed(2) + "px");
          el.style.setProperty("--my", (ty * 0.2).toFixed(2) + "px");
        });
      });
      el.addEventListener("pointerleave", function () {
        el.style.setProperty("--mx", "0px");
        el.style.setProperty("--my", "0px");
      });
    });
  }

  /* ---- FAQ accordion ---- */
  const faqList = document.querySelector(".faq-list");
  if (faqList) {
    faqList.addEventListener("click", function (e) {
      const btn = e.target.closest("button");
      if (!btn) return;
      const item = btn.closest(".faq-item");
      const panel = item.querySelector(".faq-a");
      const open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      panel.style.maxHeight = open ? panel.scrollHeight + "px" : "";
    });
    addEventListener("resize", function () {
      document.querySelectorAll(".faq-item.open .faq-a").forEach(function (p) {
        p.style.maxHeight = p.scrollHeight + "px";
      });
    });
  }

  /* ---- contact form ---- */
  const form = document.getElementById("contactForm");
  if (form) {
    const msg = document.getElementById("formMsg");
    const submit = document.getElementById("submitBtn");
    const validators = {
      name: function (v) { return v.trim().length >= 2 ? "" : "Please tell us your name."; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Please enter a valid email address."; },
      message: function (v) { return v.trim().length >= 10 ? "" : "A little more detail helps (10+ characters)."; },
    };
    function check(f) {
      const input = f.querySelector("input,textarea");
      const e = validators[f.dataset.field](input.value);
      f.classList.toggle("invalid", !!e);
      f.querySelector(".err").textContent = e;
      input.setAttribute("aria-invalid", e ? "true" : "false");
      return !e;
    }
    const fields = [].slice.call(form.querySelectorAll(".field[data-field]"));
    fields.forEach(function (f) {
      f.querySelector("input,textarea").addEventListener("input", function () { check(f); });
    });

    const ta = form.querySelector("[name=message]");
    const counter = document.getElementById("charCount");
    const max = Number(ta.getAttribute("maxlength")) || 2000;
    function count() {
      counter.textContent = ta.value.length + " / " + max;
      counter.classList.toggle("near", ta.value.length > max * 0.9);
    }
    ta.addEventListener("input", count);
    count();

    const copy = document.getElementById("copyEmail");
    copy.addEventListener("click", async function () {
      const label = copy.textContent;
      try {
        await navigator.clipboard.writeText(EMAIL);
        copy.textContent = "Copied";
      } catch (_) {
        copy.textContent = EMAIL;
      }
      msg.className = "msg ok";
      msg.textContent = "Copied " + EMAIL + " to your clipboard.";
      setTimeout(function () { copy.textContent = label; }, 2200);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.querySelector("[name=website]").value) { form.reset(); return; }
      const results = fields.map(check);
      if (results.indexOf(false) !== -1) {
        msg.className = "msg err";
        msg.textContent = "Please fix the highlighted fields.";
        fields[results.indexOf(false)].querySelector("input,textarea").focus();
        return;
      }
      const nm = form.querySelector("[name=name]").value.trim();
      const em = form.querySelector("[name=email]").value.trim();
      const body = ta.value.trim();
      submit.disabled = true;
      submit.classList.add("busy");
      msg.className = "msg";
      msg.textContent = "Opening your email app…";
      const url = "mailto:" + EMAIL +
        "?subject=" + encodeURIComponent("Project enquiry from " + nm) +
        "&body=" + encodeURIComponent(body + "\n\n— " + nm + " (" + em + ")");
      setTimeout(function () { location.href = url; }, 80);
      msg.className = "msg ok";
      msg.textContent = "Handing off to your email app. If nothing opens, write to " + EMAIL + ".";
      form.reset();
      count();
      fields.forEach(function (f) {
        f.classList.remove("invalid");
        f.querySelector("input,textarea").removeAttribute("aria-invalid");
      });
      setTimeout(function () { submit.disabled = false; submit.classList.remove("busy"); }, 2400);
    });
  }

  /* ---- bottom nav: scroll-linked active state + sliding gold pill ----
     Facebook-style: the pill follows whichever section dominates the
     viewport, so the active tab updates as you scroll, not only on click. */
  (function () {
    var nav = document.getElementById("bottomNav");
    if (!nav) return;
    var pill = nav.querySelector(".bn-pill");
    var links = nav.querySelectorAll(".bn-link");

    function movePill(link) {
      if (!pill || !link) return;
      var navRect = nav.getBoundingClientRect();
      var rect = link.getBoundingClientRect();
      pill.style.transform = "translateX(" + (rect.left - navRect.left) + "px)";
      pill.style.width = rect.width + "px";
    }

    function activate(link) {
      links.forEach(function (a) { a.classList.remove("active"); });
      link.classList.add("active");
      movePill(link);
    }

    // initial pill position on the default-active link
    var def = nav.querySelector(".bn-link.active");
    if (def) movePill(def);

    // watch each section the nav links to: a 1%-tall band at the viewport
    // middle marks whichever section the reader is currently inside.
    // (A ratio threshold can't work here — tall sections can never reach
    // 45% visibility inside a shrunken root band.)
    links.forEach(function (a) {
      var section = document.getElementById(a.dataset.target);
      if (!section) return;
      var so = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) activate(a);
        });
      }, { threshold: 0, rootMargin: "-50% 0px -49% 0px" });
      so.observe(section);
    });

    // clicking a link also fires the pill immediately
    links.forEach(function (a) {
      a.addEventListener("click", function () { activate(a); });
    });

    // keep the pill aligned on resize / orientation change
    addEventListener("resize", function () {
      var active = nav.querySelector(".bn-link.active");
      if (active) movePill(active);
    });
  })();

  /* ---- team ID gallery (mobile) ----
     Clones .team > li into 3D badge cards so names/bios exist once.
     Discrete 3-slot coverflow: threshold swipe + arrows + dots rotate,
     tap flips a badge to its bio. transform/opacity only. */
  (function () {
    var host = document.getElementById("teamGallery");
    var items = document.querySelectorAll(".team > li");
    if (!host || !items.length) return;

    var KMARK = '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M22 15 V49 M24 32 L40 15 M24 32 L40 49" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg>';
    var stage = document.createElement("div");
    stage.className = "tg-stage";
    stage.setAttribute("role", "region");
    stage.setAttribute("aria-label", "Team members");
    host.appendChild(stage);

    var cards = [];
    items.forEach(function (li, i) {
      var av = li.querySelector("picture") || li.querySelector(".avatar-img");
      var name = li.querySelector("h3").textContent;
      var role = li.querySelector(".role").textContent;
      var bio = li.querySelector("p:not(.role)");
      var no = ("0" + (i + 1)).slice(-2);

      var card = document.createElement("div");
      card.className = "tg-card";
      card.innerHTML =
        '<div class="tg-inner">' +
          '<div class="tg-face tg-front surface">' +
            '<span class="tg-no" aria-hidden="true">' + no + '</span>' +
            '<span class="tg-org" aria-hidden="true">' + KMARK + 'KIVORA TECH</span>' +
            '<span class="tg-av"></span>' +
            "<h3></h3>" +
            '<p class="role"></p>' +
            '<button type="button" class="tg-hint" aria-expanded="false">Bio</button>' +
            '<p class="tg-strip" aria-hidden="true">KATHMANDU &middot; NPL</p>' +
          "</div>" +
          '<div class="tg-face tg-back surface">' +
            '<span class="tg-org" aria-hidden="true">' + KMARK + "PROFILE</span>" +
            '<span class="tg-bio"></span>' +
            '<button type="button" class="tg-hint">Back</button>' +
          "</div>" +
        "</div>";
      card.querySelector(".tg-av").appendChild(av.cloneNode(true));
      card.querySelector("h3").textContent = name;
      card.querySelector(".role").textContent = role;
      if (bio) card.querySelector(".tg-bio").appendChild(bio.cloneNode(true));
      var hint = card.querySelectorAll(".tg-hint");
      hint[0].setAttribute("aria-label", "Show bio for " + name);
      hint[0].addEventListener("click", function (e) {
        e.stopPropagation();
        var f = card.classList.toggle("flipped");
        hint[0].setAttribute("aria-expanded", String(f));
      });
      hint[1].setAttribute("aria-label", "Back to " + name);
      hint[1].addEventListener("click", function (e) {
        e.stopPropagation();
        card.classList.remove("flipped");
        hint[0].setAttribute("aria-expanded", "false");
      });
      stage.appendChild(card);
      cards.push(card);
    });

    var controls = document.createElement("div");
    controls.className = "tg-controls";
    controls.innerHTML =
      '<button type="button" class="tg-arrow" aria-label="Previous member">&lsaquo;</button>' +
      '<div class="tg-dots"></div>' +
      '<button type="button" class="tg-arrow" aria-label="Next member">&rsaquo;</button>';
    host.appendChild(controls);
    var dotsBox = controls.querySelector(".tg-dots");
    var dots = cards.map(function (card, i) {
      var d = document.createElement("button");
      d.type = "button";
      d.setAttribute("aria-label", "Show " + card.querySelector("h3").textContent);
      d.addEventListener("click", function () { go(i); });
      dotsBox.appendChild(d);
      return d;
    });

    var cur = 0;
    function render() {
      cards.forEach(function (card, i) {
        var rel = (i - cur + cards.length) % cards.length;
        card.classList.remove("is-c", "is-l", "is-r");
        card.classList.add(rel === 0 ? "is-c" : rel === 1 ? "is-r" : "is-l");
        if (rel !== 0) {
          card.classList.remove("flipped");
          card.querySelector(".tg-hint").setAttribute("aria-expanded", "false");
        }
      });
      dots.forEach(function (d, i) {
        if (i === cur) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });
    }
    function go(i) { cur = (i + cards.length) % cards.length; render(); }
    controls.querySelectorAll(".tg-arrow")[0].addEventListener("click", function () { go(cur - 1); });
    controls.querySelectorAll(".tg-arrow")[1].addEventListener("click", function () { go(cur + 1); });

    /* side-card tap centers it; threshold swipe rotates */
    var sx = 0, moved = false;
    stage.addEventListener("pointerdown", function (e) { sx = e.clientX; moved = false; });
    stage.addEventListener("pointermove", function (e) {
      if (sx && Math.abs(e.clientX - sx) > 10) moved = true;
    });
    stage.addEventListener("pointerup", function (e) {
      if (!sx) return;
      var dx = e.clientX - sx; sx = 0;
      if (dx < -48) go(cur + 1);
      else if (dx > 48) go(cur - 1);
    });
    stage.addEventListener("click", function (e) {
      if (moved) return;
      var card = e.target.closest(".tg-card");
      if (card && !card.classList.contains("is-c")) go(cards.indexOf(card));
    });

    render();
    document.body.classList.add("has-gallery");
  })();

  /* ---- contact dialog: bottom sheet on mobile, email popup on desktop ----
     Every a[href="#contact"] opens the single dialog instead of scrolling.
     Mobile moves #contactForm into the sheet; desktop shows the email card.
     Native showModal gives ESC handling, backdrop inertness and focus
     containment in both modes. */
  (function () {
    var dlg = document.getElementById("contactSheet");
    var form = document.getElementById("contactForm");
    if (!dlg || !form || typeof dlg.showModal !== "function") return;
    var body = document.getElementById("sheetBody");
    var popup = document.getElementById("popupBody");
    var popupCopy = document.getElementById("popupCopy");
    var marker = document.createComment("contactForm home");
    var lastTrigger = null;
    var mq = matchMedia("(max-width: 860px)");

    function home() {
      if (marker.parentNode) marker.parentNode.insertBefore(form, marker);
    }
    function show() {
      if (!dlg.open) dlg.showModal();
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { dlg.classList.add("open"); });
      });
    }
    function openSheet(trigger) {
      lastTrigger = trigger || null;
      dlg.classList.remove("is-popup");
      dlg.setAttribute("aria-labelledby", "sheetTitle");
      popup.hidden = true;
      form.parentNode.insertBefore(marker, form);
      body.appendChild(form);
      show();
      var first = form.querySelector(".field input, .field textarea");
      if (first) first.focus({ preventScroll: true });
    }
    function openPopup(trigger) {
      lastTrigger = trigger || null;
      home();
      dlg.classList.add("is-popup");
      dlg.setAttribute("aria-labelledby", "popupTitle");
      popup.hidden = false;
      popupCopy.textContent = "Copy email address";
      show();
      popupCopy.focus({ preventScroll: true });
    }
    function close(restore, after) {
      dlg.classList.remove("open");
      var done = function () {
        if (dlg.open) dlg.close();
        home();
        if (restore !== false && lastTrigger && document.contains(lastTrigger)) {
          lastTrigger.focus({ preventScroll: true });
        }
        if (after) after();
      };
      if (reduce) { done(); return; }
      var finished = false;
      var finish = function () { if (!finished) { finished = true; done(); } };
      var t = setTimeout(finish, 450);
      dlg.addEventListener("transitionend", function h(e) {
        if (e.target !== dlg) return;
        clearTimeout(t);
        dlg.removeEventListener("transitionend", h);
        finish();
      });
    }

    document.getElementById("sheetClose").addEventListener("click", function () { close(); });
    document.getElementById("popupClose").addEventListener("click", function () { close(); });
    popupCopy.addEventListener("click", async function () {
      try {
        await navigator.clipboard.writeText(EMAIL);
        popupCopy.textContent = "Copied to clipboard";
      } catch (_) {
        popupCopy.textContent = "Select the address above";
      }
      setTimeout(function () { popupCopy.textContent = "Copy email address"; }, 2200);
    });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });
    dlg.addEventListener("cancel", function () {
      dlg.classList.remove("open");
      home();
      if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
    });
    mq.addEventListener("change", function () { if (dlg.open) close(false); });

    /* delegated so gallery-cloned links are covered too */
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href="#contact"]');
      if (!a) return;
      e.preventDefault();
      if (a.id === "popupFormLink") {
        var contact = document.getElementById("contact");
        close(false, function () { if (contact) contact.scrollIntoView(); });
        return;
      }
      if (mq.matches) openSheet(a);
      else openPopup(a);
    });
  })();

  /* ---- custom cursor (fine pointers, motion-safe) ---- */
  if (!reduce && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const cur = document.getElementById("cursor");
    if (cur) {
      let x = -100, y = -100, rx = x, ry = y, started = false;
      const tick = () => {
        rx += (x - rx) * 0.18;
        ry += (y - ry) * 0.18;
        cur.style.setProperty("--cx", x + "px");
        cur.style.setProperty("--cy", y + "px");
        cur.style.setProperty("--rx", rx + "px");
        cur.style.setProperty("--ry", ry + "px");
        if (Math.abs(x - rx) > 0.1 || Math.abs(y - ry) > 0.1) requestAnimationFrame(tick);
        else started = false;
      };
      addEventListener("pointermove", function (e) {
        x = e.clientX; y = e.clientY;
        cur.classList.add("on");
        if (!started) { started = true; requestAnimationFrame(tick); }
      }, { passive: true });
      document.addEventListener("pointerover", function (e) {
        cur.classList.toggle("grow", !!e.target.closest("a, button, input, textarea, select"));
      });
      document.addEventListener("mouseleave", function () { cur.classList.remove("on"); });
    }
  }
})();