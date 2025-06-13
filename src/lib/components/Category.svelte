<script lang="ts">
    import { onMount } from "svelte";
    import { purchaseRequests, showMessage } from "../stores";
    import {
        getFirestore,
        addDoc,
        updateDoc,
        doc,
        collection,
    } from "firebase/firestore";
    import { app } from "../firebase";
    import type { PurchaseRequest, SKU, HistoryLog, Vendor } from "../types";

    export let userId: string;
    const db = getFirestore(app);

    // State
    let proposedWh = "";
    let formSkus: Partial<SKU>[] = [{ sku: "", quantity: 1, expectedPrice: 0 }];
    let zone = "";

    // Derived state
    $: pendingMyApproval = $purchaseRequests.filter(
        (r: PurchaseRequest) => r.status === "Pending Category Approval",
    );

    let selectedVendors: Record<string, Record<string, string>> = {};
    let showConfirmationModal = false;
    let currentRequestForApproval: PurchaseRequest | null = null;

    // Warehouse data
    const wareHouses = [
        "Gurugram WH",
        "Patna WH",
        "Cuttack WH",
        "Kanpur WH",
        "Indore WH",
        "Jabalpur WH",
        "Pune WH",
        "Bangalore WH",
    ];

    const autoFillZoneMapping: Record<string, string> = {
        "Gurugram WH": "North",
        "Patna WH": "East",
        "Cuttack WH": "Odisha",
        "Kanpur WH": "North",
        "Indore WH": "Central",
        "Jabalpur WH": "Central",
        "Pune WH": "West",
        "Bangalore WH": "South",
    };

    // Update zone when warehouse changes
    $: if (proposedWh) {
        zone = autoFillZoneMapping[proposedWh] || "";
    } else {
        zone = "";
    }

    // Methods
    function addSku() {
        formSkus = [...formSkus, { sku: "", quantity: 1, expectedPrice: 0 }];
    }

    function removeSku(index: number) {
        formSkus = formSkus.filter((_, i) => i !== index);
    }

    function onProposedWhChange(event: Event) {
        proposedWh = (event.target as HTMLSelectElement).value;
    }

    function onSkuIdChange(event: Event, index: number) {
        const skuId = (event.target as HTMLInputElement).value;
        // TODO: Add any SKU ID change handling
    }

    function updateSkuField<T extends keyof SKU>(
        index: number,
        field: T,
        value: SKU[T],
    ) {
        formSkus = formSkus.map((sku, i) =>
            i === index ? { ...sku, [field]: value } : sku,
        );
    }

    function areAllSkusSelectedForRequest(request: PurchaseRequest): boolean {
        return request.skus.every(sku => 
            selectedVendors[request.id]?.[sku.sku]
        );
    }

    async function handleInitiateRequest() {
        if (
            !proposedWh ||
            formSkus.some((s) => !s.sku || !s.quantity || s.quantity <= 0)
        ) {
            console.log("Invalid input", { proposedWh, formSkus });
            showMessage(
                "Invalid Input",
                "Please fill all fields, including a valid SKU and quantity for each item.",
            );
            return;
        }

        const newRequest: Omit<PurchaseRequest, "id"> = {
            proposedWh,
            skus: formSkus.map((sku) => ({
                sku: sku.sku || "", // Ensure sku is always a string
                quantity: Number(sku.quantity) || 0,
                expectedPrice: Number(sku.expectedPrice) || 0,
                vendors: [],
                // Coalesce potentially undefined values to null
                unmaskedProductName: sku.unmaskedProductName || null,
                superCategory: sku.superCategory || null,
                brand: sku.brand || null,
                asv: sku.asv || null,
                seasonality: sku.seasonality || null,
                seasonDuration: sku.seasonDuration || null,
            })),
            status: "Pending Supply Input",
            initiatedBy: userId,
            history: [
                {
                    status: "Pending Supply Input",
                    user: userId,
                    timestamp: Date.now(),
                },
            ],
            createdAt: Date.now(),
        };

        try {
            await addDoc(collection(db, "purchaseRequests"), newRequest);
            showMessage(
                "Success",
                "Purchase request has been sent to the Supply team.",
            );

            // Reset form
            proposedWh = "";
            formSkus = [{ sku: "", quantity: 1, expectedPrice: 0 }];
        } catch (e: any) {
            showMessage("Error", `Could not create the request: ${e.message}`);
            console.error(e);
        }
    }

    async function handleVendorApproval(
        request: PurchaseRequest,
        skuIndex: number,
        approvedVendorId: string,
    ) {
        const requestRef = doc(db, "purchaseRequests", request.id);
        const updatedSkus = request.skus.map((sku, index) =>
            index === skuIndex
                ? {
                      ...sku,
                      vendors: sku.vendors.map((vendor) => ({
                          ...vendor,
                          vendorStatus:
                              vendor.vendorId === approvedVendorId
                                  ? "Approved"
                                  : "Rejected",
                      })),
                  }
                : sku,
        );

        const allApproved = updatedSkus.every((sku) =>
            sku.vendors.some((v) => v.vendorStatus === "Approved"),
        );

        const newStatus = allApproved
            ? "Approved - Pending PO Creation"
            : request.status;

        const newHistoryLog: HistoryLog = {
            status: newStatus,
            user: userId,
            timestamp: Date.now(),
        };

        try {
            await updateDoc(requestRef, {
                skus: updatedSkus,
                status: newStatus,
                history: [...request.history, newHistoryLog],
            });
            showMessage(
                "Success",
                `Vendor approval for SKU ${request.skus[skuIndex].sku} has been updated.`,
            );
        } catch (e: any) {
            showMessage(
                "Error",
                `Failed to update vendor approval: ${e.message}`,
            );
            console.error(e);
        }
    }

    // Add these functions in your script section

    function handleVendorSelection(requestId: string, skuId: string, vendorId: string) {
        if (!selectedVendors[requestId]) {
            selectedVendors[requestId] = {};
        }
        selectedVendors[requestId][skuId] = vendorId;
    }

    function isSkuVendorSelected(requestId: string, skuId: string): boolean {
        return !!selectedVendors[requestId]?.[skuId];
    }

    function showApprovalConfirmation(request: PurchaseRequest) {
        currentRequestForApproval = request;
        showConfirmationModal = true;
    }

    async function handleBulkVendorApproval(request: PurchaseRequest) {
        if (!request) return;

        const requestRef = doc(db, "purchaseRequests", request.id);
        
        const updatedSkus = request.skus.map(sku => ({
            ...sku,
            vendors: sku.vendors.map(vendor => ({
                ...vendor,
                vendorStatus: vendor.vendorId === selectedVendors[request.id][sku.sku] 
                    ? "Approved" 
                    : "Rejected"
            })
        )
    }));

    const newHistoryLog: HistoryLog = {
        status: "Approved - Pending PO Creation",
        user: userId,
        timestamp: Date.now()
    };

    try {
        await updateDoc(requestRef, {
            skus: updatedSkus,
            status: "Approved - Pending PO Creation",
            history: [...request.history, newHistoryLog]
        });
        
        showMessage(
            "Success", 
            `Vendors approved for Request ID: ${request.id}`
        );
        
        // Reset states
        showConfirmationModal = false;
        currentRequestForApproval = null;
        selectedVendors[request.id] = {};
        
    } catch (e: any) {
        showMessage("Error", `Failed to update vendor approval: ${e.message}`);
        console.error(e);
    }
}

// Initialize selectedVendors when pendingMyApproval changes
$: {
    pendingMyApproval.forEach(request => {
        if (!selectedVendors[request.id]) {
            selectedVendors[request.id] = {};
        }
        request.skus.forEach(sku => {
            if (!selectedVendors[request.id][sku.sku]) {
                selectedVendors[request.id][sku.sku] = '';
            }
        });
    });
}

    // These declarations are already defined at the top of the file
</script>

<div class="prose max-w-none">
    <!-- Section 1: Initiate Purchase Request Form -->
    <div class="card bg-base-100 shadow-xl border">
        <div class="card-body">
            <h3 class="card-title">Initiate New Business Purchase</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <!-- Warehouse Selection -->
                <div class="form-control w-full">
                    <label for="wh" class="label">
                        <span class="label-text">Proposed Warehouse</span>
                    </label>
                    <select
                        class="select w-full"
                        on:change={onProposedWhChange}
                    >
                        <option selected disabled>Select Warehouse</option>
                        {#each wareHouses as wh}
                            <option value={wh}>{wh}</option>
                        {/each}
                    </select>
                </div>

                <!-- Zone Display -->
                {#if zone}
                    <div class="form-control w-full">
                        <label for="zone" class="label">
                            <span class="label-text">Zone</span>
                        </label>
                        <div class="relative">
                            <input
                                type="text"
                                id="zone"
                                class="input input-bordered w-full"
                                bind:value={zone}
                            />
                            <div
                                class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-5 w-5 text-gray-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>

            <div class="divider">SKU Details</div>

            {#each formSkus as sku, i}
                <div class="card bg-base-200 p-4 mb-4 relative">
                    <button
                        class="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
                        on:click={() => removeSku(i)}>✕</button
                    >
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="form-control">
                            <label class="label block" for="sku-id"
                                >SKU ID</label
                            >
                            <input
                                type="text"
                                id="sku-id"
                                placeholder="SKU ID"
                                class="input input-bordered"
                                bind:value={sku.sku}
                                on:change={(event) => onSkuIdChange(event, i)}
                            />
                        </div>
                        <div class="form-control">
                            <label class="label block" for="quantity"
                                >Quantity</label
                            >
                            <input
                                type="number"
                                id="quantity"
                                placeholder="Quantity"
                                class="input input-bordered"
                                bind:value={sku.quantity}
                            />
                        </div>
                        <div class="form-control">
                            <label class="label block" for="expected-price">
                                Expected Price
                            </label>
                            <input
                                type="number"
                                id="expected-price"
                                placeholder="Expected Price"
                                class="input input-bordered"
                                bind:value={sku.expectedPrice}
                            />
                        </div>
                        {#if sku.sku}
                            <div class="form-control">
                                <label
                                    class="label block"
                                    for="unmasked-product-name"
                                >
                                    Unmasked Product Name
                                </label>
                                <input
                                    type="text"
                                    id="unmasked-product-name"
                                    placeholder="Unmasked Product Name"
                                    class="input input-bordered"
                                    bind:value={sku.unmaskedProductName}
                                />
                            </div>
                            <div class="form-control">
                                <label class="label block" for="super-category">
                                    Super Category
                                </label>
                                <input
                                    type="text"
                                    id="super-category"
                                    placeholder="Super Category"
                                    class="input input-bordered"
                                    bind:value={sku.superCategory}
                                />
                            </div>
                            <div class="form-control">
                                <label class="label block" for="brand"
                                    >Brand</label
                                >
                                <input
                                    type="text"
                                    id="brand"
                                    placeholder="Brand"
                                    class="input input-bordered"
                                    bind:value={sku.brand}
                                />
                            </div>
                            <div class="form-control">
                                <label class="label block" for="asv">ASV</label>
                                <input
                                    type="number"
                                    id="asv"
                                    placeholder="ASV"
                                    class="input input-bordered"
                                    bind:value={sku.asv}
                                />
                            </div>
                            <div class="form-control">
                                <label class="label block" for="seasonality">
                                    Seasonality
                                </label>
                                <input
                                    type="text"
                                    id="seasonality"
                                    placeholder="Seasonality"
                                    class="input input-bordered"
                                    bind:value={sku.seasonality}
                                />
                            </div>
                            <div class="form-control">
                                <label
                                    class="label block"
                                    for="season-duration"
                                >
                                    Season duration
                                </label>
                                <input
                                    type="number"
                                    id="season-duration"
                                    placeholder="Season duration"
                                    class="input input-bordered"
                                    bind:value={sku.seasonDuration}
                                />
                            </div>
                        {/if}
                    </div>
                </div>
            {/each}

            <div class="card-actions justify-between mt-4">
                <button class="btn btn-secondary" on:click={addSku}
                    >Add SKU</button
                >
                <button class="btn btn-primary" on:click={handleInitiateRequest}
                    >Submit Request</button
                >
            </div>
        </div>
    </div>

    <div class="divider"></div>

    <!-- Section 2: Requests Pending My Approval -->
<h3 class="text-xl font-bold mb-4">Requests Pending My Approval</h3>
{#if pendingMyApproval.length === 0}
    <div class="alert alert-info">
        You have no requests waiting for vendor approval.
    </div>
{:else}
    <div class="space-y-4">
        {#each pendingMyApproval as request (request.id)}
        <div class="collapse bg-base-100 border border-base-300 mb-4">
            <input type="checkbox" class="collapse-toggle" />
            <div class="collapse-title font-semibold flex justify-between items-center">
                <span>Request ID: {request.id}</span>
            </div>
            {#if areAllSkusSelectedForRequest(request)}
                <button
                    class="btn btn-primary mx-4 mb-4"
                    on:click|stopPropagation={() => showApprovalConfirmation(request)}
                >
                    Approve Selected Vendors
                </button>
            {/if}
            <div class="collapse-content">
                {#each request.skus as sku, skuIndex (sku.sku)}
                    <div class="divider text-sm">{sku.sku}</div>
                    <p><strong>Vendors proposed by Supply Team:</strong></p>
                    {#if !sku.vendors || sku.vendors.length === 0}
                        <p class="text-xs italic">No vendors submitted yet.</p>
                    {:else}
                        <div class="space-y-2">
                            {#each sku.vendors as vendor (vendor.vendorId)}
                                <div class="flex items-center justify-between p-2 rounded-md">
                                    <label class="flex items-center space-x-4">
                                        <input
                                            type="radio"
                                            name="vendor_{request.id}_{sku.sku}"
                                            value={vendor.vendorId}
                                            checked={selectedVendors[request.id]?.[sku.sku] === vendor.vendorId}
                                            on:change={() => handleVendorSelection(request.id, sku.sku, vendor.vendorId)}
                                            class="radio radio-primary"
                                        />
                                        <span>{vendor.vendorId} - Price: ${vendor.vendorPrice}</span>
                                    </label>
                                </div>
                            {/each}
                        </div>
                    {/if}
                {/each}
            </div>
        </div>
    {/each}
    </div>
{/if}

<!-- Add Confirmation Modal -->
{#if showConfirmationModal && currentRequestForApproval}
    <div class="modal modal-open">
        <div class="modal-box">
            <h3 class="font-bold text-lg">Confirm Vendor Approval</h3>
            <p class="py-4">
                Are you sure you want to approve the selected vendors for Request ID: {currentRequestForApproval.id}?
            </p>
            <div class="modal-action">
                <button class="btn btn-ghost" on:click={() => showConfirmationModal = false}>
                    Cancel
                </button>
                <button 
                    class="btn btn-primary" 
                    on:click={() => currentRequestForApproval && handleBulkVendorApproval(currentRequestForApproval)}
                >
                    Confirm Approval
                </button>
            </div>
        </div>
    </div>
{/if}

</div>

<!-- firebase does not accept undefined so instead of that send null -->
