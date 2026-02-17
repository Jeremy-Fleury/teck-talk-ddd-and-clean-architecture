import { UuidV7 } from "../../../shared/domain/value-objects/uuid-v7.vo";
import { InMemoryOrderRepository } from "../../infrastructure/repositories/in-memory-order.repository";
import { CreateOrderUseCase } from "./create-order.use-case";

const id = () => UuidV7.generate();

describe("CreateOrderUseCase", () => {
	it("should create an order with items and persist it", async () => {
		const repo = new InMemoryOrderRepository();
		const useCase = new CreateOrderUseCase(repo);
		const customerId = id();

		const orderId = await useCase.execute({
			customerId: customerId.value,
			items: [
				{ productId: id().value, quantity: 2, unitPrice: 29.99, currency: "EUR" },
				{ productId: id().value, quantity: 1, unitPrice: 49.99, currency: "EUR" },
			],
		});

		const saved = await repo.findById(UuidV7.create(orderId));
		expect(saved).not.toBeNull();
		expect(saved!.status.value).toBe("DRAFT");
		expect(saved!.items).toHaveLength(2);
		expect(saved!.calculateTotal().amount).toBe(109.97);
	});

	it("should create an order with no items", async () => {
		const repo = new InMemoryOrderRepository();
		const useCase = new CreateOrderUseCase(repo);

		const orderId = await useCase.execute({
			customerId: id().value,
			items: [],
		});

		const saved = await repo.findById(UuidV7.create(orderId));
		expect(saved).not.toBeNull();
		expect(saved!.items).toHaveLength(0);
	});

	it("should reject invalid customerId", async () => {
		const repo = new InMemoryOrderRepository();
		const useCase = new CreateOrderUseCase(repo);

		await expect(
			useCase.execute({ customerId: "not-a-uuid", items: [] }),
		).rejects.toThrow("Invalid UUID v7");
	});

	it("should reject invalid item quantity", async () => {
		const repo = new InMemoryOrderRepository();
		const useCase = new CreateOrderUseCase(repo);

		await expect(
			useCase.execute({
				customerId: id().value,
				items: [{ productId: id().value, quantity: 0, unitPrice: 10, currency: "EUR" }],
			}),
		).rejects.toThrow("Quantity must be greater than 0");
	});

	it("should reject invalid currency", async () => {
		const repo = new InMemoryOrderRepository();
		const useCase = new CreateOrderUseCase(repo);

		await expect(
			useCase.execute({
				customerId: id().value,
				items: [{ productId: id().value, quantity: 1, unitPrice: 10, currency: "XYZ" }],
			}),
		).rejects.toThrow("Unsupported currency");
	});
});
