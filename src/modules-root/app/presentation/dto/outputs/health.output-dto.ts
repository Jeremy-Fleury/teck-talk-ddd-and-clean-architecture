import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class HealthOutputDto {
	@ApiProperty({
		description: 'The status of the health check',
		example: 'ok',
		required: true,
		type: String,
	})
	@Expose()
	@IsString({ message: 'Status must be a string' })
	status!: 'ok';

	@ApiProperty({
		description: 'The secret of the health check',
		example: 'tata',
		required: true,
		type: String,
	})
	secret!: string;
}
