document.addEventListener('DOMContentLoaded', () => {

  /* ======================================================
     NAVIGARE MENIU (cu submeniuri imbricate pentru Modul 1 și Modul 2)
  ====================================================== */
  const menu = document.getElementById('main-menu');
  const views = document.querySelectorAll('.app-view');

  function showView(id) {
    menu.classList.add('hidden');
    views.forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(id);
    if (target) { target.classList.remove('hidden'); window.scrollTo({top:0, behavior:'smooth'}); }
  }
  function showMenu() {
    views.forEach(v => v.classList.add('hidden'));
    menu.classList.remove('hidden');
    window.scrollTo({top:0, behavior:'smooth'});
  }
  document.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('click', () => showView(card.dataset.target));
  });
  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      const backTarget = btn.dataset.back;
      if (!backTarget || backTarget === 'main-menu') showMenu();
      else showView(backTarget);
    });
  });

  /* ======================================================
     MODUL 1: CHESTIONAR HOLLAND
  ====================================================== */
  (function initHolland() {
    const quizForm = document.getElementById('holland-quiz');
    const resultDiv = document.getElementById('result');
    const calculateBtn = document.getElementById('holland-calculate-btn');
    const hollandResetBtn = document.getElementById('holland-reset-btn');
    const backToHollandTopBtn = document.getElementById('back-to-holland-top-btn');
    const hollandSection = document.getElementById('holland-section');
    const hollandValidationErrorsDiv = document.getElementById('holland-validation-errors');
    if (!quizForm) return;

    const typeMap = { R: 'Realist', I: 'Investigativ', A: 'Artistic', S: 'Social', E: 'Întreprinzător', C: 'Convențional' };
    const hollandInterpretations = {
      R: "Îți place să lucrezi cu mâinile și cu lucruri concrete: să repari, să construiești, să folosești unelte și mașini, să lucrezi cu plante sau animale, adesea în aer liber. Ești practic, direct și perseverent și preferi rezultatele concrete discuțiilor abstracte. Ți se potrivesc atelierele, șantierele, fermele, laboratoarele tehnice și munca în aer liber.",
      I: "Ești atras de activități care presupun să observi, să cercetezi, să analizezi și să înțelegi cum și de ce funcționează lucrurile: probleme de logică, matematică sau știință. Ești curios, analitic, precis și independent și te concentrezi bine, adesea singur. Ți se potrivesc laboratoarele, cercetarea, universitățile și domeniile tehnice sau IT.",
      A: "Îți plac activitățile libere, creative, în care te poți exprima: scris, muzică, desen, design, actorie, dans, fotografie sau video. Ești original, imaginativ și sensibil la frumos, iar regulile rigide și rutina te obosesc. Ți se potrivesc studiourile, redacțiile, teatrele, agențiile de design și mediile flexibile.",
      S: "Îți place să lucrezi cu oamenii: să ajuți, să înveți, să consiliezi, să îngrijești. Ești empatic, cooperant, bun ascultător și simți responsabilitate față de ceilalți; preferi să ajuți oamenii decât să lucrezi cu mașini sau cu date. Ți se potrivesc școlile, spitalele, centrele sociale, ONG-urile și organizațiile de tineret.",
      E: "Îți place să conduci, să convingi, să vinzi și să pornești proiecte sau afaceri, asumându-ți riscuri pentru a atinge un obiectiv. Ești ambițios, energic, sociabil, încrezător și vorbești ușor în fața oamenilor; îți plac competiția și rolul de lider. Ți se potrivesc afacerile, vânzările, marketingul, managementul și politica.",
      C: "Îți plac ordinea, regulile clare și sarcinile bine definite, mai ales lucrul cu cifre, date și documente. Ești organizat, meticulos, atent la detalii și de încredere și te simți bine când știi exact ce ai de făcut. Ți se potrivesc birourile, băncile, instituțiile publice, contabilitatea, arhivele și bibliotecile."
    };
    const professionRecommendations = {
      R: ["Electrician", "Mecanic auto", "Instalator / sudor", "Tâmplar / constructor", "Inginer mecanic", "Agricultor / horticultor"],
      I: ["Cercetător / om de știință", "Programator / analist IT", "Medic", "Biolog / chimist", "Matematician / fizician", "Analist de date"],
      A: ["Designer grafic / web / interior", "Fotograf / creator video", "Muzician / actor", "Scriitor / jurnalist", "Arhitect", "Ilustrator / grafician"],
      S: ["Profesor / învățător", "Psiholog / consilier", "Asistent medical", "Asistent social", "Logoped / kinetoterapeut", "Trainer / lucrător de tineret"],
      E: ["Manager / antreprenor", "Agent de vânzări / imobiliar", "Specialist marketing / PR", "Avocat / procuror", "Agent de turism", "Consultant de afaceri"],
      C: ["Contabil", "Analist financiar / auditor", "Asistent administrativ", "Funcționar public", "Bibliotecar / arhivar", "Operator date / referent"]
    };

    function hideElement(el) { el?.classList.add('hidden'); }
    function showElement(el, disp = 'block') { if (el) { el.classList.remove('hidden'); el.style.display = disp; } }
    function scrollToEl(el, pos = 'start') { el?.scrollIntoView({ behavior: 'smooth', block: pos }); }

    quizForm.addEventListener('click', (event) => {
      const btn = event.target.closest('.rating-btn');
      if (!btn || !quizForm.contains(btn)) return;
      const group = btn.closest('.rating-buttons');
      group.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      hideElement(hollandValidationErrorsDiv);
    });

    hollandResetBtn.addEventListener('click', () => {
      if (confirm("Sunteți sigur că doriți să resetați răspunsurile?")) {
        quizForm.querySelectorAll('.rating-btn.active').forEach(b => b.classList.remove('active'));
        hideElement(resultDiv);
        hideElement(backToHollandTopBtn);
        hideElement(hollandValidationErrorsDiv);
        scrollToEl(hollandSection);
      }
    });

    function scrollToQuestion(qId) {
      const el = quizForm.querySelector(`.question-group[data-question-id="${qId}"]`);
      if (el) {
        scrollToEl(el, 'center');
        el.classList.add('highlight-question');
        setTimeout(() => el.classList.remove('highlight-question'), 1500);
      }
    }

    hollandValidationErrorsDiv.addEventListener('click', (event) => {
      if (event.target.matches('.question-link')) {
        scrollToQuestion(event.target.dataset.questionIdTarget);
      }
    });

    calculateBtn.addEventListener('click', () => {
      const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
      const unanswered = [];
      const groups = quizForm.querySelectorAll('.question-group');

      groups.forEach((group, index) => {
        const qNum = index + 1;
        const qId = group.dataset.questionId || `q${qNum}`;
        const type = group.getAttribute('data-type');
        const active = group.querySelector('.rating-btn.active');
        if (!active) unanswered.push({ number: qNum, id: qId });
        else if (active.dataset.value === 'like' && scores.hasOwnProperty(type)) scores[type]++;
      });

      if (unanswered.length > 0) {
        let html = `<p>Te rog răspunde la următoarele întrebări:</p><div class="error-links">`;
        unanswered.forEach(info => {
          html += `<span class="question-link" data-question-id-target="${info.id}" role="button" tabindex="0">${info.number}</span>`;
        });
        html += `</div>`;
        hollandValidationErrorsDiv.innerHTML = html;
        showElement(hollandValidationErrorsDiv);
        scrollToEl(hollandValidationErrorsDiv, 'center');
        return;
      }
      hideElement(hollandValidationErrorsDiv);

      const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
      const topScore = sorted[0][1];
      const code = topScore === 0 ? '—' : sorted.slice(0, 3).map(([t]) => t).join('');
      const tiedTop = sorted.filter(([, s]) => s === topScore).map(([t]) => t);
      const joinNames = arr => arr.length > 1
        ? arr.slice(0, -1).map(t => typeMap[t]).join(', ') + ' și ' + typeMap[arr[arr.length - 1]]
        : typeMap[arr[0]];

      // egalități de scor care ating primele 3 locuri din cod
      const tieNotes = [];
      const seenScores = new Set();
      sorted.forEach(([, sc]) => {
        if (seenScores.has(sc)) return;
        seenScores.add(sc);
        const grp = sorted.filter(([, x]) => x === sc).map(([t]) => t);
        const firstIdx = sorted.findIndex(([, x]) => x === sc);
        if (sc > 0 && grp.length > 1 && firstIdx < 3) tieNotes.push(`${joinNames(grp)} (scor ${sc})`);
      });

      let html = `<h4>Codul tău Holland: <strong>${code}</strong></h4>`;
      html += `<p style="font-size:0.9em;color:var(--secondary-color);margin-bottom:15px;">(Detaliu scoruri: `;
      html += sorted.slice(0, 3).map(([t, sc]) => `${typeMap[t]}=${sc}`).join(', ');
      html += `)</p>`;
      if (tieNotes.length) {
        html += `<p style="font-size:0.9em;color:var(--secondary-color);margin-bottom:15px;">Scoruri egale: ${tieNotes.join('; ')}. Ordinea acestor litere în cod nu are o semnificație.</p>`;
      }
      html += `<br><h4>Interpretare:</h4>`;

      const primary = sorted[0][0];
      if (topScore === 0) {
        html += `<p>Nu ai ales niciun răspuns ✔️ („Îmi place”), așa că nu se poate stabili un tip. Reia chestionarul și alege ✔️ la activitățile care ți se potrivesc.</p>`;
      } else if (tiedTop.length >= 4) {
        html += `<p><strong>Interese foarte variate:</strong> ${tiedTop.length} tipuri au același scor (${joinNames(tiedTop)}). Încearcă să bifezi ✔️ doar activitățile care îți plac cel mai mult sau discută rezultatul cu profesorul.</p>`;
      } else if (tiedTop.length > 1) {
        html += `<p><strong>Tipuri cu scor egal (${joinNames(tiedTop)}):</strong> ai interese în ${tiedTop.length === 2 ? 'ambele direcții' : 'mai multe direcții'}, așa că citește descrierile tuturor.</p>`;
        tiedTop.forEach(t => {
          html += `<p><strong>${typeMap[t]}:</strong> ${hollandInterpretations[t]}</p>`;
        });
      } else {
        html += `<p><strong>Tipul dominant (${typeMap[primary]}):</strong> ${hollandInterpretations[primary]}</p>`;
        if (sorted.length > 1 && sorted[1][1] > 0) {
          const secScore = sorted[1][1];
          const secTypes = sorted.filter(([, sc]) => sc === secScore).map(([t]) => t);
          if ((topScore - secScore <= 1) || (secScore >= Math.ceil(topScore / 2))) {
            if (secTypes.length === 1) {
              html += `<p><strong>Tipul secundar (${typeMap[secTypes[0]]}):</strong> ${hollandInterpretations[secTypes[0]]}</p>`;
            } else if (secTypes.length <= 3) {
              html += `<p><strong>Tipuri secundare cu scor egal (${joinNames(secTypes)}):</strong></p>`;
              secTypes.forEach(t => {
                html += `<p><strong>${typeMap[t]}:</strong> ${hollandInterpretations[t]}</p>`;
              });
            } else {
              html += `<p><strong>Tipuri secundare cu scor egal:</strong> ${joinNames(secTypes)}.</p>`;
            }
          }
        }
      }

      if (topScore > 0 && tiedTop.length < 4) {
        const profTypes = tiedTop.length > 1 ? tiedTop : [primary];
        html += `<br><h4>Exemple de meserii potrivite${tiedTop.length > 1 ? '' : ' (tipul dominant)'}:</h4>`;
        profTypes.forEach(t => {
          const recs = professionRecommendations[t] || [];
          if (!recs.length) return;
          if (profTypes.length > 1) html += `<p><strong>${typeMap[t]}</strong></p>`;
          html += `<ul>` + recs.map(p => `<li>${p}</li>`).join('') + `</ul>`;
        });
      }

      html += `<br><details><summary>Vezi scorurile complete</summary><p>`;
      html += sorted.map(([t, s]) => `${typeMap[t]} (${t}): ${s}`).join('<br>');
      html += `</p></details>`;

      const backBtnHTML = backToHollandTopBtn.outerHTML;
      resultDiv.innerHTML = html;
      resultDiv.insertAdjacentHTML('beforeend', backBtnHTML);
      const newBackBtn = resultDiv.querySelector('#back-to-holland-top-btn');
      newBackBtn.addEventListener('click', () => scrollToEl(hollandSection));
      showElement(newBackBtn);
      showElement(resultDiv);
      scrollToEl(resultDiv, 'nearest');
    });
  })();

  /* ======================================================
     MODUL 2: IERARHIA CHELTUIELILOR
  ====================================================== */
  (function initExpenses() {
    const listEl = document.getElementById('expense-list-numeric');
    const displayBtn = document.getElementById('display-hierarchy-btn');
    const resetBtn = document.getElementById('expense-reset-btn');
    const combinedDisplay = document.getElementById('combined-hierarchy-display');
    const combinedList = document.getElementById('combined-hierarchy-list');
    const allCorrectMsg = document.getElementById('all-correct-message');
    const partialMsg = document.getElementById('partial-success-message');
    const backBtn = document.getElementById('back-to-expenses-top-btn');
    const section = document.getElementById('expense-prioritization-section');
    if (!listEl) return;

    const expenses = [
      { id: 'e1', text: 'Chirie / Rată bancară' },
      { id: 'e2', text: 'Utilități' },
      { id: 'e3', text: 'Mâncare & produse bază' },
      { id: 'e4', text: 'Educație' },
      { id: 'e5', text: 'Sănătate' },
      { id: 'e6', text: 'Transport' },
      { id: 'e7', text: 'Îmbrăcăminte și încălțăminte' },
      { id: 'e8', text: 'Asigurări suplimentare' },
      { id: 'e9', text: 'Întreținere locuință' },
      { id: 'e10', text: 'Fond de urgență' },
      { id: 'e11', text: 'Economii obiective TL' },
      { id: 'e12', text: 'Investiții' },
      { id: 'e13', text: 'Abonamente (Netflix, etc.)' },
      { id: 'e14', text: 'Ieșiri în oraș' },
      { id: 'e15', text: 'Hobby-uri & recreere' },
      { id: 'e16', text: 'Vacanțe & călătorii' },
    ];
    const correctOrder = expenses.map(e => e.id);
    const textOf = Object.fromEntries(expenses.map(e => [e.id, e.text]));
    const N = expenses.length;

    let displayOrder = [];
    const assigned = {};

    function shuffle(arr) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function usedNumbers(excludeId) {
      const used = new Set();
      Object.entries(assigned).forEach(([id, val]) => {
        if (id !== excludeId && val) used.add(val);
      });
      return used;
    }

    function render() {
      listEl.innerHTML = '';
      displayOrder.forEach((id) => {
        const li = document.createElement('li');
        li.className = 'expense-rank-item';
        li.dataset.id = id;

        const used = usedNumbers(id);
        const currentVal = assigned[id] || '';
        let optionsHTML = `<option value="">-- alege --</option>`;
        for (let n = 1; n <= N; n++) {
          if (used.has(n) && n !== currentVal) continue;
          optionsHTML += `<option value="${n}" ${n === currentVal ? 'selected' : ''}>${n}</option>`;
        }

        li.innerHTML = `
          <span class="expense-text">${textOf[id]}</span>
          <select class="expense-priority-select" aria-label="Prioritate pentru ${textOf[id]}">${optionsHTML}</select>`;
        listEl.appendChild(li);
      });
    }

    listEl.addEventListener('change', (e) => {
      const select = e.target.closest('.expense-priority-select');
      if (!select) return;
      const li = select.closest('.expense-rank-item');
      const id = li.dataset.id;
      const val = parseInt(select.value, 10);
      assigned[id] = isNaN(val) ? null : val;
      render();
    });

    function hideElement(el) { el?.classList.add('hidden'); }
    function showElement(el, disp = 'block') { if (el) { el.classList.remove('hidden'); el.style.display = disp; } }
    function scrollToEl(el, pos = 'start') { el?.scrollIntoView({ behavior: 'smooth', block: pos }); }

    function hideResults() {
      hideElement(combinedDisplay);
      hideElement(backBtn);
      hideElement(partialMsg);
    }

    function resetList() {
      displayOrder = shuffle(correctOrder);
      correctOrder.forEach(id => { assigned[id] = null; });
      render();
      hideResults();
    }

    displayBtn.addEventListener('click', () => {
      const missing = correctOrder.filter(id => !assigned[id]);
      if (missing.length > 0) {
        alert(`Atenție: mai ai ${missing.length} cheltuieli fără prioritate alocată. Completează-le pe toate înainte de comparație.`);
        return;
      }

      combinedList.innerHTML = '';
      let allMatch = true;
      let currentStreak = 0, maxStreak = 0, maxStreakStart = 0;

      correctOrder.forEach((id, index) => {
        const correctPos = index + 1;
        const userPos = assigned[id];
        const isMismatch = userPos !== correctPos;
        if (isMismatch) {
          allMatch = false;
          if (currentStreak > maxStreak) { maxStreak = currentStreak; maxStreakStart = index - currentStreak; }
          currentStreak = 0;
        } else {
          currentStreak++;
        }

        const li = document.createElement('li');
        if (isMismatch) li.classList.add('priority-mismatch');
        li.innerHTML = `
          <span class="correct-info"><span class="priority-number">${correctPos}.</span> ${textOf[id]}</span>
          <span class="user-priority-display">${userPos}</span>`;
        combinedList.appendChild(li);
      });
      if (currentStreak > maxStreak) { maxStreak = currentStreak; maxStreakStart = correctOrder.length - currentStreak; }

      if (allMatch) {
        showElement(allCorrectMsg);
        hideElement(partialMsg);
      } else {
        hideElement(allCorrectMsg);
        if (maxStreak >= 2) {
          partialMsg.textContent = `Bravo! Ai ierarhizat corect ${maxStreak} cheltuieli consecutive (pozițiile ${maxStreakStart + 1}-${maxStreakStart + maxStreak})! 👏`;
          showElement(partialMsg);
        } else {
          hideElement(partialMsg);
        }
      }
      showElement(combinedDisplay);
      showElement(backBtn);
      scrollToEl(combinedDisplay, 'start');
    });

    backBtn.addEventListener('click', () => scrollToEl(section));
    resetBtn.addEventListener('click', () => { resetList(); scrollToEl(section); });

    resetList();
  })();

  /* ======================================================
     MODUL 3: DECALOGUL ANTIFRAUDĂ
  ====================================================== */
  (function initAntifraud() {
    const root = document.getElementById('antifraud-quiz-root');
    if (!root) return;

    const questions = [
      { category: "Mesaj de la „un prieten” (WhatsApp)", question: "Primești pe WhatsApp un mesaj de pe un număr necunoscut: „Salut, sunt Andrei! Mi-am pierdut telefonul, ăsta e numărul meu nou. Mă ajuți urgent cu 300 de lei? Ți-i dau mâine.” Ce faci?",
        options: ["Îi trimit banii, e prietenul meu și e urgent", "Îi cer mai multe detalii, tot pe WhatsApp", "Îl sun pe numărul vechi, pe care îl am salvat, să aflu dacă el a scris", "Îi trimit doar jumătate din sumă, ca să nu risc prea mult"],
        correctAnswer: 2, explanation: "Fraudatorii se dau drept prieteni sau rude, cu „număr nou” sau cu un cont de WhatsApp furat, și cer bani urgent. Singura verificare sigură e pe alt canal: îl suni pe numărul vechi, pe care îl știi deja. Regula: niciun leu fără confirmare directă, chiar dacă mesajul pare scris de cineva cunoscut." },
      { category: "Cod QR fals (quishing)", question: "Vrei să plătești parcarea din oraș și scanezi un cod QR lipit pe un stâlp. Ce risc există?",
        options: ["Autocolantul poate fi pus de infractori peste cel real și te duce pe un site fals, care îți fură datele cardului", "Niciunul, un cod QR e mereu sigur", "Doar dacă telefonul nu are antivirus", "Niciunul, dacă pagina se deschide repede"],
        correctAnswer: 0, explanation: "Atacatorii lipesc propriile coduri QR peste cele oficiale (pe parcări, în restaurante, pe afișe). Codul te duce pe un site care arată ca cel real și îți cere datele cardului. Regula: înainte să scanezi, verifică să nu fie un autocolant pus peste altul, iar după scanare citește adresa site-ului. Dacă ai dubii, plătește din aplicația oficială." },
      { category: "Deepfake (apel video fals făcut cu AI)", question: "Primești un apel video pe WhatsApp: se vede și se aude „directorul băncii tale”, care îți cere să confirmi urgent o plată din cont. Arată și vorbește exact ca el. Ce faci?",
        options: ["Confirm plata, l-am văzut și l-am auzit chiar eu", "Îi cer să-mi trimită un mesaj scris în timpul apelului", "Verific dacă numărul de pe care sună seamănă cu al băncii", "Închid și sun eu banca, la numărul oficial de pe card sau din aplicație"],
        correctAnswer: 3, explanation: "Cu ajutorul inteligenței artificiale, oricine poate copia fața și vocea unei persoane, după câteva secunde de video sau audio din rețelele sociale. Un apel video nu mai dovedește că persoana e reală, iar numărul de telefon poate fi falsificat. Regula: nu confirma nimic în timpul unui apel primit; închide și sună tu banca la numărul oficial." },
      { category: "Magazin online fals", question: "Vezi pe Instagram o reclamă la un magazin online care vinde ultimul model de iPhone cu 400 de lei. Ce semn ar trebui să te facă să bănuiești o înșelătorie?",
        options: ["Are multe like-uri și comentarii pozitive", "Acceptă plata doar prin transfer bancar sau criptomonede, nu și cu cardul sau ramburs", "Are un site cu aspect foarte profesionist", "Oferă livrare gratuită"],
        correctAnswer: 1, explanation: "Un preț mult sub piață și plata doar prin transfer sau criptomonede (bani care nu se mai pot recupera) sunt semnalul clasic al unei înșelătorii. Comentariile pot fi cumpărate, iar site-ul poate fi copiat în câteva ore. Regula: dacă oferta pare prea bună ca să fie adevărată, probabil nu e; plătește cu cardul sau ramburs și caută păreri independente despre magazin." },
      { category: "Money mule („catâr financiar”)", question: "Cineva îți scrie pe Instagram: „Job ușor de acasă! Primești bani în contul tău, îi trimiți mai departe unei persoane și păstrezi 10% comision.” Ce faci?",
        options: ["Accept, sunt bani ușori pentru foarte puțină muncă", "Accept, dar doar dacă sumele sunt mici", "Refuz: banii pot veni din fraude, iar eu aș putea răspunde în fața poliției", "Cer un contract înainte să accept"],
        correctAnswer: 2, explanation: "Se numește „money mule” (catâr financiar): banii furați de la alții trec prin contul tău, ca să nu se vadă de unde vin. Chiar dacă nu ai știut, poți fi tras la răspundere pentru spălare de bani și riști închisoarea. Regula: nu lăsa pe nimeni să folosească contul tău pentru bani care nu sunt ai tăi." },
      { category: "Wi-Fi public (atacul „Man-in-the-Middle”)", question: "Ești în mall, vezi rețeaua „Mall_WiFi_Gratuit”, fără parolă, și vrei să îți verifici contul de la bancă. Ce e cel mai sigur?",
        options: ["Mă conectez, atât timp cât site-ul băncii are lăcățel în bara de adresă", "Mă conectez, un Wi-Fi public e la fel de sigur ca cel de acasă", "Mă conectez, dar deschid pagina în modul incognito", "Nu mă conectez; folosesc datele mobile (sau un VPN) pentru tranzacții"],
        correctAnswer: 3, explanation: "Oricine poate crea o rețea Wi-Fi falsă, cu un nume convingător, și poate vedea ce trimiți prin ea (atac numit „Man-in-the-Middle”). Lăcățelul și modul incognito nu te protejează de asta. Regula: aplicațiile bancare și plățile se fac pe datele mobile sau cu VPN, nu pe Wi-Fi public." },
      { category: "SMS fals de la curier (phishing)", question: "Aștepți un colet. Primești un SMS: „Coletul tău nu a putut fi livrat. Plătește 4,99 lei taxă de redirecționare aici: (link)”. Ce faci?",
        options: ["Nu apăs pe link; verific coletul în aplicația sau pe site-ul oficial al curierului, cu numărul comenzii", "Plătesc, e doar 4,99 lei", "Apăs pe link doar să văd despre ce e vorba, fără să introduc nimic", "Răspund la SMS și cer mai multe detalii"],
        correctAnswer: 0, explanation: "Acesta e phishing: mesajul imită curierii, ANAF, băncile sau Poșta, iar linkul duce pe o pagină falsă unde ți se cer datele cardului. Suma mică te face să nu te gândești prea mult. Regula: instituțiile nu cer plăți urgente printr-un link din SMS; nu apăsa pe link și verifică direct pe site-ul sau în aplicația oficială." },
      { category: "Plată mică necunoscută (card furat)", question: "În aplicația băncii vezi o plată de 3 lei la un comerciant pe care nu îl știi. Nu-ți amintești să fi cumpărat ceva. Ce faci?",
        options: ["Las așa, 3 lei nu înseamnă nimic", "Anunț banca imediat și blochez cardul, pentru că hoții testează cardurile furate cu sume mici", "Probabil e un comision al băncii, nu fac nimic", "Aștept să văd dacă mai apar și alte plăți"],
        correctAnswer: 1, explanation: "Infractorii testează cardul furat cu o sumă foarte mică (1-5 lei). Dacă plata trece, urmează sume mari. Regula: orice plată pe care nu o recunoști, oricât de mică, se raportează imediat băncii, iar cardul se blochează din aplicație." },
      { category: "Parole și verificare în doi pași (2FA)", question: "Care e cea mai bună protecție pentru contul tău de la bancă sau de pe Instagram?",
        options: ["O parolă cu numele și anul nașterii, ușor de ținut minte", "Aceeași parolă ca la toate conturile, ca să nu o uit", "O parolă lungă, numai a ta, plus verificare în doi pași (cod primit pe telefon)", "O parolă scurtă, dar pe care o schimb des"],
        correctAnswer: 2, explanation: "Parolele cu date personale se ghicesc ușor, iar dacă o parolă folosită peste tot ajunge la atacatori, aceștia încearcă toate conturile tale. O frază lungă, de exemplu „CaineleMeuAre3PeteNegre!”, plus codul de confirmare de pe telefon (2FA) este cea mai bună protecție. Regula: o parolă diferită pentru fiecare cont și 2FA oriunde se poate." },
      { category: "Schemă piramidală (Ponzi)", question: "Un coleg îți spune că a intrat într-un grup de Telegram cu o platformă de investiții: „profit garantat 30% pe lună” și bonus dacă aduci și alți prieteni. El a primit deja bani. Ce ar trebui să te alerteze?",
        options: ["Nimic, dacă platforma arată bine și are mulți membri", "Nimic, dacă investesc doar o sumă mică, ca test", "Nimic, dacă și colegul meu a câștigat deja bani", "Profitul „garantat” de 30% pe lună și bonusul pentru aducerea de prieteni: sunt semnele unei scheme piramidale"],
        correctAnswer: 3, explanation: "Nicio investiție reală nu garantează 30% pe lună. La schemele piramidale (Ponzi), banii noilor veniți plătesc „profitul” celor vechi, până când schema se prăbușește și majoritatea pierd tot. Primii câștigă ca să te convingă și pe tine. Regula: „profit garantat” și bonus pentru aducerea de prieteni înseamnă pericol." },
    ];

    let currentIndex = 0, selectedOption = null, answered = false, score = 0;
    const userAnswers = Array(questions.length).fill(null);

    function renderQuestion() {
      const q = questions[currentIndex];
      const userAns = userAnswers[currentIndex];
      selectedOption = userAns;
      answered = userAns !== null;

      let optsHTML = '';
      q.options.forEach((opt, i) => {
        let cls = 'quiz-option';
        if (answered) {
          if (i === q.correctAnswer) cls += ' correct';
          else if (i === userAns) cls += ' incorrect';
        } else if (i === selectedOption) {
          cls += ' selected';
        }
        optsHTML += `<label class="${cls}" data-index="${i}">
          <input type="radio" name="q${currentIndex}" ${userAns === i ? 'checked' : ''} ${answered ? 'disabled' : ''}>
          <span>${opt}</span>
        </label>`;
      });

      root.innerHTML = `
        <div class="quiz-box">
          <div class="quiz-header">
            <h4>Decalogul Antifraudă</h4>
            <span>Întrebarea ${currentIndex + 1} din ${questions.length}</span>
          </div>
          <div class="quiz-body">
            <span class="quiz-category">${q.category}</span>
            <p class="quiz-question">${q.question}</p>
            <div class="quiz-options">${optsHTML}</div>
            ${answered ? `<div class="quiz-explanation"><strong>${userAns === q.correctAnswer ? '✅ Corect! ' : '❌ Nu tocmai. '}</strong>${q.explanation}</div>` : ''}
            <div class="quiz-nav">
              <button class="quiz-btn ghost" id="qz-prev" ${currentIndex === 0 ? 'disabled' : ''}>← Înapoi</button>
              ${!answered
                ? `<button class="quiz-btn" id="qz-check" disabled>Verifică</button>`
                : `<button class="quiz-btn" id="qz-next">${currentIndex < questions.length - 1 ? 'Înainte →' : 'Vezi rezultatul →'}</button>`}
            </div>
          </div>
        </div>`;

      root.querySelectorAll('.quiz-option').forEach(label => {
        label.addEventListener('click', () => {
          if (answered) return;
          selectedOption = parseInt(label.dataset.index, 10);
          root.querySelectorAll('.quiz-option').forEach(l => l.classList.remove('selected'));
          label.classList.add('selected');
          const checkBtn = document.getElementById('qz-check');
          if (checkBtn) checkBtn.disabled = false;
        });
      });

      const checkBtn = document.getElementById('qz-check');
      if (checkBtn) checkBtn.addEventListener('click', () => {
        if (selectedOption === null) return;
        userAnswers[currentIndex] = selectedOption;
        answered = true;
        renderQuestion();
      });

      const nextBtn = document.getElementById('qz-next');
      if (nextBtn) nextBtn.addEventListener('click', () => {
        if (currentIndex < questions.length - 1) {
          currentIndex++;
          renderQuestion();
        } else {
          renderFinal();
        }
      });

      const prevBtn = document.getElementById('qz-prev');
      if (prevBtn) prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) { currentIndex--; renderQuestion(); }
      });
    }

    function computeScore() {
      return userAnswers.reduce((acc, ans, i) => acc + (ans === questions[i].correctAnswer ? 1 : 0), 0);
    }

    function renderFinal() {
      score = computeScore();
      const total = questions.length;
      const pct = Math.round((score / total) * 100);
      const wrongCount = total - score;

      let title = '', subtitle = '', interp = '';
      if (score === total) {
        title = '🏆 Felicitări!'; subtitle = 'Ai obținut scorul maxim!';
        interp = 'Excelent! Ai toate cunoștințele necesare pentru a te proteja împotriva fraudelor bancare. Ești vigilent și știi exact cum să identifici și să eviți tentativele de înșelăciune.';
      } else if (score >= total * 0.7) {
        title = '👍 Foarte bine!'; subtitle = 'Ai cunoștințe solide despre siguranța bancară.';
        interp = `Foarte bun rezultat! Ai cunoștințe solide despre securitatea bancară. Continuă să fii vigilent.<br><br><strong style="color:var(--orange-color)">Ai fost păcălit de ${wrongCount} ${wrongCount === 1 ? 'dată' : 'ori'}! Fii atent la detalii!</strong>`;
      } else if (score >= total / 2) {
        title = '👍 Bine făcut!'; subtitle = 'Ai cunoștințe bune despre siguranța bancară.';
        interp = `Ai cunoștințe bune, dar există loc de îmbunătățire. Acordă atenție verificării surselor și nu oferi niciodată date confidențiale prin canale nesigure.<br><br><strong style="color:var(--orange-color)">Ai fost păcălit de ${wrongCount} ori! Fraudatorii ar putea profita de aceste vulnerabilități!</strong>`;
      } else {
        title = '📖 Continuă să înveți!'; subtitle = 'Ai nevoie de mai multe informații pentru a te proteja eficient.';
        interp = `Este important să înveți să recunoști semnele de avertizare ale fraudelor. Nu acționa niciodată sub presiune sau din sentiment de urgență când e vorba de bani.<br><br><strong style="color:var(--danger-color)">Ai fost păcălit de ${wrongCount} ori! Ești expus la riscuri semnificative de fraudă!</strong>`;
      }

      root.innerHTML = `
        <div class="quiz-box">
          <div class="quiz-header"><h4>Rezultat final</h4></div>
          <div class="quiz-body quiz-final">
            <h3>${title}</h3>
            <p>${subtitle}</p>
            <div class="quiz-score">${score}/${total}</div>
            <p>Procentaj: ${pct}%</p>
            <div class="quiz-interpretation">${interp}</div>
            <button class="quiz-btn" id="qz-restart">🔄 Încearcă din nou</button>
          </div>
        </div>`;

      document.getElementById('qz-restart').addEventListener('click', () => {
        currentIndex = 0; score = 0;
        userAnswers.fill(null);
        renderQuestion();
      });
    }

    renderQuestion();

    function setupToggle(btnId, contentId, labelClosed, labelOpen) {
      const btn = document.getElementById(btnId);
      const content = document.getElementById(contentId);
      if (!btn || !content) return;
      btn.addEventListener('click', () => {
        const isHidden = content.classList.contains('hidden');
        content.classList.toggle('hidden');
        btn.textContent = isHidden ? labelOpen : labelClosed;
      });
    }
    setupToggle('toggle-protection-btn', 'protection-content', '🛡️ Cum să te protejezi (principii)', '🛡️ Ascunde principiile');
    setupToggle('toggle-resources-btn', 'resources-content', '📞 Unde anunți o fraudă', '📞 Ascunde');
    setupToggle('toggle-credit-btn', 'credit-content', '💵 Credite și DAE', '💵 Ascunde');
  })();

  /* ======================================================
     MODUL 4: BLITZ BUSINESS
  ====================================================== */
  (function initBlitz() {
    const expenseRowsEl = document.getElementById('expense-rows');
    const productRowsEl = document.getElementById('product-rows');
    if (!expenseRowsEl) return;

    const expenseTypes = [
      { value: 'materii_prime', label: 'Materii prime' },
      { value: 'materiale', label: 'Materiale' },
      { value: 'furnizori', label: 'Furnizori' },
      { value: 'transport', label: 'Transport' },
      { value: 'desfacere', label: 'Desfacere' },
      { value: 'altele', label: 'Altele' },
    ];

    let expenseRowCount = 0, productRowCount = 0;

    function addExpenseRow(data = {}) {
      expenseRowCount++;
      const div = document.createElement('div');
      div.className = 'row-item';
      div.dataset.rowId = expenseRowCount;
      div.innerHTML = `
        <label>Tip
          <select class="exp-type">${expenseTypes.map(t => `<option value="${t.value}" ${data.type === t.value ? 'selected' : ''}>${t.label}</option>`).join('')}</select>
        </label>
        <label>Sumă (lei)<input type="number" class="exp-amount" min="0" step="0.1" value="${data.amount || ''}"></label>
        <label class="row-full">Descriere<input type="text" class="exp-desc" placeholder="Opțional... ex: făină, ambalaje" value="${data.desc || ''}"></label>
        <button type="button" class="remove-row-btn">✕ Șterge cheltuiala</button>`;
      div.querySelector('.remove-row-btn').addEventListener('click', () => div.remove());
      expenseRowsEl.appendChild(div);
    }

    function addProductRow(data = {}) {
      productRowCount++;
      const div = document.createElement('div');
      div.className = 'row-item';
      div.dataset.rowId = productRowCount;
      div.innerHTML = `
        <label class="row-full">Produs / Serviciu<input type="text" class="prod-name" placeholder="ex: Limonadă" value="${data.name || ''}"></label>
        <label>Preț unitar (lei)<input type="number" class="prod-price" min="0" step="0.1" value="${data.price || ''}"></label>
        <label>Cantitate<input type="number" class="prod-qty" min="0" step="1" value="${data.qty || ''}"></label>
        <label>U.M.<input type="text" class="prod-unit" placeholder="buc" value="${data.unit || 'buc'}"></label>
        <button type="button" class="remove-row-btn">✕ Șterge produsul</button>`;
      div.querySelector('.remove-row-btn').addEventListener('click', () => div.remove());
      productRowsEl.appendChild(div);
    }

    document.getElementById('add-expense-row').addEventListener('click', () => addExpenseRow());
    document.getElementById('add-product-row').addEventListener('click', () => addProductRow());

    addExpenseRow(); addExpenseRow();
    addProductRow();

    function fmt(n) {
      const negative = n < 0;
      n = Math.abs(Math.round(n * 100) / 100);
      const parts = n.toFixed(2).split('.');
      let intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return (negative ? '-' : '') + intPart + ',' + parts[1];
    }

    document.getElementById('blitz-calculate-btn').addEventListener('click', () => {
      const capital = parseFloat(document.getElementById('biz-capital').value) || 0;
      const bizName = document.getElementById('biz-name').value.trim() || 'Afacerea ta';

      let totalExpenses = 0;
      const expenseBreakdown = {};
      expenseRowsEl.querySelectorAll('.row-item').forEach(row => {
        const type = row.querySelector('.exp-type').value;
        const amount = parseFloat(row.querySelector('.exp-amount').value) || 0;
        totalExpenses += amount;
        expenseBreakdown[type] = (expenseBreakdown[type] || 0) + amount;
      });

      let totalRevenue = 0;
      productRowsEl.querySelectorAll('.row-item').forEach(row => {
        const price = parseFloat(row.querySelector('.prod-price').value) || 0;
        const qty = parseFloat(row.querySelector('.prod-qty').value) || 0;
        totalRevenue += price * qty;
      });

      const profit = totalRevenue - totalExpenses;
      const roi = capital > 0 ? (profit / capital) * 100 : null;
      const capitalIsSet = capital > 0;
      const exceedsCapital = capitalIsSet && totalExpenses > capital;

      const typeLabels = Object.fromEntries(expenseTypes.map(t => [t.value, t.label]));
      let breakdownRows = Object.entries(expenseBreakdown)
        .filter(([, v]) => v > 0)
        .map(([type, amount]) => `<tr><td>${typeLabels[type]}</td><td>${fmt(amount)} lei</td></tr>`).join('');

      let capitalAlert = '';
      if (capitalIsSet) {
        if (exceedsCapital) {
          capitalAlert = `<div class="blitz-alert warning">⚠️ <strong>Atenție: Capital insuficient!</strong> Cheltuielile (${fmt(totalExpenses)} lei) depășesc capitalul inițial (${fmt(capital)} lei).</div>`;
        } else {
          const remaining = capital - totalExpenses;
          capitalAlert = `<div class="blitz-alert ok">✅ <strong>Capital suficient.</strong> Cheltuielile (${fmt(totalExpenses)} lei) sunt acoperite de capital (${fmt(capital)} lei).${remaining > 0 ? ` Rămân: ${fmt(remaining)} lei.` : ''}</div>`;
        }
      }

      let verdict = '';
      if (profit > 0 && roi !== null && roi >= 50) verdict = '🚀 Afacere foarte profitabilă — ai recuperat capitalul și mai mult!';
      else if (profit > 0) verdict = '✅ Afacerea e pe profit. Vezi dacă poți reduce cheltuielile sau crește vânzările pentru un ROI mai mare.';
      else if (profit === 0) verdict = '⚖️ Afacerea e la punctul de echilibru (break-even) — nici profit, nici pierdere.';
      else verdict = '⚠️ Afacerea e pe pierdere. Reconsideră prețurile, cheltuielile sau volumul vânzărilor.';

      const resultDiv = document.getElementById('blitz-result');
      resultDiv.innerHTML = `
        <h3>Sumar Financiar — ${bizName}</h3>
        ${capitalAlert}
        <table class="blitz-summary-table">
          <tr><td>Capital inițial</td><td>${fmt(capital)} lei</td></tr>
          ${breakdownRows}
          <tr><td>Total cheltuieli</td><td>${fmt(totalExpenses)} lei</td></tr>
          <tr><td>Total venituri</td><td>${fmt(totalRevenue)} lei</td></tr>
          <tr class="total-row"><td>Profit (venituri − cheltuieli)</td><td class="${profit >= 0 ? 'profit-positive' : 'profit-negative'}">${fmt(profit)} lei</td></tr>
          ${roi !== null ? `<tr><td>ROI (randamentul capitalului)</td><td class="${roi >= 0 ? 'profit-positive' : 'profit-negative'}">${roi.toFixed(1)}%</td></tr>` : ''}
        </table>
        <div class="blitz-verdict">${verdict}</div>`;
      resultDiv.classList.remove('hidden');
      resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.getElementById('blitz-reset-btn').addEventListener('click', () => {
      if (!confirm('Sigur resetezi planul de afaceri?')) return;
      document.getElementById('biz-name').value = '';
      document.getElementById('biz-owner').value = '';
      document.getElementById('biz-category').value = '';
      document.getElementById('biz-description').value = '';
      document.getElementById('biz-capital').value = '';
      document.getElementById('conv-amount').value = '';
      if (document.getElementById('conv-pair')) { document.getElementById('conv-pair').selectedIndex = 0; document.getElementById('conv-rate').value = fmtRate(defaultRates[document.getElementById('conv-pair').value.split('-')[0]]); }
      document.getElementById('conv-result').classList.add('hidden');
      document.getElementById('ci-monthly').value = '';
      document.getElementById('ci-years').value = '';
      document.getElementById('ci-rate').value = '';
      document.getElementById('ci-result').classList.add('hidden');
      document.getElementById('biz-presentation-text').value = '';
      expenseRowsEl.innerHTML = ''; productRowsEl.innerHTML = '';
      expenseRowCount = 0; productRowCount = 0;
      addExpenseRow(); addExpenseRow(); addProductRow();
      document.getElementById('blitz-result').classList.add('hidden');
    });

    const ciBtn = document.getElementById('ci-calc-btn');
    if (ciBtn) {
      ciBtn.addEventListener('click', () => {
        const monthly = parseFloat(document.getElementById('ci-monthly').value) || 0;
        const years = parseFloat(document.getElementById('ci-years').value) || 0;
        const ratePct = parseFloat(document.getElementById('ci-rate').value) || 0;
        const ciResult = document.getElementById('ci-result');
        if (monthly <= 0 || years <= 0) {
          ciResult.textContent = 'Completează suma lunară și numărul de ani.';
          ciResult.classList.remove('hidden');
          return;
        }
        const months = years * 12;
        const contributed = monthly * months;
        let futureValue;
        if (ratePct <= 0) {
          futureValue = contributed;
        } else {
          const i = (ratePct / 100) / 12;
          futureValue = monthly * ((Math.pow(1 + i, months) - 1) / i);
        }
        const interestEarned = futureValue - contributed;
        ciResult.textContent = `După ${years} ${years === 1 ? 'an' : 'ani'}: ai depus în total ${fmt(contributed)} lei, iar cu dobândă compusă ai acumula aproximativ ${fmt(futureValue)} lei (din care ${fmt(interestEarned)} lei doar din dobândă).`;
        ciResult.classList.remove('hidden');
      });
    }

    // ---- Convertor valutar: cursul de schimb îl introduce utilizatorul ----
    // Valorile de mai jos sunt doar orientative (completate în câmpul "Curs de schimb"
    // și pot fi schimbate oricând de utilizator).
    const defaultRates = { EUR: 5.05, USD: 4.35 };
    const convPairEl = document.getElementById('conv-pair');
    const convRateEl = document.getElementById('conv-rate');
    const convBtn = document.getElementById('conv-btn');

    // acceptă și virgula zecimală ("5,05") și punctul ("5.05")
    function parseRate(v) { return parseFloat(String(v).trim().replace(',', '.')) || 0; }

    function fmtRate(r) {
      let s = r.toFixed(4).replace(/0+$/, '');
      if (/\.\d$/.test(s)) s += '0';
      return s.replace('.', ',');
    }

    if (convPairEl && convRateEl) {
      convRateEl.value = fmtRate(defaultRates[convPairEl.value.split('-')[0]]);
      // cursul aparține monedei: la schimbarea monedei revenim la cursul orientativ al ei
      convPairEl.addEventListener('change', () => {
        convRateEl.value = fmtRate(defaultRates[convPairEl.value.split('-')[0]]);
      });
    }

    if (convBtn) {
      convBtn.addEventListener('click', () => {
        const amount = parseFloat(document.getElementById('conv-amount').value) || 0;
        const rate = parseRate(convRateEl.value);
        const from = convPairEl.value.split('-')[0];
        const convResult = document.getElementById('conv-result');
        if (amount <= 0) {
          convResult.textContent = 'Introdu suma pe care vrei să o convertești.';
          convResult.classList.remove('hidden');
          return;
        }
        if (rate <= 0) {
          convResult.textContent = 'Introdu cursul de schimb (câți lei costă 1 ' + from + ').';
          convResult.classList.remove('hidden');
          return;
        }
        const converted = amount * rate;
        convResult.textContent = `${fmt(amount)} ${from} × ${fmtRate(rate)} lei = ${fmt(converted)} lei (la cursul introdus de tine) → completat automat mai jos, la Capital inițial`;
        convResult.classList.remove('hidden');
        document.getElementById('biz-capital').value = (Math.round(converted * 100) / 100);
      });
    }

    const toggleTipsBtn = document.getElementById('toggle-tips-btn');
    if (toggleTipsBtn) {
      toggleTipsBtn.addEventListener('click', () => {
        const content = document.getElementById('tips-content');
        const isHidden = content.classList.contains('hidden');
        content.classList.toggle('hidden');
        toggleTipsBtn.textContent = isHidden ? 'ℹ️ Ascunde sfaturile' : 'ℹ️ Arată sfaturi pentru prezentare';
      });
    }

    const toggleLegalBtn = document.getElementById('toggle-legal-btn');
    if (toggleLegalBtn) {
      toggleLegalBtn.addEventListener('click', () => {
        const content = document.getElementById('legal-content');
        const isHidden = content.classList.contains('hidden');
        content.classList.toggle('hidden');
        toggleLegalBtn.textContent = isHidden ? '💼 Ascunde' : '💼 Ce formă legală poate avea o afacere?';
      });
    }
  })();

});
