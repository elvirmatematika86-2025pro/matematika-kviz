const { jsPDF } = window.jspdf;

let tacniOdgovori = [];
let odgovoriKorisnika = [];
let ime1, ime2, razred;
let vrijeme = 15 * 60;
let timerInterval;

// ------------------ Inicijalizacija ------------------
function initKviz(nivo) {
  const ekipa = JSON.parse(localStorage.getItem("ekipa"));
  if (ekipa) {
    ime1 = ekipa.ucenik1;
    ime2 = ekipa.ucenik2;
    razred = ekipa.razred;
  }

  document.getElementById("zavrsiBtn").addEventListener("click", zavrsiKviz);
  document.getElementById("diplomaBtn").addEventListener("click", generisiDiplomu);

  const container = document.getElementById("pitanja");
  container.innerHTML = "";
  tacniOdgovori = [];
  odgovoriKorisnika = [];

  generisiPitanja(nivo);
  startTimer();
}

// ------------------ Generisanje pitanja ------------------
function generisiPitanja(nivo) {
  const container = document.getElementById("pitanja");
  const operacije = ["+", "-", "×", "÷"];
  container.innerHTML = "";

  for (let i = 1; i <= 50; i++) {
    let pitanje = "";
    let rezultat;

    if (nivo === "bronza") {
      let a = rand(1, 20), b = rand(1, 20);
      const op = operacije[rand(0, 3)];
      switch (op) {
        case "+": rezultat = a + b; pitanje = `${a} + ${b}`; break;
        case "-": rezultat = a - b; pitanje = `${a} - ${b}`; break;
        case "×": rezultat = a * b; pitanje = `${a} × ${b}`; break;
        case "÷": b = rand(1, 9); rezultat = (a * b) / b; pitanje = `(${a*b}) ÷ ${b}`; break;
      }
      if (Math.random() > 0.7) {
        let c = rand(1, 10);
        pitanje = `(${a} + ${b}) × ${c}`;
        rezultat = (a + b) * c;
      }
    }

    if (nivo === "srebro") {
      const tip = rand(0, 3);
      if (tip === 0) {
        let a = rand(2, 10), b = rand(1, 10), c = rand(1, 10);
        pitanje = `${a} × (${b} + ${c})`;
        rezultat = a * (b + c);
      }
      if (tip === 1) {
        let a = rand(2, 10), x = rand(1, 10);
        pitanje = `Riješi: ${a}x = ${a * x}`;
        rezultat = x;
      }
      if (tip === 2) {
        let b = [10, 20, 25, 50][rand(0, 3)];
        let broj = rand(50, 250);
        pitanje = `Koliko je ${b}% od ${broj}?`;
        rezultat = (b / 100) * broj;
      }
      if (tip === 3) {
        let a = rand(20, 80), b = rand(2, 10);
        pitanje = `Koliki je ostatak pri dijeljenju ${a} ÷ ${b}?`;
        rezultat = a % b;
      }
    }

    if (nivo === "zlato") {
      const tip = rand(0, 4);
      if (tip === 0) {
        let a = rand(2, 6), b = rand(2, 3);
        pitanje = `Izračunaj: ${a}ⁿ, za n = ${b}`;
        rezultat = Math.pow(a, b);
      }
      if (tip === 1) {
        let a = rand(4, 10);
        pitanje = `Obim kvadrata sa stranicom ${a} cm`;
        rezultat = 4 * a;
      }
      if (tip === 2) {
        let a = rand(3, 10), b = rand(4, 12);
        pitanje = `Površina pravougaonika ${a} cm i ${b} cm`;
        rezultat = a * b;
      }
      if (tip === 3) {
        let broj = rand(100, 300);
        pitanje = `Ako 1/4 od ${broj} učenika ima peticu, koliko je to učenika?`;
        rezultat = broj / 4;
      }
      if (tip === 4) {
        let x = rand(2, 9);
        pitanje = `Riješi: 3x + 6 = ${3*x + 6}`;
        rezultat = x;
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

// ------------------ Tajmer ------------------
function startTimer() {
  const timer = document.getElementById("timer");
  clearInterval(timerInterval);
  vrijeme = 15 * 60;

  timerInterval = setInterval(() => {
    let min = Math.floor(vrijeme / 60);
    let sec = vrijeme % 60;
    sec = sec < 10 ? "0" + sec : sec;
    timer.textContent = `⏳ ${min}:${sec}`;
    if (--vrijeme <= 0) {
      clearInterval(timerInterval);
      zavrsiKviz();
    }
  }, 1000);
}

// ------------------ Završetak ------------------
function zavrsiKviz() {
  clearInterval(timerInterval);
  document.getElementById("kviz").classList.add("hidden");
  document.getElementById("rezultat").classList.remove("hidden");

  let bodovi = 0;
  odgovoriKorisnika = [];

  for (let i = 1; i <= 50; i++) {
    const checked = document.querySelector(`input[name="q${i}"]:checked`);
    const odgovor = checked ? parseFloat(checked.value) : null;
    odgovoriKorisnika.push(odgovor);
    if (odgovor === tacniOdgovori[i - 1]) bodovi++;
  }

  const postotak = (bodovi / 50) * 100;
  const ocjena =
    postotak >= 90 ? 5 :
    postotak >= 75 ? 4 :
    postotak >= 60 ? 3 :
    postotak >= 45 ? 2 : 1;

  document.getElementById("rezime").innerHTML =
    `Ekipa: <b>${ime1}</b> i <b>${ime2}</b> (${razred})<br>` +
    `Bodovi: <b>${bodovi}/50</b> (${postotak.toFixed(1)}%)`;
  document.getElementById("ocjena").innerHTML = `Ocjena: <b>${ocjena}</b>`;

  prikaziTacneOdgovore();

  localStorage.setItem("rezultat_" + Date.now(), JSON.stringify({
    ime1, ime2, razred, bodovi, postotak, ocjena
  }));
}

// ------------------ Prikaz tačnih odgovora ------------------
function prikaziTacneOdgovore() {
  const lista = document.getElementById("tacni");
  lista.innerHTML = "";
  for (let i = 0; i < tacniOdgovori.length; i++) {
    const korisnicki = odgovoriKorisnika[i];
    const tacan = tacniOdgovori[i];
    const stil = korisnicki === tacan ? "color:green" : "color:red";
    lista.innerHTML += `<p>${i+1}. Tačno: <b>${tacan}</b> — Tvoj: <span style="${stil}">${korisnicki ?? "bez odgovora"}</span></p>`;
  }
}

// ------------------ Diploma ------------------
function generisiDiplomu() {
  const jsPDFLib = window.jspdf || window.jsPDF;
  const doc = new jsPDFLib.jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const keys = Object.keys(localStorage).filter(k => k.startsWith("rezultat_"));
  if (keys.length === 0) {
    alert("Nema pohranjenih rezultata!");
    return;
  }

  const data = JSON.parse(localStorage.getItem(keys.sort().pop()));

  let boja = "#FFD700";
  if (data.ocjena === 4) boja = "#C0C0C0";
  else if (data.ocjena === 3) boja = "#CD7F32";
  else if (data.ocjena <= 2) boja = "#E0E0E0";

  doc.setDrawColor(boja);
  doc.setLineWidth(3);
  doc.rect(10, 10, 277, 190);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.text("DIPLOMA", 148.5, 45, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.text("Sekcija 'Mladi matematičari' — OŠ Prokosovići", 148.5, 65, { align: "center" });
  doc.text("dodjeljuje priznanje ekipi:", 148.5, 75, { align: "center" });

  doc.setFontSize(22);
  doc.text(`${data.ime1}${data.ime2 ? " i " + data.ime2 : ""}`, 148.5, 95, { align: "center" });

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

// ------------------ Brisanje rezultata ------------------
document.addEventListener("keydown", (e) => {
  if (e.altKey && e.key.toLowerCase() === "x") {
    if (confirm("Da li sigurno želiš obrisati sve rezultate?")) {
      localStorage.clear();
      alert("Svi rezultati su obrisani!");
      location.reload();
    }
  }
});

// ------------------ Alati ------------------
function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ------------------ Start kviza ------------------
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

