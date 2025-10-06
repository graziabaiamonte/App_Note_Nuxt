// Importa la libreria jsonwebtoken per verificare e decodificare i token JWT
// In questo caso viene usata per autenticare l'utente prima di creare una nuova nota
import jwt from "jsonwebtoken";

// Definisce un handler per le richieste HTTP POST all'endpoint /api/notes
// Il nome del file (notes.post.js) determina:
// - Route: /api/notes
// - Metodo HTTP: POST
// Questo endpoint crea una nuova nota vuota per l'utente autenticato
export default defineEventHandler(async (event) => {
  // Blocco try-catch per gestire errori di autenticazione e creazione della nota
  try {
    // ESTRAZIONE DEI COOKIES
    // parseCookies() è una funzione helper di Nuxt che:
    // 1. Legge l'header 'Cookie' dalla richiesta HTTP
    // 2. Analizza (parse) la stringa dei cookie
    // 3. Ritorna un oggetto JavaScript con tutti i cookie come coppie chiave-valore
    // Esempio: se i cookie sono "NoteNestJWT=abc123; theme=dark"
    // ritorna { NoteNestJWT: 'abc123', theme: 'dark' }
    const cookies = parseCookies(event);

    // Estrae il token JWT specifico dal cookie 'NoteNestJWT'
    // Questo è il token che è stato impostato durante il login
    // Se il cookie non esiste, token sarà undefined
    const token = cookies.NoteNestJWT;

    // VERIFICA PRESENZA TOKEN
    if (!token) {
      // Crea e lancia un errore HTTP 401 Unauthorized
      // 401 = Unauthorized: l'utente deve autenticarsi per ottenere l'accesso
      // Questo errore viene lanciato quando:
      // - L'utente non ha fatto login
      // - Il cookie è scaduto o è stato cancellato
      // - L'utente sta tentando di accedere senza autenticazione
      throw createError({
        statusCode: 401,
        // statusMessage viene usato come descrizione dell'errore
        statusMessage: "Not authorized to update",
      });
    }

    // VERIFICA E DECODIFICA DEL TOKEN JWT
    // jwt.verify() esegue due operazioni critiche:
    // 1. VERIFICA: controlla che il token sia valido e non manomesso
    //    - Verifica la firma crittografica usando JWT_SECRET
    //    - Controlla che il token non sia scaduto (se esiste campo 'exp')
    //    - Valida la struttura del token
    // 2. DECODIFICA: estrae il payload (i dati) dal token
    //    - Nel nostro caso, il payload contiene { id: userId }
    //    - Ritorna l'oggetto decodificato
    // Se la verifica fallisce, lancia un'eccezione che viene catturata dal catch
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

    // A questo punto decodedToken contiene:
    // {
    //   id: 123,           // l'ID dell'utente (inserito durante jwt.sign() al login)
    //   iat: 1234567890,   // issued at: timestamp di creazione del token
    //   exp: 1234567890    // expiration: timestamp di scadenza (se configurato)
    // }

    // CREAZIONE NUOVA NOTA NEL DATABASE
    // prisma.note.create() crea un nuovo record nella tabella 'note'
    const newNote = await prisma.note.create({
      // L'oggetto 'data' contiene i valori da inserire nel database
      data: {
        // Crea una nota con testo vuoto inizialmente
        // L'utente potrà poi modificarla tramite la textarea nell'interfaccia
        text: "",
        // Associa la nota all'utente corrente usando l'ID estratto dal token
        // decodedToken.id è l'ID dell'utente che ha fatto login
        // Questo crea una relazione tra la nota e l'utente (foreign key)
        userId: decodedToken.id,

        // NOTA: Altri campi potrebbero essere gestiti automaticamente da Prisma:
        // - id: generato automaticamente (auto-increment o UUID)
        // - createdAt: timestamp automatico di creazione (se definito nel schema)
        // - updatedAt: timestamp automatico di ultimo aggiornamento (se definito)
      },
    });

    // newNote conterrà l'oggetto completo della nota appena creata, inclusi:
    // - id: l'ID univoco generato dal database
    // - text: '' (stringa vuota)
    // - userId: l'ID dell'utente
    // - createdAt: data/ora di creazione
    // - updatedAt: data/ora di ultimo aggiornamento

    // RISPOSTA AL CLIENT
    // Ritorna l'oggetto della nuova nota al client
    // Nuxt serializza automaticamente l'oggetto in JSON
    // Il client riceverà una risposta HTTP 200 OK con il JSON della nota
    return newNote;
  } catch (err) {
    // GESTIONE ERRORI GLOBALE
    // Questo blocco catch cattura qualsiasi errore che si verifica nel try:
    //
    // Possibili errori:
    // 1. Token mancante -> gestito esplicitamente con throw sopra
    // 2. jwt.verify() fallisce:
    //    - JsonWebTokenError: token malformato o signature invalida
    //    - TokenExpiredError: token scaduto
    //    - NotBeforeError: token usato troppo presto
    // 3. prisma.note.create() fallisce:
    //    - Errori di database (connessione persa, vincoli violati, ecc.)
    //    - userId non valido (foreign key constraint)

    // Log dell'errore nella console del server per debugging
    // IMPORTANTE: Questo log aiuta a diagnosticare problemi in produzione
    // ma non dovrebbe mai esporre informazioni sensibili al client
    // (il messaggio di errore inviato al client è generico)

    // Crea e lancia un errore HTTP 500 Internal Server Error
    // 500 = Internal Server Error: errore generico del server
    throw createError({
      statusCode: 500,
      // NOTA DI SICUREZZA: Il messaggio è intenzionalmente generico
      // Non rivela dettagli specifici dell'errore al client per motivi di sicurezza
      // Questo previene che un attaccante ottenga informazioni sul funzionamento interno
      statusMessage: "Could not verify jwt",
    });

    // MIGLIORAMENTO POSSIBILE:
    // Si potrebbe differenziare gli errori per dare feedback più specifici:
    // if (err instanceof jwt.TokenExpiredError) {
    //   throw createError({ statusCode: 401, statusMessage: 'Token expired' })
    // }
    // if (err instanceof jwt.JsonWebTokenError) {
    //   throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
    // }
    // // Altri errori (database, ecc.)
    // throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
});

// FLUSSO COMPLETO DELLA RICHIESTA:
//
// 1. CLIENT: Invia richiesta POST a /api/notes
//    - Include automaticamente i cookie (tra cui NoteNestJWT)
//    - Nessun body necessario per questa richiesta
//
// 2. SERVER: Riceve la richiesta
//    - Estrae tutti i cookie dalla richiesta
//    - Recupera specificamente il cookie NoteNestJWT
//
// 3. SERVER: Verifica autenticazione
//    - Controlla se il token esiste
//    - Verifica la validità del token con jwt.verify()
//    - Estrae l'ID utente dal token decodificato
//
// 4. SERVER: Crea la nota
//    - Usa Prisma per inserire un nuovo record nel database
//    - La nota è associata all'utente tramite userId
//    - La nota inizia con testo vuoto
//
// 5. SERVER: Risponde al client
//    - Ritorna l'oggetto della nota appena creata come JSON
//    - Include id, text, userId, createdAt, updatedAt
//
// 6. CLIENT: Riceve la risposta
//    - Aggiunge la nuova nota all'array locale notes
//    - Seleziona automaticamente la nuova nota (vedi index.vue)
//    - L'utente può iniziare a scrivere immediatamente
