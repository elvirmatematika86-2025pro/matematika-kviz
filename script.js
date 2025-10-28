let pitanja = [];
let tacniOdgovori = [];
let vrijeme = 40 * 60;
let timerInterval;

function pokreniKviz(e) {
  e.preventDefault();
  document.getElementById("prijava").style.display = "none";
  document.getElementById("kviz").style.display = "block";
  generisiPitanja();
  startTimer();
}

function generisiPitanja() {
  const container = document.getElementById("pitanja");
  for (let i = 1; i <= 50; i++) {
    let a = Math.floor(Math.random() * 20) + 1;
    let b = Math.floor(Math.random() * 20) + 1;
    let tacan = a + b;
    let opcije = [tacan, tacan + 2, tacan - 3].sort(() => Math.random() - 0.5);
    tacniOdgovori.push(tacan);
    container.innerHTML += `
      <div class="pitanje">
        <p>${i}. Koliko iznosi ${a} + ${b}?</p>
        ${opcije
          .map((v) => `<label><input type="radio" name="q${i}" value="${v}"> ${v}</label>`)
          .join("")}
      </div>`;
  }
}

function startTimer() {
  const t = document.getElementById("timer");
  timerInterval = setInterval(() => {
    let m = Math.floor(vrijeme / 60);
    let s = vrijeme % 60;
    s = s < 10 ? "0" + s : s;
    t.textContent = `⏳ ${m}:${s}`;
    if (vrijeme-- <= 0) {
      clearInterval(timerInterval);
      zavrsiKviz();
    }
  }, 1000);
}

function zavrsiKviz() {
  clearInterval(timerInterval);
  document.getElementById("kviz").style.display = "none";
  document.getElementById("rezultat").style.display = "block";

  const ime1 = document.getElementById("ucenik1").value.trim();
  const ime2 = document.getElementById("ucenik2").value.trim();
  const razred = document.getElementById("razred").value.trim();

  let bodovi = 0;
  for (let i = 1; i <= 50; i++) {
    const odg = document.querySelector(`input[name="q${i}"]:checked`);
    if (odg && parseInt(odg.value) === tacniOdgovori[i - 1]) bodovi++;
  }

  const postotak = (bodovi / 50) * 100;
  let ocjena =
    postotak >= 90 ? 5 :
    postotak >= 75 ? 4 :
    postotak >= 60 ? 3 :
    postotak >= 45 ? 2 : 1;

  let poruka =
    ocjena === 5 ? "🏆 Izvanredno! Zlatna diploma!" :
    ocjena === 4 ? "🥈 Odlično, srebrna pohvala!" :
    ocjena === 3 ? "👏 Dobar rezultat, bravo!" :
    ocjena === 2 ? "💡 Potrebno malo više vježbe." :
    "📘 Ne odustaj! Učiš kroz greške.";

  document.getElementById("ekipa-info").innerHTML =
    `Ekipa: <b>${ime1}</b> i <b>${ime2}</b> (razred ${razred})`;
  document.getElementById("bodovi").innerHTML = `Osvojeni bodovi: <b>${bodovi}/50</b>`;
  document.getElementById("ocjena").innerHTML = `Ocjena: <b>${ocjena}</b>`;
  document.getElementById("poruka").innerHTML = poruka;

  if (ocjena === 5) {
    generisiDiplomu(ime1, ime2, razred, postotak);
  }
}

async function generisiDiplomu(ime1, ime2, razred, postotak) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4"
  });

  // Pozadina
  const grad = doc.context2d.createLinearGradient(0, 0, 600, 400);
  grad.addColorStop(0, "#f7fbff");
  grad.addColorStop(1, "#cdeaff");
  doc.setFillColor("#e3f4ff");
  doc.rect(0, 0, 842, 595, "F");

  // Naslov
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor("#005b99");
  doc.text("ZLATNA DIPLOMA", 300, 100);

  // Podnaslov
  doc.setFontSize(16);
  doc.setTextColor("#003355");
  doc.text("Sekcija 'Mladi matematičari' — OŠ Prokosovići", 180, 140);

  // Imena
  doc.setFontSize(18);
  doc.setTextColor("#000");
  doc.text(`Dodjeljuje se ekipi:`, 330, 190);
  doc.setFontSize(20);
  doc.setTextColor("#0077cc");
  doc.text(`${ime1} i ${ime2}`, 330, 220);
  doc.setFontSize(16);
  doc.setTextColor("#003355");
  doc.text(`Razred: ${razred}`, 360, 245);
  doc.text(`Uspjeh: ${postotak.toFixed(1)}%`, 360, 265);

  // Potpis
  doc.setFontSize(14);
  doc.text("Voditelj sekcije:", 100, 480);
  doc.setFont("helvetica", "italic");
  doc.text("prof. Elvir Čajić", 100, 500);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("OŠ Prokosovići — 2025", 100, 520);

  // Ukrasna linija
  doc.setDrawColor("#0077cc");
  doc.setLineWidth(3);
  doc.line(80, 530, 760, 530);

  // Potpis škole (stiliziran)
  doc.setFontSize(10);
  doc.setTextColor("#006699");
  doc.text("Matematička sekcija OŠ Prokosovići", 580, 560);

  doc.save(`Zlatna_diploma_${ime1}_${ime2}.pdf`);
}
