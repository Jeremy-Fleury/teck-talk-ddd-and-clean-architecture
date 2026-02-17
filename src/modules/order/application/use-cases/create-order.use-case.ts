import { UuidV7 } from "../../../shared/domain/value-objects/uuid-v7.vo";
import { Order } from "../../domain/aggregates/order.aggregate";
import type { OrderRepository } from "../../domain/repositories/order.repository";
import { Currency } from "../../domain/value-objects/currency.vo";
import { Money } from "../../domain/value-objects/money.vo";

interface OrderItemInput {
	productId: string;
	quantity: number;
	unitPrice: number;
	currency: string;
}

interface CreateOrderInput {
	customerId: string;
	items: OrderItemInput[];
}

export class CreateOrderUseCase {
	constructor(private readonly orderRepository: OrderRepository) {}

	async execute(input: CreateOrderInput): Promise<string> {
		const orderId = UuidV7.generate();
		const customerId = UuidV7.create(input.customerId);

		const order = Order.create(orderId, customerId);

		for (const item of input.items) {
			const currency = Currency.create(item.currency);
			const unitPrice = Money.create(item.unitPrice, currency);
			order.addItem(UuidV7.generate(), UuidV7.create(item.productId), item.quantity, unitPrice);
		}

		await this.orderRepository.save(order);

		return orderId.value;
	}
}
