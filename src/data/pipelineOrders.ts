// Mock data for Pipeline Orders
const mockPipelineOrders = [
	{
		request: {
			id: "REQ-001",
			proposedWh: "Mumbai-WH",
			status: "Approved - Pending PO Creation",
			initiatedBy: "user123",
			createdAt: Date.now(),
			history: [
				{
					status: "Request Created",
					user: "user123",
					timestamp: Date.now() - 86400000, // 1 day ago
				},
			],
			skus: [], // Will be populated from the nested SKU data
		},
		sku: {
			sku: "SKU001",
			quantity: 100,
			expectedPrice: 1500,
			unmaskedProductName: "Product A",
			superCategory: "Electronics",
			brand: "BrandX",
			asv: 25000,
			seasonality: "All Season",
			seasonDuration: "Year Round",
			vendors: [], // Will be populated from the nested vendor data
		},
		vendor: {
			vendorId: "V-001",
			vendorPrice: 1450,
			supplyPoc: "John Doe",
			vendorPaymentTerms: "Net 30",
			brandInvoiceAlignment: "Aligned",
			pickupAddress: "123 Vendor Street, Mumbai",
			flashSale: false,
			expectedPickupTime: Date.now() + 172800000, // 2 days from now
			vendorStatus: "Approved",
			poNumber: null,
			poStatus: null,
		},
	},
	{
		request: {
			id: "REQ-002",
			proposedWh: "Delhi-WH",
			status: "Approved - Pending PO Creation",
			initiatedBy: "user124",
			createdAt: Date.now() - 172800000, // 2 days ago
			history: [
				{
					status: "Request Created",
					user: "user124",
					timestamp: Date.now() - 259200000, // 3 days ago
				},
			],
			skus: [],
		},
		sku: {
			sku: "SKU002",
			quantity: 50,
			expectedPrice: 2500,
			unmaskedProductName: "Product B",
			superCategory: "Apparel",
			brand: "BrandY",
			asv: 35000,
			seasonality: "Summer",
			seasonDuration: "3 months",
			vendors: [],
		},
		vendor: {
			vendorId: "V-002",
			vendorPrice: 2400,
			supplyPoc: "Jane Smith",
			vendorPaymentTerms: "Net 45",
			brandInvoiceAlignment: "Aligned",
			pickupAddress: "456 Supplier Road, Delhi",
			flashSale: true,
			expectedPickupTime: Date.now() + 259200000, // 3 days from now
			vendorStatus: "Approved",
			poNumber: null,
			poStatus: null,
		},
	},
];

export const pipelineOrders = mockPipelineOrders.map((order) => {
	return {
		request: {
			...order.request,
			skus: [
				{
					...order.sku,
					vendors: [order.vendor], // Assign the vendor to the SKU
				},
			],
		},
	};
});
export type PipelineOrder = (typeof pipelineOrders)[number];
