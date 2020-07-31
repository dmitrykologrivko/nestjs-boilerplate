import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class BindUserInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();

        if (!req.user.isAdmin || !req.user.isSuperuser) {
            req.body.userId = req.user.id;
        }

        return next.handle();
    }
}
