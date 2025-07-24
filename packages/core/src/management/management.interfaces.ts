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

export type CommandOptions = Pick<Command, 'name' | 'description'>

export type HandlerOptions = Pick<Handler, 'shortcut' | 'description'>

export type CliArgumentOptions = Pick<CliArgument, keyof CliArgument>
