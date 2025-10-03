// Endpoint API POST per la creazione di nuovi utenti (/api/user)
// Gestisce la registrazione di nuovi account

// Salt
// - salt = stringa di caratteri casuali aggiunta all'inizio della password
//    - "mypassword123" diventa "x#fSA#Amypassword123"
// - Usato per prevenire che gli hacker usino tabelle hash precompilate per craccare una password
// - Ogni utente ottiene il proprio salt univoco, quindi anche se due utenti hanno la stessa password le loro password hashate appaiono completamente diverse

// NOTA: Per generare una chiave segreta JWT eseguire questo comando nel terminale:
// node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

// Import della libreria bcryptjs per l'hashing delle password
import bcrypt from "bcryptjs";

// Import della libreria validator per validare email e password
import validator from "validator";

// Import della libreria jsonwebtoken per creare token JWT di autenticazione
import jwt from "jsonwebtoken";

// Definizione del gestore dell'evento (event handler) per questa API
// defineEventHandler = funzione di Nuxt/h3 per creare endpoint API
export default defineEventHandler(async (event) => {
  // Blocco try per gestire eventuali errori durante l'esecuzione
  try {
    // Legge il corpo della richiesta HTTP (contenente email e password dall'utente)
    // readBody è una funzione asincrona che estrae i dati JSON inviati dal client
    const body = await readBody(event);

    // Validazione dell'email
    // Verifica che l'email abbia un formato valido (es: user@example.com)
    if (!validator.isEmail(body.email)) {
      throw createError({
        statusCode: 400,
        message: "Invalid email, please change.",
      });
    }

    // Validazione della password
    if (
      !validator.isStrongPassword(body.password, {
        // Richiede almeno 8 caratteri
        minLength: 8,
        // Non richiede lettere minuscole (0 = non obbligatorio)
        minLowercase: 0,
        minUppercase: 0,
        minNumbers: 0,
        // Non richiede simboli speciali
        minSymbols: 0,
      })
    ) {
      throw createError({
        statusCode: 400,
        message: "Password is not minimum 8 characters.",
      });
    }

    // Genera un salt casuale con complessità 10 (numero di round di hashing)
    // Più alto è il numero, più sicuro ma più lento è il processo
    const salt = await bcrypt.genSalt(10);

    // Crea l'hash della password combinando la password dell'utente con il salt
    // Questo produce una stringa crittografata che sarà salvata nel database
    const passwordHash = await bcrypt.hash(body.password, salt);

    // Commento che indica che i dati vengono inviati al database
    // Crea un nuovo record utente nel database usando Prisma
    const user = await prisma.user.create({
      // Oggetto data contenente i campi da inserire nel database
      data: {
        // Salva l'email fornita dall'utente
        email: body.email,
        // Salva la password hashata (NON la password in chiaro)
        password: passwordHash,
        // Salva il salt usato per hashare la password
        salt: salt,
      },
    });

    // Crea un token JWT  per autenticare l'utente
    // Il token contiene l'id dell'utente e viene firmato con una chiave segreta
    // process.env.JWT_SECRET è la chiave segreta letta dalle variabili d'ambiente
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    // Imposta un cookie nel browser dell'utente chiamato 'NoteNestJWT'
    // Questo cookie conterrà il token JWT e sarà usato per autenticare le richieste future
    setCookie(event, "NoteNestJWT", token);

    // Restituisce una risposta di successo al client
    return { data: "success!" };
  } catch (error) {
    // Blocco catch che gestisce gli errori durante la creazione dell'utente

    // Stampa il codice di errore nella console per debugging
    console.log(error.code);

    // Verifica se l'errore è di tipo P2002 (errore Prisma per vincolo unique violation)
    // Questo errore si verifica quando si tenta di inserire un'email già esistente
    if (error.code === "P2002") {
      // Lancia un errore HTTP 409 (Conflict)
      throw createError({
        statusCode: 409,
        message: "An email with this address already exists.",
      });
    }

    // Se l'errore non è P2002, rilancia l'errore originale
    // Questo permette di gestire altri tipi di errori (validazione, errori database, ecc.)
    throw error;
  }
});

// NOTA: Commenti sui metodi HTTP disponibili
// GET    - Recupera dati dal server
// POST   - Crea nuovi dati sul server (usato in questo file)
// PATCH  - Aggiorna parzialmente dati esistenti
// PUT    - Aggiorna completamente dati esistenti o li crea
// DELETE - Elimina dati dal server

// Riepilogo del flusso di registrazione:

// Ricezione dati: Riceve email e password dal client
// Validazione email: Verifica formato valido dell'email
// Validazione password: Verifica lunghezza minima di 8 caratteri
// Generazione salt: Crea una stringa casuale univoca
// Hashing password: Combina password + salt e crea l'hash
// Salvataggio database: Inserisce utente con email, password hashata e salt
// Creazione JWT: Genera token di autenticazione con id utente
// Impostazione cookie: Salva il token JWT in un cookie del browser
// Gestione errori: Controlla errori di duplicazione email (409) o altri errori

// Sicurezza implementata:

// Password mai salvata in chiaro
// Salt univoco per ogni utente
// Validazione input per prevenire dati invalidi
// JWT per autenticazione stateless
// Gestione errori specifica per email duplicate
