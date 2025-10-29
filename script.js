const { jsPDF } = window.jspdf;

let tacniOdgovori = [];
let odgovoriKorisnika = [];
let ime1, ime2, razred;
let vrijeme = 15 * 60;
let timerInterval;

// ------------------ INICIJALIZACIJA ------------------
function initKviz(nivo) {
  const ekipa = JSON.parse(localStorage.getItem("ekipa"));
  if (ekipa) {
    ime1 = ekipa.ucenik1;
    ime2 = ekipa.ucenik2;
    razred = ekipa.razred;
  }

  document.getElementById("zavrsiBtn").addEventListener("click", zavrsiKviz);
  document.getElementById("diplomaBtn").addEventListener("click", generisiDiplomu);

  tacniOdgovori = [];
  odgovoriKorisnika = [];
  generisiPitanja(nivo);
  startTimer();
}

// ------------------ GENERISANJE PITANJA ------------------
function generisiPitanja(nivo) {
  const container = document.getElementById("pitanja");
  container.innerHTML = "";
  const operacije = ["+", "-", "×", "÷"];

  for (let i = 1; i <= 50; i++) {
    let pitanje = "", rezultat;

    // --- BRONZA ---
    if (nivo === "bronza") {
      let a = rand(1, 20), b = rand(1, 20);
      const op = operacije[rand(0, 3)];
      switch (op) {
        case "+": rezultat = a + b; pitanje = `${a} + ${b}`; break;
        case "-": rezultat = a - b; pitanje = `${a} - ${b}`; break;
        case "×": rezultat = a * b; pitanje = `${a} × ${b}`; break;
        case "÷": b = rand(1, 9); rezultat = (a * b) / b; pitanje = `(${a*b}) ÷ ${b}`; break;
      }
    }

    // --- SREBRO ---
    if (nivo === "srebro") {
      const tip = rand(0, 3);
      if (tip === 0) {
        let a = rand(2, 10), b = rand(1, 10), c = rand(1, 10);
        pitanje = `${a} × (${b} + ${c})`; rezultat = a * (b + c);
      }
      if (tip === 1) {
        let a = rand(2, 10), x = rand(1, 10);
        pitanje = `Rijesi: ${a}x = ${a * x}`; rezultat = x;
      }
      if (tip === 2) {
        let b = [10, 20, 25, 50][rand(0, 3)];
        let broj = rand(50, 250);
        pitanje = `Koliko je ${b}% od ${broj}?`; rezultat = (b / 100) * broj;
      }
      if (tip === 3) {
        let a = rand(20, 80), b = rand(2, 10);
        pitanje = `Koliki je ostatak pri dijeljenju ${a} ÷ ${b}?`; rezultat = a % b;
      }
    }

    // --- ZLATO ---
    if (nivo === "zlato") {
      const tip = rand(0, 4);
      if (tip === 0) {
        let a = rand(2, 6), b = rand(2, 3);
        pitanje = `Izracunaj: ${a}^${b}`; rezultat = Math.pow(a, b);
      }
      if (tip === 1) {
        let a = rand(4, 10);
        pitanje = `Obim kvadrata sa stranicom ${a} cm`; rezultat = 4 * a;
      }
      if (tip === 2) {
        let a = rand(3, 10), b = rand(4, 12);
        pitanje = `Povrsina pravougaonika ${a} cm i ${b} cm`; rezultat = a * b;
      }
      if (tip === 3) {
        let broj = rand(100, 300);
        pitanje = `Ako 1/4 od ${broj} ucenika ima peticu, koliko je to?`; rezultat = broj / 4;
      }
      if (tip === 4) {
        let x = rand(2, 9);
        pitanje = `Rijesi: 3x + 6 = ${3*x + 6}`; rezultat = x;
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

// ------------------ ZAVRSETAK ------------------
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

// ------------------ TACNI ODGOVORI ------------------
function prikaziTacneOdgovore() {
  const lista = document.getElementById("tacni");
  lista.innerHTML = "";
  for (let i = 0; i < tacniOdgovori.length; i++) {
    const korisnicki = odgovoriKorisnika[i];
    const tacan = tacniOdgovori[i];
    const stil = korisnicki === tacan ? "color:green" : "color:red";
    lista.innerHTML += `<p>${i+1}. Tacno: <b>${tacan}</b> — Tvoj: <span style="${stil}">${korisnicki ?? "bez odgovora"}</span></p>`;
  }
}

// ------------------ DIPLOMA ------------------
async function generisiDiplomu() {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  let data = Object.values(localStorage).slice(-1)[0];
  data = JSON.parse(data);

  let boja = "#FFD700";
  if (data.ocjena === 4) boja = "#C0C0C0";
  else if (data.ocjena === 3) boja = "#CD7F32";
  else if (data.ocjena <= 2) boja = "#e0e0e0";

  doc.setDrawColor(boja);
  doc.setLineWidth(3);
  doc.rect(10, 10, 277, 190);

  doc.setFontSize(38);
  doc.text("DIPLOMA", 148.5, 45, { align: "center" });
  doc.setFontSize(16);
  doc.text("Sekcija 'Mladi matematicari' - OS Prokosovici", 148.5, 60, { align: "center" });
  doc.text("dodjeljuje priznanje ekipi:", 148.5, 75, { align: "center" });

  doc.setFontSize(22);
  doc.setTextColor(0, 51, 102);
  doc.text(`${data.ime1} i ${data.ime2}`, 148.5, 95, { align: "center" });

  doc.setFontSize(15);
  doc.setTextColor(0, 0, 0);
  doc.text(`Razred: ${data.razred}`, 148.5, 110, { align: "center" });
  doc.text(`Uspjeh: ${data.postotak.toFixed(1)}%`, 148.5, 120, { align: "center" });
  doc.text(`Ocjena: ${data.ocjena}`, 148.5, 130, { align: "center" });

  doc.line(50, 160, 120, 160);
  doc.setFontSize(13);
  doc.text("prof. Elvir Cajic", 85, 168, { align: "center" });
  doc.text("Voditelj sekcije", 85, 176, { align: "center" });
  doc.text("OS Prokosovici - 2025", 148.5, 190, { align: "center" });

  doc.save(`Diploma_${data.ime1}_${data.ime2}.pdf`);
}

// ------------------ POMOCNE FUNKCIJE ------------------
function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ------------------ PREGLED REZULTATA ------------------
function prikaziSveRezultate() {
  const tabela = document.getElementById("tabela-rezultata");
  if (!tabela) return;

  let rezultati = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("rezultat_")) rezultati.push(JSON.parse(localStorage.getItem(key)));
  }
  if (rezultati.length === 0) {
    tabela.innerHTML = "<tr><td colspan='7'>Nema pohranjenih rezultata.</td></tr>";
    document.getElementById("analiza").textContent = "Još nema zapisa.";
    return;
  }
  rezultati.sort((a, b) => b.postotak - a.postotak);

  tabela.innerHTML = `
    <tr>
      <th>#</th><th>Ucenik 1</th><th>Ucenik 2</th><th>Razred</th>
      <th>Bodovi</th><th>%</th><th>Ocjena</th>
    </tr>`;
  rezultati.forEach((r, i) => {
    tabela.innerHTML += `
      <tr><td>${i+1}</td><td>${r.ime1}</td><td>${r.ime2}</td>
      <td>${r.razred}</td><td>${r.bodovi}</td><td>${r.postotak.toFixed(1)}</td><td>${r.ocjena}</td></tr>`;
  });

  const prosjek = (rezultati.reduce((s,r)=>s+r.postotak,0)/rezultati.length).toFixed(1);
  document.getElementById("analiza").textContent =
    `Ukupno ekipa: ${rezultati.length} | Prosjecan uspjeh: ${prosjek}%`;

  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) exportBtn.onclick = () => exportCSV(rezultati);

  const obrisiBtn = document.getElementById("obrisiSve");
  if (obrisiBtn) {
    document.addEventListener("keydown", (e) => {
      if (e.altKey && e.key.toLowerCase() === "x") obrisiBtn.style.display = "block";
    });
    obrisiBtn.onclick = () => {
      if (confirm("Obrisati sve rezultate?")) { localStorage.clear(); location.reload(); }
    };
  }
}

// ------------------ CSV IZVOZ ------------------
function exportCSV(data) {
  let csv = "Ucenik 1,Ucenik 2,Razred,Bodovi,Postotak,Ocjena\n";
  data.forEach(r => {
    csv += `${r.ime1},${r.ime2},${r.razred},${r.bodovi},${r.postotak.toFixed(1)},${r.ocjena}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "rezultati_kvizova.csv";
  a.click();
}

// ------------------ START KVIZA ------------------
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      const ime1 = document.getElementById("ime1").value.trim();
      const prezime1 = document.getElementById("prezime1").value.trim();
      const ime2 = document.getElementById("ime2").value.trim();
      const prezime2 = document.getElementById("prezime2").value.trim();
      const razred1 = document.getElementById("razred1").value;
      const razred2 = document.getElementById("razred2").value;
      const nivo = document.querySelector('input[name="nivo"]:checked')?.value || "bronza";

      if (!ime1 || !prezime1 || !ime2 || !prezime2) {
        alert("Unesite imena oba ucenika!"); return;
      }

      localStorage.setItem("ekipa", JSON.stringify({
        ucenik1: `${ime1} ${prezime1}`,
        ucenik2: `${ime2} ${prezime2}`,
        razred: `${razred1}/${razred2}`,
      }));

      document.getElementById("prijava").classList.add("hidden");
      document.getElementById("kviz").classList.remove("hidden");
      initKviz(nivo);
    });
  }

  // Alt+R za rezultate
  document.addEventListener("keydown", (e) => {
    if (e.altKey && e.key.toLowerCase() === "r") window.location.href = "rezultati.html";
  });

  // Nastavnicka prijava
  const link = document.getElementById("nastavnikPrijava");
  const forma = document.getElementById("nastavnikForma");
  const nastavnikBtn = document.getElementById("nastavnikBtn");

  if (link) link.addEventListener("click", e => { e.preventDefault(); forma.classList.toggle("hidden"); });
  if (nastavnikBtn) nastavnikBtn.addEventListener("click", () => {
    const pass = document.getElementById("nastavnikLozinka").value.trim();
    if (pass === "elvir123") {
      alert("Dobrodosli, profesore!");
      window.location.href = "rezultati.html";
    } else alert("Pogresan pristupni kod!");
  });
});
