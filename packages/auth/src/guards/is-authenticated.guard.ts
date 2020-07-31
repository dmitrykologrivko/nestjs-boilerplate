import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class IsAuthenticatedGuard implements CanActivate {

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        return !(!request.user || !request.user.isActive);
    }
}
