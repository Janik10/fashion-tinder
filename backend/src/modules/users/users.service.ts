import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
        bio: true,
        sizes: true,
        createdAt: true,
      },
    });
  }

  async updateProfile(
    id: string,
    data: {
      avatarUrl?: string;
      bio?: string;
      sizes?: any;
    },
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
        bio: true,
        sizes: true,
        createdAt: true,
      },
    });
  }
}