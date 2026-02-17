import { UuidV7 } from "../../../shared/domain/value-objects/uuid-v7.vo";
import { OrderConfirmedEvent } from "../events/order-confirmed.event";
import { Currency } from "../value-objects/currency.vo";
import { Money } from "../value-objects/money.vo";
import { Order } from "./order.aggregate";

const eur = Currency.EUR();
const money = (amount: number) => Money.create(amount, eur);
const id = () => UuidV7.generate();

describe("Order (Aggregate Root)", () => {
	it("should create a DRAFT order with no items", () => {
		const order = Order.create(id(), id());
		expect(order.status.value).toBe("DRAFT");
		expect(order.items).toHaveLength(0);
	});

	it("should add items via the Root", () => {
		const order = Order.create(id(), id());
		order.addItem(id(), id(), 2, money(10));
		expect(order.items).toHaveLength(1);
		expect(order.calculateTotal().amount).toBe(20);
	});

	it("should reject adding items to a non-DRAFT order", () => {
		const order = Order.create(id(), id());
		order.addItem(id(), id(), 1, money(10));
		order.confirm();
		expect(() => order.addItem(id(), id(), 1, money(5))).toThrow("Cannot add items to a non-DRAFT order");
	});

	it("should reject confirming an empty order", () => {
		const order = Order.create(id(), id());
		expect(() => order.confirm()).toThrow("Cannot confirm an order with no items");
	});

	it("should emit OrderConfirmedEvent on confirm", () => {
		const orderId = id();
		const order = Order.create(orderId, id());
		order.addItem(id(), id(), 2, money(25));
		order.confirm();

		expect(order.domainEvents).toHaveLength(1);
		const event = order.domainEvents[0] as OrderConfirmedEvent;
		expect(event).toBeInstanceOf(OrderConfirmedEvent);
		expect(event.orderId.equals(orderId)).toBe(true);
		expect(event.totalAmount).toBe(50);
		expect(event.totalCurrency.equals(eur)).toBe(true);
	});

	it("should clear events after dispatch", () => {
		const order = Order.create(id(), id());
		order.addItem(id(), id(), 1, money(10));
		order.confirm();
		expect(order.domainEvents).toHaveLength(1);

		order.clearEvents();
		expect(order.domainEvents).toHaveLength(0);
	});
});
