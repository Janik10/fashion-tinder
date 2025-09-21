import { Module } from '@nestjs/common';
// import { RedisModule } from '@nestjs/redis';

@Module({
  imports: [
    // RedisModule.forRoot({
    //   config: {
    //     host: process.env.REDIS_HOST || 'localhost',
    //     port: parseInt(process.env.REDIS_PORT || '6379'),
    //   },
    // }),
  ],
  exports: [
    // RedisModule
  ],
})
export class CacheModule {}