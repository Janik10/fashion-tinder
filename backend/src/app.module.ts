import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ItemsModule } from './modules/items/items.module';
import { InteractionsModule } from './modules/interactions/interactions.module';
import { FriendsModule } from './modules/friends/friends.module';
import { VotesModule } from './modules/votes/votes.module';
import { SearchModule } from './modules/search/search.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { AdminModule } from './modules/admin/admin.module';
import { PrismaModule } from './modules/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ItemsModule,
    InteractionsModule,
    FriendsModule,
    VotesModule,
    SearchModule,
    RecommendationsModule,
    AdminModule,
  ],
})
export class AppModule {}