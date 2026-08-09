import { SkipSubscriptionCheck } from '@common/decorators/subscription.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@ApiExcludeController()
@ApiTags('Health')
@Controller('/health')
@AllowAnonymous()
@SkipSubscriptionCheck()
export class HealthController {
	@Get()
	health() {
		return {
			status: 'ok',
			timestamp: new Date().toISOString(),
		};
	}
}
