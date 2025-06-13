// dummy.ts

import {
    type Vendor,
    type SKU,
    type HistoryLog,
    type PurchaseRequest,
    type SupplyOpsBusiness,
    type SupplyOpsPipeline,
    type ModalState,
    SupplyTeamSegment,
    VendorQRCondition,
    DemandOrderStatus,
    SupplyBookingStatus,
    BookedAgainst,
    TypeOfPurchase,
    BrandInvoiceAlignment,
    DispatchType,
    OpsStatus,
    ApprovalStatus,
    type SupplyInput,
    type EnhancedVendor,
    type EnhancedSKU,
    type SupplyInputWithContext,
    type SupplyInputFormData,
    type SupplyInputResponse,
    type BulkSupplyInputOperation,
} from './types';

/**
 * Dummy Data
 */

// Sample vendor data
export const dummyVendor: Vendor = {
    vendorId: 'V001',
    vendorPrice: 150.75,
    supplyPoc: 'Alice Johnson',
    vendorPaymentTerms: 'NET30',
    brandInvoiceAlignment: 'Aligned',
    pickupAddress: '123 Industrial Rd, Sector 10, Noida',
    flashSale: true,
    expectedPickupTime: Date.now() + 86400000, // 24 hours from now
    vendorStatus: 'Approved',
    poNumber: 'PO-789012',
    poStatus: 'Issued',
};

// Sample SKU data
export const dummySKU: SKU = {
    sku: 'SKU-ABC-001',
    quantity: 100,
    expectedPrice: 160.0,
    vendors: [dummyVendor],
    unmaskedProductName: 'Gadget X Pro',
    superCategory: 'Electronics',
    brand: 'TechGadget',
    asv: 155.5,
    seasonality: 'High',
    seasonDuration: 'Q4',
};

// Sample history log
export const dummyHistoryLog: HistoryLog = {
    status: 'Pending at Supply Ops',
    user: 'John Doe',
    timestamp: Date.now() - 3600000, // 1 hour ago
};

// Sample purchase request
export const dummyPurchaseRequest: PurchaseRequest = {
    id: 'PR-2023-001',
    proposedWh: 'Warehouse-North',
    skus: [dummySKU],
    status: 'Pending Approval',
    initiatedBy: 'Jane Smith',
    history: [dummyHistoryLog],
    createdAt: Date.now() - 7200000, // 2 hours ago
};

// Sample SupplyOpsBusiness
export const dummySupplyOpsBusiness: SupplyOpsBusiness = {
    request: dummyPurchaseRequest,
    sku: dummySKU,
    vendor: dummyVendor,
    poNumber: 'PO-789012',
    poStatus: 'Issued',
    unmaskedProductName: 'Gadget X Pro',
    superCategory: 'Electronics',
    brand: 'TechGadget',
    asv: 155.5,
    seasonality: 'High',
    seasonDuration: 'Q4',
    proposedWh: 'Warehouse-North',
    initiatedBy: 'Jane Smith',
    history: [dummyHistoryLog],
};

// Sample SupplyOpsPipeline
export const dummySupplyOpsPipeline: SupplyOpsPipeline = {
    request: dummyPurchaseRequest,
    sku: dummySKU,
    vendor: dummyVendor,
    poNumber: 'PO-789012',
    poStatus: 'Issued',
};

// Sample EnhancedVendor
export const dummyEnhancedVendor: EnhancedVendor = {
    vendorId: dummyVendor.vendorId,
    vendorPrice: dummyVendor.vendorPrice,
    supplyPoc: dummyVendor.supplyPoc,
    vendorPaymentTerms: dummyVendor.vendorPaymentTerms,
    brandInvoiceAlignment: dummyVendor.brandInvoiceAlignment,
    pickupAddress: dummyVendor.pickupAddress,
    flashSale: dummyVendor.flashSale,
    expectedPickupTime: dummyVendor.expectedPickupTime,
    vendorStatus: dummyVendor.vendorStatus,
    poNumber: dummyVendor.poNumber,
    poStatus: dummyVendor.poStatus,
    vendorAgmId: 'VAGM-001',
    vendorName: 'Global Suppliers Inc.',
    vendorDistrict: 'Noida',
    vendorState: 'Uttar Pradesh',
    vendorPin: 201301,
    vendorMoq: 50,
    vendorQrCondition: VendorQRCondition.FULLY_INTACT,
    expiryDetails: '2025-12-31',
    packagingCondition: 'New',
};

// Sample EnhancedSKU
export const dummyEnhancedSKU: EnhancedSKU = {
    sku: dummySKU.sku,
    quantity: dummySKU.quantity,
    expectedPrice: dummySKU.expectedPrice,
    vendors: dummySKU.vendors,
    unmaskedProductName: dummySKU.unmaskedProductName,
    superCategory: dummySKU.superCategory,
    brand: dummySKU.brand,
    asv: dummySKU.asv,
    seasonality: dummySKU.seasonality,
    seasonDuration: dummySKU.seasonDuration,
    skuIdFromModule: 'SKU-ABC-001-MOD',
    cpWithGst: 180.0,
    quantityAvailable: 100,
    expiryDetails: '2025-12-31',
    packagingCondition: 'New',
    inventoryQuantity: 50,
    warehouseQuantityAgainstOrder: 30,
    quantityAgainstOrder: 20,
};

// Sample SupplyInput
export const dummySupplyInput: SupplyInput = {
    agmId: 'AGM-12345',
    skuIdSkuModule: 'SKU-MOD-001',
    cpWithGst: 180.0,
    quantityAvailable: 50,
    description: 'Latest model of Gadget X with advanced features.',
    supplyPoc: 'Bob Green',
    supplyTeamSegment: SupplyTeamSegment.RETAIL,
    vendorAgmId: 'VAGM-001',
    skuId: 'SKU-ABC-001',
    pickupLocationSameAsVendorLocation: true,
    pickupDistrict: 'Noida',
    pickupState: 'Uttar Pradesh',
    pickupPin: 201301,
    vendorQrCondition: VendorQRCondition.FULLY_INTACT,
    vendorMoq: 10,
    expiryDetails: 'Batch expires Dec 2025',
    packagingCondition: 'Good',
    supplyStatus: 'Available',
    remainingQuantity: 50,

    vendorName: 'Global Suppliers Inc.',
    cpId: 'CP-001',
    currentSupplyBookStatus: 'Supply Booked',
    vendorDistrictSi: 'Noida',
    vendorStateSi: 'Uttar Pradesh',
    vendorPinSi: 201301,

    demandOrderStatus: DemandOrderStatus.ORDER_BOOKED,
    estimateBookedQuantity: 40,
    estimates: 'Based on last quarter sales',
    supplyOrderBookTime: Date.now() - 1800000, // 30 minutes ago
    supplyOrderBookModifiedTime: Date.now() - 600000, // 10 minutes ago
    criticalShippingAddress: 'Warehouse-South, Bangalore',
    remarks: 'Urgent requirement for Q4',
    history: 'Order placed, awaiting pickup.',
    supplyBookedQuantity: 40,
    supplyBookingStatus: SupplyBookingStatus.SUPPLY_BOOKED,
    bookedAgainst: BookedAgainst.ORDER,
    typeOfPurchase: TypeOfPurchase.READY_AT_SELLER_WH,
    inventoryQuantity: 0,
    warehouseQuantityAgainstOrder: 0,
    quantityAgainstOrder: 40,
    warehouseName: 'Warehouse-North',
    pickupDate: Date.now() + 172800000, // 2 days from now
    advanceAmount: 1000,
    vendorReadyForBrandInvoice: BrandInvoiceAlignment.ALIGNED,
    priceValidity: Date.now() + 259200000, // 3 days from now
    vendorReadyForManifestations: true,
    companyBilling: true,

    dispatchType: DispatchType.REGULAR,
    opsStatus: OpsStatus.FTL_ALIGNED,
    reasonOfDelayInPickup: '',
    poIssued: true,
    revisedPickupDate: Date.now() + 172800000,
    poNumber: 'PO-789012',
    supplyOpsRemarks: 'Pickup scheduled for Friday.',

    approvalStatus: ApprovalStatus.APPROVED,
    approverRemarks: 'Approved based on current demand.',
    approvedBy: 'Catherine White',
    approvalTime: Date.now() - 3600000,
};

export const dummySupplyInputWithContext: SupplyInputWithContext = {
    supplyInput: dummySupplyInput,
    purchaseRequest: dummyPurchaseRequest,
    sku: dummyEnhancedSKU,
    vendor: dummyEnhancedVendor,
    warehouseName: 'Warehouse-North',
    proposedWh: 'Warehouse-North',
    initiatedBy: 'Jane Smith',
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 600000,
};

export const dummySupplyInputFormData: SupplyInputFormData = {
    agmId: 'AGM-12345',
    skuIdSkuModule: 'SKU-MOD-001',
    cpWithGst: '180.00',
    quantityAvailable: '50',
    supplyPoc: 'Bob Green',
    supplyTeamSegment: SupplyTeamSegment.RETAIL,
    vendorAgmId: 'VAGM-001',
    skuId: 'SKU-ABC-001',
    pickupDistrict: 'Noida',
    pickupState: 'Uttar Pradesh',
    pickupPin: '201301',
    vendorName: 'Global Suppliers Inc.',
    pickupDate: (Date.now() + 172800000).toString(), // Convert timestamp to string
    description: 'Latest model of Gadget X with advanced features.',
    pickupLocationSameAsVendorLocation: true,
    vendorQrCondition: VendorQRCondition.FULLY_INTACT,
    vendorMoq: '10',
    expiryDetails: 'Batch expires Dec 2025',
    packagingCondition: 'Good',
    supplyStatus: 'Available',
};

/**
 * Mock Functions (Simulating API Calls)
 */

export async function fetchPurchaseRequestById(
    id: string
): Promise<PurchaseRequest | null> {
    console.log(`[DEMO] Fetching Purchase Request with ID: ${id}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            if (id === dummyPurchaseRequest.id) {
                resolve(dummyPurchaseRequest);
            } else {
                resolve(null);
            }
        }, 500); // Simulate network delay
    });
}

export async function createSupplyInput(
    data: SupplyInput
): Promise<SupplyInputResponse> {
    console.log('[DEMO] Creating Supply Input:', data);
    return new Promise((resolve) => {
        setTimeout(() => {
            if (data.agmId && data.skuId) {
                resolve({
                    success: true,
                    message: 'Supply Input created successfully.',
                    data: { ...data, cpId: 'CP-NEW-001' }, // Simulate assigning a new CP ID
                });
            } else {
                resolve({
                    success: false,
                    message: 'Failed to create Supply Input. Missing required fields.',
                    errors: { agmId: 'Required', skuId: 'Required' },
                });
            }
        }, 700);
    });
}

export async function updateSupplyInput(
    id: string,
    data: Partial<SupplyInput>
): Promise<SupplyInputResponse> {
    console.log(`[DEMO] Updating Supply Input with ID: ${id}`, data);
    return new Promise((resolve) => {
        setTimeout(() => {
            if (id === dummySupplyInput.cpId) {
                resolve({
                    success: true,
                    message: 'Supply Input updated successfully.',
                    data: { ...dummySupplyInput, ...data }, // Merge existing with new data
                });
            } else {
                resolve({
                    success: false,
                    message: 'Supply Input not found.',
                });
            }
        }, 600);
    });
}

export async function fetchAllSupplyInputs(): Promise<SupplyInput[]> {
    console.log('[DEMO] Fetching all Supply Inputs.');
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([dummySupplyInput, { ...dummySupplyInput, agmId: 'AGM-54321', cpId: 'CP-002', quantityAvailable: 75 }]);
        }, 800);
    });
}

export async function performBulkSupplyOperation(
    operationData: Omit<BulkSupplyInputOperation, 'processedAt' | 'results'>
): Promise<BulkSupplyInputOperation> {
    console.log('[DEMO] Performing bulk operation:', operationData);
    return new Promise((resolve) => {
        setTimeout(() => {
            const successful = operationData.supplyInputs.length;
            resolve({
                ...operationData,
                processedAt: Date.now(),
                results: {
                    successful,
                    failed: 0,
                    errors: []
                }
            });
        }, 1000);
    });
}

/**
 * Pipeline and Business Order Filtering Functions
 */

// Get all POs for the Pipeline tab (not yet received or cancelled)
export function getPipelineOrders(): SupplyOpsPipeline[] {
    return [
        {
            ...dummySupplyOpsPipeline,
            poStatus: 'Issued',
            request: {
                ...dummyPurchaseRequest,
                status: 'Approved'
            }
        },
        {
            ...dummySupplyOpsPipeline,
            poNumber: 'PO-789013',
            poStatus: 'Issued',
            request: {
                ...dummyPurchaseRequest,
                id: 'PR-2023-002',
                status: 'Approved'
            }
        }
    ];
}

// Get all POs for the Business tab (received or cancelled)
export function getBusinessOrders(): SupplyOpsBusiness[] {
    return [
        {
            ...dummySupplyOpsBusiness,
            poStatus: 'Received at WH',
            request: {
                ...dummyPurchaseRequest,
                status: 'Completed'
            }
        },
        {
            ...dummySupplyOpsBusiness,
            poNumber: 'PO-789013',
            poStatus: 'Cancelled',
            request: {
                ...dummyPurchaseRequest,
                id: 'PR-2023-002',
                status: 'Cancelled'
            }
        }
    ];
}

// Get all POs for the In Transit tab (dispatched status)
export function getInTransitOrders(): SupplyOpsPipeline[] {
    return [
        {
            ...dummySupplyOpsPipeline,
            poStatus: 'Dispatched',
            request: {
                ...dummyPurchaseRequest,
                status: 'Dispatched'
            }
        },
        {
            ...dummySupplyOpsPipeline,
            poNumber: 'PO-789013',
            poStatus: 'Dispatched',
            request: {
                ...dummyPurchaseRequest,
                id: 'PR-2023-002',
                status: 'Dispatched'
            }
        }
    ];
}

/**
 * Example usage of fetch functions (for testing within your app)
 */
async function demoFetchUsage() {
    console.log('\n--- Demonstrating Fetch Functions ---');

    const pr = await fetchPurchaseRequestById('PR-2023-001');
    console.log('Fetched Purchase Request:', pr);

    const newSupplyInput: SupplyInput = {
        ...dummySupplyInput,
        cpId: undefined, // Let the mock API assign this
        agmId: 'AGM-DEMO-001',
        skuId: 'SKU-DEMO-001',
        supplyPoc: 'Chris Demo',
        vendorName: 'Demo Vendor Corp',
        pickupDate: Date.now() + 86400000,
    };
    const createResponse = await createSupplyInput(newSupplyInput);
    console.log('Create Supply Input Response:', createResponse);
  
    if (createResponse.success && createResponse.data?.cpId) {
      const updateResponse = await updateSupplyInput(createResponse.data.cpId, {
        quantityAvailable: 60,
        remarks: 'Updated quantity based on recent stock check.',
      });
      console.log('Update Supply Input Response:', updateResponse);
    }
  
    const allSupplyInputs = await fetchAllSupplyInputs();
    console.log('All Supply Inputs:', allSupplyInputs);
  
    const bulkOperationData: Omit<BulkSupplyInputOperation, 'processedAt' | 'results'> = {
      operation: 'create',
      supplyInputs: [
        { ...dummySupplyInput, agmId: 'AGM-BULK-001', cpId: undefined, skuId: 'SKU-BULK-001' },
        { ...dummySupplyInput, agmId: 'AGM-BULK-002', cpId: undefined, skuId: 'SKU-BULK-002' },
      ],
      batchId: 'BATCH-XYZ-001',
    };
    const bulkResult = await performBulkSupplyOperation(bulkOperationData);
    console.log('Bulk Operation Result:', bulkResult);
  }
  
  // Uncomment the line below to run the demo usage when this file is imported
  // demoFetchUsage();