// Importa bcryptjs, una libreria per l'hashing e il confronto sicuro delle password
// bcrypt usa algoritmi crittografici per rendere le password illeggibili anche se il database viene compromesso
import bcrypt from "bcryptjs";

// Importa validator, una libreria per validare e sanitizzare stringhe
// Fornisce metodi per verificare email, password forti, URL, ecc.
import validator from "validator";

// Importa jsonwebtoken per creare e firmare JWT (JSON Web Tokens)
// Usato per creare token di autenticazione dopo un login riuscito
import jwt from "jsonwebtoken";

// Definisce un handler per gli eventi HTTP in Nuxt
// Questo handler gestisce le richieste POST all'endpoint /api/login
// Il nome del file (login.post.js) determina automaticamente:
// - Route: /api/login
// - Metodo HTTP: POST
export default defineEventHandler(async (event) => {
  // Blocco try-catch per gestire tutti gli errori che possono verificarsi durante il login
  try {
    // Legge il corpo della richiesta HTTP in arrivo
    // readBody() è una funzione helper di Nuxt che:
    // 1. Estrae i dati JSON dal body della richiesta
    // 2. Li converte automaticamente in un oggetto JavaScript
    // body conterrà tipicamente: { email: '...', password: '...' }
    const body = await readBody(event);

    // VALIDAZIONE EMAIL
    // Verifica che l'email fornita sia in un formato valido
    // validator.isEmail() controlla:
    // - Presenza di @ con dominio
    // - Formato corretto (user@domain.com)
    // - Nessun carattere non valido
    if (!validator.isEmail(body.email)) {
      // Se l'email non è valida, crea e lancia un errore HTTP
      // createError() è una funzione di Nuxt per creare errori strutturati
      throw createError({
        // Codice di stato HTTP 400 = Bad Request (richiesta malformata)
        statusCode: 400,
        // Messaggio di errore che verrà ritornato al client
        message: "Invalid email, please change.",
      });
    }

    // VALIDAZIONE PASSWORD
    // Verifica che la password rispetti i requisiti minimi di sicurezza
    // validator.isStrongPassword() accetta opzioni personalizzate:
    if (
      !validator.isStrongPassword(body.password, {
        // minLength: 8 -> la password deve essere lunga almeno 8 caratteri
        minLength: 8,
        // minLowercase: 0 -> non richiede lettere minuscole (0 = nessuna richiesta)
        minLowercase: 0,
        // minUppercase: 0 -> non richiede lettere maiuscole
        minUppercase: 0,
        // minNumbers: 0 -> non richiede numeri
        minNumbers: 0,
        // minSymbols: 0 -> non richiede simboli speciali
        minSymbols: 0,
      })
    ) {
      // Se la password non rispetta i requisiti (meno di 8 caratteri), lancia un errore
      throw createError({
        statusCode: 400,
        message: "Password is not minimum 8 characters, please change.",
      });
    }

    // RICERCA UTENTE NEL DATABASE
    // Usa Prisma ORM per cercare un utente nel database
    // prisma.user.findUnique() cerca un record univoco nella tabella 'user'
    const user = await prisma.user.findUnique({
      // where specifica i criteri di ricerca
      where: {
        // Cerca un utente con l'email fornita
        // Prisma si aspetta che 'email' sia un campo univoco nel database
        email: body.email,
      },
    });
    // Se l'utente non esiste, user sarà null
    // NOTA: Non viene gestito esplicitamente qui, ma causerà un errore
    // quando si tenta di accedere a user.password più avanti

    // VERIFICA PASSWORD
    // Confronta la password in chiaro fornita dall'utente con l'hash nel database
    // bcrypt.compare() esegue:
    // 1. Prende la password in chiaro (body.password)
    // 2. Prende l'hash dal database (user.password)
    // 3. Applica lo stesso algoritmo di hashing alla password in chiaro
    // 4. Confronta il risultato con l'hash salvato
    // 5. Ritorna true se corrispondono, false altrimenti
    const isValid = await bcrypt.compare(body.password, user.password);

    // Log di debug per verificare se la password è corretta
    console.log("IS VALID:");
    console.log(isValid);

    // Se la password non è valida (non corrisponde all'hash)
    if (!isValid) {
      // Lancia un errore generico per motivi di sicurezza
      // NOTA DI SICUREZZA: Il messaggio non specifica se è l'email o la password
      // ad essere sbagliata. Questo previene attacchi di enumerazione degli utenti
      // (un attaccante non può scoprire quali email sono registrate)
      throw createError({
        statusCode: 400,
        message: "Username or password is invalid.",
      });
    }

    // CREAZIONE TOKEN JWT
    // Se arriviamo qui, email e password sono corretti
    // jwt.sign() crea un nuovo token JWT firmato
    // Parametri:
    // 1. Payload: { id: user.id } -> i dati da includere nel token (solo l'ID utente)
    // 2. Secret: process.env.JWT_SECRET -> la chiave segreta per firmare il token
    //    Questa chiave deve essere identica a quella usata per verificare il token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    // OPZIONI AGGIUNTIVE (non usate qui ma disponibili):
    // jwt.sign({ id: user.id }, secret, {
    //   expiresIn: '7d',        // scadenza del token (es. 7 giorni)
    //   issuer: 'notenest-app', // chi ha emesso il token
    //   audience: 'users'       // per chi è destinato il token
    // })

    // IMPOSTAZIONE COOKIE
    // setCookie() è una funzione helper di Nuxt per impostare cookie HTTP
    // Parametri:
    // 1. event: l'oggetto evento HTTP corrente
    // 2. 'NoteNestJWT': nome del cookie
    // 3. token: valore del cookie (il JWT appena creato)
    setCookie(event, "NoteNestJWT", token);

    // OPZIONI AGGIUNTIVE DEL COOKIE (non usate qui ma consigliate):
    // setCookie(event, 'NoteNestJWT', token, {
    //   httpOnly: true,   // impedisce l'accesso via JavaScript (previene XSS)
    //   secure: true,     // invia solo su HTTPS
    //   sameSite: 'lax',  // protezione CSRF
    //   maxAge: 604800    // durata in secondi (7 giorni)
    // })

    // RISPOSTA DI SUCCESSO
    // Ritorna un oggetto JSON al client per confermare il login riuscito
    // Questo verrà serializzato automaticamente in JSON da Nuxt
    return { data: "success!" };
  } catch (error) {
    // GESTIONE ERRORI
    // Questo blocco catch cattura qualsiasi errore lanciato nel try

    // Log del codice di errore per debugging
    // error.code è una proprietà specifica di alcuni errori (es. Prisma)
    console.log(error.code);

    // GESTIONE ERRORE PRISMA SPECIFICO
    // 'P2002' è il codice errore Prisma per violazione di vincolo univoco
    // Questo errore si verifica quando si cerca di inserire un valore duplicato
    // in un campo con vincolo UNIQUE (es. email già esistente)
    if (error.code === "P2002") {
      // Crea un errore HTTP 409 Conflict
      throw createError({
        // 409 = Conflict: la richiesta non può essere completata a causa di un conflitto
        statusCode: 409,
        message: "An email with this address already exists.",
      });
    }

    // Se l'errore non è P2002, rilancia l'errore originale
    // Questo permette agli errori createError() precedenti di propagarsi correttamente
    // e garantisce che errori imprevisti vengano gestiti dal sistema di error handling di Nuxt
    throw error;
  }
});

// FLUSSO COMPLETO DEL LOGIN:
// 1. Client invia POST a /api/login con { email, password }
// 2. Server valida formato email
// 3. Server valida lunghezza password (min 8 caratteri)
// 4. Server cerca utente nel database per email
// 5. Server confronta password con hash bcrypt
// 6. Se valido: crea JWT con user.id
// 7. Imposta JWT come cookie nel browser
// 8. Ritorna successo al client
// 9. Client può ora accedere a route protette usando il cookie JWT
