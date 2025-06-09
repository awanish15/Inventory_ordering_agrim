<script lang="ts">
    import { purchaseRequests, showMessage } from "../stores";
    import {
        getFirestore,
        updateDoc,
        doc,
        arrayUnion,
    } from "firebase/firestore";
    import { app } from "../firebase";
    import type { SupplyOpsPipeline, SupplyOpsBusiness, HistoryLog, SKU, PurchaseRequest } from "../types";

    export let userId: string;

    const db = getFirestore(app);

    // --- State for Tabs ---
    let currentTab: "pipeline" | "business" = "pipeline";

    // --- Derived State for PO Lists ---

    // Flatten the data to get a list of all potential POs
    const allPOs = $purchaseRequests
        .filter((r) => r.status === "Approved - Pending PO Creation")
        .flatMap((request) =>
            request.skus.flatMap((sku) =>
                sku.vendors
                    .filter((vendor) => vendor.vendorStatus === "Approved")
                    .map((vendor) => ({
                        request,
                        sku,
                        vendor,
                    })),
            ),
        );

    // Pipeline Fields
    // Direct to CX 

    // Warehouse dispatch via WH 

    // Retail business purchase to WH
    // Pipline give me this;

// SKU 

// Warehouse (Only where WH is required) 

// Cost price 

// Vendor Name 

// Supply POC 
//     Vendor Payment terms  

// Vendor Brand Alignment 

// Pick up address 

// Flash Sale 

// Expected Pickup time 

// Logistics (Ex, FOR) 

// Customers drop location in case of direct to C


    // Filter POs for the "Pipeline" tab (not yet received or cancelled)
    $: pipelineOrders = allPOs.filter(
        (po) =>
            po.vendor.poStatus !== "Received at WH" &&
            po.vendor.poStatus !== "Cancelled",
    );

    // Filter POs for the "Business" tab (received or cancelled)
    $: businessOrders = allPOs.filter(
        (po) =>
            po.vendor.poStatus === "Received at WH" ||
            po.vendor.poStatus === "Cancelled",
    );

    // --- Methods ---

    async function handlePoUpdate(
        po: { request: PurchaseRequest; sku: SKU; vendor: any },
        poNumber: string,
        poStatus: string,
    ) {
        if (!poNumber || !poStatus) {
            showMessage("Invalid Input", "PO Number and Status are required.");
            return;
        }

        const requestRef = doc(db, "purchaseRequests", po.request.id);

        // Create a deep copy to avoid direct mutation of the store's data
        const updatedSkus: SKU[] = JSON.parse(JSON.stringify(po.request.skus));

        // Find and update the specific vendor within the specific SKU
        const skuToUpdate = updatedSkus.find((s) => s.sku === po.sku.sku);
        if (skuToUpdate) {
            const vendorToUpdate = skuToUpdate.vendors.find(
                (v) => v.vendorId === po.vendor.vendorId,
            );
            if (vendorToUpdate) {
                vendorToUpdate.poNumber = poNumber;
                vendorToUpdate.poStatus = poStatus;
            }
        }

        const newHistoryLog: HistoryLog = {
            status: `PO for SKU ${po.sku.sku} updated to '${poStatus}'`,
            user: userId,
            timestamp: Date.now(),
        };

        try {
            await updateDoc(requestRef, {
                skus: updatedSkus,
                history: arrayUnion(newHistoryLog),
            });
            showMessage("Success", `PO for ${po.sku.sku} has been updated.`);
        } catch (e: any) {
            showMessage("Error", `Could not update PO: ${e.message}`);
            console.error(e);
        }
    }
</script>

<div class="prose max-w-none">
    <h2 class="text-2xl font-bold mb-4">
        Supply Ops - Purchase Order Management
    </h2>

    <!-- Tab Navigation -->
    <div class="tabs tabs-bordered mb-6">
        <a
            class="tab tab-lg"
            class:tab-active={currentTab === "pipeline"}
            on:click={() => (currentTab = "pipeline")}
        >
            Pipeline Orders ({pipelineOrders.length})
        </a>
        <a
            class="tab tab-lg"
            class:tab-active={currentTab === "business"}
            on:click={() => (currentTab = "business")}
        >
            Business Orders ({businessOrders.length})
        </a>
    </div>

    <!-- Pipeline Orders Tab Content -->
    {#if currentTab === "pipeline"}
        {#if pipelineOrders.length === 0}
            <div class="alert alert-info">
                There are no orders in the pipeline requiring action.
            </div>
        {:else}
            <div class="overflow-x-auto">
                <table class="table w-full">
                    <thead>
                        <tr>
                            <th>Request ID</th>
                            <th>SKU</th>
                            <th>Vendor</th>
                            <th>PO Number</th>
                            <th>PO Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each pipelineOrders as po (po.request.id + po.sku.sku)}
                            {@const poNumberInputId = `po-num-${po.request.id}-${po.sku.sku}`}
                            {@const poStatusInputId = `po-status-${po.request.id}-${po.sku.sku}`}
                            <tr>
                                <td class="font-mono text-xs align-middle"
                                    >{po.request.id}</td
                                >
                                <td class="align-middle">{po.sku.sku}</td>
                                <td class="align-middle"
                                    >{po.vendor.vendorId}</td
                                >
                                <td>
                                    <input
                                        id={poNumberInputId}
                                        type="text"
                                        placeholder="Enter PO Number"
                                        class="input input-sm input-bordered w-full max-w-xs"
                                        value={po.vendor.poNumber || ""}
                                    />
                                </td>
                                <td>
                                    <select
                                        id={poStatusInputId}
                                        class="select select-sm select-bordered w-full max-w-xs"
                                    >
                                        <option
                                            value=""
                                            disabled
                                            selected={!po.vendor.poStatus}
                                            >Select Status</option
                                        >
                                        <option
                                            selected={po.vendor.poStatus ===
                                                "PO Issued | Stock Ready | Pending for Pickup"}
                                            >PO Issued | Stock Ready | Pending
                                            for Pickup</option
                                        >
                                        <option
                                            selected={po.vendor.poStatus ===
                                                "PO Issued | Stock Not Ready"}
                                            >PO Issued | Stock Not Ready</option
                                        >
                                        <option
                                            selected={po.vendor.poStatus ===
                                                "In transit"}>In transit</option
                                        >
                                        <option
                                            selected={po.vendor.poStatus ===
                                                "Reached at WH | Receiving Pending"}
                                            >Reached at WH | Receiving Pending</option
                                        >
                                        <option value="Received at WH"
                                            >Received at WH</option
                                        >
                                        <option value="Cancelled"
                                            >Cancelled</option
                                        >
                                    </select>
                                </td>
                                <td class="align-middle">
                                    <button
                                        class="btn btn-sm btn-primary"
                                        on:click={() => {
                                            const poNumInput =
                                                document.getElementById(
                                                    poNumberInputId,
                                                ) as HTMLInputElement;
                                            const poStatusInput =
                                                document.getElementById(
                                                    poStatusInputId,
                                                ) as HTMLSelectElement;
                                            handlePoUpdate(
                                                po,
                                                poNumInput.value,
                                                poStatusInput.value,
                                            );
                                        }}>Update</button
                                    >
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    {/if}

    <!-- Business Orders Tab Content -->
    {#if currentTab === "business"}
        {#if businessOrders.length === 0}
            <div class="alert alert-info">
                There are no completed or cancelled business orders.
            </div>
        {:else}
            <div class="overflow-x-auto">
                <table class="table w-full">
                    <thead>
                        <tr>
                            <th>Request ID</th>
                            <th>SKU</th>
                            <th>Vendor</th>
                            <th>PO Number</th>
                            <th>Final Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each businessOrders as po (po.request.id + po.sku.sku)}
                            <tr>
                                <td class="font-mono text-xs"
                                    >{po.request.id}</td
                                >
                                <td>{po.sku.sku}</td>
                                <td>{po.vendor.vendorId}</td>
                                <td>{po.vendor.poNumber || "N/A"}</td>
                                <td>
                                    <span
                                        class="badge"
                                        class:badge-success={po.vendor
                                            .poStatus === "Received at WH"}
                                        class:badge-error={po.vendor
                                            .poStatus === "Cancelled"}
                                    >
                                        {po.vendor.poStatus}
                                    </span>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    {/if}
</div>
