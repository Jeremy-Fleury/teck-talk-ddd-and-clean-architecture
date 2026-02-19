import { Party } from '@/modules-business/payment/domain/value-objects/party.vo';

import { ValidationDomainError } from '@/libs/errors/domain.error';

const VALID_PARTY_PROPS = {
	name: 'John Doe',
	account: 'FR7630006000011234567890189',
	agent: 'BNPAFRPP',
	country: 'FR',
};

describe('Party', () => {
	describe('happy path', () => {
		it('should create a valid Party', () => {
			// Arrange
			const props = VALID_PARTY_PROPS;

			// Act
			const party = Party.create(props);

			// Assert
			expect(party.name).toBe('John Doe');
			expect(party.account.toString()).toBe('FR7630006000011234567890189');
			expect(party.agent.toString()).toBe('BNPAFRPP');
			expect(party.country).toBe('FR');
		});

		it('should trim the name', () => {
			// Arrange
			const props = { ...VALID_PARTY_PROPS, name: '  John Doe  ' };

			// Act
			const party = Party.create(props);

			// Assert
			expect(party.name).toBe('John Doe');
		});

		it('should clean country to uppercase', () => {
			// Arrange
			const props = { ...VALID_PARTY_PROPS, country: 'fr' };

			// Act
			const party = Party.create(props);

			// Assert
			expect(party.country).toBe('FR');
		});

		it('should accept a name of exactly 140 characters', () => {
			// Arrange
			const maxName = 'A'.repeat(140);
			const props = { ...VALID_PARTY_PROPS, name: maxName };

			// Act
			const party = Party.create(props);

			// Assert
			expect(party.name).toBe(maxName);
		});

		it('should return true for identical parties', () => {
			// Arrange
			const party1 = Party.create(VALID_PARTY_PROPS);
			const party2 = Party.create(VALID_PARTY_PROPS);

			// Act
			const result = party1.equals(party2);

			// Assert
			expect(result).toBe(true);
		});

		it('should return false when names differ', () => {
			// Arrange
			const party1 = Party.create(VALID_PARTY_PROPS);
			const party2 = Party.create({ ...VALID_PARTY_PROPS, name: 'Jane Doe' });

			// Act
			const result = party1.equals(party2);

			// Assert
			expect(result).toBe(false);
		});

		it('should return false when countries differ', () => {
			// Arrange
			const party1 = Party.create(VALID_PARTY_PROPS);
			const party2 = Party.create({
				...VALID_PARTY_PROPS,
				account: 'DE89370400440532013000',
				agent: 'COBADEFFXXX',
				country: 'DE',
			});

			// Act
			const result = party1.equals(party2);

			// Assert
			expect(result).toBe(false);
		});

		it('should return a plain object with all properties', () => {
			// Arrange
			const party = Party.create(VALID_PARTY_PROPS);

			// Act
			const result = party.toPrimitives();

			// Assert
			expect(result).toEqual({
				name: 'John Doe',
				account: 'FR7630006000011234567890189',
				agent: 'BNPAFRPP',
				country: 'FR',
			});
		});
	});

	describe('errors', () => {
		it('should reject an empty name', () => {
			// Arrange
			const props = { ...VALID_PARTY_PROPS, name: '' };

			// Act
			const act = () => Party.create(props);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject a name exceeding 140 characters', () => {
			// Arrange
			const props = { ...VALID_PARTY_PROPS, name: 'A'.repeat(141) };

			// Act
			const act = () => Party.create(props);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject an invalid country code', () => {
			// Arrange
			const props = { ...VALID_PARTY_PROPS, country: 'FRA' };

			// Act
			const act = () => Party.create(props);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject a numeric country code', () => {
			// Arrange
			const props = { ...VALID_PARTY_PROPS, country: '12' };

			// Act
			const act = () => Party.create(props);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject an invalid IBAN', () => {
			// Arrange
			const props = { ...VALID_PARTY_PROPS, account: 'INVALID' };

			// Act
			const act = () => Party.create(props);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject an invalid BIC', () => {
			// Arrange
			const props = { ...VALID_PARTY_PROPS, agent: 'BAD' };

			// Act
			const act = () => Party.create(props);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});
	});
});
