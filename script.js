// ===== AGE GATE =====
const ageGate = document.getElementById("ageGate");
const enterBtn = document.getElementById("enterBtn");

function setAgeConfirmed() {
  localStorage.setItem("ageConfirmed", "1");
  ageGate.style.display = "none";
}

if (localStorage.getItem("ageConfirmed") === "1") {
  ageGate.style.display = "none";
} else {
  ageGate.style.display = "flex";
}

enterBtn?.addEventListener("click", setAgeConfirmed);

// ===== COPY CHIP =====
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".copy-chip");
  if (!btn) return;

  const code = btn.dataset.copy || "";
  try {
    await navigator.clipboard.writeText(code);
    const old = btn.textContent;
    btn.textContent = "Kopiert ✓";
    setTimeout(() => (btn.textContent = old), 1000);
  } catch {
    alert("Kopieren nicht möglich – bitte manuell kopieren: " + code);
  }
});

// ===== MODAL DETAILS =====
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");

const casinoDetails = {
  razed: {
    title: "RAZED – Details",
    text: "✅ Sticky Bonus • ✅ No KYC • ✅ VIP Transfer\n\nCode: DANNY\nHinweis: Bedingungen können sich ändern – bitte im Casino prüfen."
  }
};

function openModal(key){
  const d = casinoDetails[key];
  if (!d) return;

  modalContent.innerHTML = `
    <h3>${d.title}</h3>
    <p>${d.text.replaceAll("\n", "<br>")}</p>
  `;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(){
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-details]");
  if (btn) openModal(btn.dataset.details);

  if (e.target.closest("[data-close]")) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ===== TWITCH STATUS (Frontend calls your own endpoint) =====
// Replace "/api/twitch-status" with your worker/backend endpoint.
async function loadTwitchStatus(){
  const liveText = document.getElementById("liveText");
  const liveDot = document.getElementById("liveDot");

  try{
    const res = await fetch("/api/twitch-status?user=danny_1998x", { cache: "no-store" });
    if (!res.ok) throw new Error("status " + res.status);
    const data = await res.json();

    if (data.live){
      liveDot?.classList.add("live");
      liveText.textContent = `LIVE: ${data.title || "Stream läuft"} (${data.viewer_count ?? "?"} Viewer)`;
    } else {
      liveDot?.classList.remove("live");
      liveText.textContent = "Offline – folge für Notifications";
    }
  } catch (err){
    // fallback (no backend set up yet)
    liveText.textContent = "Twitch: Offline/Unbekannt";
    liveDot?.classList.remove("live");
  }
}
loadTwitchStatus();

// ===== PARTICLES CANVAS (lightweight, performant) =====
const canvas = document.getElementById("particles");
const ctx = canvas?.getContext("2d");

let W = 0, H = 0;
let particles = [];

function resize(){
  if (!canvas) return;
  W = canvas.width = Math.floor(window.innerWidth * devicePixelRatio);
  H = canvas.height = Math.floor(window.innerHeight * devicePixelRatio);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
}
window.addEventListener("resize", resize);

function rand(min, max){ return Math.random() * (max - min) + min; }

function initParticles(){
  const count = Math.min(90, Math.floor((window.innerWidth * window.innerHeight) / 22000));
  particles = Array.from({length: count}).map(() => ({
    x: rand(0, W),
    y: rand(0, H),
    r: rand(1.2, 2.6) * devicePixelRatio,
    vx: rand(-0.18, 0.18) * devicePixelRatio,
    vy: rand(-0.12, 0.12) * devicePixelRatio,
    a: rand(0.08, 0.25)
  }));
}

function tick(){
  if (!ctx) return;

  ctx.clearRect(0, 0, W, H);

  // particles
  for (const p of particles){
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) p.x = W;
    if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H;
    if (p.y > H) p.y = 0;

    // gold-ish particle
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,215,0,${p.a})`;
    ctx.fill();
  }

  requestAnimationFrame(tick);
}

resize();
initParticles();
tick();
