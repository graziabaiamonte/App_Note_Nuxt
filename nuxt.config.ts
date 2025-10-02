// Link alla documentazione ufficiale di Nuxt per la configurazione
// https://nuxt.com/docs/api/configuration/nuxt-config

// Esporta la configurazione di Nuxt usando la funzione defineNuxtConfig
// Questa funzione fornisce type-safety (controllo dei tipi) per TypeScript
export default defineNuxtConfig({
  // Configurazione dell'applicazione Nuxt
  app: {
    // Configurazione del tag <head> dell'HTML
    // Permette di aggiungere meta tag, link, script e altre informazioni nel <head>
    head: {
      // Array di tag <link> da inserire nel <head> di ogni pagina
      link: [
        {
          // Stabilisce una connessione anticipata (preconnect) con Google Fonts
          // Questo migliora le performance caricando prima la connessione al dominio
          rel: "preconnect",
          // URL del server di Google Fonts
          href: 'https://fonts.googleapis.com"',
        },
        {
          // Secondo preconnect per il CDN di Google Fonts (fonts.gstatic.com)
          // Questo è il server che ospita i file dei font veri e propri
          rel: "preconnect",
          // URL del CDN di Google Fonts
          href: "https://fonts.gstatic.com",
          // Attributo crossorigin per gestire le richieste CORS (Cross-Origin Resource Sharing)
          // 'anonymous' significa che le credenziali non vengono inviate con la richiesta
          crossorigin: "anonymous",
        },
        {
          // Carica il foglio di stile CSS dei font da Google Fonts
          rel: "stylesheet",
          // URL completo che specifica quali font caricare:
          // - Inter: font sans-serif moderno con pesi variabili (100-900)
          // - Playfair: font serif elegante con pesi variabili (300-900)
          // - display=swap: ottimizza il caricamento mostrando prima un font di sistema
          href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Playfair:ital,opsz,wght@0,5..1200,300..900;1,5..1200,300..900&display=swap",
        },
      ],
    },
  },

  // Data di compatibilità per garantire che Nuxt usi le impostazioni corrette
  // Fissa il comportamento di Nuxt alla versione del 1 novembre 2024
  // Questo previene breaking changes quando si aggiorna Nuxt
  compatibilityDate: "2024-11-01",

  // Configurazione degli strumenti di sviluppo (DevTools)
  // enabled: true attiva il pannello DevTools di Nuxt durante lo sviluppo
  // Permette di ispezionare componenti, route, payload, ecc.
  devtools: { enabled: true },

  // Array di file CSS globali da importare in tutta l'applicazione
  // '~/assets/main.css' è il percorso al file CSS principale
  // Il simbolo '~/' è un alias che punta alla root directory del progetto
  css: ["~/assets/main.css"],

  // Configurazione di PostCSS per processare i file CSS
  // PostCSS è uno strumento che trasforma CSS con plugin JavaScript
  postcss: {
    // Oggetto contenente i plugin PostCSS da utilizzare
    plugins: {
      // Plugin Tailwind CSS per processare le utility classes di Tailwind
      // L'oggetto vuoto {} usa la configurazione predefinita
      // Tailwind leggerà automaticamente il file tailwind.config.js se presente
      tailwindcss: {},

      // Plugin Autoprefixer per aggiungere automaticamente i prefissi vendor ai CSS
      // Esempio: transform diventa -webkit-transform, -ms-transform, transform
      // Garantisce compatibilità cross-browser senza scrivere prefissi manualmente
      autoprefixer: {},
    },
  },

  // Array di moduli Nuxt da installare e attivare nell'applicazione
  modules: [
    // Modulo @prisma/nuxt: integra Prisma ORM con Nuxt
    // Fornisce auto-import del client Prisma e funzionalità di database
    "@prisma/nuxt",

    // Modulo @vueuse/nuxt: integra VueUse con Nuxt
    // VueUse è una collezione di composables Vue utilities
    // Fornisce funzioni helper per reattività, gestione eventi, ecc.
    "@vueuse/nuxt",
  ],
});
