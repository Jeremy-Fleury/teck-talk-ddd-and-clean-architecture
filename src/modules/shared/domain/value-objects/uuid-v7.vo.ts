import { v7 as uuidv7, validate, version } from "uuid";

export class UuidV7 {
	private constructor(public readonly value: string) {}

	static create(value: string): UuidV7 {
		if (!validate(value) || version(value) !== 7) {
			throw new Error(`Invalid UUID v7: ${value}`);
		}
		return new UuidV7(value.toLowerCase());
	}

	static generate(): UuidV7 {
		return new UuidV7(uuidv7());
	}

	equals(other: UuidV7): boolean {
		return this.value === other.value;
	}

	toString(): string {
		return this.value;
	}
}
