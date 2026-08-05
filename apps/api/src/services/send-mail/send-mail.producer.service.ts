import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { QUEUE_EVENTS, SendMailWelcomeDto } from '@kikos/shared';
import { Queue } from 'bullmq';

@Injectable()
export class SendMailQueueProducer {
  constructor(
    @InjectQueue(QUEUE_EVENTS.SEND_MAIL.AUTH.WELCOME)
    private readonly welcomeQueue: Queue,
  ) {}

  async welcome(data: SendMailWelcomeDto) {
    await this.welcomeQueue.add(QUEUE_EVENTS.SEND_MAIL.AUTH.WELCOME, data, {
      delay: 5000,
      attempts: 2,
      backoff: 5000,
    });
  }
}
