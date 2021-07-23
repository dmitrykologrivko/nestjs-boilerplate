import { Request } from './request';

export function fromExpressRequest(req: any): Request {
    return new Request(
        req.query,
        req.body,
        req.params,
        req.headers,
        req.ip,
        req.ips,
        req.url,
        req.headers.host,
        req.protocol,
        req.method,
        req.cookies,
        req.user,
    );
}
