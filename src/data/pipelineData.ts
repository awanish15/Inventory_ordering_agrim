export interface PipelineOrder {
	agmId: string;
	skuId: string;
	cpWithGst: number;
	quantityAvailable: number;
	supplyPoc: string;
	supplyTeamSegment: "Retail" | "Wholesale";
	vendorAgmId: string;
	vendorName: string;
	pickupDistrict: string;
	pickupState: string;
	pickupPin: number;
	warehouseName: string;
	pickupDate: number;
	typeOfPurchase: string;
	dispatchType: "Critical" | "Regular";
	opsStatus: string;
	poNumber: string | "";
	poStatus: string | "";
	approvalStatus: "Approved" | "Rejected" | "Pending";
	inventoryQuantity: number;
	advanceAmount: number;
	vendorReadyForBrandInvoice: "Aligned" | "Not Aligned" | "Not required";
	bookedAgainst: string;
}

export const mockPipelineData: PipelineOrder[] = [
	{
		agmId: "AGM001_VendorA",
		skuId: "SKU123456789",
		cpWithGst: 1500.5,
		quantityAvailable: 1000,
		supplyPoc: "John Doe",
		supplyTeamSegment: "Retail",
		vendorAgmId: "VAGM001",
		vendorName: "Vendor A Enterprises",
		pickupDistrict: "Mumbai Suburban",
		pickupState: "Maharashtra",
		pickupPin: 400001,
		warehouseName: "Mumbai Central WH",
		pickupDate: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 days from now
		typeOfPurchase: "Ready at seller's WH",
		dispatchType: "Regular",
		opsStatus: "Pending at Supply Ops",
		poNumber: "",
		poStatus: "",
		approvalStatus: "Approved",
		inventoryQuantity: 500,
		advanceAmount: 25000,
		vendorReadyForBrandInvoice: "Aligned",
		bookedAgainst: "Inventory",
	},
	{
		agmId: "AGM002_VendorB",
		skuId: "SKU987654321",
		cpWithGst: 2500.75,
		quantityAvailable: 750,
		supplyPoc: "Jane Smith",
		supplyTeamSegment: "Wholesale",
		vendorAgmId: "VAGM002",
		vendorName: "Vendor B Limited",
		pickupDistrict: "Delhi Central",
		pickupState: "Delhi",
		pickupPin: 110001,
		warehouseName: "Delhi North WH",
		pickupDate: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days from now
		typeOfPurchase: "Material in transit",
		dispatchType: "Critical",
		opsStatus: "EDD shared by vendor",
		poNumber: "",
		poStatus: "",
		approvalStatus: "Approved",
		inventoryQuantity: 750,
		advanceAmount: 50000,
		vendorReadyForBrandInvoice: "Aligned",
		bookedAgainst: "Order",
	},
];
