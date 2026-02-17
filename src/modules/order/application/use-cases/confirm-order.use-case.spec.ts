import { UuidV7 } from "../../../shared/domain/value-objects/uuid-v7.vo";
import { Order } from "../../domain/aggregates/order.aggregate";
import { Currency } from "../../domain/value-objects/currency.vo";
import { Money } from "../../domain/value-objects/money.vo";
import { InMemoryOrderRepository } from "../../infrastructure/repositories/in-memory-order.repository";
import { ConfirmOrderUseCase } from "./confirm-order.use-case";

const eur = Currency.EUR();
const money = (amount: number) => Money.create(amount, eur);
const id = () => UuidV7.generate();

describe("ConfirmOrderUseCase", () => {
	it("should confirm an existing order", async () => {
		const repo = new InMemoryOrderRepository();
		const orderId = id();
		const order = Order.create(orderId, id());
		order.addItem(id(), id(), 1, money(10));
		await repo.save(order);

		const useCase = new ConfirmOrderUseCase(repo);
		await useCase.execute(orderId.value);

		const saved = await repo.findById(orderId);
		expect(saved?.status.value).toBe("CONFIRMED");
	});

	it("should throw if order not found", async () => {
		const repo = new InMemoryOrderRepository();
		const useCase = new ConfirmOrderUseCase(repo);
		const unknownId = id();
		await expect(useCase.execute(unknownId.value)).rejects.toThrow(`Order ${unknownId.value} not found`);
	});
});
