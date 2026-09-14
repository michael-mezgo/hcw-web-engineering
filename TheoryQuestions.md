# Theory Questions — Playground 1 (JS Playground)

## Task 1: Introduce ES modules

**How does an ES module differ from a classic script with respect to scope, strict mode, loading, and bindings? Explain why the module boundaries you chose make the application easier to maintain.**

- **Scope**: Bei einem klassischen `<script>` direkt im Tag läuft alles im golbalen Scope. Das bedeutet, dass jede Variable oder Funktion, die auf der obersten Ebene deklariert ist, zu einer Eigenschaft von `window` wird. Wenn zwei Skripte denselben Namen deklarieren, kann es zu Konflikten kommen. Ein ES-Modul (`<script type="module">` oder eine Datei, die über `import` geladen wird) hat einen eigenen obersten Scope. Nichts gelangt standardmäßig in den Sope anderer Dateien oder auf `window` (Ausnahme: explizit exportierte Variablen/Funktionen).
- **Strict mode**: Module werden automatisch im Strict Mode ausgeführt (`'use strict'` wird nicht benötigt). Stille Fehler (z.B. Zuweisung an eine nicht deklarierte Variable, doppelte Parameter) werden daher zu geworfenen Fehlern. - Ohne Strict Mode könnten solche Fehler unbemerkt bleiben (z.B. durch implizite globale Variablen).
- **Loading**: Der HTML-Parser lädt klassische Skript mit und stoppt für diese Zeit (Download, Ausführung). Moduke werden standardmäßig parallel geladen und asynchron ausgeführt.
- **Bindings**: ES Modules können "live bindings" exportieren und importieren. Das bedeutet, dass wenn eine exportierte Variable in einem Modul geändert wird, alle Importe automatisch die aktualisierte Version sehen. Klassische Skripte können diese funktion nur über globale Variablen erreichen.

**Why these module boundaries help maintainability**: The application was split along responsibility, not just file size:
- Jedes Modul hat eine klare Zuständigkeit - dies soll die Komplexität reduzieren und Seiteneffekte vermeiden
- Aus versehen gesetzte globale Variablen werden vermieden, da jedes Modul seinen eigenen Scope hat (siehe oben)
- Die isolierten Module können leichter getestet und wiederverwendet werden, da sie keine Abhängigkeiten untereinander haben

Gewählte Module für den Playground 1:
- **`bears.js`** – lädt, verarbeitet und rendert die Bärenliste (zuständig für `.more_bears` und die Wikipedia-API).
- **`search.js`** – regelt die Suche/Hervorhebung (zuständig für das `.search`-Formular und das Highlighting im `<article>`).
- **`comments.js`** – regelt das Ein-/Ausblenden der Kommentare und das Kommentarformular (zuständig für `.comment-wrapper`/`.comment-form`).
- **`main.js`** – bindet nur die drei anderen Module ein und ruft sie auf, enthält aber selbst keine eigene Logik.

Jedes Modul kümmert sich um einen eigenen Bereich der Seite und eine eigene Aufgabe. Keines importiert von einem anderen, es gibt also keine zirkulären Abhängigkeiten. Dadurch kann man jedes Modul für sich lesen, testen oder austauschen, ohne die anderen beiden verstehen zu müssen.

---

## Task 2: Correct the application behavior

**Describe event propagation (capturing, target, and bubbling). Where could event delegation be useful in this application, and what trade-off would it introduce?**

**Event Propagation**: Diese besteht aus drei Phasen, die ein Ereignis durchläuft, wenn es auf einem Element ausgelöst wird:
1. **Capturing phase** — das Ereignis reist von `window` durch den DOM-Baum bis zum Ziel-Element. Listener müssen dafür registriert werden.
2. **Target phase** — das Ereignis erreicht das Element, auf dem es tatsächlich ausgelöst wurde (z.B. das `<input>`, das angeklickt wurde) - registrierte Event-Listener auf dem Element werden hier ausgeführt
3. **Bubbling phase** — das Ereignis reist dann wieder von dem Ziel-Element durch jeden Vorfahren des DOM-Trees bis zu `window`. Die meisten Listener (Standard für `addEventListener`) werden hier ausgeführt

**Event delegation**: Anstatt jedem einzelnen Element, das ein Ereignis auslösen kann, einen eigenen Listener zu geben, kann man einen Listener auf einem übergeordneten Element registrieren und das Ereignis "delegieren". Das funktioniert, weil Ereignisse in der Bubbling-Phase nach oben reisen und man im Listener prüfen kann, welches Element das Ereignis ausgelöst hat (z.B. mit `event.target` oder `event.currentTarget`). Beispiel: Kommentare in einer Liste — anstatt jedem `<li>` einen eigenen Listener zu geben, kann man einen Listener auf dem `<ul>`-Element registrieren und prüfen, welches `<li>` das Ereignis ausgelöst hat.

**Where delegation could help here**: `comments.js` currently attaches one listener directly to `.comment-form` (`submit`) and one to `.show-hide` (`click`) — both fixed elements that exist once, so delegation would not add value there. A better candidate is the *rendered* comment list (`.comment-container`): if we later wanted per-comment controls (e.g. a "delete" or "like" button on every `<li>`), we would not want to attach a new listener to every dynamically created comment. Instead, we could attach a single `click` listener to `.comment-container` and use `event.target.closest('button')` to figure out which comment's button was actually clicked, relying on bubbling to catch clicks from any current or future `<li>`.

**Trade-off**: Das handling wird komplexer, da man im Listener prüfen muss, welches Element das Ereignis ausgelöst hat. - Wenn der DOM dann auch noch sehr tief verschachtelt ist, ist es schwer festzustellen, bei welchem Element das Ereignis gehandelt wird.

---

## Task 3: Make failures explicit

**How do synchronous exceptions and rejected promises travel through this application? Explain where errors should be caught and why catching every error at its source can make failures harder to diagnose.**

In `bears.js` gibt es zwei unterschiedliche Fehlerarten, die aber am Ende an derselben Stelle landen:

- **Synchrone Exceptions** (z.B. ein `TypeError` durch ein falsches Argument) rollen den aktuellen Call-Stack sofort ab und suchen nach dem nächsten umschließenden `try/catch`.
- **Rejected Promises** (z.B. ein fehlgeschlagener `fetch`, oder ein `throw` innerhalb einer `async`-Funktion) rollen *nicht* sofort synchron ab — der Promise wechselt in den Rejected-Zustand, und erst wenn er innerhalb eines `try`-Blocks `await`-ed wird (oder ein `.catch()` angehängt ist), springt die Kontrolle in den `catch`-Handler.

In diesem Projekt umschließt `loadBears()` den kompletten Ablauf mit einem einzigen `try/catch`:
```js
try {
    const response = await fetch(...);
    if (!response.ok) throw new Error('Bear list request failed with status ' + response.status);
    const data = await response.json();
    if (data.error) throw new Error(...);
    if (!data.parse || ...) throw new Error(...);
    return await extractBears(data.parse.wikitext['*']);
} catch (err) {
    console.error('Failed to load bears:', err);
    showBearsError('...');
    throw err;
}
```
Sowohl die `throw new Error(...)`-Aufrufe (synchron, direkt in der Funktion) als auch ein rejected `fetch`/`await` landen im selben `catch`. Das ist so gewollt — es ist die eine Stelle, die weiß, wie auf einen fehlgeschlagenen Bear-List-Load reagiert werden soll: loggen und die Fehlermeldung über `showBearsError` anzeigen.

`buildBear()` fängt Fehler von `fetchImageUrl`/`verifyImageLoads` dagegen **lokal** ab, pro Bär, damit nicht ein einzelnes kaputtes Bild das gesamte `Promise.all` zum Scheitern bringt und die ganze Liste verhindert — stattdessen wird einfach auf `image: null` zurückgefallen, woraus `renderBearCard` dann das Platzhalterbild macht.

**Warum das Fangen jedes Fehlers direkt an der Quelle die Diagnose erschweren kann**: Würde jede kleine Funktion (`fetchImageUrl`, `verifyImageLoads`, `extractBears`) ihre Fehler selbst fangen und stillschweigend schlucken, würde `loadBears()` immer nur "Erfolg" mit verdächtig leeren/Default-Daten sehen — die eigentliche Ursache (ein 404, ein Netzwerkfehler, eine unerwartete API-Struktur) wäre genau dort verloren gegangen, wo sie aufgetreten ist, und ganz oben würde niemand merken, dass überhaupt ein Fehler passiert ist. Genau das soll Task 3 verhindern ("do not represent a failed request as valid empty data"). Die Faustregel hier: nur dann nahe an der Quelle fangen, wenn es einen sinnvollen, lokalen Fallback gibt (das Platzhalterbild) — ansonsten den Fehler weiterreichen, bis zu der einen Stelle, die den Nutzer informieren kann.

---

## Task 4: Refactor asynchronous control flow

**Explain the relationship between async/await, promises, the microtask queue, and the browser event loop. Also explain why an arrow function is not always an interchangeable replacement for a regular function, particularly regarding `this`.**

Ein Promise steht für einen Wert, der erst irgendwann in der Zukunft vorliegt. `async`/`await` ist dabei keine eigene Nebenläufigkeits-Technik, sondern nur syntaktischer Zucker über Promises: Eine `async function` gibt selbst immer ein Promise zurück, und `await` pausiert die Funktion an genau dieser Stelle, bis das erwartete Promise erfüllt oder abgelehnt ist. Die Fortsetzung danach läuft technisch wie ein `.then()`-Callback ab — sie landet also nicht sofort, sondern über die **Microtask-Queue**.

Der Event Loop im Browser läuft immer nach demselben Muster: erst der aktuell laufende synchrone Code bis zum Ende, danach wird die Microtask-Queue **komplett** geleert (alle wartenden Promise-Callbacks samt `await`-Fortsetzungen), erst danach folgen Rendering und der nächste Macrotask (z.B. `setTimeout`, ein Klick, eine fertige Netzwerkantwort). Weil Microtasks so vor jedem neuen Macrotask garantiert abgearbeitet werden, weiß man z.B. bei `await Promise.all(bearPromises)` in `extractBears`, dass die Funktion garantiert erst weiterläuft, wenn wirklich alle Bild-Requests durch sind — unabhängig davon, in welcher Reihenfolge die einzelnen `fetch`-Aufrufe tatsächlich zurückkommen. Genau deshalb bringt es hier auch etwas, dass jeder `buildBear(...)`-Aufruf sofort (ohne eigenes `await`) in `bearPromises` gepusht wird: alle Requests laufen nebenläufig los, statt dass die Funktion bei jedem einzelnen erst wartet, bevor der nächste überhaupt gestartet wird.

**Arrow Function vs. normale `function` — der `this`-Unterschied**: Eine normale `function` bekommt ihr `this` **dynamisch**, abhängig davon, *wie* sie aufgerufen wird (Call-Site-Bindung) — ruft z.B. `element.addEventListener('submit', fn)` die Funktion auf, ist `this` innerhalb von `fn` das Element. Eine Arrow Function hat dagegen **kein eigenes** `this`: Sie übernimmt es lexikalisch, also einfach den Wert von `this`, der an der Stelle gilt, an der die Arrow Function im Quellcode steht — unabhängig davon, wie oder wo sie später aufgerufen wird.

Genau deshalb ist der äußere Submit-Handler in `search.js` bewusst weiterhin eine normale `function`:
```js
document.querySelector('.search').addEventListener('submit', function(e) {
    e.preventDefault();
    ...
    const searchKey = this.q.value.trim();
    ...
});
```
`this` ist hier das `<form>`-Element, und `this.q` greift über die automatische Formular-Namensbindung des Browsers auf das Eingabefeld `q` zu. Als Arrow Function würde `this` stattdessen den Wert aus dem umschließenden `searchBears()`-Scope übernehmen — dort ist `this` auf Modul-Ebene `undefined`, und `this.q.value` würde sofort einen `TypeError` werfen. Alle übrigen Callbacks im Projekt (`forEach`, `Promise`-Executor, die Handler in `comments.js`) hängen dagegen nirgends von einem dynamisch gebundenen `this` ab und konnten deshalb gefahrlos zu Arrow Functions umgebaut werden.

Zwei weitere praktische Unterschiede, die hier zwar nicht direkt im Code vorkommen, aber zum selben Thema gehören:
- Arrow Functions haben kein eigenes `arguments`-Objekt — greift man darauf zu, wird (falls überhaupt vorhanden) das `arguments` einer umschließenden normalen Funktion verwendet, sonst gibt es einen `ReferenceError`.
- Ein falsch gebundenes `this` fällt bei asynchronem Code oft erst spät auf: Der Fehler tritt ja erst nach dem `await`/in der Promise-Fortsetzung auf, und der Stacktrace zeigt dann meist auf die Microtask-Fortsetzung statt auf die eigentliche Aufrufstelle — das macht so einen Bug schwerer zu debuggen als einen normalen synchronen `this`-Fehler.

---

## Task 5: Remove remaining code smells

**Select one of your refactorings and explain how JavaScript scope, closures, references, or prototypes caused the original risk. State how you verified that your refactoring preserved behavior.**

**Refactoring**: `const baseUrl` und `const title` in `bears.js` in den Modul-Scope verschoben.

Beim Refactoring von `bears.js` von `var` auf `const` gab ich die beiden Konstanten zwischenzeitlich in `extractBears()`, statt auf Modul-Ebene (ganz oben in der Datei) zu bleiben:
```js
export async function extractBears(wikitext) {
    ...
    const baseUrl = "https://en.wikipedia.org/w/api.php";
    const title = "List_of_ursids";
    ...
}
```
Das ist ein direktes Beispiel für JavaScript-**Scope**: `const`/`let` sind block-scoped, eine `const` innerhalb einer Funktion ist also nur in dieser Funktion (und ihren verschachtelten Blöcken) sichtbar — anders als bei `var`, das ungewollt aus Blöcken herauslekt, hält `const`/`let` die Bindung sauber dort, wo sie deklariert wurde. Normalerweise ist genau das der Vorteil von `const`/`let`.
Ich bekam nach dem Refactoring aber einen `ReferenceError: baseUrl is not defined` in `fetchImageUrl` und `loadBears`, da beide Funktionen **außerhalb** von `extractBears` liegen. Sie konnten die Konstanten nicht mehr sehen, weil sie jetzt nur noch innerhalb von `extractBears` existierten.

Durch die Deklaration auf Modul-Ebene (ganz oben in der Datei) sind `baseUrl` und `title` nun wieder für alle Funktionen in `bears.js` sichtbar, ohne dass sie global werden. Das ist ein gutes Beispiel dafür, wie **Closures** und **Scope** zusammenarbeuten: Funktionen "schließen" sich an die Variablen, die in ihrem Scope sichtbar sind. Wenn diese Variablen nicht im richtigen Scope liegen, können die Funktionen sie nicht mehr erreichen.
**Verifikation**: Da ich aufgrund des "Stict" Modes eine Fehlermeldung bekam, war der Fehler sichtbar (WebStorm). Nach dem Verschieben auf Modul-Ebene lief die Applikation wieder wie vorher, was meine Verifikation war ;).
---

## Source

Claude Code (Sonnet 5) für die Dokumentation / Formulierung der Fragen 3 und 4 verwendet