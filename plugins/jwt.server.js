// Importa la libreria jsonwebtoken che fornisce funzionalità per creare e verificare JWT
// jwt è l'oggetto che contiene i metodi sign(), verify(), decode(), ecc.
import jwt from "jsonwebtoken";

// Definisce un plugin Nuxt utilizzando la funzione helper defineNuxtPlugin
// I plugin Nuxt permettono di estendere le funzionalità dell'applicazione
// e rendere disponibili funzioni/utilità in tutta l'app
// nuxtApp è l'istanza dell'applicazione Nuxt passata automaticamente
export default defineNuxtPlugin((nuxtApp) => {
  // Il plugin deve ritornare un oggetto con una proprietà 'provide'
  // Questo oggetto definisce cosa verrà reso disponibile globalmente nell'app
  return {
    // La proprietà 'provide' permette di iniettare funzioni/variabili
    // nell'istanza dell'app Nuxt, rendendole accessibili ovunque
    provide: {
      // Definisce una funzione chiamata 'verifyJwtToken' che verrà resa disponibile
      // in tutta l'applicazione con il prefisso '$' (quindi: $verifyJwtToken)
      //
      // Parametri della funzione:
      // - token: il JWT string che deve essere verificato (formato: header.payload.signature)
      // - secret: la chiave segreta usata per firmare il token (deve corrispondere a quella usata in fase di creazione)
      // - options: (opzionale) oggetto con opzioni aggiuntive per la verifica, come:
      //   * algorithms: array degli algoritmi accettati (es. ['HS256'])
      //   * audience: il pubblico previsto del token
      //   * issuer: l'emittente previsto del token
      //   * ignoreExpiration: se true, ignora la scadenza del token
      //   * maxAge: età massima del token in secondi
      verifyJwtToken: (token, secret, options) => {
        // Chiama il metodo verify() della libreria jsonwebtoken
        // jwt.verify() esegue le seguenti operazioni:
        // 1. Decodifica il token JWT (separa header, payload e signature)
        // 2. Verifica che il token non sia stato manomesso confrontando la signature
        // 3. Controlla che il token non sia scaduto (campo 'exp' nel payload)
        // 4. Valida eventuali claims aggiuntivi specificati nelle options
        //
        // Se tutto è valido, ritorna il payload decodificato (oggetto con i dati dell'utente)
        // Se qualcosa non va, lancia un'eccezione (JsonWebTokenError, TokenExpiredError, ecc.)
        return jwt.verify(token, secret, options);
      },
    },
  };
});

// NOTA IMPORTANTE SULLA NOMENCLATURA:
// Il nome del file termina con '.server.js' invece del normale '.js'
// Questo è un pattern speciale di Nuxt che indica che questo plugin
// deve essere eseguito SOLO lato server e MAI sul client (browser)
//
//
// Altri suffissi disponibili in Nuxt:
// - .client.js -> eseguito SOLO sul client/browser
// - .server.js -> eseguito SOLO sul server
// - .js -> eseguito sia su client che su server (universale)

// POSSIBILI ERRORI LANCIATI DA jwt.verify():
// - JsonWebTokenError: token malformato o signature non valida
// - TokenExpiredError: token scaduto (campo exp superato)
// - NotBeforeError: token utilizzato prima del tempo specificato (campo nbf)
// Tutti questi errori devono essere gestiti con try-catch

// Struttura del Plugin

// Definizione Plugin: Usa defineNuxtPlugin per creare un plugin che estende Nuxt
// Provider: Usa provide per rendere la funzione disponibile globalmente con il prefisso $
// Wrapper: La funzione verifyJwtToken è un wrapper attorno a jwt.verify() della libreria jsonwebtoken

// Come Funziona jwt.verify()
// La funzione esegue 4 controlli critici:

// Decodifica il token nelle sue tre parti
// Verifica l'integrità usando la signature
// Controlla la scadenza (campo exp)
// Valida eventuali claims aggiuntivi
