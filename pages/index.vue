<template>
  <!-- Contenitore principale con flex layout, sfondo scuro e altezza piena dello schermo -->
  <div class="flex bg-zinc-900 h-screen">
    <!-- SIDEBAR -->
    <div class="bg-black w-[338px] p-8 flex flex-col overflow-scroll">
      <div>
        <Logo />
      </div>

      <!-- SEZIONE "TODAY" -->
      <div class="flex-grow">
        <p class="text-xs font-bold text-[#C2C2C5] mt-12 mb-4">Today</p>

        <!-- Contenitore per la lista delle note con margine sinistro e spaziatura verticale -->
        <div class="ml-2 space-y-2">
          <!-- Loop attraverso tutte le note di oggi -->
          <!-- v-for itera sull'array todaysNotes e crea un elemento per ogni nota -->
          <div
            v-for="note in todaysNotes"
            class="p-2 rounded-lg cursor-pointer"
            :class="{
              'bg-[#A1842C]': note.id === selectedNote.id,
              'hover:bg-[#A1842C]/50': note.id !== selectedNote.id,
            }"
            @click="setNote(note)"
          >
            <h3 class="text-sm font-bold text-[#F4F4F5] truncate">
              <!-- Mostra i primi 50 caratteri del testo della nota -->
              {{ note.text.substring(0, 50) }}
            </h3>

            <div class="leading-none truncate text-[#D6D6D6]">
              <span class="text-xs text-[#F4F4F5] mr-4">{{
                new Date(note.updatedAt).toLocaleDateString()
              }}</span>

              <!-- v-if rende questo elemento solo se la condizione è vera -->
              <span v-if="note.text.length > 50" class="text-xs text-[#D6D6D6]"
                >... {{ note.text.substring(50, 100) }}</span
              >
            </div>
          </div>
        </div>
      </div>
      <!-- /FINE SEZIONE TODAY -->

      <!-- SEZIONE "YESTERDAY" - Contenitore per le note di ieri -->
      <div>
        <!-- Titolo della sezione con margine superiore, inferiore e colore grigio -->
        <p class="text-xs font-bold text-[#C2C2C5] mt-12 mb-4">Yesterday</p>

        <!-- Contenitore per la lista delle note di ieri -->
        <div class="ml-2 space-y-2">
          <!-- Loop attraverso tutte le note di ieri -->
          <div
            v-for="note in yesterdaysNotes"
            class="p-2 rounded-lg cursor-pointer"
            :class="{
              'bg-[#A1842C]': note.id === selectedNote.id,
              'hover:bg-[#A1842C]/50': note.id !== selectedNote.id,
            }"
            @click="setNote(note)"
          >
            <!-- Titolo della nota troncato ai primi 50 caratteri -->
            <h3 class="text-sm font-bold text-[#F4F4F5] truncate">
              {{ note.text.substring(0, 50) }}
            </h3>

            <!-- Contenitore per metadata della nota -->
            <div class="leading-none truncate text-[#D6D6D6]">
              <!-- Mostra "Today" se la data è oggi, altrimenti mostra la data formattata -->
              <span class="text-xs text-[#F4F4F5] mr-4">{{
                new Date(note.updatedAt).toDateString() ===
                new Date().toDateString()
                  ? "Today"
                  : new Date(note.updatedAt).toLocaleDateString()
              }}</span>
              <!-- Preview del testo se supera i 50 caratteri -->
              <span v-if="note.text.length > 50" class="text-xs text-[#D6D6D6]"
                >... {{ note.text.substring(50, 100) }}</span
              >
            </div>
          </div>
        </div>
      </div>
      <!-- /FINE SEZIONE YESTERDAY -->

      <!-- SEZIONE "EARLIER" - Contenitore per le note più vecchie -->
      <div>
        <!-- Titolo della sezione -->
        <p class="text-xs font-bold text-[#C2C2C5] mt-12 mb-4">Earlier</p>

        <!-- Contenitore per la lista delle note più vecchie -->
        <div class="ml-2 space-y-2">
          <!-- Loop attraverso tutte le note precedenti a ieri -->
          <div
            v-for="note in earlierNotes"
            class="p-2 rounded-lg cursor-pointer"
            :class="{
              'bg-[#A1842C]': note.id === selectedNote.id,
              'hover:bg-[#A1842C]/50': note.id !== selectedNote.id,
            }"
            @click="setNote(note)"
          >
            <!-- Titolo della nota -->
            <h3 class="text-sm font-bold text-[#F4F4F5] truncate">
              {{ note.text.substring(0, 50) }}
            </h3>

            <!-- Metadata con data e preview -->
            <div class="leading-none truncate text-[#D6D6D6]">
              <span class="text-xs text-[#F4F4F5] mr-4">{{
                new Date(note.updatedAt).toDateString() ===
                new Date().toDateString()
                  ? "Today"
                  : new Date(note.updatedAt).toLocaleDateString()
              }}</span>
              <span v-if="note.text.length > 50" class="text-xs text-[#D6D6D6]"
                >... {{ note.text.substring(50, 100) }}</span
              >
            </div>
          </div>
        </div>
      </div>
      <!-- /FINE SEZIONE EARLIER -->
    </div>
    <!-- /FINE SIDEBAR -->

    <!-- CONTENITORE PRINCIPALE DELLA NOTA -->
    <!-- Occupa tutta la larghezza rimanente con layout flex in colonna -->
    <div class="w-full flex flex-col">
      <!-- BARRA SUPERIORE con pulsanti di azione -->
      <!-- flex con justify-between distribuisce gli elementi agli estremi -->
      <div class="flex justify-between w-full items-start p-8">
        <!-- Pulsante per creare una nuova nota -->
        <!-- inline-flex allinea icona e testo orizzontalmente -->
        <button
          class="inline-flex items-center text-xs text-[#C2C2C5] hover:text-white font-bold space-x-2"
          @click="createNewNote"
        >
          <!-- Icona della matita -->
          <PencilIcon />
          <!-- Testo del pulsante -->
          <span>Create Note</span>
        </button>

        <!-- Pulsante per eliminare la nota corrente -->
        <button>
          <!-- Icona del cestino con effetto hover -->
          <TrashIcon
            class="text-[#6D6D73] hover:text-white"
            @click="deleteNote"
          />
        </button>
      </div>

      <!-- AREA DI EDITING DELLA NOTA -->
      <div class="max-w-[437px] mx-auto w-full flex-grow flex flex-col">
        <!-- Data di ultimo aggiornamento della nota con font Playfair -->
        <p class="text-[#929292] font-playfair">
          {{ new Date(selectedNote.updatedAt).toLocaleDateString() }}
        </p>

        <!-- TEXTAREA per l'editing del testo della nota -->
        <!-- ref crea un riferimento a questo elemento per accedervi programmaticamente -->
        <!--    v-model crea un binding bidirezionale con la variabile updatedNote  -->
        <textarea
          ref="textarea"
          v-model="updatedNote"
          name="note"
          id="note"
          class="text-[#D4D4D4] my-4 font-playfair w-full bg-transparent focus:outline-none resize-none flex-grow"
          @input="
            () => {
              // evento input che si attiva ad ogni modifica del testo
              // Chiama la funzione debounced che aspetta 1 secondo prima di salvare
              debouncedFn();
              // Aggiorna immediatamente il testo nella nota selezionata
              selectedNote.text = updatedNote;
            }
          "
        >
        </textarea>
      </div>

      <!-- PULSANTE DI LOGOUT -->
      <button
        class="text-zinc-400 hover:text-white text-sm font-bold absolute right-0 bottom-0 p-8"
        @click="logout"
      >
        Logout
      </button>
    </div>
    <!-- /FINE CONTENITORE NOTA -->
  </div>
</template>

<script setup>
import Swal from "sweetalert2";

// Variabile reattiva che contiene il testo della nota attualmente in modifica
const updatedNote = ref("");

// Array reattivo che contiene tutte le note dell'utente
const notes = ref([]);

// Oggetto reattivo che contiene la nota attualmente selezionata
const selectedNote = ref({});

// Riferimento all'elemento textarea per poterlo manipolare (es. focus)
const textarea = ref(null);

// Definisce i metadata della pagina, specificando che richiede autenticazione
// Il middleware 'auth' verrà eseguito prima di caricare questa pagina
definePageMeta({
  middleware: ["auth"],
});

// Funzione che imposta una nota come selezionata
// Prende una nota come parametro e la rende attiva
function setNote(note) {
  // Imposta la nota selezionata
  selectedNote.value = note;
  // Sincronizza il contenuto della textarea con il testo della nota
  updatedNote.value = note.text;
}

// Funzione per effettuare il logout
function logout() {
  // Recupera il cookie JWT utilizzato per l'autenticazione
  const jwtCookie = useCookie("NoteNestJWT");
  // Cancella il cookie impostandolo a null
  jwtCookie.value = null;
  navigateTo("/login");
}

async function deleteNote() {
  const { isConfirmed } = await Swal.fire({
    title: "Are you sure?",
    text: "This will delete your note permanently, are you extra sure you like to do this?",
    icon: "warning",
    confirmButtonText: "Yes, delete",
    showCancelButton: true,
  });

  // Se l'utente ha confermato l'eliminazione
  if (isConfirmed) {
    // Effettua una richiesta DELETE all'API per eliminare la nota dal database
    await $fetch(`/api/notes/${selectedNote.value.id}`, {
      method: "DELETE",
    });

    // Trova l'indice della nota eliminata nell'array locale
    const index = notes.value.findIndex((note) => {
      return note.id === selectedNote.value.id;
    });
    // Log dell'indice per debugging
    console.log(index);
    // Rimuove la nota dall'array locale usando splice
    // splice(index, 1) rimuove 1 elemento dalla posizione 'index'
    notes.value.splice(index, 1);
  }
}

// Funzione asincrona per creare una nuova nota
async function createNewNote() {
  try {
    // Effettua una richiesta POST all'API per creare una nuova nota
    const newNote = await $fetch(`/api/notes`, {
      method: "POST",
    });

    // Aggiunge la nuova nota all'inizio dell'array (posizione 0)
    notes.value.unshift(newNote);
    // Seleziona automaticamente la nuova nota creata
    selectedNote.value = notes.value[0];
    // Svuota il contenuto della textarea
    updatedNote.value = "";
    // Mette il focus sulla textarea per iniziare subito a scrivere
    textarea.value.focus();
  } catch (err) {
    // In caso di errore, lo registra nella console
    console.log(err);
  }
}

// Crea una versione "debounced" della funzione updateNote
// useDebounceFn ritarda l'esecuzione della funzione di 1000ms (1 secondo)
// Questo evita di salvare ad ogni singola pressione di tasto
const debouncedFn = useDebounceFn(async () => {
  await updateNote();
}, 1000);

// Funzione asincrona per aggiornare il contenuto di una nota
async function updateNote() {
  try {
    // Effettua una richiesta PATCH all'API per aggiornare la nota
    await $fetch(`/api/notes/${selectedNote.value.id}`, {
      method: "PATCH",
      // Invia il nuovo testo della nota nel body della richiesta
      body: {
        updatedNote: updatedNote.value,
      },
    });
  } catch (err) {
    // In caso di errore, lo registra nella console
    console.log(err);
  }
}

// Computed property che calcola dinamicamente le note di oggi
// computed() crea una proprietà reattiva che si ricalcola quando le sue dipendenze cambiano
const todaysNotes = computed(() => {
  // Filtra l'array delle note
  return notes.value.filter((note) => {
    // Crea un oggetto Date dalla data di aggiornamento della nota
    const noteDate = new Date(note.updatedAt);
    // Ritorna true solo se la data della nota corrisponde alla data odierna
    // toDateString() restituisce solo la data senza orario, permettendo il confronto
    return noteDate.toDateString() === new Date().toDateString();
  });
});

// Computed property per le note di ieri
const yesterdaysNotes = computed(() => {
  // Crea un oggetto Date per oggi
  const yesterday = new Date();
  // Sottrae 1 giorno per ottenere la data di ieri
  yesterday.setDate(yesterday.getDate() - 1);

  // Filtra le note che corrispondono alla data di ieri
  return notes.value.filter((note) => {
    const noteDate = new Date(note.updatedAt);
    // Confronta solo le date (senza orario)
    return noteDate.toDateString() === yesterday.toDateString();
  });
});

// Computed property per le note precedenti a ieri
const earlierNotes = computed(() => {
  // Calcola la data di ieri
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Filtra le note che sono più vecchie di ieri
  return notes.value.filter((note) => {
    const noteDate = new Date(note.updatedAt);
    // Ritorna true se la nota è precedente a ieri
    // E verifica anche che non sia esattamente ieri (doppio controllo)
    return (
      noteDate < yesterday &&
      noteDate.toDateString() !== yesterday.toDateString()
    );
  });
});

// Hook del ciclo di vita che viene eseguito quando il componente è montato nel DOM
onMounted(async () => {
  // Effettua una richiesta GET per recuperare tutte le note dell'utente
  notes.value = await $fetch("/api/notes");

  // Ordina le note per data di aggiornamento in ordine decrescente (più recenti prima)
  // sort() modifica l'array originale
  // (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt) ordina dal più recente al più vecchio
  notes.value.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  // Se esistono note, seleziona la prima (la più recente)
  if (notes.value.length > 0) selectedNote.value = notes.value[0];
  else {
    // Se non esistono note, crea una nuova nota automaticamente
    await createNewNote();
    // Seleziona la nota appena creata
    selectedNote.value = notes.value[0];
  }

  // Sincronizza il contenuto della textarea con la nota selezionata
  updatedNote.value = selectedNote.value.text;

  // Mette il focus sulla textarea per permettere all'utente di iniziare a scrivere subito
  textarea.value.focus();
});
</script>
