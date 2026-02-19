import { Auth0Id } from "@/modules-business/user/domain/value-objects/auth0Id.vo";
import { Uuid } from "@/libs/value-objects/uuid.vo";
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
export declare class User {
	private readonly _id;
	private readonly _email;
	private readonly _auth0Id;
	private _firstName;
	private _lastName;
	private constructor();
	static create(props: CreateUserInput): User;
	static fromPrimitives(primitives: UserPrimitives): User;
	get id(): Uuid;
	get auth0Id(): Auth0Id;
	updateName(firstName: string, lastName: string): void;
	get fullName(): string | null;
	toPrimitives(): UserPrimitives;
}
