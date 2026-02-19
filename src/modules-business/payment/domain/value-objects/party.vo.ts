import { Bic } from '@/modules-business/payment/domain/value-objects/bic.vo';
import { Iban } from '@/modules-business/payment/domain/value-objects/iban.vo';

import { ValidationDomainError } from '@/libs/errors/domain.error';

const MAX_NAME_LENGTH = 140;
const COUNTRY_FORMAT = /^[A-Z]{2}$/;

interface PartyProps {
	account: Iban;
	agent: Bic;
	country: string;
	name: string;
}

export interface PartyPrimitives {
	account: string;
	agent: string;
	country: string;
	name: string;
}

/**
 * Party — Represents a Debtor or a Creditor
 *
 * In ISO 20022, the data dictionary defines:
 * ```XML
 *   <Dbtr> → Debtor:   "Party that owes an amount of money to the Creditor"
 *   <Cdtr> → Creditor: "Party to which an amount of money is due"
 * ```
 *
 * Both share the same structure: name + account + agent (bank).
 * This is a Value Object because its identity is defined by its attributes.
 *
 * ISO 20022 constraints:
 * ```XML
 *   <Nm>  : max 140 characters
 *   <Ctry>: ISO 3166-1 alpha-2
 * ```
 */
export class Party {
	private readonly _name: string;
	private readonly _account: Iban;
	private readonly _agent: Bic;
	private readonly _country: string;

	private constructor(props: PartyProps) {
		this._name = props.name;
		this._account = props.account;
		this._agent = props.agent;
		this._country = props.country;
	}

	// ─── Factories ──────────────────────────────────────────────

	static create(props: PartyPrimitives): Party {
		const name = Party._cleanName(props.name);
		Party._validateName(name);

		const country = Party._cleanCountry(props.country);
		Party._validateCountry(country);

		return new Party({
			name,
			account: Iban.create(props.account),
			agent: Bic.create(props.agent),
			country,
		});
	}

	// ─── Getters ────────────────────────────────────────────────

	get name(): string {
		return this._name;
	}

	get account(): Iban {
		return this._account;
	}

	get agent(): Bic {
		return this._agent;
	}

	get country(): string {
		return this._country;
	}

	// ─── Behavior ───────────────────────────────────────────────

	equals(other: Party): boolean {
		return this._name === other._name && this._account.equals(other._account) && this._agent.equals(other._agent) && this._country === other._country;
	}

	// ─── Serialization ──────────────────────────────────────────

	toPrimitives(): PartyPrimitives {
		return {
			account: this._account.toString(),
			agent: this._agent.toString(),
			country: this._country,
			name: this._name,
		};
	}

	// ─── Private methods ────────────────────────────────────────

	private static _validateName(name: string): void {
		if (name.length === 0) {
			throw new ValidationDomainError('Party name is required.', { name });
		}

		if (name.length > MAX_NAME_LENGTH) {
			throw new ValidationDomainError(`Party name cannot exceed ${MAX_NAME_LENGTH} characters (ISO 20022).`, {
				name,
			});
		}
	}

	private static _validateCountry(country: string): void {
		if (!COUNTRY_FORMAT.test(country)) {
			throw new ValidationDomainError('Country must be ISO 3166-1 alpha-2.', { country });
		}
	}

	private static _cleanName(name: string): string {
		return name.trim();
	}

	private static _cleanCountry(country: string): string {
		return country.toUpperCase().trim();
	}
}
