import { OrderStatus } from "./order-status.vo";

describe("OrderStatus (Value Object)", () => {
	it("should create DRAFT status", () => {
		expect(OrderStatus.draft().value).toBe("DRAFT");
	});

	it("should allow DRAFT → CONFIRMED", () => {
		const draft = OrderStatus.draft();
		const confirmed = OrderStatus.create("CONFIRMED");
		expect(draft.canTransitionTo(confirmed)).toBe(true);
	});

	it("should reject DRAFT → CANCELLED", () => {
		const draft = OrderStatus.draft();
		const cancelled = OrderStatus.create("CANCELLED");
		expect(draft.canTransitionTo(cancelled)).toBe(false);
	});

	it("should reject invalid status values", () => {
		expect(() => OrderStatus.create("INVALID")).toThrow("Invalid order status");
	});
});
