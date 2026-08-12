# CEFCA – Micro Curs Interactiv (aplicație unificată)

Această aplicație combină 4 module, accesibile printr-un singur cod QR / link:

1. **Modul 1 · Carieră**
   - *Chestionar Holland* – calculează scorul R-I-A-S-E-C și recomandă meserii
   - *Prima Slujbă & Contracte* – salariu brut/net (cu exemplu), tipuri de contract de muncă, negocierea salariului, economii vs. investiții
2. **Modul 2 · Educație Financiară**
   - *Ierarhia Cheltuielilor* – fiecare cheltuială primește un număr de prioritate (1-16) dintr-un meniu derulant; numărul ales dispare din meniurile celorlalte cheltuieli, deci nu pot exista duplicate
   - *Decalogul Antifraudă* – quiz cu exact 10 întrebări (cele mai întâlnite cazuri de fraudă bancară + 1 despre scheme piramidale de investiții), explicație după fiecare răspuns, plus carduri de referință: principii de protecție, „Unde anunți o fraudă" (bancă, Poliție, CERT-RO, ANPC) și „Credite și DAE"
3. **Modul 3 · Creativitate în Afaceri** (Blitz Business) – card scurt despre formele legale de afacere (PFA / ÎI / SRL, actualizat iulie 2026), calculator de dobândă compusă și convertor valutar cu **curs BNR live** (ambele înainte de capitalul inițial, care se completează automat din convertor), plan de afaceri (cheltuieli, venituri, profit, verificare capital suficient/insuficient), iar la final: ghid de sfaturi pentru prezentare și o casetă de text pentru descrierea afacerii
4. **Modul 4 · Jurizare** – fiecare din cei 3 jurați notează **separat**, de pe **propriul telefon**, chiar în același timp — scorurile se sincronizează live prin Firebase Realtime Database; clasamentul se actualizează automat pe toate telefoanele

Modulele 1 și 2 au câte un submeniu cu cele 2 componente ale lor; Modulele 3 și 4 se deschid direct.

Fișiere: `index.html`, `style.css`, `script.js`, `logo.jpg`. Nu necesită build sau server propriu — Firebase e singurul serviciu extern folosit, doar pentru Modulul 4.

**Important:** Modulul 3 (Creativitate în Afaceri) nu salvează nimic pe telefon (fără localStorage) — datele planului de afaceri există doar cât timp pagina rămâne deschisă. Doar Modulul 4 (Jurizare) scrie în Firebase, ca să poată sincroniza între telefoane diferite.

## ⚠️ Pași obligatorii: Autentificare + reguli Firebase

Ca notele juriului să nu fie complet publice (oricine cu linkul să poată scrie), am adăugat un cod de acces (PIN). Configurează:

1. **console.firebase.google.com** → proiectul `cefca-juriu`
2. **Build → Authentication → Get started** → tab **Sign-in method** → activează **Anonymous** → Save
3. **Build → Realtime Database → Rules** → înlocuiește cu:
```json
{
  "rules": {
    "jury": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```
4. **Publish**

**Codul de acces implicit e `CEFCA2026`.** Îl schimbi ușor în `script.js`, caută linia:
```js
const JURY_PIN = 'CEFCA2026';
```
și înlocuiește textul dintre ghilimele cu orice cod vrei. Fiecare jurat introduce acest cod o singură dată, apoi alege „Sunt Jurat 1/2/3" — rămâne blocat pe acel rol tot restul sesiunii (până reîncarcă pagina), ca să nu existe confuzii între jurați.

**De ce nu e o parolă „reală":** cineva cu cunoștințe tehnice ar putea ocoli codul din interfață. E suficient de bun pentru un eveniment de notare la clasă (ține afară vizitatorii întâmplători), dar nu e securitate de nivel bancar.

## Testare Firebase (important)

Integrarea Firebase **nu a putut fi testată live automat** (mediul în care am construit aplicația nu are acces la internet către Google/Firebase). Codul a fost verificat static cu atenție, dar te rog testează manual înainte de eveniment:
1. Deschide aplicația pe 2 telefoane diferite, introdu codul pe amândouă
2. Pe telefonul 1: alege „Sunt Jurat 1", alege o echipă, completează, trimite
3. Pe telefonul 2: alege „Sunt Jurat 2", aceeași echipă → ar trebui să vezi imediat „Jurat 1 — ✅" cu scorul lui
4. Media echipei (Modulul 4, secțiunea Clasament) se calculează din câți jurați au notat (1, 2 sau 3 — nu trebuie neapărat toți 3)

## Convertor valutar & calculator dobândă compusă (curs BNR)

În **Modulul 3**, la secțiunea „1. Afacerea ta", aplicația încearcă automat să preia cursul zilei EUR/USD direct de la Banca Națională a României (nbrfxrates.xml) pentru convertorul valutar. Dacă din orice motiv cursul live nu poate fi accesat, convertorul folosește un curs de rezervă și afișează clar acest lucru în rezultat. Calculatorul de dobândă compusă (chiar deasupra convertorului) nu depinde de nicio conexiune externă.

## Publicare pe GitHub Pages

1. Creează un repo nou pe GitHub.
2. Încarcă cele 4 fișiere (+ acest README) în rădăcina repo-ului.
3. Settings → Pages → Source: `main` branch, folder `/ (root)` → Save.
4. După 1-2 minute, aplicația va fi live la:
   `https://<user-github>.github.io/<nume-repo>/`
5. Generează codul QR pentru acel link și înlocuiește codurile QR vechi din prezentare cu acesta.

## Ce poți edita ușor în `script.js`

- **Întrebările Holland / Antifraudă**: array-urile `questions` din fiecare modul.
- **Ordinea corectă a cheltuielilor**: array-ul `expenses` din Modulul 2 (ordinea din listă = ordinea corectă).
- **Criteriile juriului**: array-ul `criteria` din Modulul 4 (5 criterii, scară 1-5).
- **Cursul valutar de rezervă**: obiectul `fallbackRates` din Modulul 3 (folosit doar dacă BNR nu poate fi accesat).
- **Codul de acces juriu**: constanta `JURY_PIN` din Modulul 4.

## Ce poți edita ușor în `index.html`

- **Conținutul cardurilor de referință** (principii de protecție, unde anunți o fraudă, credite și DAE, forme legale de afacere, sfaturi de prezentare): sunt liste `<ul>`/`<details>` simple, ușor de editat direct în text.

## Ce se salvează și ce nu

- **Modulul 3 (Creativitate în Afaceri)**: nimic nu se salvează pe telefon — planul de afaceri există doar cât timp pagina rămâne deschisă (refresh = se pierde).
- **Modulul 4 (Jurizare)**: notele SE salvează, dar în Firebase (nu pe telefon) — de-asta pot fi văzute în timp real pe toate telefoanele conectate, chiar dacă un telefon anume dă refresh.
