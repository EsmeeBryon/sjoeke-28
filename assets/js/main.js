(() => {
  "use strict";

  const FOTO_MAP = "assets/foto/";
  // In het losse bestand zitten de foto's in window.FOTOS ingebakken.
  const fotoPad = (bestand) => (window.FOTOS && window.FOTOS[bestand]) || FOTO_MAP + bestand;
  const $ = (id) => document.getElementById(id);
  const zachteAnimatie = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Confetti ---------------- */
  const canvas = $("confetti");
  const ctx = canvas.getContext("2d");
  const kleuren = ["#ff3d81", "#ffd23f", "#27d3f5", "#9bf04a", "#7b3ff2", "#ff7a2f"];
  let deeltjes = [];
  let loopt = false;

  function schaalCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  schaalCanvas();
  window.addEventListener("resize", schaalCanvas);

  function confetti(aantal = 90, bronX = null, bronY = null) {
    if (zachteAnimatie) return;
    const x = bronX ?? window.innerWidth / 2;
    const y = bronY ?? window.innerHeight / 2;
    for (let i = 0; i < aantal; i++) {
      deeltjes.push({
        x, y,
        vx: (Math.random() - 0.5) * 14,
        vy: Math.random() * -15 - 3,
        g: 0.28 + Math.random() * 0.2,
        b: 4 + Math.random() * 8,
        h: 6 + Math.random() * 10,
        kleur: kleuren[(Math.random() * kleuren.length) | 0],
        draai: Math.random() * Math.PI * 2,
        draaiSnelheid: (Math.random() - 0.5) * 0.3,
        leven: 1,
      });
    }
    if (!loopt) { loopt = true; requestAnimationFrame(tick); }
  }

  function tick() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    deeltjes = deeltjes.filter((p) => p.leven > 0 && p.y < window.innerHeight + 60);
    for (const p of deeltjes) {
      p.vy += p.g;
      p.vx *= 0.995;
      p.x += p.vx;
      p.y += p.vy;
      p.draai += p.draaiSnelheid;
      if (p.y > window.innerHeight * 0.6) p.leven -= 0.012;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.draai);
      ctx.globalAlpha = Math.max(0, p.leven);
      ctx.fillStyle = p.kleur;
      ctx.fillRect(-p.b / 2, -p.h / 2, p.b, p.h);
      ctx.restore();
    }
    if (deeltjes.length) {
      requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      loopt = false;
    }
  }

  function confettiRegen(duur = 2600) {
    if (zachteAnimatie) return;
    const stop = Date.now() + duur;
    (function buien() {
      confetti(14, Math.random() * window.innerWidth, -20);
      if (Date.now() < stop) setTimeout(buien, 140);
    })();
  }

  /* ---------------- Polaroid ---------------- */
  function maakPolaroid(bestand, bijschrift) {
    const fig = document.createElement("figure");
    fig.className = "polaroid";

    if (bestand) {
      const img = document.createElement("img");
      img.className = "polaroid__beeld";
      img.src = fotoPad(bestand);
      img.alt = bijschrift || "Foto";
      img.loading = "lazy";
      img.addEventListener("error", () => img.replaceWith(leegVak(bestand)));
      fig.appendChild(img);
    } else {
      fig.appendChild(leegVak(""));
    }

    const cap = document.createElement("figcaption");
    cap.className = "polaroid__bijschrift";
    cap.textContent = bijschrift || "";
    fig.appendChild(cap);
    return fig;
  }

  function leegVak(bestand) {
    const div = document.createElement("div");
    div.className = "polaroid__leeg";
    div.textContent = bestand
      ? "Zet hier een foto met de naam " + bestand
      : "Hier komt een foto";
    return div;
  }

  /* ---------------- Opbouw ---------------- */
  function vulHero() {
    $("heroKicker").textContent = CONTENT.hero.boven;
    $("heroOnder").textContent = CONTENT.hero.onder;

    const titel = $("heroTitel");
    [...CONTENT.hero.titel].forEach((teken, i) => {
      const span = document.createElement("span");
      span.textContent = teken === " " ? "\u00A0" : teken;
      span.style.setProperty("--draai", (i % 2 ? 5 : -5) + "deg");
      span.style.animationDelay = (i * 0.06).toFixed(2) + "s";
      titel.appendChild(span);
    });

    const vak = $("heroFotos");
    CONTENT.hero.fotos.forEach((f) => vak.appendChild(maakPolaroid(f.src, f.bijschrift)));
  }

  function vulTijdlijn() {
    $("tijdlijnTitel").textContent = CONTENT.tijdlijn.titel;
    $("tijdlijnIntro").textContent = CONTENT.tijdlijn.intro;

    const lijst = $("tijdlijn");
    CONTENT.tijdlijn.items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "tijdlijn__item";

      const fotoVak = document.createElement("div");
      fotoVak.className = "tijdlijn__foto";
      fotoVak.appendChild(maakPolaroid(item.foto, item.bijschrift));

      const kaart = document.createElement("div");
      kaart.className = "tijdlijn__kaart";

      const jaar = document.createElement("p");
      jaar.className = "tijdlijn__jaar";
      jaar.textContent = item.jaar;

      const kop = document.createElement("h3");
      kop.className = "tijdlijn__titel";
      kop.textContent = item.titel;

      const tekst = document.createElement("div");
      tekst.className = "tijdlijn__tekst";
      item.tekst.split("\n\n").forEach((alinea) => {
        const p = document.createElement("p");
        p.textContent = alinea;
        tekst.appendChild(p);
      });

      kaart.append(jaar, kop, tekst);
      li.append(fotoVak, kaart);
      lijst.appendChild(li);
    });

    const waarnemer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-zichtbaar");
          waarnemer.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });

    lijst.querySelectorAll(".tijdlijn__item").forEach((el) => waarnemer.observe(el));
  }

  function vulKaartjes() {
    $("redenenTitel").textContent = CONTENT.redenen.titel;
    $("redenenIntro").textContent = CONTENT.redenen.intro;

    const lijst = CONTENT.redenen.lijst;
    const vak = $("kaartjes");
    const totaal = $("tellerTotaal");
    const nu = $("tellerNu");
    totaal.textContent = String(lijst.length);
    let gevonden = 0;

    lijst.forEach((reden, i) => {
      const knop = document.createElement("button");
      knop.type = "button";
      knop.className = "kaartje";
      knop.setAttribute("aria-label", "Reden " + (i + 1));

      const binnen = document.createElement("div");
      binnen.className = "kaartje__binnen";

      const voor = document.createElement("div");
      voor.className = "kaartje__voor";
      voor.textContent = String(i + 1);

      const achter = document.createElement("div");
      achter.className = "kaartje__achter";
      achter.textContent = reden;

      binnen.append(voor, achter);
      knop.appendChild(binnen);

      knop.addEventListener("click", () => {
        const wasOm = knop.classList.contains("is-om");
        knop.classList.toggle("is-om");
        if (!wasOm && !knop.dataset.geteld) {
          knop.dataset.geteld = "1";
          gevonden++;
          nu.textContent = String(gevonden);
          const r = knop.getBoundingClientRect();
          confetti(14, r.left + r.width / 2, r.top + r.height / 2);
          if (gevonden === lijst.length) {
            confettiRegen(4000);
            document.querySelector(".teller").textContent = "Allemaal gevonden. Net als jij: compleet.";
          }
        }
      });

      vak.appendChild(knop);
    });
  }

  /* ---------------- Muziek ---------------- */
  let speler = null;
  let moetSpelen = false;

  function vulMuziek() {
    $("muziekTitel").textContent = CONTENT.muziek.titel;
    $("muziekIntro").textContent = CONTENT.muziek.intro;

    window.onSpotifyIframeApiReady = (API) => {
      API.createController(
        $("speler"),
        { uri: "spotify:track:" + CONTENT.muziek.spotifyId, width: "100%", height: 152 },
        (controller) => {
          speler = controller;
          if (moetSpelen) controller.play();
        }
      );
    };
  }

  // Browsers staan geluid pas toe na een klik; de cadeauknop is die klik.
  function startMuziek() {
    moetSpelen = true;
    if (speler) speler.play();
  }

  function vulSlot() {
    $("slotTitel").textContent = CONTENT.slot.titel;
    const tekstVak = $("slotTekst");
    CONTENT.slot.tekst.split("\n\n").forEach((alinea) => {
      const p = document.createElement("p");
      p.textContent = alinea;
      tekstVak.appendChild(p);
    });
    $("slotOnder").textContent = CONTENT.slot.ondertekening;
    $("voetTekst").textContent = CONTENT.voet;

    const knop = $("slotKnop");
    knop.textContent = CONTENT.slot.knop;
    knop.addEventListener("click", () => confettiRegen(3200));
  }

  /* ---------------- Fotomuur ---------------- */
  function vulMuur() {
    $("muurTitel").textContent = CONTENT.muur.titel;
    $("muurIntro").textContent = CONTENT.muur.intro;

    const vak = $("muur");
    const fotos = CONTENT.muur.fotos;

    fotos.forEach((bestand, i) => {
      const knop = document.createElement("button");
      knop.type = "button";
      knop.className = "muur__item";
      knop.setAttribute("aria-label", "Foto " + (i + 1) + " groot bekijken");

      const img = document.createElement("img");
      img.src = fotoPad(bestand);
      img.alt = "Foto " + (i + 1);
      img.loading = "lazy";
      img.addEventListener("error", () => knop.remove());

      knop.appendChild(img);
      knop.addEventListener("click", () => openLichtbak(i));
      vak.appendChild(knop);
    });

    startLichtbak(fotos);
  }

  let lichtbakIndex = 0;
  let lichtbakFotos = [];

  function openLichtbak(i) {
    lichtbakIndex = (i + lichtbakFotos.length) % lichtbakFotos.length;
    $("lichtbakBeeld").src = fotoPad(lichtbakFotos[lichtbakIndex]);
    $("lichtbakBeeld").alt = "Foto " + (lichtbakIndex + 1);
    $("lichtbak").hidden = false;
    $("chaosKnop").hidden = true;
    document.body.classList.add("is-locked");
  }

  function sluitLichtbak() {
    $("lichtbak").hidden = true;
    $("chaosKnop").hidden = false;
    document.body.classList.remove("is-locked");
  }

  function startLichtbak(fotos) {
    lichtbakFotos = fotos;
    $("lichtbakSluit").addEventListener("click", sluitLichtbak);
    $("lichtbakVorige").addEventListener("click", () => openLichtbak(lichtbakIndex - 1));
    $("lichtbakVolgende").addEventListener("click", () => openLichtbak(lichtbakIndex + 1));
    $("lichtbak").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) sluitLichtbak();
    });
    document.addEventListener("keydown", (e) => {
      if ($("lichtbak").hidden) return;
      if (e.key === "Escape") sluitLichtbak();
      if (e.key === "ArrowLeft") openLichtbak(lichtbakIndex - 1);
      if (e.key === "ArrowRight") openLichtbak(lichtbakIndex + 1);
    });
  }

  /* ---------------- Intro ---------------- */
  function startIntro() {
    $("introKicker").textContent = CONTENT.intro.kicker;
    $("cadeauLabel").textContent = CONTENT.intro.knop;
    $("cadeauSub").textContent = CONTENT.intro.knopSub;

    const knop = $("cadeauKnop");
    const aftelVak = $("aftellen");
    const getal = $("aftelGetal");

    knop.addEventListener("click", function uitpakken() {
      knop.removeEventListener("click", uitpakken);
      knop.disabled = true;
      startMuziek();
      $("intro").classList.add("is-weg");
      aftelVak.classList.add("is-actief");

      const stappen = CONTENT.intro.aftellen;
      let i = 0;

      (function volgende() {
        if (i >= stappen.length) {
          aftelVak.classList.remove("is-actief");
          getal.textContent = "";
          toonFeest();
          return;
        }
        getal.textContent = stappen[i];
        getal.style.animation = "none";
        void getal.offsetWidth;
        getal.style.animation = "";
        if (i === stappen.length - 1) confettiRegen(3000);
        else confetti(30);
        i++;
        setTimeout(volgende, i === stappen.length ? 1100 : 850);
      })();
    });
  }

  function toonFeest() {
    document.body.classList.remove("is-locked");
    $("feest").hidden = false;
    $("chaosKnop").hidden = false;
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  /* ---------------- Chaos ---------------- */
  function startChaos() {
    const knop = $("chaosKnop");
    knop.addEventListener("click", () => {
      confetti(70, window.innerWidth - 50, window.innerHeight - 50);
      confettiRegen(1500);
      document.body.classList.add("chaos");
      setTimeout(() => document.body.classList.remove("chaos"), 2200);
    });
  }

  /* ---------------- Start ---------------- */
  document.title = "Gelukkige verjaardag, " + CONTENT.naam + "!";
  vulHero();
  vulTijdlijn();
  vulKaartjes();
  vulMuur();
  vulMuziek();
  vulSlot();
  startIntro();
  startChaos();
})();
