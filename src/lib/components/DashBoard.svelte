<script lang="ts">
    import { purchaseRequests } from "../stores";
    // Reactive declaration: this code runs whenever the purchaseRequests store changes.
    $: requests = $purchaseRequests;
</script>

<div class="prose max-w-none">
    <h2 class="text-2xl font-bold mb-6">System-Wide Dashboard</h2>

    {#if requests.length === 0}
        <div class="alert alert-info">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="stroke-current shrink-0 w-6 h-6"
                ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path></svg
            >
            <span
                >No purchase requests found. The Category team can initiate a
                new one.</span
            >
        </div>
    {:else}
        <div class="space-y-4">
            {#each requests as request (request.id)}
                <div class="collapse bg-base-200 border border-base-300 mb-4">
                    <input type="checkbox" />
                    <div
                        class="collapse-title font-semibold flex items-center gap-2"
                    >
                        Request ID: <span class="font-mono text-sm"
                            >{request.id}</span
                        >
                        <div class="badge badge-primary">
                            {request.status}
                        </div>
                    </div>
                    <div class="collapse-content">
                        <p class="text-sm mt-2">
                            <strong>Proposed WH:</strong>
                            {request.proposedWh}
                        </p>
                        <div class="overflow-x-auto mt-4">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>SKU</th>
                                        <th>Quantity</th>
                                        <th>Approved Vendor</th>
                                        <th>PO Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each request.skus as sku (sku.sku)}
                                        {@const approvedVendor =
                                            sku.vendors?.find(
                                                (v) =>
                                                    v.vendorStatus ===
                                                    "Approved",
                                            )}
                                        <tr>
                                            <td>{sku.sku}</td>
                                            <td>{sku.quantity}</td>
                                            <td
                                                >{approvedVendor?.vendorId ||
                                                    "N/A"}</td
                                            >
                                            <td
                                                >{approvedVendor?.poStatus ||
                                                    "N/A"}</td
                                            >
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
