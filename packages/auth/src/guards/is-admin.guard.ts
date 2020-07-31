import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class IsAdminGuard implements CanActivate {

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        return !(!request.user || !request.user.isActive || !request.user.isAdmin);
    }
}
