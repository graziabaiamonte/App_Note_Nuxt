<template>
  <div class="flex bg-black h-screen">
    <!-- Sidebar -->
    <div class="bg-zinc-900 w-[516px] p-12 flex flex-col justify-center">
      <Logo />

      <h1 class="text-white font-bold text-lg mt-8">
        Sign up for a free account
      </h1>

      <p class="text-zinc-300 text-sm mt-0.5">
        Already registered?
        <nuxt-link to="/login" class="font-bold text-[#FFAC00] underline"
          >Log in</nuxt-link
        >
        to your account
      </p>

      <!-- Form -->
      <form @submit.prevent="submit">
        <div class="mt-8">
          <label for="" class="text-zinc-300 text-sm block mb-0.5"
            >Email Address</label
          >
          <!-- Input email collegato tramite v-model alla variabile reattiva 'email' -->
          <input
            v-model="email"
            placeholder="you@example.com"
            type="email"
            class="block w-full bg-[#27272A] border border-[#3F3F46] rounded text-white px-4 py-2 placeholder:text-zinc-500 text-sm"
          />
        </div>

        <div class="mt-6">
          <label for="" class="text-zinc-300 text-sm block mb-0.5"
            >Password</label
          >
          <!-- Input password collegato tramite v-model alla variabile reattiva 'password' -->
          <!-- Type "password" nasconde i caratteri inseriti -->
          <input
            v-model="password"
            placeholder="****************"
            type="password"
            class="block w-full bg-[#27272A] border border-[#3F3F46] rounded text-white px-4 py-2 placeholder:text-zinc-500 text-sm"
          />
        </div>

        <div>
          <button
            class="w-full mt-4 bg-[#FFAC00] rounded-full px-4 py-2 text-sm font-bold flex justify-center items-center space-x-2"
          >
            <span>Sign Up</span>
            <ArrowRight />
          </button>
        </div>
      </form>
    </div>
    <!-- Fine sezione sidebar -->
  </div>
</template>

<script setup>
// per modali di conferma/errore
import Swal from "sweetalert2";

// Creazione di una ref reattiva per memorizzare il valore dell'email inserita dall'utente
// ref() è una funzione di Vue 3 Composition API che rende una variabile reattiva
const email = ref("");
const password = ref("");

// Funzione asincrona che gestisce il submit del form di registrazione
async function submit() {
  try {
    // Effettua una chiamata HTTP POST all'endpoint API '/api/user' usando $fetch (utility Nuxt)
    // Invia nel body i dati email e password (.value è necessario per accedere al valore delle ref)
    const response = await $fetch("/api/user", {
      method: "POST",
      body: {
        email: email.value,
        password: password.value,
      },
    });

    // Mostra un popup di successo  e attende la conferma dell'utente
    // La destrutturazione estrae isConfirmed per verificare se l'utente ha cliccato il bottone
    const { isConfirmed } = await Swal.fire({
      title: "Success!",
      text: "Account created successfully.",
      icon: "success",
      confirmButtonText: "Close",
    });

    // Se l'utente ha confermato (cliccato sul bottone "Close")
    if (isConfirmed) {
      // Naviga alla home page ('/') usando la funzione navigateTo di Nuxt
      navigateTo("/");
    }
  } catch (error) {
    // Blocco catch che gestisce eventuali errori durante la registrazione

    // Log dell'etichetta ERROR nella console per debug
    console.log("ERROR:");

    // Log del messaggio di errore specifico restituito dall'API
    // Usa optional chaining (?.) per evitare errori se la struttura della risposta è diversa
    console.log(error.response?._data?.message);

    // Mostra un popup di errore usando SweetAlert2
    // Visualizza il messaggio di errore ricevuto dall'API
    Swal.fire({
      title: "Error!",
      text: error.response?._data?.message,
      icon: "error",
      confirmButtonText: "Close",
    });
  }
}
</script>
