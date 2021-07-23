import { Request } from './request';

export function convertExpressRequest(req: any): Request {
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
