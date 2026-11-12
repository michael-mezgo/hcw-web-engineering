# Web Engineering Coding Playground Template

This repository is designed as the foundation for coding playgrounds in the Web Engineering course. It offers a structured space for experimenting with and mastering various web development technologies and practices.
The project is based on [this](https://developer.mozilla.org/en-US/docs/Learn/Accessibility/Accessibility_troubleshooting) repository from MDN.

The project introduces a lot of code smells for you to tackle.
**Let's get coding!**

## Submission Details and Deadlines

- Coding playgrounds are **individual** work
- Use this base template to create your project repository.
- Submit your repository link once.
- Each playground must be submitted via a new branch in that repository (last commit within deadline will be graded).
  - Naming conventions of branch: <code>playground-1</code>, <code>playground-2</code>, ...
- Each playground consists of 5 tasks, 1 point each. A task is complete only when both its implementation work and its theory question have been answered.

### Submission Deadlines
* [1st Playground](#1-js-playground): 14.09.2026
* [2nd Playground](#2-dependency--and-build-management-playground): 28.09.2026
* [3rd Playground](#3-migrate-to-a-frontend-framework): 04.10.2026
* [4th Playground](#4-http-api-design-and-the-backend-for-frontend): 12.11.2026
* [5th Playground](#5-persistence-and-data-modelling): 19.11.2026
* [6th Playground](#6-authentication-authorisation-and-web-security): 25.11.2026
* [7th Playground](#7-caching-realtime-and-background-jobs): 01.12.2026

#### Playgrounds 4 to 7 (backend part, Thomas Berger)
* Individual work, same repository, one branch per playground (playground-4 ... playground-7). The last commit before the deadline counts.
* Deadlines: PG4 12.11.2026, PG5 19.11.2026, PG6 25.11.2026, PG7 01.12.2026, each at 23:59. Tick the Moodle checklist by the same time.
* Presentations: in the following unit, 8 to 10 minutes per student, chosen by Thomas Berger. Show the running code, explain your decisions, answer the theory question and follow-up questions.
* Stack for the lecture examples: Node (current LTS), TypeScript (strict, ESM), Fastify, zod, PostgreSQL, Drizzle ORM. Other libraries are fine if you document why in your README.
* Everything must start with `docker compose up --build` on a clean clone and with `npm run dev` for development. No secrets in git.

## Features

- Wonderful UI-design :heart_eyes:
- Loads bear data using [Wikipedia API](https://www.mediawiki.org/wiki/API:Main_page) :bear:
  - Original Wikipedia Page can be found [here](https://en.wikipedia.org/wiki/List_of_ursids)
- Worst JS coding practices :cold_sweat:
- No Build and Dependency Management at all :fire:

# Coding Playground Description

## 1. JS Playground

The provided base project template contains bad coding and templating practices and bugs for you to fix. Take a look into the component files and get a grasp of the inner workings of the provided project. The app should provide the requirements described below. Some are implemented poorly or do not work at all.

### App Requirements

- On page load the app requests the Wikipedia API to extract bear information from Wikipedia's [list of ursids](https://en.wikipedia.org/wiki/List_of_ursids). The page then renders the provided image, the common name, the scientific name and it's range.
  - the bears should be ordered in the same order and number (no duplicates) as in the corresponding Wiki page.
  - if there is no image available, the app should show a placeholder image.
- Users are able to toggle the comment section.
- Users are able to leave their name and a comment (both should not be empty).
- Users are able to search the web page contents using a search query, whereby only the html contents with tag <code>article</code> should be highlighted.

### Tasks

Fix the application code and support them with short code examples where useful.

#### Task 1: Introduce ES modules

Split the code into separate script files and use ES modules (`import`/`export`). Choose module boundaries that separate concerns and avoid circular dependencies.

**Theory question:** How does an ES module differ from a classic script with respect to scope, strict mode, loading, and bindings? Explain why the module boundaries you chose make the application easier to maintain.

#### Task 2: Correct the application behavior

Fix the semantic and functional issues according to the app requirements. Use appropriate DOM queries and event handling, and ensure the bear list has the same order and number of entries as the source page.

**Theory question:** Describe event propagation (capturing, target, and bubbling). Where could event delegation be useful in this application, and what trade-off would it introduce?

#### Task 3: Make failures explicit

Add error handling with `try`/`catch` and show useful, user-facing error messages. Check whether each image can be loaded and render a placeholder when it cannot. Do not represent a failed request as valid empty data.

**Theory question:** How do synchronous exceptions and rejected promises travel through this application? Explain where errors should be caught and why catching every error at its source can make failures harder to diagnose.

#### Task 4: Refactor asynchronous control flow

Replace promise callback chains with `async`/`await` and refactor suitable callbacks to arrow functions. Run independent asynchronous operations concurrently where doing so is safe.

**Theory question:** Explain the relationship between `async`/`await`, promises, the microtask queue, and the browser event loop. Also explain why an arrow function is not always an interchangeable replacement for a regular function, particularly regarding `this`.

#### Task 5: Remove remaining code smells

Find and eliminate the remaining bad coding practices. Consider scope, accidental globals, mutation and shared references, function responsibilities, naming, duplication, and DOM update patterns. Document each relevant finding, why it is problematic, and how you fixed it below.

**Theory question:** Select one of your refactorings and explain how JavaScript scope, closures, references, or prototypes caused the original risk. State how you verified that your refactoring preserved behavior.

##### **What bad coding practices did you find? Why is it a bad practice and how did you fix it?**

> [!NOTE]
> Missing `#` for a HEX color value in [style.css](style.css). (Removed line - this pink was ugly 😉)
>
> ```css
> div[class='nav'] {
>   height: 50px;
>   background-color: ff80ff;
>   display: flex;
>   padding: 1% 0;
>   margin-bottom: 10px;
> }
> ```

> [!NOTE]
> No input validation on the comment form in [comments.js](scripts/comments.js) — the app requirement says "both should not be empty", but the original code created a comment from `nameField.value`/`commentField.value` regardless of their content, including empty or whitespace-only input. Fixed by adding `required` to both `<input>` elements in [index.html](index.html) (blocks the native form submit on empty fields) and, in `initCommentForm()`, trimming both values and rejecting whitespace-only input via `setCustomValidity(...)` + `form.reportValidity()`, which also gives the user visible native browser feedback on which field is invalid. Both fields also reset their custom validity on the `input` event, otherwise the browser would keep blocking the form after a failed attempt even once the user corrected the value.
>
> ```js
> nameField.addEventListener('input', () => nameField.setCustomValidity(''));
> commentField.addEventListener('input', () => commentField.setCustomValidity(''));
>
> form.addEventListener('submit', (e) => {
>     e.preventDefault();
>
>     const nameValue = nameField.value.trim();
>     const commentValue = commentField.value.trim();
>
>     nameField.setCustomValidity(nameValue ? '' : 'Please enter your name.');
>     commentField.setCustomValidity(commentValue ? '' : 'Please enter a comment.');
>
>     if (!form.reportValidity()) return;
>     ...
> });
> ```

## 2. Dependency- and Build Management Playground

Build the application with `npm` and a build and a dependency management tool of your choice (e.g. [Vite](https://vitejs.dev/), [Webpack](https://webpack.js.org/), or others).

### Tasks

#### Task 1: Establish the build

Set up the project with `npm` and a build tool of your choice (for example, Vite or Webpack). Keep source files separate from generated distribution files and commit the package-manager lockfile.

```bash
npm init -y #use default values
npm install --save-dev vite #vite only as a dev-dependency
```

> packege.json changes:
> "type": "commonjs" -> "type": "module" #(we are using ES modules)
> "main": "index.js" -> deleted #(we are using ES modules, no need for a main entry point=

> Create `src/` directory and move all files into it - change the paths in `index.html` and `bears.js` accordingly:

```bash
mkdir src
git mv scripts/ src/
git mv media/ public/
git mv style.css src/
```

> Add scripts to `package.json`:

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```

**Theory question:** Distinguish source, build, distribution, and deployment. What does your build tool do in development and in a production build, and why is the lockfile important for reproducibility?

> #### Source, Build, Distribution, Deployment
>
> - Source: The original code written by developers, including HTML, CSS, JavaScript, and other assets.
> - Build: The process of transforming source code into a format suitable for deployment, which may include bundling, minification, transpilation, and other optimizations.
> - Distribution: The final output of the build process (`/dist` in this project)
> - Deployment: Making the distribution available to users (upload it manually or via CI/CD pipeline to a web server)
>
> #### Build Tool Behavior
>
> - Development: The build tool serves the application with hot-reloading, allowing developers to see changes in real-time without needing to refresh the browser
> - Production Build: The build tool optimizes the code for performance, including minification, resulting in a smaller and faster application.
>
> #### Lockfile Importance
>
> The lockfile ensures that all developers and CI environments use the same versions of dependencies, preventing unexpected issues caused by version discrepancies and ensuring reproducibility across different environments.
> **Lockfile vs. package.json**: The lockfile locks the exact versions of dependencies, while `package.json` specifies version ranges. The lockfile ensures that everyone uses the same versions, while `package.json` allows for flexibility in dependency updates.

#### Task 2: Migrate to TypeScript

Use TypeScript as the primary development language and adapt the source files and configuration accordingly. Enable strict checking, model the application's domain data, and validate data received from external APIs before treating it as a typed value.

```bash
npm install --save-dev typescript
npx tsc --init
```

> Changes in `tsconfig.json`:
>
> ```json
> {
>   "compilerOptions": {
>     "module": "esnext", // we are using ES modules
>     "moduleResolution": "bundler", // we are using Vite as a bundler
>     "lib": ["ES2022", "DOM", "DOM.Iterable"], // DOM-APIs
>     // deleted "jsx": "react-jsx"
>     "noEmit": true // transpilation is handled by Vite, so we don't need to emit JS files from TypeScript
>   },
>   "include": ["src/"]
> }
> ```

> Rename all `.js` files to `.ts`
>
> ```bash
> git mv src/scripts/main.js src/scripts/main.ts
> git mv src/scripts/bears.js src/scripts/bears.ts
> git mv src/scripts/comments.js src/scripts/comments.ts
> git mv src/scripts/search.js src/scripts/search.ts
> ```

**Theory question:** TypeScript uses structural typing and erases types during compilation. Explain both concepts and why a compile-time type alone cannot guarantee the shape of a Wikipedia API response at runtime.

> **Structural Typing**: TypeScript nutzt structural typing, was bedeutet, dass die Kompatibilität von Typen auf der Struktur der Daten basiert, nicht auf den Namen der Typen. Zwei Typen gelten als kompatibel, wenn sie die gleichen Eigenschaften und Methoden haben, unabhängig davon, wie sie benannt sind (z.B. `{ name: string }` ist kompatibel mit `{ name: string, age: number }`, da beide eine `name`-Eigenschaft haben). - Bei Java wird im Gegensatz dazu nominal typing verwendet, bei dem die Typen explizit benannt werden müssen, um kompatibel zu sein.
>
> **Type erasure:** TypeScript-Typen existieren ausschließlich zur Compile-Zeit. Beim Kompilieren zu JavaScript (Vite in meinem Projekt) werden alle Typannotationen, Interfaces und Type-Guards-Signaturen vollständig entfernt — im ausgeführten JS-Code gibt es keine Spur mehr davon. Zur Laufzeit existiert kein Mechanismus, der prüft, ob ein Wert tatsächlich dem deklarierten Typ entspricht; das Typsystem ist zu diesem Zeitpunkt bereits "verschwunden".
>
> **Wikipedia API Response Validation**: Da TypeScript-Typen zur Laufzeit nicht existieren, kann der Compiler nicht garantieren, dass die Daten, die von der Wikipedia-API zurückgegeben werden, tatsächlich dem erwarteten Typ entsprechen. Die API könnte sich ändern, Fehler zurückgeben oder unerwartete Daten liefern. Daher ist es notwendig, die Form der Daten zur Laufzeit zu validieren (z.B. durch Überprüfen von Eigenschaften und Typen), bevor sie als sicherer Typ behandelt werden.

#### Task 3: Add static analysis and formatting

Configure ESLint and Prettier using the rulesets below. Resolve all reported errors in the application code and avoid disabling rules without a written justification.

> Installed ESLint v8 (https://eslint.org/docs/v9.x/use/configure/configuration-files-deprecated - newer versions of ESLint use a different configuration file format) - Colleagues reported problems with newer versions
> Therefore I had to downgrade TypeScript to v5.6
>
> ```bash
> npm install --save-dev eslint@8 eslint-config-standard-with-typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-import eslint-plugin-n eslint-plugin-promise eslint-plugin-prettier eslint-config-prettier prettier
> npm install --save-dev typescript@5.6
> ```
>
> ESLint found 287 problems (mostly prettier formatting issues)
>
> ```bash
> npx prettier --write .
> ```
>
> Now there are "only" 54 problems left
>
> ```bash
> npx eslint --fix .
> ```

**Theory question:** What different problems do a linter, a formatter, and the TypeScript compiler detect? Give one concrete example for each from this project.

> - **Linter**: Findet potentiell fehlerhafte oder riskante Muster im Code. Diese können aber trotzdem syntaktisch korrekt sein. Beispiel: In [bears.ts](src/scripts/bears.ts) habe ich oft gecheckt, ob die Variable nicht `null` oder `undefined` ist, auf leere Stings habe ich jedoch nicht gecheckt. Der Linter hat mich darauf hingewiesen, dass ich die Variable auf leere Strings prüfen sollte, da dies zu unerwartetem Verhalten führen kann. - ESLint Ausgabe: (`181:8 error Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly  @typescript-eslint/strict-boolean-expressions`)
> - **Formatter**: Kümmert sich um die einheitliche Formatierung des Codes, wie Einrückungen, Leerzeichen, Zeilenlängen usw. Hat auf die Funktionsweise des Codes keinen Einfluss, dennoch gibt es in Firmen oft verbindliche Styleguides. Beispiel aus dem Projekt: 4 Spaces vs. 2 Spaces Einrückung
> - **TypeScript Compiler**: Prüft die Typen und die Struktur des Codes (zur Build-Zeit (siehe Aufgabe 2)). Hier hatte ich keinen Fehler mehr, da diese bereits in der vorherigen Aufgabe ausgebessert wurden (`tsc --noEmit`).
#### Task 4: Provide a consistent command interface

Define the following tasks within `npm scripts`:

- `dev`: starts the development server.
- `build`: runs the typescript compiler and bundles your application - bundling depends on your chosen build tool (e.g. Vite, Webpack) but typically bundles multiple files into one, applies optimizations like minification and obfuscation and outputs final results to a `dist` or `build` directory.
- `lint`: runs ESLint on all `.js` and `.ts` files in your projects `/src` directory.
- `lint:fix`: runs and also fixes all issues found by ESLint.
- `format`: formats all `.js` and `.ts` files in your projects `/src` directory.
- `format:check`: checks if the files in the `/src` directory are formatted according to Prettier's rules.

The `build`, `lint`, and `format:check` commands must exit with a non-zero status when their checks fail.

**Theory question:** Why are stable, composable commands such as these useful as an interface for developers and CI? Explain idempotence and identify which of your scripts should be idempotent.

> - **Stable, Composable Commands**: Ein einheitliches Befehlsset bildet eine stabile Schnittstelle. So finden sich Entwickler auch in anderen Projekten schnell zurecht. Zudem ist es für die einfache Verwendung egal, welches Tool in welcher Version genau dahinter steckt - der Aufruf bleibt gleich.
> - **Idempotence**: Ein idempotenter Befehl kann beliebig oft ausgeführt werden, ohne dass sich das Ergebnis ändert. ("Mehrfaches Ausführen mit demselben Input führt zum selben Endzustand wie einmaliges Ausführen.")
>   - Projekt-spezifische Beispiele:
>     - `format` und `lint:fix` sind idempotent. Wenn sie einmal ausgeführt wurden, ändert sich das Ergebnis nicht mehr auch wenn sie wieder ausgeführt werden.
>     - `lint` und `format:check` sind read-only. Daher auch idempotent (vgl. HTTP-GET). Sie geben immer das gleiche Ergebnis zurück (bei selbem Input-Code)
>     - `build` grundsätzlich auch idempotent - kommt allerdings auch darauf an, wie z.B. die minification funktioniert
>     - `dev` ist nicht idempotent, da es einen Server startet und dieser beim zweiten Aufruf bereits läuft und daher fehlschlägt

#### Task 5: Enforce quality before integration

Configure a pre-commit hook that checks staged code using [husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/lint-staged/lint-staged). Configure a continuous-integration workflow that installs dependencies from the lockfile and runs the non-mutating build, type, lint, and formatting checks for every push or pull request.

> ```bash
> npm install --save-dev husky lint-staged
> npx husky init
> chmod +x .husky/pre-commit
> ```
**Theory question:** Compare a local pre-commit hook with a CI quality gate. Why is CI still necessary when hooks are configured, and why should CI use non-mutating checks rather than automatically rewriting source files?

> - **Hook**: Läuft am Rechner des Entwicklers, bevor ein Commit erstellt wird. Es kann den Commit blockieren, wenn die Checks fehlschlagen. Vorteil: Entwickler erhalten sofortiges Feedback und können Probleme direkt beheben, daher weniger Commits mit "Fix xy". Nachteil: Hooks sind lokal und können umgangen oder deaktiviert werden.
> - **CI Quality Gate**: Läuft auf einem zentralen Server (z.B. GitHub Actions) und prüft den Code, bevor er in den Hauptbranch integriert wird. Vorteil: Alle Commits werden überprüft, unabhängig davon, ob der Entwickler Hooks deaktiviert hat. Es gibt auch im Nachhinein nicht die Ausrede "bei mir hat es funktioniert".  Nachteil: Feedback kommt erst nach dem Push, daher kann es zu mehr "Fix xy"-Commits kommen.
>
> **Warum CI trotz Hook?**: Warum CI trotz Hook? - Siehe oben Nachteile von Hooks.
> **CI non-mutating checks**: CI sollte keine Änderungen am Code vornehmen, da dies zu unerwarteten Änderungen führen kann, die der Entwickler nicht beabsichtigt hat. Zudem ist es ein Sicherheitsrisiko: CI braucht Schreibrechte am Repo. Stattdessen sollte CI nur prüfen, ob der Code den Standards entspricht und Fehler melden, damit der Entwickler diese selbst beheben kann. - **Non mutating** checks haben auch den Vorteil, dass sie immer reproduzierbar sind.

**ESLint Configurations**

Use ESLint configs [standard-with-typescript](https://www.npmjs.com/package/eslint-config-standard-with-typescript) and [TypeScript ESLint Plugin](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin).
Your `.eslintrc` file should have the following extensions:

```.eslintrc.yml
...
extends:
  - standard-with-typescript
  - plugin:@typescript-eslint/recommended
  - plugin:prettier/recommended
  - prettier
...
```

**Prettier Configurations**

Apply the following ruleset for Prettier:

```.prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 80
}
```

## 3. Migrate to a Frontend Framework

In this playground you will migrate your application to React with TypeScript while retaining the build and quality pipeline from Playground 2.

### Tasks

#### Task 1: Establish the React application

Add React (or another framework of your choice) to the existing Vite and TypeScript project and migrate the page entry point to a React root. Preserve the build, linting, formatting, and CI setup from Playground 2, adapting scripts and configuration where necessary.

> ```bash
> npm install react react-dom 
> npm install --save-dev @types/react @types/react-dom @vitejs/plugin-react
> ```

**Theory question:** Contrast imperative DOM updates with React's declarative model. What happens during React's render, reconciliation, and commit phases, and why should code outside React not modify DOM nodes owned by the React root? If you chose not to use React, answer the same questions in the context of your chosen framework.

> **Imparativ**: Sagt, _wie_ sich das DOM ändert. Beispiele: `createElement`, `appendChild`. Das hat den Nachteil, dass man sich selbst darum kümmern muss. Bei jeder Interaktion kommen neue Fälle dazu, die man berücksichtigen muss. Das ist eine Fehlerquelle (vergessene Updates, doppelte Einträge, ...).
> **Deklarativ**: Sagt, _was_ das DOM darstellen soll. React kümmert sich darum, dass das DOM immer den aktuellen Zustand der Anwendung widerspiegelt. Man beschreibt nur, wie die UI aussehen soll, und React kümmert sich um die Details der Aktualisierung.
> 
> **Die 3 Phasen von React**:
> 1. **Render**: Wird in 2 Fällen aufgerufen: initial Render und State Änderungen. React erstellt einen Virtual DOM basierend auf den Komponenten und deren Props/State.
> 2. **Reconciliation**: React vergleicht den neuen Virtual DOM mit dem DOM. Es entscheidet, welche Teile des echten DOM aktualisiert werden müssen.
> 3. **Commit**: React wendet die Änderungen am echten DOM an. Danach laufen `useLayoutEffect` und `useEffect`. Nur in dieser Phase wird das echte DOM verändert.
>
> **Warum sollte Code außerhalb von React das DOM nicht verändern?**: Wenn Code außerhalb von React das DOM verändert, kann React diese Änderungen nicht erkennen. Bei der nächsten Reconciliation könnte React die Änderungen überschreiben, da es den Zustand des Virtual DOMs als Quelle der Wahrheit betrachtet. Dies kann zu unerwartetem Verhalten führen.
> 
> [Quelle](https://medium.com/@mukeshsharma20120/understanding-reacts-render-reconciliation-diffing-commit-phases-63913e775d8d)

#### Task 2: Design the component tree

Decompose the interface into components organised by feature. Use props where appropriate, keep rendering pure, and render bear collections with stable keys.

**Theory question:** Explain how component boundaries and typed props act as contracts. What makes a key stable, why does React need keys during reconciliation, and why is an array index unsuitable when list entries can change order?

> Eine Komponente ist eine abgeschlossene Einheit, die eine bestimmte Funktionalität kapselt. Sie hat klar definierte Eingaben (Props) und Ausgaben (Render-Ergebnis). Props sind wie Parameter für Funktionen: Sie geben der Komponente die Daten, die sie benötigt, um korrekt zu rendern. Typisierte Props stellen sicher, dass die Daten, die an eine Komponente übergeben werden, den erwarteten Typen entsprechen. Dies wirkt wie ein Vertrag zwischen der Komponente und ihrem Aufrufer: Wenn der Vertrag verletzt wird (z.B. falscher Typ), kann TypeScript einen Fehler melden.
> Dies hält das Single-Responsibility-Prinzip ein, da jede Komponente nur für ihre eigene Logik verantwortlich ist. So ist es z.B. der Bear-List egal woher die Daten kommen, solange sie in der richtigen Form (Props) übergeben werden.
> 
> **Stable Keys**: Stabiler Key - referenziert Listeneintrag eindeutig und bleibt über mehrere Renders hinweg gleich - unabhängig von Reihenfolge oder Filterung. React verwendet Keys, um Listeneinträge effizient zu aktualisieren. Wenn ein Key sich ändert, denkt React, dass es sich um einen neuen Eintrag handelt, und entfernt den alten Eintrag aus dem DOM und fügt den neuen hinzu. Dies kann zu unnötigen DOM-Operationen führen und den Zustand von Komponenten verlieren.
> Wir nutzen einen Slug aus dem eindeutigen Bären-Namen als Key, da dieser stabil ist. Ein Array-Index wäre ungeeignet, da sich die Reihenfolge der Bären ändern kann (z.B. durch Filterung oder Sortierung).

#### Task 3: Model state and interaction

Implement the comment toggle, comment form, and search behavior with React events and state. Use controlled inputs, immutable updates, and derived values rather than duplicate state. Lift state only to the closest common owner that needs it.

**Theory question:** Distinguish props, stored state, and derived values. Explain why direct mutation can produce incorrect React behavior and when lifting state is preferable to introducing context.

> - **Props:** Props sind schreibgeschützte Eingaben, die von einer übergeordneten Komponente an eine untergeordnete Komponente übergeben werden. Sie dienen dazu, Daten und Funktionen weiterzugeben.
> - **Stored State:** Stored State ist der interne Zustand einer Komponente. Dieser kann sich ändern -> Re-Render der Komponente.
> - **Derived Values:** Derived Values sind Werte, die aus Props und/oder Stored State berechnet werden. Sie werden nicht direkt gespeichert, sondern bei jedem Render neu berechnet (z.B. Button "Hide Comments" vs. "Show Comments" - abhängig vom State `isOpen`).
> 
> **Direct Mutation:** Wenn man den State direkt mutiert (z.B. `state.value = newValue`), erkennt React die Änderung nicht, da es auf Referenzänderungen achtet. Dies kann dazu führen, dass die Komponente nicht neu gerendert wird und der UI-Zustand inkonsistent wird.
> 
> **Lifting vs. Context**: Lifting State bedeutet, den State in die nächsthöhere gemeinsame Komponente zu verschieben, sodass mehrere untergeordnete Komponenten darauf zugreifen können. / Context ist nützlich, wenn viele, tief verschachtelte Komponenten auf denselben State zugreifen müssen und das durchreichen als Props unpraktisch wird. Beispiel: Suchbegriff

#### Task 4: Load and represent remote data

Load and validate the bear data within the React application. Represent loading, success, empty, and error states explicitly; prevent stale requests from overwriting newer results; and retain the image fallback behavior from Playground 1.

**Theory question:** Why is fetching data a synchronization with an external system rather than part of pure rendering? Explain how cleanup or cancellation prevents race conditions when a component unmounts or a request becomes irrelevant.

> 

#### Task 5: Add client-side routing and verify the migration

Add at least a list route and a bear-detail route using a stable bear identifier as a route parameter. Use query parameters for optional search/filter view state where appropriate. Verify that every requirement from Playground 1 still works and that all Playground 2 quality commands pass.

> ```bash
> npm install react-router-dom
> ```

**Theory question:** Distinguish client-side rendering, a single-page application, and client-side routing. Compare route parameters with query parameters, and describe one benefit and one cost of the SPA architecture used here.

## 4. HTTP, API Design and the Backend for Frontend

Your Playground 3 app calls the Wikipedia API from the browser. In this playground you move that call behind your own backend and give the comment section a real API. Stack for the examples: Node (current LTS), TypeScript, Fastify, zod. Alternatives (Express, Hono, ...) are allowed if your README explains why.

### Tasks

#### Task 1: Set up the API workspace

Turn the repository into an npm workspace with `apps/web` (the existing React app) and `apps/api` (a new Fastify service in TypeScript, strict mode, ESM). The API exposes `GET /health` returning JSON with status, version and uptime. Add a Dockerfile for both apps and a `compose.yaml` so that `docker compose up --build` serves the web app and the API; `npm run dev` starts both with hot reload, with Vite proxying `/api` to the API. Extend ESLint, Prettier, Husky and the CI workflow from Playground 2 so that both workspaces are checked.

**Done:** on a clean clone `docker compose up --build` serves the web app, `curl -i localhost:3000/health` returns 200 with JSON, and CI is green for both workspaces.

**Theory question:** Explain Node's event loop on the server: why does one slow synchronous operation delay every concurrent request, and how does async I/O avoid that? What is a health endpoint for, and who calls it?

#### Task 2: Move the Wikipedia call behind a BFF

Implement `GET /api/bears` and `GET /api/bears/:id`. The API fetches the "List of ursids" page server-side (with a descriptive `User-Agent`, as Wikimedia's policy requires), parses it and returns a normalised, typed `Bear` (`id` as a stable slug of the binomial name, `name`, `binomial`, `imageUrl`, `range`), validated with zod before it leaves the server. Use a timeout for the upstream call; if Wikipedia fails or returns something unexpected, respond with 502 or 504, never with an empty list. Switch the frontend to the BFF: the browser no longer talks to Wikipedia.

**Done:** the web app shows the same bears as before, exclusively via `/api/bears`; with the upstream blocked (for example a wrong hostname in the environment) the UI shows its error state, not an empty page.

**Theory question:** What is a Backend for Frontend, and what moves from the browser to the server when you introduce one (shape of the data, secrets, headers, CORS, failure handling)? Why is an empty 200 on upstream failure worse than a 502?

> **Answer:**
>
> **Backend for Frontend (BFF)**: Ein BFF ist ein eigener, kleiner Server, der genau für ein Frontend gebaut ist und zwischen Browser und externen Diensten vermittelt. Das Frontend spricht nur noch mit dem BFF (`/api/bears`); der BFF spricht mit Wikipedia, bereinigt die Antwort und liefert genau das zurück, was die UI braucht. Das Frontend kennt den Upstream nicht mehr.
>
> **Was wandert vom Browser auf den Server:**
>
> - **Form der Daten**: Vorher musste der Browser das Wikitext der Seite "List of ursids" selbst laden und parsen (Tabellen, Bild-Lookups pro Bär). Jetzt macht das der Server und liefert ein normalisiertes `Bear`-Objekt (`id` als Slug, `name`, `binomial`, `imageUrl`, `range`), das mit zod validiert wird, bevor es den Server verlässt. Ändert Wikipedia sein Format, muss nur der Parser im BFF angepasst werden, nicht jeder ausgelieferte Client.
> - **Secrets**: Ein Browser kann nichts geheim halten, jeder API-Key im Bundle ist öffentlich. Hinter einem BFF liegen Keys und Tokens in Umgebungsvariablen auf dem Server. Wikipedia braucht zwar keinen Key, aber das Prinzip ist der Hauptgrund für BFFs bei anderen Upstreams.
> - **Header**: Der BFF setzt die Header zum Upstream selbst, z.B. den `User-Agent` mit App-Name und Kontakt, den die Wikimedia-Policy verlangt. Ein Browser darf `User-Agent` nicht frei setzen (verbotener Header-Name). Ebenso entscheidet der BFF, welche Header er an den Client weitergibt (z.B. `Cache-Control`, `x-request-id`) und welche interne Details nicht.
> - **CORS**: Der Browser ruft nur noch die eigene Origin auf (in der Entwicklung über den Vite-Proxy, in Produktion vom selben Host oder mit expliziter Allow-List), es gibt keine Cross-Origin-Anfrage zu Wikipedia mehr. Der Server-zu-Server-Aufruf unterliegt keiner CORS-Prüfung, weil CORS eine Browser-Regel ist.
> - **Fehlerbehandlung**: Timeout (`AbortSignal.timeout`), Statuscode-Prüfung, Parsing und Validierung passieren zentral auf dem Server. Der BFF übersetzt Upstream-Probleme in eine eigene, stabile Fehlersprache für das Frontend, statt dass die UI mit rohen Wikipedia-Antworten, Netzwerkfehlern und halb kaputten Daten umgehen muss.
>
> **Warum ist ein leeres 200 bei Upstream-Fehlern schlimmer als ein 502?**
>
> Der Statuscode ist der Vertrag zwischen Server und Client: `200` heißt "die Anfrage hat funktioniert, das ist die Antwort". Gibt der BFF bei einem Wikipedia-Ausfall `200 []` zurück, behauptet er, es gebe keine Bären, und lügt damit.
>
> - Der Client kann einen Fehler nicht vom echten leeren Ergebnis unterscheiden. Die UI zeigt eine leere Seite statt einer Fehlermeldung mit Retry-Möglichkeit. Genau das ist das Kriterium in der Aufgabe: bei blockiertem Upstream muss der Fehlerzustand sichtbar sein.
> - Ein `502 Bad Gateway` (Upstream liefert Unsinn oder ist nicht erreichbar) bzw. `504 Gateway Timeout` (Upstream antwortet nicht rechtzeitig) sagt klar: Der Fehler liegt nicht beim Client und nicht im BFF selbst, ein späterer Retry kann helfen. Clients und Monitoring können darauf reagieren (Retry mit Backoff, Alarm).
> - Caches, Proxys und Browser dürfen ein `200` unter Umständen speichern. Eine leere Fehlerantwort würde dann auch nach der Wiederherstellung des Upstreams weiter ausgeliefert. Fehlerstatus werden dagegen nicht als gültige Daten wiederverwendet.
> - Monitoring und Logs zählen Fehlerraten über Statuscodes. Mit `200` bleibt der Ausfall unsichtbar, und die Metriken zeigen "alles grün", obwohl die Anwendung nichts mehr liefert.
>
> Das ist dasselbe Prinzip wie in Playground 1, Task 3: ein fehlgeschlagener Request darf nie als gültige leere Daten dargestellt werden.

#### Task 3: Design the comments API

Design and implement a comments resource with `GET /api/bears/:id/comments`, `POST /api/bears/:id/comments` (201 Created with a `Location` header) and `DELETE /api/comments/:commentId` (204 No Content). Validate the request body with zod (author and text non-empty, sensible length limits) and answer 400 for invalid input and 404 for unknown bears or comments. Store comments in memory for now (a `Map`) and connect the comment section of the React app to the API.

**Done:** comments created in the UI survive a page reload but not an API restart (you can explain why; Playground 5 fixes it); `curl` demonstrates 201, 204, 400 and 404.

**Theory question:** Explain safe, idempotent and cacheable methods. Why is POST used for creating and why must DELETE be idempotent? What happens when a client retries a POST after a timeout, and what does that mean for the API?

> **Answer:**
>
> **Safe, idempotent, cacheable** (RFC 9110):
>
> - **Safe**: Die Methode ändert keinen Zustand auf dem Server, sie liest nur (`GET`, `HEAD`, `OPTIONS`). Clients, Crawler und Prefetching dürfen sie deshalb jederzeit aufrufen.
> - **Idempotent**: Mehrfaches Ausführen derselben Anfrage hat den gleichen Effekt auf den Serverzustand wie einmaliges Ausführen (`GET`, `PUT`, `DELETE` und alle sicheren Methoden). Die _Antwort_ darf sich unterscheiden, nur der Zustand danach muss gleich sein.
> - **Cacheable**: Die Antwort darf zwischengespeichert und wiederverwendet werden (`GET`, `HEAD`, mit Einschränkungen `POST`, in der Praxis aber kaum). Safe und cacheable sind nicht dasselbe, aber ein Cache setzt voraus, dass die Anfrage keine Nebenwirkung braucht.
>
> **Warum POST zum Erstellen?** Beim Anlegen eines Kommentars vergibt der Server die ID (`POST /api/bears/:id/comments`). Der Client kennt die URL der neuen Ressource vorher nicht, deshalb passt `PUT` auf eine bekannte URL nicht. `POST` ist weder safe noch idempotent: Jeder Aufruf erzeugt eine neue Ressource. Die Antwort `201 Created` mit `Location: /api/comments/<id>` sagt dem Client, wo sie jetzt liegt.
>
> **Warum muss DELETE idempotent sein?** Weil Clients und Netzwerke wiederholen. Das Ziel von `DELETE` ist ein Zustand ("der Kommentar existiert nicht mehr"), und dieser Zustand ist nach dem ersten und nach jedem weiteren Aufruf derselbe. Ein automatischer Retry ist darum ungefährlich. In meiner API liefert das erste `DELETE` `204`, ein zweites `404`. Die Antwort unterscheidet sich also, der Serverzustand aber nicht. Das ist erlaubt, denn Idempotenz bezieht sich auf den Effekt, nicht auf den Statuscode. Ein `DELETE`, das beim Wiederholen zusätzlich etwas anderes löscht (z.B. "lösche den letzten Kommentar"), wäre dagegen nicht idempotent.
>
> **POST nach einem Timeout wiederholen**: Der Client weiß nicht, ob die Anfrage den Server nie erreicht hat oder ob der Kommentar gespeichert wurde und nur die Antwort verloren ging. Wiederholt er das `POST`, entsteht im zweiten Fall ein doppelter Kommentar mit neuer ID, denn der Server kann beide Anfragen nicht als gleich erkennen. Für die API heißt das:
>
> - Clients (und Proxys) dürfen `POST` nicht blind automatisch wiederholen, anders als `GET`, `PUT` und `DELETE`.
> - Soll Wiederholen trotzdem sicher sein, braucht `POST` einen Idempotenz-Mechanismus: der Client schickt einen eindeutigen `Idempotency-Key` (z.B. eine UUID) im Header, der Server merkt sich Key und erste Antwort und liefert bei einer Wiederholung dieselbe Antwort statt einen neuen Kommentar zu erstellen. Alternativ vergibt der Client die ID selbst und die Erstellung läuft über `PUT /api/comments/:id`.
> - In diesem Playground ist das nicht umgesetzt. Das Frontend wiederholt nicht automatisch und behält bei einem Fehler den eingegebenen Text, der Nutzer entscheidet also selbst über einen erneuten Versuch (und könnte so einen Kommentar doppelt anlegen). Ein doppelter Kommentar wäre hier ein kleiner Schaden, bei Zahlungen wäre er ein ernstes Problem.

#### Task 4: One error format for everything

Introduce typed error classes and a central Fastify error handler that renders every error as RFC 9457 Problem Details (`application/problem+json`): validation errors as 400 with an `errors` array, unknown resources as 404, upstream failures as 502 or 504, anything unexpected as 500 without stack trace or internals. Every response carries a request id (`x-request-id`, generated or taken from the incoming request) that also appears in the log line and in the problem's `instance` field. The frontend parses problem responses and shows `detail` to the user.

**Done:** `curl -i` shows `application/problem+json` and a request id for a 400, a 404, a 502 and a provoked 500; the request id is found in the API log.

**Theory question:** Why should an API have exactly one error contract? Which information must never leave the server in an error, and how do request ids connect a user's complaint to a log line?

> **Answer:**
>
> **Warum genau ein Fehlervertrag?** Ein Client muss Fehler maschinell verarbeiten können, ohne den Server zu kennen. Gibt es nur ein Format (bei uns RFC 9457: `type`, `title`, `status`, `detail`, `instance`, bei Validierung zusätzlich `errors`), reicht _ein_ Parser im Frontend: `api-error.ts` liest die Antwort und zeigt `detail` an, egal ob sie von einer 400-, 404-, 502- oder 500-Antwort kommt. Gäbe es pro Route eigene Formen (`{error: "..."}`, `{message: ...}`, HTML-Fehlerseite von Fastify oder Proxy), müsste jeder Aufrufer raten und Sonderfälle behandeln, und neue Fehlerfälle würden das Frontend brechen. Ein zentraler Error-Handler stellt zudem sicher, dass kein Fehler "vorbeirutscht": auch unbekannte Routen (404-Handler), Validierungsfehler und unerwartete Exceptions laufen durch dieselbe Stelle. Der Vertrag ist außerdem dokumentierbar (das `Problem`-Schema in `/api/docs`) und testbar. Die Statuscodes bleiben dabei die maschinenlesbare Hauptinformation, `detail` ist der Text für Menschen.
>
> **Was darf den Server nie verlassen?**
>
> - Stacktraces, Dateipfade und Quellcode-Zeilen,
> - interne Fehlermeldungen von Bibliotheken, Datenbank (SQL, Tabellen- und Spaltennamen, Connection Strings) und Upstream-Antworten im Rohzustand,
> - Secrets, Tokens, Passwörter, Konfigurationswerte und Umgebungsvariablen,
> - Interna der Infrastruktur (interne Hostnamen, IPs, Versionen), und bei Auth-Fehlern Hinweise, die Angreifern helfen (z.B. "Benutzer existiert, Passwort falsch").
>
> Solche Details helfen einem Angreifer beim Auskundschaften und dem Nutzer nicht. Deshalb trennt der Handler zwei Texte: `HttpError.detail` ist für den Client bestimmt, `message` (mit Interna) geht nur ins Log. Ein unerwarteter Fehler wird zu `500` mit dem festen Text `Internal Server Error`. Beim provozierten 500 (`ENABLE_DEBUG_ROUTES=1`) steht "Provoked 500 (secret internal detail)" im Log, aber nicht in der Antwort. Auch ein 502 sagt nur "Wikipedia is currently unavailable.", nicht die genaue Ursache.
>
> **Request-IDs**: Jede Anfrage bekommt eine ID (`x-request-id`, entweder vom Client mitgeschickt oder vom Server als UUID erzeugt). Sie steht an drei Stellen: im Response-Header, im Feld `instance` (`urn:request:<id>`) der Problem-Antwort und in jeder Logzeile der Anfrage (Fastify/pino loggt sie als `reqId`). Meldet sich ein Nutzer mit "Beim Speichern kam ein Fehler", genügt die ID aus der Fehlermeldung oder den DevTools. Im Log findet man damit genau diese Anfrage samt Stacktrace und Ursache (`grep <id>`), ohne dass Interna beim Nutzer landen. Die ID bleibt auch über mehrere Dienste hinweg nutzbar, wenn jeder sie weiterreicht und loggt, und lässt sich so in verteilten Systemen zu einer Spur zusammensetzen.

#### Task 5: CORS and the API contract

In development Vite proxies `/api`, so the browser sees one origin. Now serve the built web app from a different origin (for example `vite preview` on port 4173 without the proxy) and observe the failing requests. Configure `@fastify/cors` with an allow-list of origins from the environment and the methods and headers your API needs, and watch the preflight of a `DELETE` and of a JSON `POST` in the browser's network tab. Finally generate an OpenAPI 3.1 document from your zod route schemas (`@fastify/swagger`) and serve it at `/api/docs`.

**Done:** the preflight (OPTIONS) and the successful cross-origin request are visible in DevTools; `/api/docs` lists every route including the Problem Details schema.

**Theory question:** Who enforces CORS, the browser or the server? What is the difference between a simple and a preflighted request? Why can `Access-Control-Allow-Origin: *` not be combined with credentials, and why does a BFF make most CORS problems disappear?

> **Answer:**
>
> **Wer erzwingt CORS?** Der Browser. CORS ist eine Schutzregel der Same-Origin-Policy, keine Server-Sicherheitsfunktion. Der Server schickt nur Header (`Access-Control-Allow-Origin`, `-Methods`, `-Headers`), die sagen, welche fremden Origins die Antwort lesen dürfen. Der Browser prüft diese Header und blockiert bei einer Abweichung den Zugriff des JavaScripts auf die Antwort. Der Server kann die Anfrage dabei trotzdem schon verarbeitet haben (bei einem einfachen `POST` wurde sie ausgeführt, nur die Antwort ist unlesbar). `curl`, Postman oder ein anderer Server kennen CORS gar nicht. Deshalb ersetzt CORS weder Authentifizierung noch Autorisierung. Es schützt Nutzer davor, dass eine fremde Webseite mit ihrem Browser (und ihren Cookies) eine API ausliest. Bei uns prüft `@fastify/cors` die `Origin` gegen die Allow-List aus `CORS_ORIGINS`. Eine nicht erlaubte Origin bekommt keinen `Access-Control-Allow-Origin`-Header, und der Browser blockiert die Antwort.
>
> **Einfache vs. preflighted Anfrage:**
>
> - **Einfach**: Methode `GET`, `HEAD` oder `POST`, nur "harmlose" Header und bei `POST` nur die Content-Types `application/x-www-form-urlencoded`, `multipart/form-data` oder `text/plain`. Der Browser sendet die Anfrage direkt mit einem `Origin`-Header und prüft erst die Antwort.
> - **Preflighted**: Alles andere, z.B. `DELETE`, `PUT`, `PATCH`, ein eigener Header wie `x-request-id` oder `Content-Type: application/json`. Der Browser schickt zuerst automatisch eine `OPTIONS`-Anfrage mit `Origin`, `Access-Control-Request-Method` und `Access-Control-Request-Headers`. Nur wenn die Antwort (bei uns `204` mit `Access-Control-Allow-Methods`, `-Allow-Headers`, `-Allow-Origin`) das erlaubt, folgt die eigentliche Anfrage. Der Preflight schützt Server, die nie mit solchen Anfragen aus fremden Seiten gerechnet haben, vor Nebenwirkungen. Mit `Access-Control-Max-Age` (bei uns 600 s) darf der Browser das Ergebnis zwischenspeichern und spart so die zusätzliche Anfrage. In den DevTools sieht man beim `DELETE` und beim JSON-`POST` deshalb je zwei Einträge: `OPTIONS` und danach die eigentliche Anfrage.
>
> **Warum `*` nicht mit Credentials?** Credentials sind Cookies, HTTP-Auth und Client-Zertifikate (`fetch` mit `credentials: 'include'`). Würde `Access-Control-Allow-Origin: *` zusammen mit `Access-Control-Allow-Credentials: true` gelten, dürfte _jede_ beliebige Webseite im Browser eines angemeldeten Nutzers authentifizierte Anfragen an die API schicken und die Antworten lesen. Das wäre ein Freibrief für fremde Seiten, im Namen des Nutzers zu handeln. Deshalb verwirft der Browser diese Kombination: Bei Credentials muss der Server eine konkrete Origin zurückgeben (und `Vary: Origin` setzen), ebenso bei `Allow-Headers` und `Allow-Methods` keine Wildcards verwenden. Deshalb nutzt unsere API eine explizite Allow-List aus der Umgebung. Wir senden aktuell keine Cookies, die Regel gilt aber, sobald Sessions kommen.
>
> **Warum lässt ein BFF CORS-Probleme verschwinden?** CORS entsteht nur, wenn der Browser eine _andere_ Origin (Schema, Host oder Port) aufruft. Ein BFF liegt aus Sicht des Browsers auf derselben Origin wie das Frontend (in der Entwicklung über den Vite-Proxy `/api`, in Produktion z.B. über einen Reverse Proxy). Damit gibt es keine Cross-Origin-Anfrage, keinen Preflight und keine Header-Konfiguration. Die Aufrufe zu Drittanbietern wie Wikipedia macht der Server, für den CORS nicht gilt. Erst wenn wir die gebaute App von einer anderen Origin ausliefern (z.B. `vite preview` auf 4173 und API auf 3000), brauchen wir die CORS-Konfiguration wirklich.

## 5. Persistence and Data Modelling

Your comments live in a `Map` and die with the process. In this playground bears and comments move into PostgreSQL, with migrations, a repository layer and a transaction that survives concurrency. Stack for the examples: PostgreSQL via Docker Compose, Drizzle ORM and drizzle-kit, the `pg` driver. Prisma or another tool is allowed if your README explains why.

### Tasks

#### Task 1: Add PostgreSQL to the stack

Add a `db` service (PostgreSQL, current major version) to `compose.yaml` with a named volume and a healthcheck; the API starts only when the database is healthy and reads its connection string from `DATABASE_URL`. Use a connection pool, not a connection per request, and validate all environment variables with zod at startup. Add `GET /health/ready`, which returns 200 only if the database answers a trivial query, while `/health` stays a pure liveness check.

**Done:** on a clean clone `docker compose up --build` starts db and api; `/health/ready` returns a 503 Problem while the database is stopped and 200 once it is back.

**Theory question:** Liveness versus readiness: who uses each, and what goes wrong if the readiness check includes too many dependencies? Why is a connection pool necessary, and what limits its size?

#### Task 2: Model bears and comments and write the first migration

Define the schema in Drizzle: `bears` (id = slug as primary key, name, binomial, image_url, range, fetched_at) and `comments` (uuid id, bear_id with a foreign key and `ON DELETE CASCADE`, author, text, created_at), plus the indexes you expect to need. Generate the SQL migration with drizzle-kit, commit it, and add `npm run db:migrate` and `npm run db:seed`; the seed fetches the bears through your BFF code from Playground 4 (or from a committed fixture file) and upserts them. `GET /api/bears` now reads from the database.

**Done:** on an empty database `db:migrate` and `db:seed` create the tables and the bears, the migration SQL is in the repository, and the UI works without a live Wikipedia call.

**Theory question:** Why migrations instead of creating tables from code at startup? What does forward-only mean, and what goes wrong when two branches both create migration 0003? Natural key (slug) versus surrogate key (uuid): when is which appropriate?

#### Task 3: Introduce a repository layer

Define `BearRepository` and `CommentRepository` as TypeScript interfaces and implement them with Drizzle. Route handlers and services depend on the interfaces only; the implementation is injected (Fastify decorators or plugin options). Keep the in-memory implementation from Playground 4 and use it in your tests. Comments are now persisted.

**Done:** no route handler contains SQL or ORM calls; comments survive an API restart; the test suite runs against the in-memory repositories without a database.

**Theory question:** What does the repository hide, and what does it cost? Explain the N+1 problem using "comments for all bears" and show how your repository avoids it.

#### Task 4: Pagination, filtering and one measured index

Make `GET /api/bears/:id/comments` cursor-paginated (`limit`, `cursor` based on `created_at` and `id`, response contains `nextCursor`) and add `?q=` to `GET /api/bears` to filter by name. Write a script that seeds 100,000 comments, run `EXPLAIN ANALYZE` for the comments query without and with an index on (`bear_id`, `created_at`, `id`), and record both plans and timings in your README.

**Done:** the UI pages through comments; the README shows the two query plans and the measured difference; the index lives in a migration.

**Theory question:** Why does offset pagination get slower and skip or repeat rows, and how does a cursor avoid that? What is a B-tree index, why does the column order in a composite index matter, and why may PostgreSQL ignore an index on a small table?

#### Task 5: Transactions and the lost update

Add a report feature: `POST /api/comments/:id/report` increments `report_count` on the comment, and at three reports the comment is hidden (`hidden_at`). First implement it naively (read, increment in TypeScript, write) and write a script that sends 50 concurrent reports for one comment; observe the final count. Then fix it inside a transaction with a row lock (`SELECT ... FOR UPDATE`) or an atomic `UPDATE ... SET report_count = report_count + 1 ... RETURNING`, and run the script again. The transaction boundary belongs in the service, not in the repository.

**Done:** the race is reproducible with the naive version, the fixed version ends with exactly 50, and both the script and your explanation are in the repository.

**Theory question:** Explain ACID and the lost-update anomaly. What does PostgreSQL's default isolation level (read committed) guarantee, and what not? Compare pessimistic locking, atomic updates and optimistic concurrency with a version column.

## 6. Authentication, Authorisation and Web Security

Anyone can post and delete comments. In this playground the API gets users, a login, authorisation rules and the hardening every public API needs. Libraries for the examples: `argon2`, `@fastify/cookie`, `@fastify/session` (or a JWT library if you argue for it), `@fastify/helmet`, `@fastify/rate-limit`.

### Tasks

#### Task 1: Users and password storage

Add a `users` table via migration (id, email unique, password_hash, role, created_at) and `POST /api/auth/register`. Validate with zod (email format, password at least 12 characters, no composition rules), hash the password with argon2id and store only the hash. A duplicate email yields a 409 Problem.

**Done:** registering works from the UI, `SELECT password_hash FROM users` shows argon2 hashes only, duplicate registration yields 409.

**Theory question:** Why hash instead of encrypt, what do salt and work factor do, and why is a deliberately slow hash a feature? Why do current guidelines (NIST SP 800-63B) prefer length over composition rules? What is the trade-off between a clear 409 and user enumeration?

#### Task 2: Login and session, with a written decision

Implement `POST /api/auth/login`, `POST /api/auth/logout` and `GET /api/auth/me`. Decide between a server-side session (cookie with a session id, sessions stored in PostgreSQL) and a JWT, and write the decision as a ten-line ADR in your README (context, options, decision, consequences). Whatever you choose, set the cookie flags correctly (`HttpOnly`, `Secure` in production, `SameSite=Lax`, `Path`) and make logout actually invalidate the credential. The React app shows the logged-in user and a logout button.

**Done:** `/api/auth/me` returns the user after login and a 401 Problem after logout or without a cookie; the ADR is in the README.

**Theory question:** Compare session cookies and JWTs regarding revocation, statelessness, size and storage in the browser. What does an XSS attacker get in each case, and how does `SameSite` relate to CSRF?

#### Task 3: Authorisation for comments

Comments get an `author_id`. Creating a comment requires a login (401 otherwise); deleting is allowed for the author and for users with the role `moderator` (403 otherwise). Seed one moderator. Enforce the rules in one place on the server (a `preHandler` or a policy function) and let the UI only reflect them by hiding the delete button where the call would fail.

**Done:** a curl matrix (anonymous, author, other user, moderator) shows 401, 204, 403 and 204 for `DELETE`; the UI matches.

**Theory question:** Authentication versus authorisation, 401 versus 403. Explain RBAC and ownership checks, what an IDOR vulnerability is (OWASP A01 Broken Access Control) and why hiding a button in the client is not a security control.

#### Task 4: Harden the API

Add rate limiting to login and register (429 with `Retry-After`), security headers via `@fastify/helmet`, a strict CORS configuration with credentials, a request body size limit, and zod validation on every input (params, query, body, environment). Secrets (session secret, database password) come only from the environment; commit a `.env.example`, never a `.env`, and add a secret scan (for example gitleaks) to the pre-commit hook or the CI workflow.

**Done:** a brute-force script against `/api/auth/login` receives 429 after the configured number of attempts; `curl -I` shows the security headers; the secret scan runs in CI.

**Theory question:** Map your measures to the OWASP Top 10: which items do they address? Explain token bucket versus fixed window rate limiting, and what "defence in depth" means for this API.

#### Task 5: Security review and one attack test

Write a short security review of the bear API in your README: choose three OWASP Top 10 risks, explain how each applies to this application, what mitigates it and what residual risk remains. Then write one automated test (vitest with `fastify.inject()`) that reproduces an attack, for example an injection attempt through `?q=`, a stored XSS payload in a comment, an IDOR delete or a cross-site POST, and shows that the mitigation holds.

**Done:** the review is in the README, the test is in the repository and passes in CI; in the presentation you walk through attack, mitigation and residual risk.

**Theory question:** Why do parameterised queries stop SQL injection while input validation alone does not? Where is stored XSS mitigated (output encoding in React, Content Security Policy) and what is the server's share of the responsibility?

## 7. Caching, Realtime and Background Jobs

The API works and is secure; now it has to stay fast and alive under load. In this playground you add HTTP caching, a server-side cache, live comments via Server-Sent Events, a job queue and idempotent writes. No new infrastructure is required: the cache is in-process and the queue is a PostgreSQL table.

### Tasks

#### Task 1: HTTP caching with ETags

Give `GET /api/bears` and `GET /api/bears/:id` a `Cache-Control` policy (for example `public, max-age=60, stale-while-revalidate=300`) and an `ETag`; answer `If-None-Match` with 304 and an empty body. Comments and everything behind a login get `Cache-Control: private, no-store` or `no-cache` with validation, as appropriate. Verify the behaviour in the browser's network tab and with curl.

**Done:** a repeated request to `/api/bears` with `If-None-Match` returns 304; a data change produces a new ETag; authenticated responses are never stored by a shared cache.

**Theory question:** Freshness versus validation, private versus public caches, `no-store` versus `no-cache`, and what `Vary` is for. Map the client-side strategies from the PWA unit (cache first, network first, stale-while-revalidate) to server headers.

#### Task 2: Server-side cache for the upstream

Put an in-process cache (TTL and maximum size, for example `lru-cache`) in front of the Wikipedia fetch and the bear list query (cache-aside). Add request coalescing so that 50 concurrent cold requests cause exactly one upstream call, and invalidate the cache when the seed or a refresh changes the bears. Expose hit and miss counters at `/metrics`. Measure `GET /api/bears` with autocannon before and after and record the numbers in your README.

**Done:** the README shows requests per second and p99 latency before and after; a counter proves one upstream call for 50 parallel cold requests; `/metrics` shows hits and misses.

**Theory question:** Cache-aside versus read-through, TTL versus event-based invalidation, and the cache stampede problem. When would you move the cache to Redis, and what changes for cache keys and invalidation with several API instances?

#### Task 3: Live comments with Server-Sent Events

Add `GET /api/bears/:id/comments/stream` (`text/event-stream`) that pushes `comment.created` and `comment.deleted` events from an in-process event bus; include event ids, a heartbeat every 15 seconds and support for `Last-Event-ID` so that a reconnecting client receives what it missed. The React app subscribes with `EventSource` and updates the list without reloading.

**Done:** a comment posted in one browser window appears in a second window within a second; after an API restart the second window reconnects and catches up.

**Theory question:** Compare polling, long polling, SSE and WebSockets and justify SSE for this case. What does ordering per entity mean, how does the server deal with a slow consumer (backpressure), and why does the in-process bus stop working with two API instances?

#### Task 4: Background jobs with a PostgreSQL queue

Create a `jobs` table (id, type, payload, status, attempts, run_at, locked_at, last_error) and a worker process (`npm run worker`, also a Compose service) that claims jobs with `SELECT ... FOR UPDATE SKIP LOCKED`, runs a handler, retries with exponential backoff and moves a job to `dead` after three failures. Use it for at least one real case: for example a moderation job that hides comments containing words from a block list, or a nightly refresh of the bear data from Wikipedia.

**Done:** creating a comment enqueues a job that completes asynchronously; killing the worker in the middle of a job and restarting it completes the job; a job that always fails ends in `dead` after three attempts.

**Theory question:** Why not do the work in the request? Explain at-least-once versus at-most-once delivery, why `SKIP LOCKED` is needed, what a visibility timeout is, and when you would switch to a broker such as Redis with BullMQ or RabbitMQ.

#### Task 5: Idempotency end to end

Support an `Idempotency-Key` header on `POST /api/bears/:id/comments`: store key, request fingerprint and response per user; a replay with the same key returns the stored 201, a replay with a different body returns 422, and concurrent duplicates lead to exactly one comment. Make your job handlers idempotent as well: running the same job twice has no additional effect.

**Done:** a script sends the same POST 20 times concurrently with one key, exactly one comment exists and all 20 responses are identical; re-running a completed job changes nothing.

**Theory question:** Why is exactly-once delivery impossible end to end, and how do idempotent operations give the same guarantee in practice? Connect this to the idempotent HTTP methods from Playground 4 and to the retries in Task 4.

---

## In-Class Accessibility Workshop

You might have noticed that the base project has a number of accessibility issues - your task is to explore the existing site and fix them. Use the tools presented in our accessibility workshop to test the accessibility of your app and write a summary of your reports below.

### Tasks

- Accessibility Checks:
  - **Color**: Test the current color contrast (text/background), report the results of the test, and then fix them by changing the assigned colors.
  - **Semantic HTML**: Report on what happens when you try to navigate the page using a screen reader. Fix those navigation issues.
  - **Audio**: The `<audio>` player isn't accessible to hearing impaired people — can you add some kind of accessible alternative for these users?
  - **Forms**:
    - The `<input>` element in the search form at the top could do with a label, but we don't want to add a visible text label that would potentially spoil the design and isn't really needed by sighted users. Fix this issue by adding a label that is only accessible to screen readers.
    - The two `<input>` elements in the comment form have visible text labels, but they are not unambiguously associated with their labels — how do you achieve this? Note that you'll need to update some of the CSS rule as well.
  - **Comment Section**: The show/hide comment control button is not currently keyboard-accessible. Can you make it keyboard accessible, both in terms of focusing it using the tab key, and activating it using the return key?
  - **The table**: The data table is not currently very accessible — it is hard for screen reader users to associate data rows and columns together, and the table also has no kind of summary to make it clear what it shows. Can you add some features to your HTML to fix this problem?

> _Note your findings here..._

<p>© 2026 Leon Freudenthaler (Hochschule Campus Wien). All rights reversed.</p>

Info: KI für die Formulierung der Theorieantworten verwendet.
