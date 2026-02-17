import { Currency } from "./currency.vo";
import { Money } from "./money.vo";

const eur = Currency.EUR();
const usd = Currency.USD();

describe("Money (Value Object)", () => {
	it("should create a valid Money", () => {
		const m = Money.create(10.5, eur);
		expect(m.amount).toBe(10.5);
		expect(m.currency.equals(eur)).toBe(true);
	});

	it("should reject negative amounts", () => {
		expect(() => Money.create(-1, eur)).toThrow("Money amount cannot be negative");
	});

	it("should add two Money of same currency", () => {
		const result = Money.create(10, eur).add(Money.create(5, eur));
		expect(result.amount).toBe(15);
	});

	it("should reject adding different currencies", () => {
		expect(() => Money.create(10, eur).add(Money.create(5, usd))).toThrow("Cannot add EUR and USD");
	});

	it("should compare by value (equals)", () => {
		const a = Money.create(10, eur);
		const b = Money.create(10, eur);
		expect(a.equals(b)).toBe(true);
		expect(a.equals(Money.create(20, eur))).toBe(false);
	});
});
