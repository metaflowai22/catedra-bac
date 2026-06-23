# Catedra · BAC Română

Platformă de pregătire pentru Bacalaureatul la limba română (profil real). Comentarii literare, caracterizări de personaj și quiz-uri pentru cele **15 opere obligatorii**, ordonate **cronologic** (1877 → 1968).

Inspirată după aplicația din Emergent, dar **rescrisă să funcționeze fără AI și fără backend**: tot conținutul este scris și stocat local, deci nu există costuri de API și nici bază de date.

## Ce conține
- **Bibliotecă** cu 15 opere, filtrabilă pe gen (poezie / roman / nuvelă / dramaturgie / basm).
- **Eseu & comentariu** structurat pentru fiecare operă (încadrare, temă, construcție, semnificații, concluzie).
- **Caracterizări** de personaj, cu citate-cheie.
- **Quiz** pe fiecare operă + **Mod examen** (12 întrebări amestecate din toate operele).
- **Descarcă PDF** pentru eseuri și caracterizări (printează / salvează ca PDF).

## Cum o rulezi local
Este un site static, fără build. Orice server static merge:

```bash
# Python
python -m http.server 5180
# sau Node
npx serve .
```
Apoi deschide `http://localhost:5180`.

> Poți deschide și direct `index.html` în browser, dar un server local e recomandat (pentru rutarea pe hash).

## Cum o pui online (gratis)
Fiind 100% static, o poți urca oriunde, fără configurare:
- **Vercel / Netlify** — trage folderul `catedra-bac` în interfața de deploy (drag & drop). Gata.
- **GitHub Pages** — pune fișierele într-un repo și activează Pages.
- **Cloudflare Pages** — la fel, doar încarci folderul.

Niciun cost de hosting peste planul gratuit, niciun API de plătit.

## Structură
```
index.html   – pagina + fonturi
styles.css   – tot stilul (paletă editorială: paper / ink / burgundy / mustard)
data.js      – cele 15 opere: eseuri, caracterizări, quiz-uri (ordonate cronologic)
app.js       – rutare, randare, logica de quiz/examen, export PDF
```

## Cum adaugi sau editezi conținut
Tot ce ține de conținut este în `data.js`. Fiecare operă are forma:
```js
{
  id:"...", title:"...", author:"...", year:"1883",
  genre:"poezie", type:"...",
  essay:`text cu **bold**, *italic*, ### titlu, > citat, --- linie`,
  characters:[ {name, role, essay} ],
  quiz:[ {q, opts:[...], correct: <index>, explain} ]
}
```
Operele se afișează automat în ordine cronologică (după `year`).
