export interface Command {
    instance: any;
    name: string;
    description?: string;
    handlers: Handler[];
}

export interface Handler {
    methodName: string;
    shortcut: string;
    description?: string;
    arguments: CliArgument[];
}

export interface CliArgument {
    name: string;
    description?: string;
    parse?: (arg: any) => any;
    defaultValue?: any;
    optional?: boolean;
}

export interface CommandOptions extends Pick<Command, 'name' | 'description'> {}

export interface HandlerOptions extends Pick<Handler, 'shortcut' | 'description'> {}

export interface CliArgumentOptions extends Pick<CliArgument, keyof CliArgument> {}
