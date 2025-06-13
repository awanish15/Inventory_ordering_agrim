<script lang="ts">
    import { purchaseRequests } from "../stores";
    // Reactive declaration: this code runs whenever the purchaseRequests store changes.
    $: requests = $purchaseRequests;

    // Format timestamp to readable date
    function formatDate(timestamp: number): string {
        return new Date(timestamp).toLocaleString();
    }
</script>

<div class="prose max-w-none">
    <h2 class="text-2xl font-bold mb-6">System-Wide Dashboard</h2>

    {#if requests.length === 0}
        <div class="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>No purchase requests found. The Category team can initiate a new one.</span>
        </div>
    {:else}
        <div class="space-y-4">
            {#each requests as request (request.id)}
                <div class="collapse bg-base-200 border border-base-300 mb-4">
                    <input type="checkbox" />
                    <div class="collapse-title">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-2">
                                <span class="font-semibold">Request ID:</span>
                                <span class="font-mono text-sm">{request.id}</span>
                                <div class="badge badge-primary">{request.status}</div>
                            </div>
                            <div class="text-sm">
                                Created: {formatDate(request.createdAt)}
                            </div>
                        </div>
                    </div>

                    <div class="collapse-content">
                        <!-- Basic Information Card -->
                        <div class="card bg-base-100 shadow-sm mb-4">
                            <div class="card-body">
                                <h3 class="card-title text-lg">Basic Information</h3>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <p><strong>Proposed Warehouse:</strong> {request.proposedWh}</p>
                                        <p><strong>Initiated By:</strong> {request.initiatedBy}</p>
                                        <p><strong>Current Status:</strong> {request.status}</p>
                                    </div>
                                    <div>
                                        <p><strong>Created:</strong> {formatDate(request.createdAt)}</p>
                                        <p><strong>Total SKUs:</strong> {request.skus.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- SKUs Information -->
                        <div class="card bg-base-100 shadow-sm mb-4">
                            <div class="card-body">
                                <h3 class="card-title text-lg">SKUs Information</h3>
                                <div class="overflow-x-auto">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>SKU</th>
                                                <th>Product Name</th>
                                                <th>Brand</th>
                                                <th>Category</th>
                                                <th>Quantity</th>
                                                <th>Expected Price</th>
                                                <th>ASV</th>
                                                <th>Seasonality</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {#each request.skus as sku (sku.sku)}
                                                <tr>
                                                    <td class="font-mono">{sku.sku}</td>
                                                    <td>{sku.unmaskedProductName || 'N/A'}</td>
                                                    <td>{sku.brand || 'N/A'}</td>
                                                    <td>{sku.superCategory || 'N/A'}</td>
                                                    <td>{sku.quantity}</td>
                                                    <td>₹{sku.expectedPrice}</td>
                                                    <td>{sku.asv || 'N/A'}</td>
                                                    <td>{sku.seasonality || 'N/A'}</td>
                                                </tr>
                                            {/each}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <!-- Vendor Information -->
                        <div class="card bg-base-100 shadow-sm mb-4">
                            <div class="card-body">
                                <h3 class="card-title text-lg">Vendor Details</h3>
                                {#each request.skus as sku (sku.sku)}
                                    <div class="mb-4">
                                        <h4 class="font-semibold">SKU: {sku.sku}</h4>
                                        <div class="overflow-x-auto">
                                            <table class="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Vendor ID</th>
                                                        <th>Status</th>
                                                        <th>Price</th>
                                                        <th>Payment Terms</th>
                                                        <th>Logistics</th>
                                                        <th>PO Status</th>
                                                        <th>Return Days</th>
                                                        <th>SOR Flag</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {#each sku.vendors as vendor}
                                                        <tr class:bg-success-content={vendor.vendorStatus === "Approved"}>
                                                            <td>{vendor.vendorId}</td>
                                                            <td>
                                                                <div class="badge" class:badge-success={vendor.vendorStatus === "Approved"} class:badge-warning={vendor.vendorStatus === "Pending"} class:badge-error={vendor.vendorStatus === "Rejected"}>
                                                                    {vendor.vendorStatus}
                                                                </div>
                                                            </td>
                                                            <td>₹{vendor.vendorPrice}</td>
                                                            <td>{vendor.vendorPaymentTerms}</td>
                                                            <td>{vendor.logistics || 'N/A'}</td>
                                                            <td>{vendor.poStatus || 'N/A'}</td>
                                                            <td>{vendor.returnDays || 'N/A'}</td>
                                                            <td>{vendor.SORFlag || 'N/A'}</td>
                                                        </tr>
                                                    {/each}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>

                        <!-- History Timeline -->
                        <div class="card bg-base-100 shadow-sm">
                            <div class="card-body">
                                <h3 class="card-title text-lg">History Timeline</h3>
                                <ul class="timeline timeline-vertical">
                                    {#each request.history as log}
                                        <li>
                                            <div class="timeline-start">{formatDate(log.timestamp)}</div>
                                            <div class="timeline-middle">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                                                </svg>
                                            </div>
                                            <div class="timeline-end timeline-box">
                                                <p class="font-medium">{log.status}</p>
                                                <p class="text-sm">By: {log.user}</p>
                                            </div>
                                        </li>
                                    {/each}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>