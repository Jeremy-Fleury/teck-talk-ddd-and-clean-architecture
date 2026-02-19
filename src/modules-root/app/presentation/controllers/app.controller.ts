import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { Serialize } from '@/modules-root/app/infrastructure/decorators/serialize.decorator';
import { HealthOutputDto } from '@/modules-root/app/presentation/dto/outputs/health.output-dto';

import { Public } from '@/libs/decorators/public.decorator';

@Controller()
export class AppController {
	@Get('/')
	@Public()
	@ApiOperation({
		summary: 'Health check',
	})
	@ApiOkResponse({
		description: 'Liveness response: `status="ok"`.',
		type: HealthOutputDto,
	})
	@Serialize(HealthOutputDto)
	health(): HealthOutputDto {
		return { secret: 'tata', status: 'ok' };
	}
}
