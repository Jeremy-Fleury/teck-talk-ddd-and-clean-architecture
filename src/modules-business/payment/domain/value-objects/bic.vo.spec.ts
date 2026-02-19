import { Bic } from '@/modules-business/payment/domain/value-objects/bic.vo';

import { ValidationDomainError } from '@/libs/errors/domain.error';

describe('Bic', () => {
	describe('happy path', () => {
		it('should create a valid 8-character BIC', () => {
			// Arrange
			const value = 'BNPAFRPP';

			// Act
			const bic = Bic.create(value);

			// Assert
			expect(bic.toString()).toBe('BNPAFRPP');
		});

		it('should create a valid 11-character BIC', () => {
			// Arrange
			const value = 'BNPAFRPPXXX';

			// Act
			const bic = Bic.create(value);

			// Assert
			expect(bic.toString()).toBe('BNPAFRPPXXX');
		});

		it('should trim whitespace', () => {
			// Arrange
			const value = '  BNPAFRPP  ';

			// Act
			const bic = Bic.create(value);

			// Assert
			expect(bic.toString()).toBe('BNPAFRPP');
		});

		it('should convert to uppercase', () => {
			// Arrange
			const value = 'bnpafrpp';

			// Act
			const bic = Bic.create(value);

			// Assert
			expect(bic.toString()).toBe('BNPAFRPP');
		});

		it('should return the country code', () => {
			// Arrange
			const bic = Bic.create('BNPAFRPP');

			// Act
			const countryCode = bic.countryCode;

			// Assert
			expect(countryCode).toBe('FR');
		});

		it('should return the institution code', () => {
			// Arrange
			const bic = Bic.create('BNPAFRPP');

			// Act
			const institutionCode = bic.institutionCode;

			// Assert
			expect(institutionCode).toBe('BNPA');
		});

		it('should return true for identical BICs', () => {
			// Arrange
			const bic1 = Bic.create('BNPAFRPP');
			const bic2 = Bic.create('BNPAFRPP');

			// Act
			const result = bic1.equals(bic2);

			// Assert
			expect(result).toBe(true);
		});

		it('should return false for different BICs', () => {
			// Arrange
			const bic1 = Bic.create('BNPAFRPP');
			const bic2 = Bic.create('SOGEFRPP');

			// Act
			const result = bic1.equals(bic2);

			// Assert
			expect(result).toBe(false);
		});

		it('should return the raw BIC string', () => {
			// Arrange
			const bic = Bic.create('BNPAFRPP');

			// Act
			const result = bic.toString();

			// Assert
			expect(result).toBe('BNPAFRPP');
		});
	});

	describe('errors', () => {
		it('should reject an empty string', () => {
			// Arrange
			const value = '';

			// Act
			const act = () => Bic.create(value);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject a BIC that is too short', () => {
			// Arrange
			const value = 'BNPA';

			// Act
			const act = () => Bic.create(value);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject a BIC with invalid characters', () => {
			// Arrange
			const value = 'BNPA1RPP';

			// Act
			const act = () => Bic.create(value);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject a BIC with wrong length (9 chars)', () => {
			// Arrange
			const value = 'BNPAFRPPA';

			// Act
			const act = () => Bic.create(value);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject a BIC with wrong length (10 chars)', () => {
			// Arrange
			const value = 'BNPAFRPPAB';

			// Act
			const act = () => Bic.create(value);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});
	});
});
