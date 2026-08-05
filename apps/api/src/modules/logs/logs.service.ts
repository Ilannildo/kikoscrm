import { LogsRepository } from '@infra/database/repositories/logs.repository';
import { Injectable } from '@nestjs/common';
import { CreateLogDto } from './dto/request/create-log.dto';

@Injectable()
export class LogsService {
  constructor(private logsRepository: LogsRepository) {}

  async create<T>(data: CreateLogDto<T>) {
    const { action, entity, body, companyId, ipAddress, userId, description } =
      data;

    const encryptedBody = body ? JSON.stringify(body) : undefined;

    await this.logsRepository.create({
      description,
      action,
      body: encryptedBody,
      entity,
      ipAddress,
      company: companyId ? { connect: { id: companyId } } : undefined,
      user: userId ? { connect: { id: userId } } : undefined,
    });
  }
}
