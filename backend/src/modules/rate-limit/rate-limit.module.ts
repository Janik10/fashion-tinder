import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60, // 1 minute
      limit: 10, // 10 requests per minute
    }]),
  ],
  exports: [ThrottlerModule],
})
export class RateLimitModule {}