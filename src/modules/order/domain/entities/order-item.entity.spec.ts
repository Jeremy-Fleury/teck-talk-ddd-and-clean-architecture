import { UuidV7 } from "../../../shared/domain/value-objects/uuid-v7.vo";
import { Currency } from "../value-objects/currency.vo";
import { Money } from "../value-objects/money.vo";
import { OrderItem } from "./order-item.entity";

const eur = Currency.EUR();
const money = (amount: number) => Money.create(amount, eur);
const id = () => UuidV7.generate();

describe("OrderItem (Entity)", () => {
	it("should create an item with calculated subtotal", () => {
		const item = OrderItem.create(id(), id(), 3, money(10));
		expect(item.subtotal.amount).toBe(30);
	});

	it("should reject quantity <= 0", () => {
		expect(() => OrderItem.create(id(), id(), 0, money(10))).toThrow("Quantity must be greater than 0");
	});

	it("should compare by identity (id)", () => {
		const sharedId = id();
		const a = OrderItem.create(sharedId, id(), 1, money(10));
		const b = OrderItem.create(sharedId, id(), 5, money(99));
		expect(a.equals(b)).toBe(true);
	});
});
