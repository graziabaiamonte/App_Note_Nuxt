// Esporta un middleware di route Nuxt utilizzando la funzione helper defineNuxtRouteMiddleware
// Questo middleware verrà eseguito prima di accedere alle route protette
export default defineNuxtRouteMiddleware(async (event) => {
  // Verifica se il codice sta girando sul client (browser)
  // process.client è true quando il codice viene eseguito nel browser
  // Se è true, il middleware termina immediatamente e ritorna undefined
  // Questo perché la verifica JWT deve avvenire SOLO lato server per sicurezza
  if (process.client) return;

  // Estrae la funzione $verifyJwtToken dal contesto dell'applicazione Nuxt
  // useNuxtApp() fornisce accesso alle funzionalità globali dell'app
  // $verifyJwtToken è un plugin personalizzato che verifica la validità del token
  const { $verifyJwtToken } = useNuxtApp();

  // Log di debug per confermare che il middleware è stato attivato
  console.log("middleware fired");

  // Recupera il cookie chiamato 'NoteNestJWT' che contiene il token di autenticazione
  // useCookie() è una funzione composable di Nuxt per gestire i cookie
  // Crea un riferimento reattivo al cookie, permettendo lettura/scrittura
  const jwt = useCookie("NoteNestJWT");

  // Log del valore del token per debugging
  // Mostra il contenuto del JWT (o undefined se non esiste)
  console.log(jwt.value);

  // Verifica se il token JWT esiste
  // Se jwt.value è null, undefined, o una stringa vuota, la condizione è vera
  if (!jwt.value) {
    // Se non c'è token, significa che l'utente non è autenticato
    // navigateTo() reindirizza l'utente alla pagina di registrazione
    // return interrompe l'esecuzione del middleware
    return navigateTo("/register");
  }

  // Blocco try-catch per gestire eventuali errori nella verifica del token
  try {
    // Tenta di verificare la validità del token JWT
    // $verifyJwtToken è una funzione asincrona che:
    // 1. Prende il token JWT come primo parametro
    // 2. Prende la chiave segreta (JWT_SECRET) come secondo parametro
    // 3. Verifica che il token sia valido, non scaduto e non manomesso
    // Se la verifica ha successo, l'esecuzione continua normalmente
    // Se fallisce, viene lanciato un errore che viene catturato dal catch
    await $verifyJwtToken(jwt.value, process.env.JWT_SECRET);
  } catch (error) {
    // Se la verifica del token fallisce (token scaduto, manomesso, o invalido)
    // il controllo passa a questo blocco catch

    // Log dell'errore per debugging
    // Utile per capire perché la verifica è fallita
    console.log(error);

    // Reindirizza l'utente alla pagina di registrazione
    // Questo forza l'utente a riautenticarsi
    // return interrompe l'esecuzione del middleware
    return navigateTo("/register");
  }

  // Se il codice arriva qui, significa che:
  // 1. Il codice sta girando lato server (process.client è false)
  // 2. Il token JWT esiste nel cookie
  // 3. Il token è stato verificato con successo
  // Il middleware termina senza fare return, permettendo l'accesso alla route protetta
});

// NOTA :
// Struttura di un JWT (JSON Web Token):
// Un JWT è composto da tre parti separate da punti:
//
// Header.Payload.Signature
//
// Esempio: klfjdsalkfjklsdajkl4jfkslkdfjl.fadsjklfjsdklfjskla.asdfsafsdasdfsafsadjksldfjsdkl
//
// 1. Header (prima parte): contiene il tipo di token e l'algoritmo di hashing
//    Es: {"alg": "HS256", "typ": "JWT"} codificato in Base64
//
// 2. Payload (seconda parte): contiene i claims (dati dell'utente)
//    Es: {"userId": 123, "email": "user@example.com", "exp": 1234567890}
//    codificato in Base64
//
// 3. Signature (terza parte): firma crittografica che garantisce l'integrità
//    Creata con: HMACSHA256(base64(header) + "." + base64(payload), JWT_SECRET)

// Flusso del Middleware

// Controllo Server-Side: Il middleware viene eseguito SOLO lato server per sicurezza (se gira sul client, esce immediatamente)
// Verifica Cookie: Controlla se esiste il cookie NoteNestJWT che contiene il token di autenticazione
// Validazione Token: Se il token esiste, lo verifica usando la chiave segreta (JWT_SECRET) tramite il plugin $verifyJwtToken
// Gestione Errori: Se il token è mancante, scaduto o invalido, reindirizza l'utente a /register

// Perché Solo Server-Side?
// La verifica lato server è cruciale per la sicurezza perché:

// Il JWT_SECRET non deve mai essere esposto al client
// Sul browser un utente malintenzioso potrebbe manipolare il codice
// La verifica server-side garantisce che solo token validi ottengano accesso

// Struttura JWT
// Ho anche aggiunto una nota sulla struttura del JWT (le tre parti separate da punti) che puoi vedere nel commento finale. Questo spiega il formato del token che hai indicato nel commento originale del codice!
