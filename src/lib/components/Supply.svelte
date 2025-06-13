<script lang="ts">
    import { purchaseRequests, showMessage } from "../stores";
    import { getFirestore, updateDoc, doc } from "firebase/firestore";
    import { app } from "../firebase";
    import type { Vendor, HistoryLog, PurchaseRequest } from "../types";

    export let userId: string;

    const db = getFirestore(app);

    // Filter for requests that need action from the Supply team
    $: pendingSupplyInput = $purchaseRequests.filter(
        (r) => r.status === "Pending Supply Input",
    );

    // Local state to manage the vendors for a specific SKU when a user is editing
    let currentlyEditing: { requestId: string; skuIndex: number } | null = null;
    // let vendorForms: Partial<Vendor>[] = [{}];
    let showConfirmationModal = false;
    let requestForSubmission: PurchaseRequest | null = null;
    let savedVendors: Record<string, Record<string, Vendor[]>> = {};

    function createEmptyVendor(): Vendor {
        return {
            vendorId: '',
            vendorPrice: 0,
            supplyPoc: '',
            vendorPaymentTerms: '',
            brandInvoiceAlignment: '',
            pickupAddress: '',
            flashSale: false,
            expectedPickupTime: Date.now(),
            vendorStatus: 'Pending',
            poNumber: '',
            poStatus: ''
        };
    }
    let vendorForms: Vendor[] = [createEmptyVendor()];

    // Helper function to check if all SKUs have vendors
    function areAllSkusComplete(request: PurchaseRequest): boolean {
        return request.skus.every(sku => 
            savedVendors[request.id]?.[sku.sku]?.length > 0
        );
    }

    function addVendorForm() {
        if (vendorForms.length < 3) {
            vendorForms = [...vendorForms, createEmptyVendor()];
        } else {
            showMessage(
                "Limit Reached",
                "You can only add up to 3 vendors per SKU.",
            );
        }
    }

    function isValidVendor(vendor: Partial<Vendor>): vendor is Vendor {
        return !!(
            vendor.vendorId &&
            vendor.vendorPrice !== undefined &&
            vendor.supplyPoc &&
            vendor.vendorPaymentTerms &&
            vendor.brandInvoiceAlignment &&
            vendor.pickupAddress !== undefined &&
            vendor.flashSale !== undefined &&
            vendor.expectedPickupTime !== undefined
        );
    }

    // function startEditing(request: PurchaseRequest, skuIndex: number) {
    //     currentlyEditing = { requestId: request.id, skuIndex };
    //     // Pre-fill with existing vendor data if available, otherwise start fresh
    //     const existingVendors = request.skus[skuIndex].vendors;
    //     vendorForms = existingVendors.length > 0 ? existingVendors : [{}];
    // }

    // Modified startEditing function
    function startEditing(request: PurchaseRequest, skuIndex: number) {
        currentlyEditing = { requestId: request.id, skuIndex };
        const skuId = request.skus[skuIndex].sku;
        
        // Initialize from savedVendors if exists, else from request or empty
        vendorForms = savedVendors[request.id]?.[skuId] || 
                    request.skus[skuIndex].vendors || 
                    [createEmptyVendor()];
        // If no vendors exist, start with an empty vendor form
        if (vendorForms.length === 0) {
            vendorForms = [createEmptyVendor()];
        }
    }

    function closeModal() {
        const modalCheckbox = document.getElementById('supply-modal') as HTMLInputElement;
        if (modalCheckbox) {
            modalCheckbox.checked = false;
        }
        currentlyEditing = null;
    }

    // New save vendors function
    async function saveVendors() {
        if (!currentlyEditing) return;

        // Validation
        if (vendorForms.some(v => !v.vendorId || !v.vendorPrice)) {
            // Show validation error if any vendor is missing required fields
            closeModal(); // Close the modal before showing error
            vendorForms = [createEmptyVendor()]; // Reset to empty form
            showMessage("Validation Error", "Each vendor must have at least a Vendor ID and a Price.");
            return;
        }

        const { requestId, skuIndex } = currentlyEditing;
        const request = pendingSupplyInput.find(r => r.id === requestId);
        if (!request) return;

        const skuId = request.skus[skuIndex].sku;

        // Initialize nested structure if not exists
        if (!savedVendors[requestId]) {
            savedVendors[requestId] = {};
        }
        
        // Save vendors for this SKU
        savedVendors[requestId][skuId] = vendorForms;
        
        closeModal(); // Close the modal
        showMessage("Success", "Vendors saved successfully for this SKU.");
    }

    // New submit all vendors function
    async function submitAllVendors(request: PurchaseRequest) {
        const requestRef = doc(db, "purchaseRequests", request.id);

        // Deep copy SKUs and update with saved vendors
        const updatedSkus = request.skus.map(sku => ({
            ...sku,
            vendors: savedVendors[request.id][sku.sku]
        }));

        const newHistoryLog: HistoryLog = {
            status: "Pending Category Approval",
            user: userId,
            timestamp: Date.now()
        };

        try {
            await updateDoc(requestRef, {
                skus: updatedSkus,
                status: "Pending Category Approval",
                history: [...request.history, newHistoryLog]
            });
            
            showMessage("Success", "All vendors submitted for Category approval.");
            delete savedVendors[request.id]; // Cleanup saved vendors
            showConfirmationModal = false;
            requestForSubmission = null;
            
        } catch (e: any) {
            showMessage("Error", `Failed to submit vendors: ${e.message}`);
        }
    }

    // function addVendorForm() {
    //     if (vendorForms.length < 3) {
    //         vendorForms = [...vendorForms, {}];
    //     } else {
    //         showMessage(
    //             "Limit Reached",
    //             "You can only add up to 3 vendors per SKU.",
    //         );
    //     }
    // }

    async function submitVendors() {
        if (!currentlyEditing) return;

        // Validation
        if (vendorForms.some((v) => !v.vendorId || !v.vendorPrice)) {
            showMessage(
                "Validation Error",
                "Each vendor must have at least a Vendor ID and a Price.",
            );
            return;
        }

        const { requestId, skuIndex } = currentlyEditing;
        const request = pendingSupplyInput.find((r) => r.id === requestId);
        if (!request) return;

        const requestRef = doc(db, "purchaseRequests", request.id);

        // Deep copy and update the specific SKU with the new vendor data
        const updatedSkus = JSON.parse(JSON.stringify(request.skus));
        updatedSkus[skuIndex].vendors = vendorForms;

        const newHistoryLog: HistoryLog = {
            status: "Pending Category Approval",
            user: userId,
            timestamp: Date.now(), // Using current timestamp in milliseconds
        };

        try {
            await updateDoc(requestRef, {
                skus: updatedSkus,
                status: "Pending Category Approval", // Move to next stage in workflow
                history: [...request.history, newHistoryLog],
            });
            showMessage(
                "Success",
                "Vendors have been submitted for Category approval.",
            );
            currentlyEditing = null; // Close the modal/editing view
        } catch (e: any) {
            showMessage("Error", `Failed to submit vendors: ${e.message}`);
        }
    }
</script>

<!-- Modal for editing vendors -->
<input
    type="checkbox"
    id="supply-modal"
    class="modal-toggle"
    on:change={(e) =>
        (currentlyEditing = (e.target as HTMLInputElement).checked
            ? currentlyEditing
            : null)}
/>
<div class="modal" role="dialog">
    <div class="modal-box w-11/12 max-w-2xl">
        <h3 class="font-bold text-lg">Add/Edit Vendors</h3>
        <p class="py-2 text-sm">
            For SKU: {currentlyEditing
                ? pendingSupplyInput.find(r => r.id === currentlyEditing?.requestId)
                    ?.skus[currentlyEditing.skuIndex].sku
                : ""}
        </p>

        <div class="space-y-4 max-h-96 overflow-y-auto p-1">
            {#each vendorForms as vendor, i}
                <div class="card card-compact bg-base-200 p-4">
                    <h4 class="font-bold">Vendor {i + 1}</h4>
                    <div class="grid grid-cols-2 gap-2">
                        <input
                            type="text"
                            placeholder="Vendor ID"
                            class="input input-sm input-bordered"
                            bind:value={vendor.vendorId}
                        />
                        <input
                            type="number"
                            placeholder="Vendor Price"
                            class="input input-sm input-bordered"
                            bind:value={vendor.vendorPrice}
                        />
                        <input
                            type="text"
                            placeholder="Supply POC"
                            class="input input-sm input-bordered"
                            bind:value={vendor.supplyPoc}
                        />
                        <input
                            type="text"
                            placeholder="Payment Terms"
                            class="input input-sm input-bordered"
                            bind:value={vendor.vendorPaymentTerms}
                        />
                    </div>
                </div>
            {/each}
        </div>
        <button class="btn btn-sm btn-secondary mt-4" on:click={addVendorForm}
            >Add another vendor</button
        >

        <div class="modal-action">
            <label for="supply-modal" class="btn btn-ghost">Cancel</label>
            <button class="btn btn-primary" on:click={saveVendors}>
                Save Vendors
            </button>
        </div>
    </div>
</div>

<!-- Add confirmation modal -->
{#if showConfirmationModal && requestForSubmission}
    <div class="modal modal-open">
        <div class="modal-box">
            <h3 class="font-bold text-lg">Confirm Vendor Submission</h3>
            <p class="py-4">
                Are you sure you want to submit all vendors for Request ID: {requestForSubmission.id}?
                This will send the request for Category approval.
            </p>
            <div class="modal-action">
                <button class="btn btn-ghost" on:click={() => showConfirmationModal = false}>
                    Cancel
                </button>
                <button 
                    class="btn btn-primary" 
                    on:click={() => {
                        if (requestForSubmission) {
                            submitAllVendors(requestForSubmission);
                        }
                    }}
                >
                    Confirm Submit
                </button>
            </div>
        </div>
    </div>
{/if}

<div class="prose max-w-none">
    <h2 class="text-2xl font-bold mb-6">Supply Team Actions</h2>

    {#if pendingSupplyInput.length === 0}
        <div class="alert alert-success">
            No requests are currently waiting for your input.
        </div>
    {:else}
        <p>
            The following requests require you to find and add vendor
            information.
        </p>
        <div class="overflow-x-auto">
            <table class="table">
                <thead>
                    <tr>
                        <th>Request ID</th>
                        <th>SKU</th>
                        <th>Quantity</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <!-- <tbody>
                    {#each pendingSupplyInput as request (request.id)}
                        {#each request.skus as sku, skuIndex (sku.sku)}
                            <tr>
                                {#if skuIndex === 0}
                                    <td
                                        rowspan={request.skus.length}
                                        class="align-top font-mono text-xs"
                                        >{request.id}</td
                                    >
                                {/if}
                                <td>{sku.sku}</td>
                                <td>{sku.quantity}</td>
                                <td>
                                    <label
                                        for="supply-modal"
                                        class="btn btn-sm btn-primary"
                                        on:click={() =>
                                            startEditing(request, skuIndex)}
                                    >
                                        {#if sku.vendors && sku.vendors.length > 0}Edit
                                            Vendors{:else}Add Vendors{/if}
                                    </label>
                                </td>
                            </tr>
                        {/each}
                    {/each}
                </tbody> -->
                <tbody>
                    {#each pendingSupplyInput as request (request.id)}
                        {#each request.skus as sku, skuIndex (sku.sku)}
                            <tr>
                                {#if skuIndex === 0}
                                    <td rowspan={request.skus.length} class="align-top font-mono text-xs">
                                        {request.id}
                                        {#if areAllSkusComplete(request)}
                                            <button
                                                class="btn btn-sm btn-success mt-2"
                                                on:click={() => {
                                                    requestForSubmission = request;
                                                    showConfirmationModal = true;
                                                }}
                                            >
                                                Submit All Vendors
                                            </button>
                                        {/if}
                                    </td>
                                {/if}
                                <td>{sku.sku}</td>
                                <td>{sku.quantity}</td>
                                <td>
                                    <label
                                        for="supply-modal"
                                        class="btn btn-sm btn-primary"
                                        on:click={() => startEditing(request, skuIndex)}
                                    >
                                        {#if savedVendors[request.id]?.[sku.sku]}
                                            Update Vendors
                                        {:else}
                                            Add Vendors
                                        {/if}
                                    </label>
                                </td>
                            </tr>
                        {/each}
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>
