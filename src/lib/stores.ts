import { writable, type Writable } from "svelte/store";
import {
	collection,
	onSnapshot,
	getFirestore,
	query,
} from "firebase/firestore";
import { app } from "./firebase";
import type { PurchaseRequest, ModalState } from "./types";

// Centralized state management for the application

// Loading indicator state
export const isLoading: Writable<boolean> = writable(true);

// Modal state for showing messages to the user
export const modal: Writable<ModalState> = writable({
	show: false,
	title: "",
	message: "",
});

// Main data store for all purchase requests, strongly typed
export const purchaseRequests: Writable<PurchaseRequest[]> = writable([]);

// Firestore instance
const db = getFirestore(app);

/**
 * Sets up a real-time listener to the 'purchaseRequests' collection in Firestore.
 * Automatically updates the `purchaseRequests` store when data changes.
 * @returns {() => void} An unsubscribe function to detach the listener.
 */
export function listenToPurchaseRequests(): () => void {
	isLoading.set(true);
	const q = query(collection(db, "purchaseRequests")); // Simplified path

	const unsubscribe = onSnapshot(
		q,
		(querySnapshot) => {
			const requests: PurchaseRequest[] = [];
			querySnapshot.forEach((doc) => {
				// Map Firestore document to our PurchaseRequest type
				requests.push({ id: doc.id, ...doc.data() } as PurchaseRequest);
			});
			purchaseRequests.set(requests);
			isLoading.set(false);
		},
		(error) => {
			console.error("Error fetching purchase requests:", error);
			showMessage(
				"Data Error",
				"Could not load purchase requests from the database."
			);
			isLoading.set(false);
		}
	);

	return unsubscribe;
}

/**
 * A helper function to easily trigger the message modal from any component.
 * @param {string} title - The title of the modal.
 * @param {string} message - The message content of the modal.
 */
export function showMessage(title: string, message: string) {
	modal.set({ show: true, title, message });
}
