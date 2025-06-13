<script lang="ts">
    import { purchaseRequests, showMessage } from "../stores";
    import { pipelineOrders, type PipelineOrder } from "../../data/pipelineOrders";
    import {
        getFirestore,
        updateDoc,
        doc,
        arrayUnion,
    } from "firebase/firestore";
    import { app } from "../firebase";
    import type { HistoryLog, SKU, Vendor, PurchaseRequest } from "../types";

    export let userId: string;

    const db = getFirestore(app);

    // --- State for Tabs ---
    let currentTab: "pipeline" | "business" | "in-transit" = "pipeline";

    // --- Derived State for PO Lists ---

    // First, filter out only those requests with the correct status having at least one approved vendor for every SKU.
    $: filteredPurchaseRequests = $purchaseRequests
        .filter(request =>
            request.status === "Approved - Pending PO Creation" &&
            // Ensure every SKU has at least one approved vendor.
            request.skus.every(sku => sku.vendors.some(vendor => vendor.vendorStatus === "Approved"))
        );
        // .map(request => ({
        //     ...request,
        //     skus: request.skus.map(sku => ({
        //         ...sku,
        //         // Only keep approved vendors for each SKU.
        //         vendors: sku.vendors.filter(vendor => vendor.vendorStatus === "Approved")
        //     }))
        // }));

    // Status definitions
    const IN_TRANSIT_STATUSES = [
        "Dispatched",
        "In transit",
        "Reached at WH | Receiving Pending",
    ];
    const BUSINESS_STATUSES = ["Received at WH", "Cancelled"];

    // Filter POs for the "Pipeline" tab
    let localPipelineOrders: PipelineOrder[] = pipelineOrders;

    // Making it reactive
    $: filteredPipelineOrders = localPipelineOrders.filter(po => 
        po.request.status === "Approved - Pending PO Creation" &&
        !po.request.skus[0].vendors[0].poStatus
    );

    // Filter POs for the "Business" tab
    $: businessOrders = filteredPurchaseRequests.map(request => ({
        ...request,
        skus: request.skus.filter(sku =>
            !BUSINESS_STATUSES.includes(sku.vendors[0].poStatus) &&
            !IN_TRANSIT_STATUSES.includes(sku.vendors[0].poStatus)
        )
    })).filter(request => request.skus.length > 0);

    // Filter POs for the "In-Transit" tab
    $: inTransitOrders = filteredPurchaseRequests.map(request => ({
        ...request,
        skus: request.skus.filter(sku => 
            sku.vendors[0].poStatus && 
            IN_TRANSIT_STATUSES.includes(sku.vendors[0].poStatus)
        )
    })).filter(request => request.skus.length > 0);

    // --- Methods ---
    async function handlePoUpdate(
        po: { request: PurchaseRequest; sku: SKU; vendor: Vendor },
        poNumber: string,
        poStatus: string,
    ) {
        if (!poNumber || !poStatus) {
            showMessage("Error", "PO Number and Status are required.");
            return;
        }        

        const requestRef = doc(db, "purchaseRequests", po.request.id);

        // // Create a deep copy to avoid direct mutation of the store's data
        // const updatedSkus: SKU[] = JSON.parse(JSON.stringify(po.request.skus));

        // // Find and update the specific vendor within the specific SKU
        // const skuToUpdate = updatedSkus.find((s) => s.sku === po.sku.sku);
        // if (skuToUpdate) {
        //     const vendorToUpdate = skuToUpdate.vendors.find(
        //         (v) => v.vendorId === po.vendor.vendorId,
        //     );
        //     if (vendorToUpdate) {
        //         vendorToUpdate.poNumber = poNumber;
        //         vendorToUpdate.poStatus = poStatus;
        //     }
        // }

        // const newHistoryLog: HistoryLog = {
        //     status: `PO for SKU ${po.sku.sku} updated to '${poStatus}'`,
        //     user: userId,
        //     timestamp: Date.now(),
        // };

        // try {
        //     await updateDoc(requestRef, {
        //         skus: updatedSkus,
        //         history: arrayUnion(newHistoryLog),
        //     });
        //     showMessage("Success", `PO for ${po.sku.sku} has been updated.`);

        try {
            // Get the current request data
            const currentRequest = $purchaseRequests.find(r => r.id === po.request.id);
            if (!currentRequest) {
                throw new Error("Request not found");
            }

            // Create a deep copy of SKUs to avoid direct store mutation
            const updatedSkus = JSON.parse(JSON.stringify(currentRequest.skus));

            // Find the specific SKU
            const skuToUpdate = updatedSkus.find((s: SKU) => s.sku === po.sku.sku);
            if (!skuToUpdate) {
                throw new Error("SKU not found in request");
            }

            // Find and update the specific vendor
            const vendorToUpdate = skuToUpdate.vendors.find((v: Vendor) => v.vendorId === po.vendor.vendorId);
            if (!vendorToUpdate) {
                throw new Error("Vendor not found in SKU");
            }

            // Update vendor details
            vendorToUpdate.poNumber = poNumber;
            vendorToUpdate.poStatus = poStatus;

            // Create history log
            const newHistoryLog: HistoryLog = {
                status: `PO for SKU ${po.sku.sku} updated to '${poStatus}'`,
                user: userId,
                timestamp: Date.now()
            };

            // Update Firestore
            await updateDoc(requestRef, {
                skus: updatedSkus,
                history: arrayUnion(newHistoryLog)
            });

            // Update the store to trigger reactive re-filtering
            purchaseRequests.update(requests => {
                const updatedRequests = [...requests];
                const requestIndex = updatedRequests.findIndex(r => r.id === po.request.id);
                if (requestIndex !== -1) {
                    updatedRequests[requestIndex] = {
                        ...updatedRequests[requestIndex],
                        skus: updatedSkus
                    };
                }
                return updatedRequests;
            });

            showMessage(
                "Success", 
                `PO Status updated for SKU ${po.sku.sku} to ${poStatus}`
            );
        } catch (e: any) {
            showMessage("Error", `Could not update PO: ${e.message}`);
            console.error("PO Update Error:", e);
        }
    }
</script>

<div class="prose max-w-none">
    <h2 class="text-2xl font-bold mb-4">
        Supply Ops - Purchase Order Management
    </h2>

    <!-- Tab Navigation -->
    <div class="tabs tabs-bordered mb-6">
        <button
            aria-label="Pipeline Orders"
            class="tab tab-lg"
            class:tab-active={currentTab === "pipeline"}
            on:click={() => (currentTab = "pipeline")}
        >
            Pipeline Orders ({pipelineOrders.length})
        </button>
        <button
            class="tab tab-lg"
            class:tab-active={currentTab === "business"}
            on:click={() => (currentTab = "business")}
        >
            Business Orders ({businessOrders.length})
        </button>
        <button
            class="tab tab-lg"
            class:tab-active={currentTab === "in-transit"}
            on:click={() => (currentTab = "in-transit")}
        >
            In Transit Inventory ({inTransitOrders.length})
        </button>
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
                        {#each filteredPipelineOrders as po (po.request.id)}
                        {@const vendor = po.request.skus[0].vendors[0]}
                            <tr>
                                <td class="font-mono text-xs align-middle"
                                    >{po.request.id}</td
                                >
                                <td class="align-middle">{po.request.skus[0].sku}</td>
                                <td class="align-middle"
                                    >{vendor.vendorId}</td
                                >
                                <td>
                                    <input
                                        id={po.request.id + "-" + po.request.skus[0].sku}
                                        type="text"
                                        placeholder="Enter PO Number"
                                        class="input input-sm input-bordered w-full max-w-xs"
                                        value={vendor.poNumber || ""}
                                    />
                                </td>
                                <td>
                                    <select
                                        id={`po-status-${po.request.id}-${po.request.skus[0].sku}`}
                                        class="select select-sm select-bordered w-full max-w-xs"
                                    >
                                        <option
                                            value=""
                                            disabled
                                            selected={!vendor.poStatus}
                                            >Select Status</option
                                        >
                                        <option
                                            value="PO Issued | Stock Ready | Pending for Pickup"
                                            selected={vendor.poStatus ===
                                                "PO Issued | Stock Ready | Pending for Pickup"}
                                            >PO Issued | Stock Ready | Pending
                                            for Pickup</option
                                        >
                                        <option
                                            value="PO Issued | Stock Not Ready"
                                            selected={vendor.poStatus ===
                                                "PO Issued | Stock Not Ready"}
                                            >PO Issued | Stock Not Ready</option
                                        >
                                        <option value="Dispatched"
                                            >Dispatched</option
                                        >
                                        <option value="Cancelled"
                                            >Cancelled</option
                                        >
                                    </select>
                                </td>
                                <td class="align-middle">
                                    <button
                                        class="btn btn-sm btn-primary"
                                        disabled
                                        on:click={() => {
                                            const poNumInput =
                                                document.getElementById(
                                                    po.request.id +
                                                        "-" +
                                                        po.request.skus[0].sku,
                                                ) as HTMLInputElement;
                                            const poStatusInput =
                                                document.getElementById(
                                                    `po-status-${po.request.id}-${po.request.skus[0].sku}`,
                                                ) as HTMLSelectElement;
                                            // handlePoUpdate(
                                            //     po,
                                            //     poNumInput.value,
                                            //     poStatusInput.value,
                                            // );
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
                            <th>PO Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each businessOrders as request (request.id)}
                        {#each request.skus as sku, skuIndex (sku.sku)}
                            <tr>
                                {#if skuIndex === 0}
                                    <td class="font-mono text-xs" rowspan={request.skus.length}>
                                        {request.id}
                                    </td>
                                {/if}
                                <td>{sku.sku}</td>
                                <td>{sku.vendors[0].vendorId}</td>
                                <td>
                                    <input
                                        id={`po-num-business-${request.id}-${sku.sku}`}
                                        type="text"
                                        placeholder="Enter PO Number"
                                        class="input input-sm input-bordered w-full max-w-xs"
                                        value={sku.vendors[0].poNumber || ""}
                                    />
                                </td>
                                <td>
                                    <select
                                        id={`po-status-business-${request.id}-${sku.sku}`}
                                        class="select select-sm select-bordered w-full max-w-xs"
                                    >
                                        <option
                                            value=""
                                            disabled
                                            selected={sku.vendors[0].poStatus === ""}
                                            >Select Status</option
                                        >
                                        <option
                                            value="PO Issued | Stock Ready | Pending for Pickup"
                                            selected={sku.vendors[0].poStatus ===
                                                "PO Issued | Stock Ready | Pending for Pickup"}
                                            >PO Issued | Stock Ready | Pending
                                            for Pickup</option
                                        >
                                        <option
                                            value="PO Issued | Stock Not Ready"
                                            selected={sku.vendors[0].poStatus ===
                                                "PO Issued | Stock Not Ready"}
                                            >PO Issued | Stock Not Ready</option
                                        >
                                        <option value="Dispatched"
                                            >Dispatched</option
                                        >
                                        <option value="Cancelled"
                                            >Cancelled</option
                                        >
                                    </select>
                                </td>
                                <td>
                                    <button
                                        class="btn btn-sm btn-primary"
                                        on:click={() => {
                                            const poNumInput =
                                                document.getElementById(
                                                    `po-num-business-${request.id}-${sku.sku}`
                                                ) as HTMLInputElement;
                                            const poStatusInput =
                                                document.getElementById(
                                                    `po-status-business-${request.id}-${sku.sku}`
                                                ) as HTMLSelectElement;
                                            handlePoUpdate(
                                                {
                                                    request,
                                                    sku,
                                                    vendor: sku.vendors[0]
                                                },
                                                poNumInput.value,
                                                poStatusInput.value
                                            );
                                        }}>Update</button
                                    >
                                </td>
                            </tr>
                        {/each}
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    {/if}

    <!-- In Transit Inventory Tab Content -->
    {#if currentTab === "in-transit"}
        {#if inTransitOrders.length === 0}
            <div class="alert alert-info">
                There are no items in transit.
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
                        {#each inTransitOrders as request (request.id)}
                            {#each request.skus as sku, skuIndex (sku.sku)}
                                <tr>
                                    {#if skuIndex === 0}
                                        <td class="font-mono text-xs" rowspan={request.skus.length}>
                                            {request.id}
                                        </td>
                                    {/if}
                                    <td class="align-middle">{sku.sku}</td>
                                    <td class="align-middle"
                                        >{sku.vendors[0].vendorId}</td
                                    >
                                    <td>
                                        <input
                                            id={`po-num-transit-${request.id}-${sku.sku}`}
                                            type="text"
                                            placeholder="Enter PO Number"
                                            class="input input-sm input-bordered w-full max-w-xs"
                                            value={sku.vendors[0].poNumber || ""}
                                        />
                                    </td>
                                    <td>
                                        <select
                                            id={`po-status-transit-${request.id}-${sku.sku}`}
                                            class="select select-sm select-bordered w-full max-w-xs"
                                        >
                                            <option
                                                value=""
                                                disabled
                                                selected={sku.vendors[0].poStatus === ""}
                                                >Select Status</option
                                            >
                                            <option
                                                value="Dispatched"
                                                selected={sku.vendors[0].poStatus ===
                                                    "Dispatched"}>Dispatched</option
                                            >
                                            <option
                                                value="In transit"
                                                selected={sku.vendors[0].poStatus ===
                                                    "In transit"}>In transit</option
                                            >
                                            <option
                                                value="Reached at WH | Receiving Pending"
                                                selected={sku.vendors[0].poStatus ===
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
                                                const poNumInput = document.getElementById(
                                                    `po-num-transit-${request.id}-${sku.sku}`
                                                ) as HTMLInputElement;
                                                const poStatusInput = document.getElementById(
                                                    `po-status-transit-${request.id}-${sku.sku}`
                                                ) as HTMLSelectElement;
                                                handlePoUpdate(
                                                    {
                                                        request,
                                                        sku,
                                                        vendor: sku.vendors[0]
                                                    },
                                                    poNumInput.value,
                                                    poStatusInput.value
                                                );
                                            }}
                                            >Update</button
                                        >
                                    </td>
                                </tr>
                            {/each}
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    {/if}
    </div>
