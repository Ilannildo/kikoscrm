import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@ApiExcludeController()
@ApiTags('Health')
@Controller('/health')
export class HealthController {
	@AllowAnonymous()
	@Get()
	health() {
		return {
			status: 'ok',
			timestamp: new Date().toISOString(),
		};
	}
}
