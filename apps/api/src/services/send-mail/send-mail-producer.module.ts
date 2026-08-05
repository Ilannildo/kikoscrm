import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_EVENTS } from '@kikos/shared';
import { SendMailQueueProducer } from './send-mail.producer.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_EVENTS.SEND_MAIL.AUTH.WELCOME,
    }),
  ],
  providers: [SendMailQueueProducer],
  exports: [SendMailQueueProducer]
})
export class SendMailProducerModule {}
