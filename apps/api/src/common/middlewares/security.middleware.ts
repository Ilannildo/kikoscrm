import { env } from '@/env';
import {
  Injectable,
  NestMiddleware,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);

  private redis = new Redis(env.REDIS_URL);

  private blockedKeyPrefix = 'blocked_ip:';
  private blockDuration = 7 * 24 * 60 * 60; // 7 dias (604800 segundos)

  private suspiciousPatterns = [
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION)\b/i, // SQL Injection
    /\$\w*\s*:\s*\{/, // NoSQL Injection (MongoDB)
    /;?\s*(rm|ls|cat|curl|wget|echo|env|printenv|set)\s+/i,
    /(\.\.|\/etc\/passwd|\/proc\/self\/environ)/i,
    /\.env(\.local|\.production|\.development|\.test|\.staging)?/i,
  ];

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.path.startsWith('/api/webhooks/stripe')) return next();

    const ip =
      req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (!ip) {
      this.logger.warn(`IP não identificado ao acessar: ${req.originalUrl}`);
      return next();
    }

    const isBlocked = await this.redis.get(this.blockedKeyPrefix + ip);
    if (isBlocked) {
      this.logger.warn(
        `⚠️ IP ${ip} bloqueado tentando acessar: ${req.originalUrl}`,
      );
      throw new ForbiddenException('Acesso bloqueado temporariamente.');
    }

    const requestData = JSON.stringify({
      query: req.query,
      body: req.body,
      path: req.path,
      params: req.params,
    });

    if (this.suspiciousPatterns.some((pattern) => pattern.test(requestData))) {
      this.logger.warn(
        `⚠️ IP ${ip} bloqueado por atividade suspeita: ${req.originalUrl}`,
      );

      await this.redis.setex(
        this.blockedKeyPrefix + ip,
        this.blockDuration,
        '1',
      );

      throw new ForbiddenException('Acesso bloqueado temporariamente');
    }

    next();
  }
}
