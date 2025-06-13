// Represents a single vendor's information and quote for a SKU
export interface Vendor {
	vendorId: string;
	vendorPrice: number;
	supplyPoc: string; // Point of Contact from the Supply team
	vendorPaymentTerms: string;
	brandInvoiceAlignment: string;
	pickupAddress: string;
	flashSale: boolean;
	expectedPickupTime: number; // Stored as a timestamp (milliseconds since epoch)
	vendorStatus: "Pending" | "Approved" | "Rejected";
	// PO fields managed by Supply Ops
	poNumber: string | ""; // PO number can be null if not issued yet
	poStatus: string | ""; // PO status can be null if not issued yet
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
	unmaskedProductName: string | null;
	superCategory: string | null;
	brand: string | null;
	asv: number | null;
	seasonality: string | null;
	seasonDuration: string | null;
	proposedWh: string;
	initiatedBy: string;
	history: HistoryLog[];
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

// Enums for better type safety
export enum SupplyTeamSegment {
	RETAIL = "Retail",
	WHOLESALE = "Wholesale",
}

export enum VendorQRCondition {
	FULLY_INTACT = "Fully Intact on master pack and internal pack",
	SCRATCHED_MASTER = "Scratched on master box but code on internal pack is intact",
	SCRATCHED_BOTH = "Scratched on both inside and outside",
}

export enum DemandOrderStatus {
	ORDER_BOOKED = "Order Booked",
	DROPPED = "Dropped",
	ON_HOLD = "On Hold",
}

export enum SupplyBookingStatus {
	SUPPLY_BOOKED = "Supply Booked",
	AVAILABLE_SUPPLY = "Available Supply",
	SUPPLY_OOS = "Supply OOS",
	SUPPLY_DISPATCHED = "Supply Dispatched",
	CLOSED_PARTIALLY = "Closed - Partially",
}

export enum BookedAgainst {
	INVENTORY = "Inventory",
	ORDER = "Order",
	ORDERS_INVENTORY = "Orders + Inventory",
	ORDERS_PENDENCY = "Orders + Pendency",
	ORDERS_PENDENCY_INVENTORY = "Orders + Pendency + Inventory",
	PENDENCY = "Pendency",
}

export enum TypeOfPurchase {
	READY_AT_SELLER_WH = "Ready to move at seller's WH",
	MATERIAL_IN_TRANSIT = "Material in transit towards seller's WH",
	READY_AT_CNF_NOT_BILLED = "Ready to move at company's CnF but not billed yet, To be picked from CnF",
	READY_AT_CNF_PICK_FROM_SELLER = "Ready to move at company's CnF but not billed yet, To be picked from Seller WH",
	NONE_OF_ABOVE = "None of the above",
}

export enum BrandInvoiceAlignment {
	ALIGNED = "Aligned",
	NOT_ALIGNED = "Not Aligned",
	NOT_REQUIRED = "Not required for this product",
}

export enum DispatchType {
	CRITICAL = "Critical",
	REGULAR = "Regular",
}

export enum OpsStatus {
	FTL_ALIGNED = "FTL Aligned",
	EDD_SHARED = "EDD shared by vendor",
	PTL_ALIGNED = "PTL Aligned",
	VENDOR_CONFIRMATION_PENDING = "Vendor Confirmation Pending",
	ORDER_PENDING = "Order Pending",
	PENDING_AT_SUPPLY_OPS = "Pending at Supply Ops",
	DISPATCHED = "Dispatched",
	PARTIAL_DISPATCHED = "Partial Dispatched",
	OOS = "OOS",
	REALIGNED_TO_OTHER_VENDOR = "Realigned to other vendor",
	PENDING_AT_DEMAND = "Pending at Demand",
	PERMANENTLY_CANCELLED = "Permanently Cancelled",
	PARTIAL_DISPATCH_REST_CANCELLED = "Partial Dispatch & Rest Cancelled",
	ORDER_PENDING_FORECAST_FILLED = "Order Pending Forecast Filled",
}

export enum ApprovalStatus {
	APPROVED = "Approved",
	REJECTED = "Rejected",
	PENDING = "Pending",
}

// Main Supply Input interface
export interface SupplyInput {
	// Section 1 - Basic Information
	agmId: string;
	skuIdSkuModule: string;
	cpWithGst: number;
	quantityAvailable: number;
	description?: string;
	supplyPoc: string;
	supplyTeamSegment: SupplyTeamSegment;
	vendorAgmId: string;
	skuId: string;
	pickupLocationSameAsVendorLocation: boolean;
	pickupDistrict: string;
	pickupState: string;
	pickupPin: number;
	vendorQrCondition?: VendorQRCondition;
	vendorMoq?: number;
	expiryDetails?: string;
	packagingCondition?: string;
	supplyStatus?: string;
	remainingQuantity?: number; // private field

	// Auto Fill Section
	vendorName: string;
	cpId?: string; // autonumber
	currentSupplyBookStatus?: string; // private field
	vendorDistrictSi?: string;
	vendorStateSi?: string;
	vendorPinSi?: number;

	// Order Section
	demandOrderStatus?: DemandOrderStatus;
	estimateBookedQuantity?: number;
	estimates?: string;
	supplyOrderBookTime?: number; // timestamp
	supplyOrderBookModifiedTime?: number; // timestamp
	criticalShippingAddress?: string;
	remarks?: string;
	history?: string;
	supplyBookedQuantity?: number;
	supplyBookingStatus?: SupplyBookingStatus;
	bookedAgainst?: BookedAgainst;
	typeOfPurchase?: TypeOfPurchase;
	inventoryQuantity?: number;
	warehouseQuantityAgainstOrder?: number;
	quantityAgainstOrder?: number;
	warehouseName?: string;
	pickupDate: number; // timestamp
	advanceAmount?: number;
	vendorReadyForBrandInvoice?: BrandInvoiceAlignment;
	priceValidity?: number; // timestamp
	vendorReadyForManifestations?: boolean;
	companyBilling?: boolean;

	// Order Status Section
	dispatchType?: DispatchType;
	opsStatus?: OpsStatus;
	reasonOfDelayInPickup?: string;
	poIssued?: boolean;
	revisedPickupDate?: number; // timestamp
	poNumber?: string;
	supplyOpsRemarks?: string;

	// Approvals Section
	approvalStatus?: ApprovalStatus;
	approverRemarks?: string;
	approvedBy?: string; // private field
	approvalTime?: number; // timestamp, private field
}

// Extended Vendor interface to include Supply Input data
export interface EnhancedVendor extends Vendor {
	// Additional fields from Supply Input
	vendorAgmId: string;
	vendorName: string;
	vendorDistrict?: string;
	vendorState?: string;
	vendorPin?: number;
	vendorMoq?: number;
	vendorQrCondition?: VendorQRCondition;
	expiryDetails?: string;
	packagingCondition?: string;
	priceValidity?: number; // timestamp
	vendorReadyForManifestations?: boolean;
	companyBilling?: boolean;
	advanceAmount?: number;
}

// Extended SKU interface to include Supply Input data
export interface EnhancedSKU extends SKU {
	// Additional fields from Supply Input
	skuIdFromModule: string;
	cpWithGst: number;
	quantityAvailable: number;
	expiryDetails?: string;
	packagingCondition?: string;
	inventoryQuantity?: number;
	warehouseQuantityAgainstOrder?: number;
	quantityAgainstOrder?: number;
}

// Supply Input with Purchase Request context
export interface SupplyInputWithContext {
	supplyInput: SupplyInput;
	purchaseRequest?: PurchaseRequest;
	sku: EnhancedSKU;
	vendor: EnhancedVendor;
	warehouseName?: string;
	proposedWh: string;
	initiatedBy: string;
	createdAt: number; // timestamp
	updatedAt: number; // timestamp
}

// For form handling and validation
export interface SupplyInputFormData {
	// Required fields
	agmId: string;
	skuIdSkuModule: string;
	cpWithGst: string; // form input as string
	quantityAvailable: string; // form input as string
	supplyPoc: string;
	supplyTeamSegment: string;
	vendorAgmId: string;
	skuId: string;
	pickupDistrict: string;
	pickupState: string;
	pickupPin: string; // form input as string
	vendorName: string;
	pickupDate: string; // form input as string

	// Optional fields
	description?: string;
	pickupLocationSameAsVendorLocation?: boolean;
	vendorQrCondition?: string;
	vendorMoq?: string;
	expiryDetails?: string;
	packagingCondition?: string;
	supplyStatus?: string;
	// ... other optional fields as strings for form handling
}

// For API responses and data transfer
export interface SupplyInputResponse {
	success: boolean;
	message: string;
	data?: SupplyInput;
	errors?: Record<string, string>;
}

// For bulk operations
export interface BulkSupplyInputOperation {
	operation: "create" | "update" | "delete";
	supplyInputs: SupplyInput[];
	batchId: string;
	processedAt: number; // timestamp
	results: {
		successful: number;
		failed: number;
		errors: string[];
	};
}
