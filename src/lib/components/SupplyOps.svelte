<script lang="ts">
    import { purchaseRequests, showMessage } from "../stores";
<<<<<<< HEAD
    import type { PipelineOrder } from "../../data/pipelineData";
    import { mockPipelineData } from "../../data/pipelineData";
=======
    import { pipelineOrders, type PipelineOrder } from "../../data/pipelineOrders";
>>>>>>> 553e233f085c4703db13b12030cce13bef3e5b77
    import {
        getFirestore,
        updateDoc,
        doc,
        arrayUnion,
    } from "firebase/firestore";
    import { app } from "../firebase";
<<<<<<< HEAD
    import type { HistoryLog, SKU, Vendor, PurchaseRequest, VendorWithSkus } from "../types";
=======
    import type { HistoryLog, SKU, Vendor, PurchaseRequest } from "../types";
>>>>>>> 553e233f085c4703db13b12030cce13bef3e5b77

    export let userId: string;

    const db = getFirestore(app);

    // --- State for Tabs ---
    let currentTab: "pipeline" | "business" | "in-transit" = "pipeline";
<<<<<<< HEAD
    let selectedOrder: any = null;
=======
>>>>>>> 553e233f085c4703db13b12030cce13bef3e5b77

    // --- Derived State for PO Lists ---

    // First, filter out only those requests with the correct status having at least one approved vendor for every SKU.
    $: filteredPurchaseRequests = $purchaseRequests
        .filter(request =>
            request.status === "Approved - Pending PO Creation" &&
            // Ensure every SKU has at least one approved vendor.
            request.skus.every(sku => sku.vendors.some(vendor => vendor.vendorStatus === "Approved"))
<<<<<<< HEAD
        )
        .map(request => ({
        ...request,
        // Filter SKUs to only include approved vendors
        skus: request.skus.map(sku => ({
            ...sku,
            // Keep only approved vendors for each SKU
            vendors: sku.vendors.filter(vendor => vendor.vendorStatus === "Approved")
        }))
    }));
=======
        );
        // .map(request => ({
        //     ...request,
        //     skus: request.skus.map(sku => ({
        //         ...sku,
        //         // Only keep approved vendors for each SKU.
        //         vendors: sku.vendors.filter(vendor => vendor.vendorStatus === "Approved")
        //     }))
        // }));
>>>>>>> 553e233f085c4703db13b12030cce13bef3e5b77

    // Status definitions
    const IN_TRANSIT_STATUSES = [
        "Dispatched",
        "In transit",
        "Reached at WH | Receiving Pending",
    ];
    const BUSINESS_STATUSES = ["Received at WH", "Cancelled"];

<<<<<<< HEAD
    // Filter POs for the "Pipeline Orders" tab
    $: pipelineOrders = mockPipelineData.reduce<Array<{
        skuId: string;
        vendors: Array<{
            agmId: string;
            vendorName: string;
            vendorAgmId: string;
            supplyPoc: string;
            cpWithGst: number;
            quantityAvailable: number;
            pickupDetails: {
                district: string;
                state: string;
                pin: number;
                date: number;
            };
            dispatchType: string;
            opsStatus: string;
            inventoryQuantity: number;
            poNumber: string | null;
            poStatus: string | null;
        }>
    }>>((acc, order) => {
        let skuGroup = acc.find(group => group.skuId === order.skuId);
        if (!skuGroup) {
            skuGroup = {
                skuId: order.skuId,
                vendors: []
            };
            acc.push(skuGroup);
        }

        skuGroup.vendors.push({
            agmId: order.agmId,
            vendorName: order.vendorName,
            vendorAgmId: order.vendorAgmId,
            supplyPoc: order.supplyPoc,
            cpWithGst: order.cpWithGst,
            quantityAvailable: order.quantityAvailable,
            pickupDetails: {
                district: order.pickupDistrict,
                state: order.pickupState,
                pin: order.pickupPin,
                date: order.pickupDate
            },
            dispatchType: order.dispatchType,
            opsStatus: order.opsStatus,
            inventoryQuantity: order.inventoryQuantity,
            poNumber: order.poNumber,
            poStatus: order.poStatus
        });

        return acc;
    }, []);
=======
    // Filter POs for the "Pipeline" tab
    let localPipelineOrders: PipelineOrder[] = pipelineOrders;

    // Making it reactive
    $: filteredPipelineOrders = localPipelineOrders.filter(po => 
        po.request.status === "Approved - Pending PO Creation" &&
        !po.request.skus[0].vendors[0].poStatus
    );
>>>>>>> 553e233f085c4703db13b12030cce13bef3e5b77

    // Filter POs for the "Business" tab
    $: businessOrders = filteredPurchaseRequests.map(request => ({
        ...request,
        skus: request.skus.filter(sku =>
            !BUSINESS_STATUSES.includes(sku.vendors[0].poStatus) &&
            !IN_TRANSIT_STATUSES.includes(sku.vendors[0].poStatus)
        )
    })).filter(request => request.skus.length > 0);

<<<<<<< HEAD
    // Update the business orders filtering
    $: businessOrders2 = filteredPurchaseRequests.reduce<VendorWithSkus[]>((vendors, request) => {
        request.skus.forEach(sku => {
            const approvedVendor = sku.vendors[0];
            if (!BUSINESS_STATUSES.includes(approvedVendor.poStatus) &&
                !IN_TRANSIT_STATUSES.includes(approvedVendor.poStatus)) {
                // Find or create vendor group
                let vendorGroup = vendors.find(v => v.vendorId === approvedVendor.vendorId);
                if (!vendorGroup) {
                    vendorGroup = {
                        vendorId: approvedVendor.vendorId,
                        items: []
                    };
                    vendors.push(vendorGroup);
                }
                
                // Add this SKU to vendor's items
                vendorGroup.items.push({
                    requestId: request.id,
                    sku,
                    poNumber: approvedVendor.poNumber,
                    poStatus: approvedVendor.poStatus
                });
            }
        });
        return vendors;
    }, []);

=======
>>>>>>> 553e233f085c4703db13b12030cce13bef3e5b77
    // Filter POs for the "In-Transit" tab
    $: inTransitOrders = filteredPurchaseRequests.map(request => ({
        ...request,
        skus: request.skus.filter(sku => 
            sku.vendors[0].poStatus && 
            IN_TRANSIT_STATUSES.includes(sku.vendors[0].poStatus)
        )
    })).filter(request => request.skus.length > 0);
<<<<<<< HEAD

    $: inTransitOrders2 = filteredPurchaseRequests.reduce<VendorWithSkus[]>((vendors, request) => {
        request.skus.forEach(sku => {
            const approvedVendor = sku.vendors[0];
            if (IN_TRANSIT_STATUSES.includes(approvedVendor.poStatus)) {
                let vendorGroup = vendors.find(v => v.vendorId === approvedVendor.vendorId);
                if (!vendorGroup) {
                    vendorGroup = {
                        vendorId: approvedVendor.vendorId,
                        items: []
                    };
                    vendors.push(vendorGroup);
                }
                
                vendorGroup.items.push({
                    requestId: request.id,
                    sku,
                    poNumber: approvedVendor.poNumber,
                    poStatus: approvedVendor.poStatus
                });
            }
        });
        return vendors;
    }, []);

    // --- Methods ---
    async function handlePoUpdate(
        params: {
            requestId: string;
            sku: SKU;
            vendorId: string;
            poNumber: string;
            poStatus: string;
        }
=======

    // --- Methods ---
    async function handlePoUpdate(
        po: { request: PurchaseRequest; sku: SKU; vendor: Vendor },
        poNumber: string,
        poStatus: string,
>>>>>>> 553e233f085c4703db13b12030cce13bef3e5b77
    ) {
        const { requestId, sku, vendorId, poNumber, poStatus } = params;

        if (!poNumber || !poStatus) {
            showMessage("Error", "PO Number and Status are required.");
            return;
        }        

<<<<<<< HEAD
        const requestRef = doc(db, "purchaseRequests", requestId);

        try {
            // Get the current request data
            const currentRequest = $purchaseRequests.find(r => r.id === requestId);
=======
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
>>>>>>> 553e233f085c4703db13b12030cce13bef3e5b77
            if (!currentRequest) {
                throw new Error("Request not found");
            }

            // Create a deep copy of SKUs to avoid direct store mutation
            const updatedSkus = JSON.parse(JSON.stringify(currentRequest.skus));

            // Find the specific SKU
<<<<<<< HEAD
            const skuToUpdate = updatedSkus.find((s: SKU) => s.sku === sku.sku);
=======
            const skuToUpdate = updatedSkus.find((s: SKU) => s.sku === po.sku.sku);
>>>>>>> 553e233f085c4703db13b12030cce13bef3e5b77
            if (!skuToUpdate) {
                throw new Error("SKU not found in request");
            }

            // Find and update the specific vendor
<<<<<<< HEAD
            const vendorToUpdate = skuToUpdate.vendors.find((v: Vendor) => v.vendorId === vendorId);
=======
            const vendorToUpdate = skuToUpdate.vendors.find((v: Vendor) => v.vendorId === po.vendor.vendorId);
>>>>>>> 553e233f085c4703db13b12030cce13bef3e5b77
            if (!vendorToUpdate) {
                throw new Error("Vendor not found in SKU");
            }

            // Update vendor details
            vendorToUpdate.poNumber = poNumber;
            vendorToUpdate.poStatus = poStatus;

            // Create history log
            const newHistoryLog: HistoryLog = {
<<<<<<< HEAD
                status: `PO for SKU ${sku.sku} updated to '${poStatus}'`,
=======
                status: `PO for SKU ${po.sku.sku} updated to '${poStatus}'`,
>>>>>>> 553e233f085c4703db13b12030cce13bef3e5b77
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
<<<<<<< HEAD
                const requestIndex = updatedRequests.findIndex(r => r.id === requestId);
=======
                const requestIndex = updatedRequests.findIndex(r => r.id === po.request.id);
>>>>>>> 553e233f085c4703db13b12030cce13bef3e5b77
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
<<<<<<< HEAD
                `PO Status updated for SKU ${sku.sku} to ${poStatus}`
=======
                `PO Status updated for SKU ${po.sku.sku} to ${poStatus}`
>>>>>>> 553e233f085c4703db13b12030cce13bef3e5b77
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
<<<<<<< HEAD
            <!-- Pipeline Orders ({pipelineOrders.length}) -->
            Pipeline Orders (0)
=======
            Pipeline Orders ({pipelineOrders.length})
>>>>>>> 553e233f085c4703db13b12030cce13bef3e5b77
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
                            <th>SKU</th>
                            <th>Vendor</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
<<<<<<< HEAD
                        {#each pipelineOrders as skuGroup}
                            {#each skuGroup.vendors as vendor, vendorIndex}
                                <tr>
                                    {#if vendorIndex === 0}
                                        <td class="font-mono" rowspan={skuGroup.vendors.length}>
                                            {skuGroup.skuId}
                                        </td>
                                    {/if}
                                    <td>
                                        <div class="flex flex-col">
                                            <span class="font-semibold">{vendor.vendorName}</span>
                                            <span class="text-xs">AGMID: {vendor.vendorAgmId}</span>
                                        </div>
                                    </td>
                                    <td>{vendor.quantityAvailable}</td>
                                    <td>₹{vendor.cpWithGst}</td>
                                    <td>
                                        <div class="badge badge-outline">
                                            {vendor.opsStatus}
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            class="btn btn-sm btn-primary"
                                            on:click={() => selectedOrder = { sku: skuGroup.skuId, ...vendor }}
                                        >
                                            Update
                                        </button>
                                    </td>
                                </tr>
                            {/each}
=======
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
>>>>>>> 553e233f085c4703db13b12030cce13bef3e5b77
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
                            <th>Vendor ID</th>
                            <th>Request ID</th>
                            <th>SKU</th>
                            <th>PO Number</th>
                            <th>PO Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
<<<<<<< HEAD
                    {#each businessOrders2 as vendor (vendor.vendorId)}
                        {#each vendor.items as item, itemIndex (item.sku.sku)}
                            <tr>
                                {#if itemIndex === 0}
                                    <td class="font-bold" rowspan={vendor.items.length}>
                                        {vendor.vendorId}
                                    </td>
                                {/if}
                                <td class="font-mono text-xs">{item.requestId}</td>
                                <td>{item.sku.sku}</td>
                                <td>
                                    <input
                                        id={`po-num-business-${item.requestId}-${item.sku.sku}`}
                                        type="text"
                                        placeholder="Enter PO Number"
                                        class="input input-sm input-bordered w-full max-w-xs"
                                        value={item.poNumber || ""}
=======
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
>>>>>>> 553e233f085c4703db13b12030cce13bef3e5b77
                                    />
                                </td>
                                <td>
                                    <select
<<<<<<< HEAD
                                        id={`po-status-business-${item.requestId}-${item.sku.sku}`}
=======
                                        id={`po-status-business-${request.id}-${sku.sku}`}
>>>>>>> 553e233f085c4703db13b12030cce13bef3e5b77
                                        class="select select-sm select-bordered w-full max-w-xs"
                                    >
                                        <option
                                            value=""
                                            disabled
<<<<<<< HEAD
                                            selected={item.poStatus === ""}
=======
                                            selected={sku.vendors[0].poStatus === ""}
>>>>>>> 553e233f085c4703db13b12030cce13bef3e5b77
                                            >Select Status</option
                                        >
                                        <option
                                            value="PO Issued | Stock Ready | Pending for Pickup"
<<<<<<< HEAD
                                            selected={item.poStatus ===
=======
                                            selected={sku.vendors[0].poStatus ===
>>>>>>> 553e233f085c4703db13b12030cce13bef3e5b77
                                                "PO Issued | Stock Ready | Pending for Pickup"}
                                            >PO Issued | Stock Ready | Pending
                                            for Pickup</option
                                        >
                                        <option
                                            value="PO Issued | Stock Not Ready"
<<<<<<< HEAD
                                            selected={item.poStatus ===
=======
                                            selected={sku.vendors[0].poStatus ===
>>>>>>> 553e233f085c4703db13b12030cce13bef3e5b77
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
<<<<<<< HEAD
                                                    `po-num-business-${item.requestId}-${item.sku.sku}`
                                                ) as HTMLInputElement;
                                            const poStatusInput =
                                                document.getElementById(
                                                    `po-status-business-${item.requestId}-${item.sku.sku}`
                                                ) as HTMLSelectElement;
                                            handlePoUpdate({
                                                requestId: item.requestId,
                                                sku: item.sku,
                                                vendorId: vendor.vendorId,
                                                poNumber: poNumInput.value,
                                                poStatus: poStatusInput.value
                                            });
=======
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
>>>>>>> 553e233f085c4703db13b12030cce13bef3e5b77
                                        }}>Update</button
                                    >
                                </td>
                            </tr>
                        {/each}
                        {/each}
<<<<<<< HEAD
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
                            <th>VendorID</th>
                            <th>Request ID</th>
                            <th>SKU</th>
                            <th>PO Number</th>
                            <th>PO Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each inTransitOrders2 as vendor (vendor.vendorId)}
                        {#each vendor.items as item, itemIndex (item.sku.sku)}
                                <tr>
                                    {#if itemIndex === 0}
                                        <td class="font-bold" rowspan={vendor.items.length}>
                                            {vendor.vendorId}
                                        </td>
                                    {/if}
                                    <td class="font-mono text-xs">{item.requestId}</td>
                                    <td>{item.sku.sku}</td>
                                    <td>
                                        <input
                                            id={`po-num-transit-${item.requestId}-${item.sku.sku}`}
                                            type="text"
                                            placeholder="Enter PO Number"
                                            class="input input-sm input-bordered w-full max-w-xs"
                                            value={item.poNumber || ""}
                                        />
                                    </td>
                                    <td>
                                        <select
                                            id={`po-status-transit-${item.requestId}-${item.sku.sku}`}
                                            class="select select-sm select-bordered w-full max-w-xs"
                                        >
                                            <option
                                                value=""
                                                disabled
                                                selected={item.poStatus === ""}
                                                >Select Status</option
                                            >
                                            <option
                                                value="Dispatched"
                                                selected={item.poStatus ===
                                                    "Dispatched"}>Dispatched</option
                                            >
                                            <option
                                                value="In transit"
                                                selected={item.poStatus ===
                                                    "In transit"}>In transit</option
                                            >
                                            <option
                                                value="Reached at WH | Receiving Pending"
                                                selected={item.poStatus ===
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
                                                    `po-num-transit-${item.requestId}-${item.sku.sku}`
                                                ) as HTMLInputElement;
                                                const poStatusInput = document.getElementById(
                                                    `po-status-transit-${item.requestId}-${item.sku.sku}`
                                                ) as HTMLSelectElement;
                                                handlePoUpdate({
                                                    requestId: item.requestId,
                                                    sku: item.sku,
                                                    vendorId: vendor.vendorId,
                                                    poNumber: poNumInput.value,
                                                    poStatus: poStatusInput.value
                                                });
                                            }}
                                            >Update</button
                                        >
                                    </td>
                                </tr>
                            {/each}
                        {/each}
=======
>>>>>>> 553e233f085c4703db13b12030cce13bef3e5b77
                    </tbody>
                </table>
            </div>
        {/if}
    {/if}
<<<<<<< HEAD
</div>

<!-- Modal for Updating Order Details of PipelineTab -->
{#if selectedOrder}
    <div class="modal modal-open">
        <div class="modal-box w-11/12 max-w-4xl">
            <h3 class="font-bold text-lg mb-4">Update Order Details</h3>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
                <!-- Basic Info -->
                <div class="card bg-base-200 p-4">
                    <h4 class="font-semibold mb-2">Basic Information</h4>
                    <p><span class="font-medium">SKU:</span> {selectedOrder.sku}</p>
                    <p><span class="font-medium">Vendor:</span> {selectedOrder.vendorName}</p>
                    <p><span class="font-medium">AGMID:</span> {selectedOrder.vendorAgmId}</p>
                    <p><span class="font-medium">Supply POC:</span> {selectedOrder.supplyPoc}</p>
                </div>

                <!-- Pickup Details -->
                <div class="card bg-base-200 p-4">
                    <h4 class="font-semibold mb-2">Pickup Details</h4>
                    <p><span class="font-medium">District:</span> {selectedOrder.pickupDetails.district}</p>
                    <p><span class="font-medium">State:</span> {selectedOrder.pickupDetails.state}</p>
                    <p><span class="font-medium">PIN:</span> {selectedOrder.pickupDetails.pin}</p>
                    <p><span class="font-medium">Date:</span> {new Date(selectedOrder.pickupDetails.date).toLocaleDateString()}</p>
                </div>
            </div>

            <!-- Update Section -->
            <div class="form-control gap-4">
                <div>
                    <label class="label">
                        <span class="label-text">PO Number</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Enter PO Number"
                        class="input input-bordered w-full"
                        value={selectedOrder.poNumber || ""}
                        id="modal-po-number"
                    />
                </div>

                <div>
                    <label class="label">
                        <span class="label-text">PO Status</span>
                    </label>
                    <select
                        class="select select-bordered w-full"
                        id="modal-po-status"
                    >
                        <option value="" disabled selected={!selectedOrder.poStatus}>Select Status</option>
                        <option value="PO Issued | Stock Ready">PO Issued | Stock Ready</option>
                        <option value="PO Issued | Stock Not Ready">PO Issued | Stock Not Ready</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div class="modal-action">
                <button 
                    class="btn btn-primary"
                    on:click={() => {
                        const poNum = document.getElementById('modal-po-number') as HTMLInputElement;
                        const poStatus = document.getElementById('modal-po-status') as HTMLSelectElement;
                        handlePoUpdate({
                            requestId: selectedOrder.vendorAgmId,
                            sku: { sku: selectedOrder.sku } as SKU,
                            vendorId: selectedOrder.vendorAgmId,
                            poNumber: poNum.value,
                            poStatus: poStatus.value
                        });
                        selectedOrder = null;
                    }}
                >
                    Save Changes
                </button>
                <button 
                    class="btn btn-ghost"
                    on:click={() => selectedOrder = null}
                >
                    Close
                </button>
            </div>
        </div>
    </div>
{/if}
=======

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
>>>>>>> 553e233f085c4703db13b12030cce13bef3e5b77
