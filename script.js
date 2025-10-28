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
  const doc = new jsPDF({ orientation: "landscape" });

  const data = JSON.parse(
    localStorage.getItem(Object.keys(localStorage).filter(k => k.startsWith("rezultat_")).pop())
  );

  // Odabir boje prema ocjeni
  let boja = "#FFD700";
  if (data.ocjena === 4) boja = "#C0C0C0";
  else if (data.ocjena === 3) boja = "#CD7F32";
  else if (data.ocjena === 2) boja = "#ADD8E6";
  else if (data.ocjena === 1) boja = "#F5B7B1";

  // Pozadina
  doc.setFillColor(boja);
  doc.rect(0, 0, 842, 595, "F");

  // Stil fonta
  doc.setFont("Times", "bold");
  doc.setFontSize(40);
  doc.setTextColor("#0a1a2f");

  // Naslov diplome
  doc.text("DIPLOMA", 420, 120, { align: "center" });

  // Podnaslov
  doc.setFontSize(20);
  doc.setFont("Times", "italic");
  doc.text("Sekcija 'Mladi matematičari' — OŠ Prokosovići", 420, 160, { align: "center" });

  // Crta ispod
  doc.setDrawColor("#0a1a2f");
  doc.line(150, 170, 690, 170);

  // Glavni tekst
  doc.setFont("Times", "normal");
  doc.setFontSize(18);
  doc.text("Ova diploma se dodjeljuje ekipi:", 420, 210, { align: "center" });

  doc.setFont("Times", "bold");
  doc.setFontSize(22);
  doc.text(`${data.ime1} i ${data.ime2}`, 420, 240, { align: "center" });

  doc.setFont("Times", "normal");
  doc.setFontSize(18);
  doc.text(`Razred: ${data.razred}`, 420, 270, { align: "center" });
  doc.text(`Broj bodova: ${data.bodovi}/50`, 420, 300, { align: "center" });
  doc.text(`Ocjena: ${data.ocjena}`, 420, 330, { align: "center" });

  // Crta prije potpisa
  doc.line(150, 400, 690, 400);

  // Potpis i škola
  doc.setFont("Times", "italic");
  doc.setFontSize(16);
  doc.text("Voditelj sekcije:", 150, 440);
  doc.setFont("Times", "bolditalic");
  doc.text("prof. Elvir Čajić", 150, 460);

  doc.setFont("Times", "italic");
  doc.setTextColor("#0a1a2f");
  doc.text("OŠ Prokosovići", 150, 490);

  // Datum i godina
  const datum = new Date().toLocaleDateString("bs-BA");
  doc.text(`Datum: ${datum}`, 640, 490);

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
