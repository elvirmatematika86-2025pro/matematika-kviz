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
  generisiPitanja(nivo);
  startTimer();
}

// ------------------ Generisanje pitanja ------------------
function generisiPitanja(nivo) {
  const container = document.getElementById("pitanja");
  const operacije = ["+", "-", "×", "÷"];
  for (let i = 1; i <= 50; i++) {
    let pitanje = "";
    let rezultat;

    // ----- BRONZANI -----
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

    // ----- SREBRNI -----
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

    // ----- ZLATNI -----
    if (nivo === "zlato") {
      const tip = rand(0, 4);
      if (tip === 0) {
        let a = rand(2, 6), b = rand(2, 3);
        pitanje = `Izračunaj: ${a}ⁿ, za n = ${b}`;
        rezultat = Math.pow(a, b);
      }
      if (tip === 1) {
        let a = rand(4, 10), b = rand(3, 8);
        pitanje = `Izračunaj obim kvadrata sa stranicom ${a} cm`;
        rezultat = 4 * a;
      }
      if (tip === 2) {
        let a = rand(3, 10), b = rand(4, 12);
        pitanje = `Površina pravougaonika stranica ${a} cm i ${b} cm`;
        rezultat = a * b;
      }
      if (tip === 3) {
        let broj = rand(100, 300);
        pitanje = `U razredu je ${broj} učenika. Ako ih je 1/4 dobilo peticu, koliko je to učenika?`;
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
    let odgovor = checked ? parseFloat(checked.value) : null;
    odgovoriKorisnika.push(odgovor);
    if (odgovor === tacniOdgovori[i - 1]) bodovi++;
  }

  const postotak = (bodovi / 50) * 100;
  let ocjena = postotak >= 90 ? 5 : postotak >= 75 ? 4 : postotak >= 60 ? 3 : postotak >= 45 ? 2 : 1;

  document.getElementById("rezime").innerHTML =
    `Ekipa: <b>${ime1}</b> i <b>${ime2}</b> (razred ${razred})<br>` +
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
    lista.innerHTML += `<p>${i+1}. Tačan odgovor: <b>${tacan}</b> — Tvoj: <span style="${stil}">${korisnicki ?? "bez odgovora"}</span></p>`;
  }
}

// ------------------ Diploma ------------------
function generisiDiplomu() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Učitaj zadnji rezultat
  let data = Object.values(localStorage).slice(-1)[0];
  data = JSON.parse(data);

  // Boje diploma prema ocjeni
  let boja = "#FFD700"; // zlato
  if (data.ocjena === 4) boja = "#C0C0C0"; // srebro
  else if (data.ocjena === 3) boja = "#CD7F32"; // bronza
  else if (data.ocjena <= 2) boja = "#e0e0e0"; // slabiji uspjeh

  // Crtanje blagog okvira
  doc.setDrawColor(boja);
  doc.setLineWidth(3);
  doc.rect(10, 10, 277, 190);

  // Naslov i tekst
  doc.setFont("Times", "bold");
  doc.setFontSize(36);
  doc.setTextColor(30, 30, 30);
  doc.text("DIPLOMA", 148.5, 45, { align: "center" });

  doc.setFontSize(16);
  doc.setFont("Times", "normal");
  doc.text("Sekcija 'Mladi matematičari' — OŠ Prokosovići", 148.5, 60, { align: "center" });
  doc.text("dodjeljuje priznanje ekipi", 148.5, 75, { align: "center" });

  // Imena učenika
  doc.setFont("Times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(0, 51, 102);
  doc.text(`${data.ime1} ${data.ime2 ? "i " + data.ime2 : ""}`, 148.5, 95, { align: "center" });

  // Podaci o uspjehu
  doc.setFont("Times", "normal");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(15);
  doc.text(`Razredi: ${data.razred1 || "?"} i ${data.razred2 || "?"}`, 148.5, 110, { align: "center" });
  doc.text(`Uspjeh: ${data.postotak.toFixed(1)}%`, 148.5, 120, { align: "center" });
  doc.text(`Ocjena: ${data.ocjena}`, 148.5, 130, { align: "center" });

  // Linija i potpis
  doc.setDrawColor(0, 0, 120);
  doc.line(50, 160, 120, 160);

  doc.setFont("Times", "italic");
  doc.setFontSize(13);
  doc.text("prof. Elvir Čajić", 85, 168, { align: "center" });
  doc.text("Voditelj sekcije", 85, 176, { align: "center" });

  // Dno diplome
  doc.setFont("Times", "normal");
  doc.setFontSize(12);
  doc.text("OŠ Prokosovići — 2025", 148.5, 190, { align: "center" });

  // Spremi PDF
  doc.save(`Diploma_${data.ime1}_${data.ime2}.pdf`);
}


// ------------------ Pomoćne funkcije ------------------
function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
// ----------------------
// PRIKAZ I IZVOZ PODATAKA
// ----------------------
function prikaziSveRezultate() {
  const tabela = document.getElementById("tabela-rezultata");
  if (!tabela) return;

  let rezultati = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("rezultat_")) {
      rezultati.push(JSON.parse(localStorage.getItem(key)));
    }
  }
  rezultati.sort((a,b)=>b.postotak - a.postotak);

  tabela.innerHTML = `
    <tr>
      <th>#</th>
      <th>Učenik 1</th>
      <th>Učenik 2</th>
      <th>Razred</th>
      <th>Bodovi</th>
      <th>%</th>
      <th>Ocjena</th>
    </tr>`;

  rezultati.forEach((r,i)=>{
    tabela.innerHTML += `
      <tr>
        <td>${i+1}</td>
        <td>${r.ime1}</td>
        <td>${r.ime2}</td>
        <td>${r.razred}</td>
        <td>${r.bodovi}</td>
        <td>${r.postotak.toFixed(1)}</td>
        <td>${r.ocjena}</td>
      </tr>`;
  });

  const prosjek = (rezultati.reduce((s,r)=>s+r.postotak,0)/rezultati.length || 0).toFixed(1);
  document.getElementById("analiza").textContent =
    `Ukupno ekipa: ${rezultati.length} | Prosječan uspjeh: ${prosjek}%`;

  // Dodaj funkcionalnost export dugmeta
  const exportBtn = document.getElementById("exportBtn");
  exportBtn.addEventListener("click", () => exportCSV(rezultati));
}

function exportCSV(data) {
  let csv = "Učenik 1,Učenik 2,Razred,Bodovi,Postotak,Ocjena\n";
  data.forEach(r => {
    csv += `${r.ime1},${r.ime2},${r.razred},${r.bodovi},${r.postotak.toFixed(1)},${r.ocjena}\n`;
  });
const obrisiBtn = document.getElementById("obrisiSve");
if (obrisiBtn) {
  document.addEventListener("keydown", (e) => {
    if (e.altKey && e.key.toLowerCase() === "x") {
      obrisiBtn.style.display = "block";
    }
  });
  obrisiBtn.addEventListener("click", () => {
    if (confirm("Da li sigurno želiš obrisati sve rezultate?")) {
      localStorage.clear();
      location.reload();
    }
  });
}

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "rezultati_kvizova.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
// ------------------ START KVIZA ------------------
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
      razred: `${razred1}/${razred2}`,
    }));

    // Sakrij prijavu i prikaži kviz
    document.getElementById("prijava").classList.add("hidden");
    document.getElementById("kviz").classList.remove("hidden");

    initKviz(nivo);
  });
});



