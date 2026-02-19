import { Auth0Id } from '@/modules-business/user/domain/value-objects/auth0Id.vo';

import { Email } from '@/libs/value-objects/email.vo';
import { Uuid } from '@/libs/value-objects/uuid.vo';

interface UserProps {
	auth0Id: Auth0Id;
	email: Email | null;
	firstName: string | null;
	id: Uuid;
	lastName: string | null;
}

export interface UserPrimitives {
	auth0Id: string;
	email: string | null;
	firstName: string | null;
	id: string;
	lastName: string | null;
}

export interface CreateUserInput {
	auth0Id: string;
	email: string | null;
	firstName: string | null;
	lastName: string | null;
}

export class User {
	private readonly _id: Uuid;
	private readonly _email: Email | null;
	private readonly _auth0Id: Auth0Id;
	private _firstName: string | null;
	private _lastName: string | null;

	private constructor(props: UserProps) {
		this._id = props.id;
		this._email = props.email;
		this._auth0Id = props.auth0Id;
		this._firstName = props.firstName;
		this._lastName = props.lastName;
	}

	// ─── Factories ──────────────────────────────────────────────

	static create(props: CreateUserInput): User {
		return new User({
			id: Uuid.generate(),
			email: props.email ? Email.create(props.email) : null,
			auth0Id: Auth0Id.create(props.auth0Id),
			firstName: props.firstName,
			lastName: props.lastName,
		});
	}

	static fromPrimitives(primitives: UserPrimitives): User {
		return new User({
			id: Uuid.create(primitives.id),
			email: primitives.email ? Email.create(primitives.email) : null,
			auth0Id: Auth0Id.create(primitives.auth0Id),
			firstName: primitives.firstName,
			lastName: primitives.lastName,
		});
	}

	// ─── Getters ────────────────────────────────────────────────

	get id(): Uuid {
		return this._id;
	}

	get auth0Id(): Auth0Id {
		return this._auth0Id;
	}

	// ─── Behaviors ──────────────────────────────────────────────

	updateName(firstName: string, lastName: string): void {
		this._firstName = firstName;
		this._lastName = lastName;
	}

	// ─── Computed ───────────────────────────────────────────────

	get fullName(): string | null {
		if (!(this._firstName || this._lastName)) {
			return null;
		}

		return [this._firstName, this._lastName].filter(Boolean).join(' ');
	}

	// ─── Serialization ──────────────────────────────────────────

	toPrimitives(): UserPrimitives {
		return {
			id: this._id.toString(),
			email: this._email?.toString() ?? null,
			auth0Id: this._auth0Id.toString(),
			firstName: this._firstName,
			lastName: this._lastName,
		};
	}
}
