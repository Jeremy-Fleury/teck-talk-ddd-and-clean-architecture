import { Iban } from '@/modules-business/payment/domain/value-objects/iban.vo';

import { ValidationDomainError } from '@/libs/errors/domain.error';

describe('Iban', () => {
	describe('happy path', () => {
		it('should create a valid FR IBAN', () => {
			// Arrange
			const value = 'FR7630006000011234567890189';

			// Act
			const iban = Iban.create(value);

			// Assert
			expect(iban.toString()).toBe('FR7630006000011234567890189');
		});

		it('should strip spaces', () => {
			// Arrange
			const value = 'FR76 3000 6000 0112 3456 7890 189';

			// Act
			const iban = Iban.create(value);

			// Assert
			expect(iban.toString()).toBe('FR7630006000011234567890189');
		});

		it('should convert to uppercase', () => {
			// Arrange
			const value = 'fr7630006000011234567890189';

			// Act
			const iban = Iban.create(value);

			// Assert
			expect(iban.toString()).toBe('FR7630006000011234567890189');
		});

		it('should create a valid DE IBAN', () => {
			// Arrange
			const value = 'DE89370400440532013000';

			// Act
			const iban = Iban.create(value);

			// Assert
			expect(iban.toString()).toBe('DE89370400440532013000');
		});

		it('should return the country code', () => {
			// Arrange
			const iban = Iban.create('FR7630006000011234567890189');

			// Act
			const countryCode = iban.countryCode;

			// Assert
			expect(countryCode).toBe('FR');
		});

		it('should return DE country code', () => {
			// Arrange
			const iban = Iban.create('DE89370400440532013000');

			// Act
			const countryCode = iban.countryCode;

			// Assert
			expect(countryCode).toBe('DE');
		});

		it('should return true for identical IBANs', () => {
			// Arrange
			const iban1 = Iban.create('FR7630006000011234567890189');
			const iban2 = Iban.create('FR7630006000011234567890189');

			// Act
			const result = iban1.equals(iban2);

			// Assert
			expect(result).toBe(true);
		});

		it('should return true for same IBAN with different formatting', () => {
			// Arrange
			const iban1 = Iban.create('FR7630006000011234567890189');
			const iban2 = Iban.create('FR76 3000 6000 0112 3456 7890 189');

			// Act
			const result = iban1.equals(iban2);

			// Assert
			expect(result).toBe(true);
		});

		it('should return false for different IBANs', () => {
			// Arrange
			const iban1 = Iban.create('FR7630006000011234567890189');
			const iban2 = Iban.create('DE89370400440532013000');

			// Act
			const result = iban1.equals(iban2);

			// Assert
			expect(result).toBe(false);
		});

		it('should return the cleaned IBAN string', () => {
			// Arrange
			const iban = Iban.create('FR76 3000 6000 0112 3456 7890 189');

			// Act
			const result = iban.toString();

			// Assert
			expect(result).toBe('FR7630006000011234567890189');
		});
	});

	describe('errors', () => {
		it('should reject an empty string', () => {
			// Arrange
			const value = '';

			// Act
			const act = () => Iban.create(value);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject an invalid format', () => {
			// Arrange
			const value = 'INVALID';

			// Act
			const act = () => Iban.create(value);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject an IBAN with invalid checksum', () => {
			// Arrange
			const value = 'FR7630006000011234567890188';

			// Act
			const act = () => Iban.create(value);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject an IBAN starting with digits', () => {
			// Arrange
			const value = '1234567890';

			// Act
			const act = () => Iban.create(value);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});
	});
});
