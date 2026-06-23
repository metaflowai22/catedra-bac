/* Funcție serverless (Vercel) pentru asistentul AI „Întreabă AI".
   IMPORTANT: cheia OpenAI NU se află în cod. Se citește din variabila de mediu
   OPENAI_API_KEY, setată în Vercel → Project → Settings → Environment Variables.
   Astfel cheia nu ajunge niciodată în browser sau pe GitHub. */

const OPERE = [
  "Povestea lui Harap-Alb — Ion Creangă (basm cult, 1877)",
  "Moara cu noroc — Ioan Slavici (nuvelă psihologică, 1881)",
  "Luceafărul — Mihai Eminescu (poem romantic, 1883)",
  "O scrisoare pierdută — I. L. Caragiale (comedie de moravuri, 1884)",
  "Plumb — George Bacovia (simbolism, 1916)",
  "Eu nu strivesc corola de minuni a lumii — Lucian Blaga (modernism, 1919)",
  "Ion — Liviu Rebreanu (roman realist obiectiv, 1920)",
  "Riga Crypto și lapona Enigel — Ion Barbu (baladă modernistă, 1924)",
  "Baltagul — Mihail Sadoveanu (roman, 1930)",
  "Ultima noapte de dragoste, întâia noapte de război — Camil Petrescu (roman psihologic, 1930)",
  "Flori de mucigai — Tudor Arghezi (modernism, estetica urâtului, 1931)",
  "Enigma Otiliei — George Călinescu (roman realist balzacian, 1938)",
  "Moromeții — Marin Preda (roman realist postbelic, 1955)",
  "Leoaică tânără, iubirea — Nichita Stănescu (neomodernism, 1964)",
  "Iona — Marin Sorescu (dramă-parabolă, 1968)"
];

const SYSTEM_PROMPT =
  "Ești un profesor de limba și literatura română care ajută elevii de liceu să se pregătească pentru Bacalaureat (profil real). " +
  "Răspunzi STRICT la întrebări legate de operele literare studiate, de autorii lor, de curentele literare, de personaje, teme, " +
  "procedee, comentarii, caracterizări și de modul de redactare a eseului/comentariului pentru examen. " +
  "Operele din platformă sunt:\n- " + OPERE.join("\n- ") + "\n" +
  "Reguli ferme:\n" +
  "1. Dacă întrebarea NU are legătură cu literatura română / aceste opere / pregătirea la română, refuză POLITICOS și " +
  "amintește-i elevului că poți răspunde doar la întrebări despre operele studiate. Nu da informații în afara subiectului " +
  "(nu rețete, nu matematică, nu programare, nu sfaturi generale, nu cod etc.).\n" +
  "2. Răspunde în limba română, clar, structurat și concis (folosește, unde ajută, liste sau subtitluri).\n" +
  "3. Oferă informații corecte din punct de vedere literar; nu inventa citate. Dacă nu ești sigur, spune asta.\n" +
  "4. Adaptează răspunsul la nivelul unui elev de clasa a XII-a.";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Metodă nepermisă." });
    return;
  }
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    res.status(500).json({ error: "Asistentul nu este configurat (lipsește OPENAI_API_KEY pe server)." });
    return;
  }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  const question = String(body.question || "").trim().slice(0, 1000);
  const work = String(body.work || "").trim().slice(0, 120);
  if (!question) {
    res.status(400).json({ error: "Întrebarea este goală." });
    return;
  }

  const userContent = (work ? "(Context — opera: " + work + ")\n" : "") + question;

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        max_tokens: 700,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent }
        ]
      })
    });

    if (!r.ok) {
      const t = await r.text();
      res.status(502).json({ error: "Serviciul AI a returnat o eroare.", detail: t.slice(0, 300) });
      return;
    }
    const data = await r.json();
    const answer = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "Nu am putut genera un răspuns.";
    res.status(200).json({ answer: answer });
  } catch (err) {
    res.status(500).json({ error: "Eroare la conectarea cu serviciul AI.", detail: String(err).slice(0, 200) });
  }
};
