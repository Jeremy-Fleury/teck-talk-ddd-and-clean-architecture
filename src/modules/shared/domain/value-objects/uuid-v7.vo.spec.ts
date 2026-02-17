import { UuidV7 } from "./uuid-v7.vo";

describe("UuidV7 (Value Object)", () => {
	it("should generate a valid UUID v7", () => {
		const uuid = UuidV7.generate();
		expect(uuid.value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
	});

	it("should accept a valid UUID v7 string", () => {
		const generated = UuidV7.generate();
		const parsed = UuidV7.create(generated.value);
		expect(parsed.equals(generated)).toBe(true);
	});

	it("should reject an invalid UUID", () => {
		expect(() => UuidV7.create("not-a-uuid")).toThrow("Invalid UUID v7");
	});

	it("should reject a UUID v4 (wrong version)", () => {
		expect(() => UuidV7.create("550e8400-e29b-41d4-a716-446655440000")).toThrow("Invalid UUID v7");
	});

	it("should compare by value (equals)", () => {
		const a = UuidV7.generate();
		const b = UuidV7.create(a.value);
		expect(a.equals(b)).toBe(true);
	});
});
