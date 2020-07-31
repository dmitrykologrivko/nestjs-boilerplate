import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LOCAL_AUTH_TYPE } from '../constants/auth.types';

@Injectable()
export class LocalAuthGuard extends AuthGuard(LOCAL_AUTH_TYPE) {}
