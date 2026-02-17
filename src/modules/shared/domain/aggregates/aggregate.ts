import type { DomainEvent } from "../events/domain-event";
import type { UuidV7 } from "../value-objects/uuid-v7.vo";

export abstract class Aggregate {
	public readonly id: UuidV7;
	private _domainEvents: DomainEvent[] = [];

	protected constructor(id: UuidV7) {
		this.id = id;
	}

	get domainEvents(): readonly DomainEvent[] {
		return [...this._domainEvents];
	}

	protected addDomainEvent(event: DomainEvent): void {
		this._domainEvents.push(event);
	}

	clearEvents(): void {
		this._domainEvents = [];
	}
}
