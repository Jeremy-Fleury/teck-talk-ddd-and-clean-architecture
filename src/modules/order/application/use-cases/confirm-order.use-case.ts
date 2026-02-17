import { UuidV7 } from "../../../shared/domain/value-objects/uuid-v7.vo";
import type { OrderRepository } from "../../domain/repositories/order.repository";

export class ConfirmOrderUseCase {
	constructor(
		private readonly orderRepository: OrderRepository
		/* private readonly eventPublisher: EventPublisher */
	) {}

	async execute(orderId: string): Promise<void> {
		const id = UuidV7.create(orderId);
		const order = await this.orderRepository.findById(id);

		if (!order) {
			throw new Error(`Order ${orderId} not found`);
		}

		order.confirm();

		await this.orderRepository.save(order);

		for (const event of order.domainEvents) {
			/* this.eventPublisher.publish(event); */
		}

		order.clearEvents();
	}
}
