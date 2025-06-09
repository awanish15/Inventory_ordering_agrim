// Represents a single vendor's information and quote for a SKU
export interface Vendor {
    vendorId: string;
    vendorPrice: number;
    supplyPoc: string;// Point of Contact from the Supply team
    vendorPaymentTerms: string;
    brandInvoiceAlignment: string;
    pickupAddress: string;
    flashSale: boolean;
    expectedPickupTime: number; // Stored as a timestamp (milliseconds since epoch)
    vendorStatus?: 'Pending' | 'Approved' | 'Rejected';
    // PO fields managed by Supply Ops
    poNumber?: string;
    poStatus?: string;
}


// Represents a Stock Keeping Unit (SKU) within a purchase request
export interface SKU {
    sku: string;
    quantity: number;
    expectedPrice: number;
    vendors: Vendor[];
    unmaskedProductName: string | null;
    superCategory: string | null;
    brand: string | null;
    asv: number | null;
    seasonality: string | null;
    seasonDuration: string | null;
}

// Represents a single log entry in the request's history
export interface HistoryLog {
    status: string;
    user: string;
    timestamp: number; // Milliseconds since epoch
}

// The main Purchase Request object, the central data structure for the app
export interface PurchaseRequest {
    id: string; // Document ID from Firestore
    proposedWh: string;
    skus: SKU[];
    status: string;
    initiatedBy: string;
    history: HistoryLog[];
    createdAt: number; // Milliseconds since epoch
}

export interface SupplyOpsBusiness {
    request: PurchaseRequest;
    sku: SKU;
    vendor: Vendor;
    poNumber: string;
    poStatus: string;
}

export interface SupplyOpsPipeline {
    request: PurchaseRequest;
    sku: SKU;
    vendor: Vendor;
    poNumber: string;
    poStatus: string;
}

// Type for the writable store that controls the modal
export interface ModalState {
    show: boolean;
    title: string;
    message: string;
}
