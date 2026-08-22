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
      R: "Preferi activități practice, care implică lucrul cu obiecte, mașini, unelte, plante sau animale. Ești o persoană practică, directă, stabilă și preferi soluțiile concrete. Mediile de lucru structurate, în aer liber sau în ateliere ți se potrivesc.",
      I: "Ești atras de activități care implică observarea, învățarea, investigarea, analiza și rezolvarea problemelor. Ești o persoană curioasă, analitică, independentă și precisă. Preferi mediile academice, de cercetare sau cele care necesită gândire critică.",
      A: "Îți plac activitățile nestructurate, creative, care îți permit să te exprimi prin forme artistice (scris, muzică, arte vizuale, design). Ești o persoană originală, intuitivă, expresivă și nonconformistă. Preferi mediile flexibile, care încurajează inovația.",
      S: "Ești orientat către activități care implică interacțiunea cu alte persoane – a ajuta, a învăța, a consilia, a îngriji. Ești o persoană cooperantă, empatică, prietenoasă și responsabilă social. Preferi mediile educaționale, de sănătate sau serviciile sociale.",
      E: "Preferi activități care îți permit să influențezi, să convingi, să conduci sau să gestionezi alte persoane pentru a atinge obiective organizaționale sau economice. Ești o persoană ambițioasă, energică, sociabilă și persuasivă. Preferi mediile de afaceri, vânzări sau management.",
      C: "Ești atras de activități care implică manipularea ordonată și sistematică a datelor, organizarea informațiilor, respectarea regulilor și procedurilor. Ești o persoană organizată, conștiincioasă, eficientă și atentă la detalii. Preferi mediile de birou, financiare sau administrative structurate."
    };
    const professionRecommendations = {
      R: ["Inginer mecanic/electrician", "Agricultor/Horticultor", "Instalator/Sudor/Tehnician"],
      I: ["Cercetător științific", "Programator/Analist IT", "Medic/Biolog/Chimist"],
      A: ["Designer grafic/web/interior", "Muzician/Compozitor/Actor", "Scriitor/Jurnalist/Arhitect"],
      S: ["Profesor/Învățător/Trainer", "Asistent medical/social", "Psiholog/Consilier/Terapeut"],
      E: ["Manager/Antreprenor/Director", "Agent de vânzări/imobiliar/PR", "Avocat/Consultant/Politician"],
      C: ["Contabil/Expert financiar", "Funcționar public/administrativ", "Bibliotecar/Arhivar/Analist date"]
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
      const code = sorted.slice(0, 3).map(([t]) => t).join('');

      let html = `<h4>Codul tău Holland: <strong>${code}</strong></h4>`;
      html += `<p style="font-size:0.9em;color:var(--secondary-color);margin-bottom:15px;">(Detaliu scoruri: `;
      html += sorted.slice(0, 3).map(([t, s]) => `${typeMap[t]}=${s}`).join(', ');
      html += `)</p><br><h4>Interpretare:</h4>`;

      const primary = sorted[0][0];
      html += `<p><strong>Tipul dominant (${typeMap[primary]}):</strong> ${hollandInterpretations[primary]}</p>`;

      if (sorted.length > 1 && sorted[1][1] > 0) {
        const secondary = sorted[1][0];
        if (hollandInterpretations[secondary] && ((scores[primary] - scores[secondary] <= 1) || (scores[secondary] >= Math.ceil(scores[primary] / 2)))) {
          html += `<p><strong>Tipul secundar (${typeMap[secondary]}):</strong> ${hollandInterpretations[secondary]}</p>`;
        }
      }

      html += `<br><h4>Recomandări Profesii (bazate pe tipul dominant):</h4>`;
      const recs = professionRecommendations[primary] || [];
      if (recs.length) {
        html += `<ul>` + recs.slice(0, 3).map(p => `<li>${p}</li>`).join('') + `</ul>`;
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
      { category: 'Phishing prin mesaj (prieten fals)', question: 'Un „prieten" îți scrie pe WhatsApp că are o urgență medicală și are nevoie de bani chiar acum. Ce faci?',
        options: ['Trimit banii imediat, e vorba de o urgență', 'Îl sun pe numărul lui obișnuit, ca să fiu sigur că el a scris, nu altcineva', 'Îi cer mai multe detalii tot pe WhatsApp', 'Trimit doar jumătate din sumă, ca să fiu precaut'],
        correctAnswer: 1, explanation: 'Fraudatorii clonează conturi de WhatsApp sau preiau controlul asupra lor. Singura modalitate sigură de verificare este să contactezi persoana pe alt canal (telefon, față în față). Nu trimite niciodată bani fără confirmare directă.' },
      { category: 'Cod QR fraudulos (quishing)', question: 'Vrei să plătești parcarea scanând un cod QR lipit pe un stâlp. Ce ar trebui să te pui pe gânduri?',
        options: ['Codul ar putea fi un abțibild fals, lipit peste cel oficial, care te duce pe un site ce îți fură datele cardului', 'Codurile QR sunt mereu sigure, sunt generate automat', 'E o problemă doar dacă telefonul n-are antivirus', 'Nu există niciun risc la coduri QR'],
        correctAnswer: 0, explanation: 'Tehnica „quishing" (QR + phishing) presupune lipirea unui cod QR fals peste cel legitim. Când îl scanezi, ești redirecționat către un site care îți fură datele de card. Verifică mereu dacă codul QR nu este un autocolant lipit peste cel original.' },
      { category: 'Deepfake / apel video fals', question: 'Primești un apel video în care cineva care arată și vorbește exact ca directorul băncii tale îți cere să confirmi o plată. Ce faci?',
        options: ['Confirm, doar l-am văzut cu ochii mei', 'Închid și sun eu banca la numărul oficial, pentru că imaginea și vocea pot fi falsificate', 'Îi cer să-mi trimită un email de confirmare', 'Verific doar dacă numărul de telefon pare să fie al băncii'],
        correctAnswer: 1, explanation: 'Tehnologia deepfake bazată pe inteligență artificială poate genera video și audio extrem de realiste. Fraudatorii pot imita perfect chipul și vocea oricui. Nu lua decizii financiare bazate pe apeluri video nesolicitate — sună mereu banca la numărul oficial.' },
      { category: 'Magazin online fals', question: 'Găsești un magazin online care vinde un iPhone la doar 200 de lei. Ce te-ar face să bănuiești o țeapă?',
        options: ['Are multe recenzii pozitive', 'Acceptă plata doar prin transfer bancar sau criptomonede, nu și cu cardul sau ramburs', 'Are un design de site foarte profesionist', 'Oferă livrare gratuită'],
        correctAnswer: 1, explanation: 'Magazinele frauduloase oferă prețuri nerealiste și acceptă doar metode de plată ireversibile (transfer bancar, cripto). Un site legitim oferă multiple opțiuni de plată (card, ramburs). Recenziile pot fi false, iar designul poate fi copiat de pe site-uri reale.' },
      { category: 'Money mule', question: 'Cineva cunoscut online îți propune o „afacere": banii lui trec prin contul tău, iar tu păstrezi o parte drept comision. Ce faci?',
        options: ['Accept, pare un mod ușor de a face bani', 'Refuz — banii care trec fără motiv real prin contul meu ar putea fi din fraude, iar eu aș răspunde pentru asta', 'Accept, dar doar dacă suma e mică', 'Cer un contract semnat înainte'],
        correctAnswer: 1, explanation: 'Aceasta este o schemă de tip „money mule" (catâr financiar). Banii proveniți din fraude sunt „spălați" prin contul tău. Ești considerat complice la spălare de bani și riști pedeapsa cu închisoarea, chiar dacă nu știai proveniența banilor.' },
      { category: 'Wi-Fi public / Man-in-the-Middle', question: 'Ești într-o cafenea și vrei să-ți verifici contul bancar folosind Wi-Fi-ul gratuit al localului. E o idee bună?',
        options: ['Da, atât timp cât site-ul băncii are lacătul verde în bara de adresă', 'Nu, pe o rețea publică altcineva ar putea „asculta" ce trimit și fura datele mele', 'Da, un Wi-Fi public e la fel de sigur ca cel de acasă', 'Nu contează, telefonul are oricum parolă'],
        correctAnswer: 1, explanation: 'Pe rețele Wi-Fi publice, atacatorii pot crea puncte de acces false sau intercepta traficul prin atacuri „Man-in-the-Middle". Evită accesarea aplicațiilor bancare pe Wi-Fi public. Folosește datele mobile sau un VPN pentru tranzacții financiare.' },
      { category: 'Phishing ANAF', question: 'Primești un email care pare de la ANAF, spunând că ai o datorie și trebuie să plătești urgent, altfel îți blochează contul. Ce faci?',
        options: ['Plătesc imediat, ca să evit problemele', 'Dau click pe link să văd despre ce e vorba', 'Verific direct pe site-ul oficial anaf.ro sau sun la ANAF, fără să folosesc linkul din email', 'Răspund la email cerând mai multe detalii'],
        correctAnswer: 2, explanation: 'ANAF, băncile și alte instituții nu trimit niciodată solicitări de plată prin email cu amenințări de executare imediată. Verifică mereu pe site-ul oficial sau la telefonul instituției. Presiunea și urgența sunt semne clare de fraudă.' },
      { category: 'Tranzacție test (card furat)', question: 'Vezi pe extrasul de cont o plată de 2-3 lei pe care nu ți-o amintești. E o sumă prea mică ca să conteze?',
        options: ['Da, e neglijabilă', 'Nu neapărat — hoții testează adesea un card furat cu sume mici, înainte să facă plăți mari', 'E normal, băncile mai pun taxe mici din când în când', 'Nu, doar dacă suma trece de 50 de lei'],
        correctAnswer: 1, explanation: 'Fraudatorii testează adesea cardurile furate cu tranzacții foarte mici (1-5 lei) pentru a verifica dacă funcționează. Dacă trec, urmează tranzacții mari. Raportează imediat orice tranzacție nerecunoscută, oricât de mică!' },
      { category: 'Parole și 2FA', question: 'Care e cea mai bună metodă de a-ți proteja contul de internet banking?',
        options: ['O parolă cu numele tău și anul nașterii', 'Aceeași parolă pe care o folosești și pe alte site-uri', 'O parolă lungă, greu de ghicit, plus un cod de confirmare primit pe telefon la fiecare autentificare', 'O parolă scurtă, dar schimbată des'],
        correctAnswer: 2, explanation: 'O parolă sigură este lungă, conține litere mari și mici, cifre și caractere speciale, și nu conține informații personale. Cea mai bună protecție combină o parolă puternică cu autentificarea în doi pași (2FA).' },
      { category: 'Schemă piramidală (Ponzi)', question: 'Un cunoscut îți spune că a găsit o platformă de investiții care oferă 30% profit garantat pe lună și te încurajează să aduci și alți prieteni, pentru un bonus. Ce ar trebui să te alerteze?',
        options: ['E o oportunitate bună dacă platforma are un site frumos și mulți utilizatori', 'Un randament „garantat" de 30%/lună e nerealist, iar structura bazată pe aducerea de noi investitori e specifică unei scheme piramidale (Ponzi)', 'Ar trebui să investesc doar o sumă mică, ca test', 'Dacă prietenul meu a câștigat deja bani, sigur e sigur și pentru mine'],
        correctAnswer: 1, explanation: 'Randamentele „garantate" mult peste piață, combinate cu recompense pentru aducerea de noi investitori, sunt semnătura clasică a schemelor piramidale (Ponzi). Banii noilor investitori plătesc „profitul" celor vechi, până când schema se prăbușește și majoritatea pierd tot.' },
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

    const fallbackRates = { USD: 4.45, EUR: 4.97 };
    let bnrRates = null;
    let bnrDate = null;

    async function fetchBnrRates() {
      try {
        const res = await fetch('https://www.bnr.ro/nbrfxrates.xml');
        if (!res.ok) throw new Error('BNR fetch failed');
        const text = await res.text();
        const xml = new DOMParser().parseFromString(text, 'application/xml');
        const cube = xml.querySelector('Cube');
        const rates = {};
        xml.querySelectorAll('Rate').forEach(r => {
          const code = r.getAttribute('currency');
          if (code === 'USD' || code === 'EUR') rates[code] = parseFloat(r.textContent);
        });
        if (rates.USD && rates.EUR) {
          bnrRates = rates;
          bnrDate = cube ? cube.getAttribute('date') : null;
        }
      } catch (e) {
        bnrRates = null;
      }
    }
    fetchBnrRates();

    const convBtn = document.getElementById('conv-btn');
    if (convBtn) {
      convBtn.addEventListener('click', () => {
        const amount = parseFloat(document.getElementById('conv-amount').value) || 0;
        const pair = document.getElementById('conv-pair').value;
        const [from] = pair.split('-');
        const rate = bnrRates ? bnrRates[from] : fallbackRates[from];
        const converted = amount * rate;
        const convResult = document.getElementById('conv-result');
        const sourceNote = bnrRates
          ? `curs BNR din ${bnrDate}`
          : `curs orientativ de rezervă (cursul live BNR nu a putut fi accesat)`;
        convResult.textContent = `${fmt(amount)} ${from} = ${fmt(converted)} lei — 1 ${from} = ${rate.toFixed(4)} lei (${sourceNote}) → completat automat mai jos, la Capital inițial`;
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

  /* ======================================================
     MODUL 5: JURIU (sincronizat live prin Firebase Realtime Database)
     Autentificarea Firebase (anonimă) se face AUTOMAT, fără cod de acces.
     Numele echipei e normalizat pentru cheia din Firebase: fără sensibilitate
     la majuscule/minuscule sau diacritice, cu spațiile multiple reduse la
     unul singur — dar spațiul dintre cuvinte tot contează („Lupii Jurați”
     rămâne diferit de „LupiiJurați”).

     Panou ADMIN (protejat cu PIN): permite resetarea completă a clasamentului
     sau ștergerea unei singure echipe. Butonul "⚙️ Admin" e vizibil în
     interfață (discret), dar acțiunile necesită introducerea PIN-ului.
     NOTĂ: acesta este un cod JS executat în browser — un utilizator care
     inspectează sursa paginii ar putea afla PIN-ul. E o barieră practică,
     nu o protecție criptografică reală.
  ====================================================== */
  (function initJury() {
    const identityView = document.getElementById('jury-identity-view');
    const selectView = document.getElementById('jury-team-select-view');
    if (!identityView || !selectView) return;
    const statusView = document.getElementById('jury-team-status-view');
    const scoringView = document.getElementById('jury-scoring-view');
    const pinView = document.getElementById('jury-pin-view'); // poate exista în HTML, dar nu mai e folosit

    const criteria = [
      { id: 'prezentare', label: 'Calitatea prezentării' },
      { id: 'eficienta', label: 'Eficiența afacerii' },
      { id: 'realism', label: 'Nivelul de realism al implementării' },
      { id: 'originalitate', label: 'Originalitatea ideii' },
      { id: 'echipa', label: 'Lucrul în echipă & răspunsuri la întrebări' },
    ];
    const SCALE_MAX = 5;
    const MAX_TOTAL = criteria.length * SCALE_MAX;

    // ---- Panou admin: schimbă PIN-ul de mai jos cu al tău ----
    const ADMIN_PIN = '1234';

    if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) {
      document.getElementById('jury-section').insertAdjacentHTML('afterbegin',
        '<div class="validation-errors">⚠️ Modulul de Juriu are nevoie de conexiune la internet ca să sincronizeze notele între telefoane. Verifică conexiunea și reîncarcă pagina.</div>');
      return;
    }

    let db = null;
    let juryRootRef = null;
    let jurorClaimsRef = null;
    let myJurorNumber = null;
    let myUid = null;
    let currentTeam = null;
    let currentKey = null;
    let currentTeamRef = null;
    let currentTeamListener = null;
    let latestTeamData = {};
    let latestAllTeams = {};
    let currentJurorClaims = {};

    function normalizeTeamKey(name) {
      return name
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[.#$\[\]/]/g, '_');
    }

    function scoreOptionsHTML() {
      let html = '<option value="">-</option>';
      for (let i = 1; i <= SCALE_MAX; i++) html += `<option value="${i}">${i}</option>`;
      return html;
    }
    function showOnly(view) {
      [pinView, identityView, selectView, statusView, scoringView].forEach(v => v?.classList.add('hidden'));
      view.classList.remove('hidden');
    }

    function startJury() {
      firebase.auth().signInAnonymously()
        .then((cred) => {
          myUid = cred.user.uid;
          db = firebase.database();
          juryRootRef = db.ref('jury');
          jurorClaimsRef = db.ref('jury/_jurorClaims');
          attachLeaderboardListener();
          jurorClaimsRef.on('value', (snap) => {
            currentJurorClaims = snap.val() || {};
            renderIdentityView();
          });
          watchConnectionAndReclaim();
          ensureAdminButton();
          showOnly(identityView);
        })
        .catch(() => {
          document.getElementById('jury-section').insertAdjacentHTML('afterbegin',
            '<div class="validation-errors">⚠️ Nu ne-am putut conecta (verifică internetul) — reîncarcă pagina și încearcă din nou.</div>');
        });
    }
    startJury();

    function renderIdentityView() {
      document.querySelectorAll('.jury-identity-btn').forEach(btn => {
        const num = btn.dataset.juror;
        const taken = !!currentJurorClaims[num];
        if (taken) {
          btn.disabled = true;
          btn.textContent = `Jurat ${num} — deja ales de altcineva`;
        } else {
          btn.disabled = false;
          btn.textContent = `Sunt Jurat ${num}`;
        }
      });
    }

    document.querySelectorAll('.jury-identity-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const num = btn.dataset.juror;
        jurorClaimsRef.child(num).transaction((current) => {
          if (current && current !== myUid) return; // deja rezervat de altcineva -> anulează
          return myUid; // rezervă (sau reafirmă rezervarea proprie)
        }, (error, committed) => {
          if (error) { alert('Eroare la selectarea rolului — verifică conexiunea la internet.'); return; }
          if (!committed) {
            alert(`Jurat ${num} tocmai a fost ales de altcineva. Alege alt rol.`);
            return;
          }
          myJurorNumber = parseInt(num, 10);
          // Eliberează automat rolul dacă acest telefon se deconectează
          // (închide tab-ul, pierde internetul, reîncarcă pagina) — evită
          // blocarea permanentă a rolului și nevoia de reset manual.
          jurorClaimsRef.child(num).onDisconnect().remove();
          document.getElementById('jury-team-select-title').textContent = `Echipa evaluată (tu ești Jurat ${myJurorNumber})`;
          showOnly(selectView);
        });
      });
    });

    // La fiecare reconectare (după o pierdere scurtă de semnal), telefonul
    // încearcă să-și reafirme propriul rol de jurat. Dacă între timp rolul
    // a fost preluat de altcineva (deconectare reală, nu doar un blip),
    // juratul e anunțat clar și trimis să aleagă alt rol disponibil —
    // astfel nu pot exista niciodată doi jurați cu aceeași identitate.
    function watchConnectionAndReclaim() {
      db.ref('.info/connected').on('value', (snap) => {
        if (snap.val() !== true || myJurorNumber === null) return;
        const num = String(myJurorNumber);
        jurorClaimsRef.child(num).transaction((current) => {
          if (current && current !== myUid) return; // altcineva l-a preluat între timp
          return myUid;
        }, (error, committed) => {
          if (error) return;
          if (committed) {
            jurorClaimsRef.child(num).onDisconnect().remove();
          } else {
            myJurorNumber = null;
            alert(`Conexiunea s-a întrerupt, iar rolul de Jurat ${num} a fost preluat între timp de altcineva. Te rog alege alt rol disponibil.`);
            showOnly(identityView);
          }
        });
      });
    }

    document.getElementById('jury-select-team-btn').addEventListener('click', () => {
      const name = document.getElementById('jury-team-name').value.trim();
      if (!name) { alert('Te rog completează numele echipei.'); return; }

      currentTeam = name;
      currentKey = normalizeTeamKey(name);
      if (currentTeamRef && currentTeamListener) currentTeamRef.off('value', currentTeamListener);

      currentTeamRef = juryRootRef.child(currentKey);
      currentTeamRef.child('name').once('value').then((snap) => {
        if (!snap.exists() || !snap.val()) {
          currentTeamRef.child('name').set(currentTeam);
        }
      });
      currentTeamListener = currentTeamRef.on('value', (snap) => {
        latestTeamData = snap.val() || {};
        if (!statusView.classList.contains('hidden')) renderStatusView();
      });

      renderStatusView();
      showOnly(statusView);
    });

    function renderStatusView() {
      const displayName = latestTeamData.name || currentTeam;
      document.getElementById('jury-current-team-title').textContent = `Echipa: ${displayName} — tu ești Jurat ${myJurorNumber}`;
      const wrap = document.getElementById('jury-juror-status-list');
      const scores = latestTeamData.scores || {};
      wrap.innerHTML = [1, 2, 3].map(j => {
        const val = scores[j];
        const done = val !== undefined && val !== null;
        const meTag = j === myJurorNumber ? ' (tu)' : '';
        return `
        <div class="jury-criteria-row">
          <label>Jurat ${j}${meTag} ${done ? `— ✅ ${val}/${MAX_TOTAL}` : '— ⏳ neevaluat'}</label>
        </div>`;
      }).join('');

      const myDone = scores[myJurorNumber] !== undefined && scores[myJurorNumber] !== null;
      const myBtn = document.getElementById('jury-my-score-btn');
      myBtn.textContent = myDone ? `Refă evaluarea ta (Jurat ${myJurorNumber})` : `Completează ca Jurat ${myJurorNumber}`;
    }

    document.getElementById('jury-my-score-btn').addEventListener('click', () => {
      openScoringScreen();
    });

    document.getElementById('jury-change-team-btn').addEventListener('click', () => {
      if (currentTeamRef && currentTeamListener) currentTeamRef.off('value', currentTeamListener);
      currentTeam = null; currentKey = null; currentTeamRef = null; currentTeamListener = null;
      document.getElementById('jury-team-name').value = '';
      showOnly(selectView);
    });

    function openScoringScreen() {
      document.getElementById('jury-scoring-title').textContent = `Jurat ${myJurorNumber} — evaluează echipa „${currentTeam}"`;
      const wrap = document.getElementById('jury-scoring-criteria');
      wrap.innerHTML = criteria.map(c => `
        <div class="jury-criteria-row">
          <label>${c.label}</label>
          <select class="jury-score-select" data-criterion="${c.id}">${scoreOptionsHTML()}</select>
        </div>`).join('');
      showOnly(scoringView);
    }

    document.getElementById('jury-cancel-score-btn').addEventListener('click', () => {
      showOnly(statusView);
    });

    document.getElementById('jury-submit-score-btn').addEventListener('click', () => {
      const selects = document.querySelectorAll('#jury-scoring-criteria .jury-score-select');
      let total = 0, incomplete = false;
      selects.forEach(s => { if (!s.value) incomplete = true; total += parseInt(s.value, 10) || 0; });
      if (incomplete) { alert('Te rog completează toate cele 5 criterii înainte de a trimite.'); return; }

      currentTeamRef.child('scores/' + myJurorNumber).set(total)
        .then(() => showOnly(statusView))
        .catch(() => { alert('Nu s-a putut trimite evaluarea — verifică conexiunea la internet și încearcă din nou.'); });
    });

    function attachLeaderboardListener() {
      juryRootRef.on('value', (snap) => {
      latestAllTeams = snap.val() || {};
      const allTeams = latestAllTeams;
      const evaluated = Object.values(allTeams)
        .map((teamData) => {
          const scores = teamData.scores || {};
          const scored = [1, 2, 3].filter(j => scores[j] !== undefined && scores[j] !== null);
          if (!scored.length) return null;
          const totals = scored.map(j => scores[j]);
          const avgScore = totals.reduce((a, b) => a + b, 0) / totals.length;
          return { name: teamData.name, scores, scoredCount: scored.length, avgScore };
        })
        .filter(Boolean)
        .sort((a, b) => b.avgScore - a.avgScore);

      const el = document.getElementById('jury-leaderboard');
      if (!evaluated.length) {
        el.innerHTML = '<p class="jury-empty-msg">Nicio echipă notată încă.</p>';
        return;
      }
      el.innerHTML = evaluated.map((entry, idx) => {
        const detail = [1, 2, 3].map(j => (entry.scores[j] === undefined || entry.scores[j] === null) ? '—' : entry.scores[j]).join(' / ');
        const partialNote = entry.scoredCount < 3 ? ` · scor parțial (${entry.scoredCount}/3 jurați)` : '';
        return `
        <div class="jury-leaderboard-row ${idx === 0 ? 'rank-1' : ''}">
          <span class="jury-rank-badge">${idx + 1}.</span>
          <span class="jury-team-info">
            <span class="jury-team-name">${entry.name}</span>
            <span class="jury-team-detail">Jurați: ${detail} (din ${MAX_TOTAL} fiecare)${partialNote}</span>
          </span>
          <span class="jury-score">${entry.avgScore.toFixed(1)}/${MAX_TOTAL}</span>
        </div>`;
      }).join('');

      renderSimpleLeaderboard(evaluated);
      });
    }

    function renderSimpleLeaderboard(evaluated) {
      const elSimple = document.getElementById('jury-leaderboard-simple');
      if (!elSimple) return;
      if (!evaluated.length) {
        elSimple.innerHTML = '<p class="jury-empty-msg">Nicio echipă notată încă.</p>';
        return;
      }
      elSimple.innerHTML = evaluated.map((entry, idx) => `
        <div class="jury-leaderboard-row ${idx === 0 ? 'rank-1' : ''}">
          <span class="jury-rank-badge">${idx + 1}.</span>
          <span class="jury-team-name">${entry.name}</span>
          <span class="jury-score">${entry.avgScore.toFixed(1)}/${MAX_TOTAL}</span>
        </div>`).join('');
    }

    /* ---------- Panou ADMIN (PIN) ---------- */
    function ensureAdminButton() {
      let adminBtn = document.getElementById('jury-admin-btn');
      if (!adminBtn) {
        // Dacă nu există deja în HTML, îl creăm automat lângă clasament.
        const leaderboardEl = document.getElementById('jury-leaderboard');
        const anchor = leaderboardEl ? leaderboardEl.parentElement : document.getElementById('jury-section');
        adminBtn = document.createElement('button');
        adminBtn.type = 'button';
        adminBtn.id = 'jury-admin-btn';
        adminBtn.textContent = '⚙️ Admin';
        adminBtn.style.cssText = 'opacity:0.5;font-size:0.8em;margin-top:10px;background:none;border:1px solid #ccc;border-radius:4px;padding:4px 10px;cursor:pointer;';
        if (anchor) anchor.appendChild(adminBtn);
      }
      adminBtn.addEventListener('click', () => {
        const pin = prompt('Introdu codul PIN de administrator:');
        if (pin === null) return; // anulat
        if (pin !== ADMIN_PIN) {
          alert('PIN incorect.');
          return;
        }
        openAdminMenu();
      });
    }

    function openAdminMenu() {
      const teams = Object.keys(latestAllTeams || {}).filter(k => k !== '_jurorClaims');
      let msg = 'Panou Admin:\n\n1 = Resetează TOT clasamentul (și eliberează toți jurații)\n2 = Eliberează un jurat ales greșit\n';
      const teamLines = teams.map((key, i) => `${i + 3} = Resetează doar echipa "${latestAllTeams[key].name || key}"`).join('\n');
      msg += teamLines + (teams.length ? '\n' : '') + '\n0 = Anulează';

      const choice = prompt(msg);
      if (choice === null || choice === '0' || choice === '') return;

      if (choice === '1') {
        const confirmReset = confirm('Sigur vrei să ștergi TOATE echipele, notele juraților ȘI să eliberezi toți jurații? Ireversibil!');
        if (!confirmReset) return;
        juryRootRef.remove()
          .then(() => alert('Clasamentul a fost resetat complet și toți jurații au fost eliberați.'))
          .catch(() => alert('Eroare la resetare — verifică conexiunea la internet.'));
        return;
      }

      if (choice === '2') {
        const claimedNums = Object.keys(currentJurorClaims || {}).filter(n => currentJurorClaims[n]);
        if (!claimedNums.length) { alert('Niciun jurat nu e ocupat momentan.'); return; }
        const releaseChoice = prompt(`Ce jurat vrei să eliberezi?\n\n${claimedNums.map(n => `${n} = Jurat ${n}`).join('\n')}\n\n0 = Anulează`);
        if (!releaseChoice || releaseChoice === '0') return;
        if (claimedNums.includes(releaseChoice)) {
          jurorClaimsRef.child(releaseChoice).remove()
            .then(() => alert(`Jurat ${releaseChoice} a fost eliberat — poate fi ales din nou.`))
            .catch(() => alert('Eroare — verifică conexiunea la internet.'));
        } else {
          alert('Opțiune invalidă.');
        }
        return;
      }

      const idx = parseInt(choice, 10) - 3;
      if (!isNaN(idx) && idx >= 0 && idx < teams.length) {
        const key = teams[idx];
        const name = latestAllTeams[key].name || key;
        const confirmReset = confirm(`Sigur vrei să ștergi echipa "${name}"?`);
        if (!confirmReset) return;
        juryRootRef.child(key).remove()
          .then(() => alert(`Echipa "${name}" a fost ștearsă.`))
          .catch(() => alert('Eroare la ștergere — verifică conexiunea la internet.'));
      } else {
        alert('Opțiune invalidă.');
      }
    }
  })();

});
