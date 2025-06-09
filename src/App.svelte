<script lang="ts">
  import { onMount } from "svelte";
  import { getAuth, signInAnonymously } from "firebase/auth";
  import { app } from "./lib/firebase";
  import {
    isLoading,
    modal,
    listenToPurchaseRequests,
    showMessage,
  } from "./lib/stores";

  // Component Imports
  import Dashboard from "./lib/components/DashBoard.svelte";
  import Category from "./lib/components/Category.svelte";
  import Supply from "./lib/components/Supply.svelte";
  import SupplyOps from "./lib/components/SupplyOps.svelte";

  // Type definition for the tabs
  type Tab = {
    id: "dashboard" | "category" | "supply" | "supply-ops";
    label: string;
  };

  const tabs: Tab[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "category", label: "Category" },
    { id: "supply", label: "Supply" },
    { id: "supply-ops", label: "Supply Ops" },
  ];

  let activeTab: Tab = tabs[0];
  let userId: string = "";
  let unsubscribe: (() => void) | null = null;

  onMount(() => {
    const auth = getAuth(app);
    try {
      signInAnonymously(auth).then((userCredential) => {
        userId = userCredential.user.uid;
        // Start listening to data changes after successful authentication
        unsubscribe = listenToPurchaseRequests();
      });
    } catch (error) {
      console.error("Authentication Error:", error);
      showMessage(
        "Authentication Error",
        "Could not sign in. Please check your connection and Firebase setup.",
      );
      $isLoading = false;
    }

    // Cleanup listener when the component is unmounted
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  });
</script>

<input
  type="checkbox"
  id="message-modal"
  class="modal-toggle"
  bind:checked={$modal.show}
/>
<div class="modal" role="dialog">
  <div class="modal-box">
    <h3 class="font-bold text-lg">{$modal.title}</h3>
    <p class="py-4">{$modal.message}</p>
    <div class="modal-action">
      <label for="message-modal" class="btn btn-primary">OK</label>
    </div>
  </div>
  <label class="modal-backdrop" for="message-modal">Close</label>
</div>

<div class="p-4 md:p-8 bg-base-200 min-h-screen font-sans">
  <div class="max-w-7xl mx-auto">
    <header class="text-center bg-base-100 p-6 rounded-box shadow-md mb-8">
      <h1 class="text-4xl font-bold">Inventory Ordering System</h1>
      {#if userId}
        <p class="mt-2 text-xs text-base-content/70 font-mono">
          User ID: {userId}
        </p>
      {/if}
    </header>

    <div role="tablist" class="tabs tabs-lifted justify-center mb-8">
      <!-- svelte-ignore a11y_interactive_supports_focus -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_missing_attribute -->
      {#each tabs as tab (tab.id)}
        <!-- svelte-ignore a11y_interactive_supports_focus -->
        <a
          role="tab"
          class="tab"
          class:tab-active={activeTab.id === tab.id}
          on:click={() => (activeTab = tab)}
        >
          {tab.label}
        </a>
      {/each}
    </div>

    <main class="bg-base-100 p-6 rounded-box shadow-md min-h-[50vh]">
      {#if $isLoading}
        <div class="flex justify-center items-center h-full p-10">
          <span class="loading loading-lg loading-spinner text-primary"></span>
        </div>
      {:else if activeTab.id === "dashboard"}
        <Dashboard />
      {:else if activeTab.id === "category"}
        <Category {userId} />
      {:else if activeTab.id === "supply"}
        <Supply {userId} />
      {:else if activeTab.id === "supply-ops"}
        <SupplyOps {userId} />
      {/if}
    </main>
  </div>
</div>
