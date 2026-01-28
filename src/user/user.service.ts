import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        posts: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByName(name: string) {
    return this.prisma.user.findFirst({ where: { name } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({ where: { email } });
  }

  async create(body: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (exists) {
      throw new ConflictException('Email already exists');
    }

    const hash = await bcrypt.hash(body.password, 10);
    return this.prisma.user.create({
      data: { ...body, password: hash },
    });
  }

  async update(id: number, body: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const data: any = { ...body };
    if (body.password) {
      data.password = await bcrypt.hash(body.password, 10);
    }
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
