export class Request {

    constructor(
        public query: Record<string, any>,
        public body: object,
        public params: Record<string, any>,
        public headers: Record<string, string>,
        public ip: string,
        public ips: string[],
        public url: string,
        public hostname: string,
        public protocol: string,
        public method: string,
        public cookies: object,
        public user?: object,
    ) {}
}
