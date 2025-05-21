import { fromExpressRequest } from '../../../web/request/request.utils';
import { Request } from '../../../web/request/request';

describe('Request Utils', () => {
    describe('#fromExpressRequest()', () => {
        it('should correctly map express request to custom Request object', () => {
            const expressReq = {
                query: { search: 'test' },
                body: { key: 'value' },
                params: { id: '123' },
                headers: { host: 'localhost' },
                ip: '127.0.0.1',
                ips: ['127.0.0.1'],
                url: '/test',
                protocol: 'http',
                method: 'GET',
                cookies: { session: 'abc123' },
                user: { id: 'user1' },
            };

            const result = fromExpressRequest(expressReq);

            expect(result).toBeInstanceOf(Request);
            expect(result.query).toEqual(expressReq.query);
            expect(result.body).toEqual(expressReq.body);
            expect(result.params).toEqual(expressReq.params);
            expect(result.headers).toEqual(expressReq.headers);
            expect(result.ip).toEqual(expressReq.ip);
            expect(result.ips).toEqual(expressReq.ips);
            expect(result.url).toEqual(expressReq.url);
            expect(result.hostname).toEqual(expressReq.headers.host);
            expect(result.protocol).toEqual(expressReq.protocol);
            expect(result.method).toEqual(expressReq.method);
            expect(result.cookies).toEqual(expressReq.cookies);
            expect(result.user).toEqual(expressReq.user);
        });

        it('should handle missing optional fields gracefully', () => {
            const expressReq = {
                query: {},
                body: null,
                params: {},
                headers: {},
                ip: '127.0.0.1',
                ips: [],
                url: '/test',
                protocol: 'http',
                method: 'POST',
            };

            const result = fromExpressRequest(expressReq);

            expect(result).toBeInstanceOf(Request);
            expect(result.query).toEqual(expressReq.query);
            expect(result.body).toBeNull();
            expect(result.params).toEqual(expressReq.params);
            expect(result.headers).toEqual(expressReq.headers);
            expect(result.ip).toEqual(expressReq.ip);
            expect(result.ips).toEqual(expressReq.ips);
            expect(result.url).toEqual(expressReq.url);
            expect(result.hostname).toBeUndefined();
            expect(result.protocol).toEqual(expressReq.protocol);
            expect(result.method).toEqual(expressReq.method);
            expect(result.cookies).toBeUndefined();
            expect(result.user).toBeUndefined();
        });
    });
});
