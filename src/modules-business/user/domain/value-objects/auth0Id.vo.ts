import { ValidationDomainError } from '@/libs/errors/domain.error';

export class Auth0Id {
	private static readonly _pattern = /^[a-zA-Z][a-zA-Z0-9_-]+\|[a-zA-Z0-9._-]+$/;
	private readonly _provider: string;
	private readonly _identifier: string;

	private constructor(value: string) {
		const cleaned = this._clean(value);
		this._validate(cleaned);
		const { provider, identifier } = this._parse(cleaned);
		this._provider = provider;
		this._identifier = identifier;
	}

	// ─── Factories ──────────────────────────────────────────────

	static create(value: string): Auth0Id {
		return new Auth0Id(value);
	}

	// ─── Getters ─────────────────────────────────────────────

	get provider(): string {
		return this._provider;
	}

	get identifier(): string {
		return this._identifier;
	}

	// ─── Behavior ─────────────────────────────────────────────

	equals(other: Auth0Id): boolean {
		return this._provider === other._provider && this._identifier === other._identifier;
	}

	// ─── Serialization ────────────────────────────────────────

	toString(): string {
		return `${this._provider}|${this._identifier}`;
	}

	// ─── Private methods ────────────────────────────────────────

	private _parse(value: string): { provider: string; identifier: string } {
		const separatorIndex = value.indexOf('|');
		return {
			provider: value.substring(0, separatorIndex),
			identifier: value.substring(separatorIndex + 1),
		};
	}

	private _clean(value: string): string {
		return value.trim();
	}

	private _validate(value: string): void {
		if (value.length === 0) {
			throw new ValidationDomainError('Auth0 ID cannot be empty.', { value });
		}

		if (!Auth0Id._pattern.test(value)) {
			throw new ValidationDomainError('Auth0 ID must follow the "provider|identifier" format.', { value });
		}
	}
}
