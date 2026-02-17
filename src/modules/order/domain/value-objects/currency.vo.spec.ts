import { Currency } from "./currency.vo";

describe("Currency (Value Object)", () => {
	it("should create a valid currency", () => {
		const currency = Currency.create("eur");
		expect(currency.code).toBe("EUR");
	});

	it("should reject unsupported currency", () => {
		expect(() => Currency.create("XYZ")).toThrow("Unsupported currency");
	});

	it("should compare by value (equals)", () => {
		expect(Currency.create("EUR").equals(Currency.EUR())).toBe(true);
		expect(Currency.EUR().equals(Currency.USD())).toBe(false);
	});
});
