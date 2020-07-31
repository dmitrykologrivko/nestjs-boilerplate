import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JWT_AUTH_TYPE } from '../constants/auth.types';

@Injectable()
export class JwtAuthGuard extends AuthGuard(JWT_AUTH_TYPE) {}
