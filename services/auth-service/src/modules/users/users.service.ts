import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, AuthProvider, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    provider?: AuthProvider;
    providerId?: string;
  }): Promise<User> {
    try {
      console.log('Creating user - checking if email exists:', createUserDto.email);
      
      // Check if user already exists
      const existingUser = await this.findByEmail(createUserDto.email);
      if (existingUser) {
        console.log('User already exists with email:', createUserDto.email);
        throw new ConflictException('User with this email already exists');
      }

      // Hash password if provided
      let hashedPassword: string | undefined;
      if (createUserDto.password) {
        console.log('Hashing password...');
        hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        console.log('Password hashed successfully');
      }

      console.log('Creating user entity...');
      const user = this.usersRepository.create({
        email: createUserDto.email,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role || UserRole.EMPLOYEE,
        provider: createUserDto.provider || AuthProvider.LOCAL,
        providerId: createUserDto.providerId,
        isActive: true,
        isEmailVerified: false,
      });

      console.log('Saving user to database...');
      const savedUser = await this.usersRepository.save(user);
      console.log('User saved successfully:', savedUser.id);
      
      return savedUser;
    } catch (error) {
      console.error('Error in users.service.create:', error);
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findByProviderId(provider: AuthProvider, providerId: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { provider, providerId },
    });
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    const hashedToken = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;
    await this.usersRepository.update(userId, { refreshToken: hashedToken || undefined });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, { lastLoginAt: new Date() });
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateData);
    return await this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(userId, { password: hashedPassword });
  }
}
