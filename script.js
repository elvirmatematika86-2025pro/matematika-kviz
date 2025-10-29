// ------------------ GLOBALNE PROMJENLJIVE ------------------
let tacniOdgovori = [];
let odgovoriKorisnika = [];
let ime1, ime2, razred;
let vrijeme = 15 * 60;
let timerInterval;

// ------------------ INICIJALIZACIJA KVIZA ------------------
function initKviz(nivo) {
  const ekipa = JSON.parse(localStorage.getItem("ekipa"));
  if (ekipa) {
    ime1 = ekipa.ucenik1;
    ime2 = ekipa.ucenik2;
    razred = ekipa.razred;
  }

  document.getElementById("zavrsiBtn").addEventListener("click", zavrsiKviz);
  document.getElementById("diplomaBtn").addEventListener("click", generisiDiplomu);

  generisiPitanja(nivo);
  startTimer();
}

// ------------------ GENERISANJE PITANJA ------------------
function generisiPitanja(nivo) {
  const container = document.getElementById("pitanja");
  const operacije = ["+", "-", "×", "÷"];
  container.innerHTML = "";
  tacniOdgovori = [];

  for (let i = 1; i <= 10; i++) { // smanjeno radi testa
    let pitanje = "", rezultat;

    if (nivo === "bronza") {
      const a = rand(1, 20), b = rand(1, 20);
      const op = operacije[rand(0, 3)];
      switch (op) {
        case "+": rezultat = a + b; pitanje = `${a} + ${b}`; break;
        case "-": rezultat = a - b; pitanje = `${a} - ${b}`; break;
        case "×": rezultat = a * b; pitanje = `${a} × ${b}`; break;
        case "÷": rezultat = a; pitanje = `(${a*b}) ÷ ${b}`; break;
      }
    }

    tacniOdgovori.push(rezultat);
    const opcije = shuffle([rezultat, rezultat + 1, rezultat - 1, rezultat + 2]);
    container.innerHTML += `
      <div class="pitanje">
        <p>${i}. ${pitanje}</p>
        ${opcije.map(v => `<label><input type="radio" name="q${i}" value="${v}"> ${v}</label>`).join("")}
      </div>`;
  }
}

// ------------------ TAJMER ------------------
function startTimer() {
  const timer = document.getElementById("timer");
  clearInterval(timerInterval);
  vrijeme = 15 * 60;

  timerInterval = setInterval(() => {
    const min = Math.floor(vrijeme / 60);
    const sec = (vrijeme % 60).toString().padStart(2, "0");
    timer.textContent = `⏳ ${min}:${sec}`;
    if (--vrijeme <= 0) {
      clearInterval(timerInterval);
      zavrsiKviz();
    }
  }, 1000);
}

// ------------------ ZAVRŠETAK ------------------
function zavrsiKviz() {
  clearInterval(timerInterval);
  document.getElementById("kviz").classList.add("hidden");
  document.getElementById("rezultat").classList.remove("hidden");

  let bodovi = 0;
  odgovoriKorisnika = [];

  for (let i = 1; i <= tacniOdgovori.length; i++) {
    const checked = document.querySelector(`input[name="q${i}"]:checked`);
    const odgovor = checked ? parseFloat(checked.value) : null;
    odgovoriKorisnika.push(odgovor);
    if (odgovor === tacniOdgovori[i - 1]) bodovi++;
  }

  const postotak = (bodovi / tacniOdgovori.length) * 100;
  const ocjena = postotak >= 90 ? 5 : postotak >= 75 ? 4 : postotak >= 60 ? 3 : postotak >= 45 ? 2 : 1;

  document.getElementById("rezime").innerHTML =
    `Ekipa: <b>${ime1}</b> i <b>${ime2}</b> (${razred})<br>` +
    `Bodovi: <b>${bodovi}/${tacniOdgovori.length}</b> (${postotak.toFixed(1)}%)`;
  document.getElementById("ocjena").innerHTML = `Ocjena: <b>${ocjena}</b>`;

  prikaziTacneOdgovore();

  localStorage.setItem("rezultat_" + Date.now(), JSON.stringify({ ime1, ime2, razred, bodovi, postotak, ocjena }));
}

// ------------------ PRIKAZ TAČNIH ODGOVORA ------------------
function prikaziTacneOdgovore() {
  const lista = document.getElementById("tacni");
  lista.innerHTML = "";
  tacniOdgovori.forEach((tacan, i) => {
    const korisnicki = odgovoriKorisnika[i];
    const boja = korisnicki === tacan ? "green" : "red";
    lista.innerHTML += `<p>${i+1}. Tačno: <b>${tacan}</b> — Tvoj: <span style="color:${boja}">${korisnicki ?? "bez odgovora"}</span></p>`;
  });
}

// ------------------ DIPLOMA ------------------
function generisiDiplomu() {
  const jsPDFLib = window.jspdf || window.jsPDF;
  const doc = new jsPDFLib.jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const keys = Object.keys(localStorage).filter(k => k.startsWith("rezultat_"));
  if (keys.length === 0) {
    alert("Nema rezultata!");
    return;
  }

  const data = JSON.parse(localStorage.getItem(keys.sort().pop()));

  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.text("DIPLOMA", 148.5, 45, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.text("Sekcija 'Mladi matematičari' — OŠ Prokosovići", 148.5, 65, { align: "center" });
  doc.text("dodjeljuje priznanje ekipi:", 148.5, 75, { align: "center" });

  doc.setFontSize(22);
  doc.text(`${data.ime1} i ${data.ime2}`, 148.5, 95, { align: "center" });

  doc.setFontSize(15);
  doc.text(`Razredi: ${data.razred}`, 148.5, 110, { align: "center" });
  doc.text(`Uspjeh: ${data.postotak.toFixed(1)}%`, 148.5, 120, { align: "center" });
  doc.text(`Ocjena: ${data.ocjena}`, 148.5, 130, { align: "center" });

  doc.line(50, 165, 120, 165);
  doc.setFontSize(13);
  doc.text("prof. Elvir Čajić", 85, 172, { align: "center" });
  doc.text("Voditelj sekcije", 85, 180, { align: "center" });
  doc.text("OŠ Prokosovići — 2025", 148.5, 192, { align: "center" });

  doc.save(`Diploma_${data.ime1}_${data.ime2}.pdf`);
}

// ------------------ ALATI ------------------
function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ------------------ START ------------------
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  if (!startBtn) return;
  startBtn.addEventListener("click", () => {
    const ime1 = document.getElementById("ime1").value.trim();
    const prezime1 = document.getElementById("prezime1").value.trim();
    const ime2 = document.getElementById("ime2").value.trim();
    const prezime2 = document.getElementById("prezime2").value.trim();
    const razred1 = document.getElementById("razred1").value;
    const razred2 = document.getElementById("razred2").value;
    const nivo = document.querySelector('input[name="nivo"]:checked')?.value || "bronza";

    if (!ime1 || !prezime1 || !ime2 || !prezime2) {
      alert("Unesite imena oba učenika!");
      return;
    }

    localStorage.setItem("ekipa", JSON.stringify({
      ucenik1: `${ime1} ${prezime1}`,
      ucenik2: `${ime2} ${prezime2}`,
      razred: `${razred1}/${razred2}`
    }));

    document.getElementById("prijava").classList.add("hidden");
    document.getElementById("kviz").classList.remove("hidden");
    initKviz(nivo);
  });
});
