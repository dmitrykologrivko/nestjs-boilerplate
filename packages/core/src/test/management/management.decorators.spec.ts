import 'reflect-metadata';
import { INJECTABLE_WATERMARK } from '@nestjs/common/constants';
import {
    Command,
    Handler,
    DefaultHandler,
    CliArgument,
} from '../../management/management.decorators';
import {
    COMMAND_METADATA_NAME,
    HANDLER_METADATA_NAME,
    HANDLER_DEFAULT_NAME,
    CLI_ARGUMENTS_METADATA_NAME,
} from '../../management/management.constants';

describe('Management Decorators', () => {
    describe('Command', () => {
        it('should set command metadata and make the class injectable', () => {
            @Command({ name: 'testCommand', description: 'A test command' })
            class TestCommand {}

            const metadata = Reflect.getMetadata(COMMAND_METADATA_NAME, TestCommand);
            expect(metadata).toEqual({ name: 'testCommand', description: 'A test command' });

            const injectableMetadata = Reflect.getMetadata(INJECTABLE_WATERMARK, TestCommand);
            expect(injectableMetadata).toBeDefined();
        });
    });

    describe('Handler', () => {
        it('should set handler metadata on a method', () => {
            // tslint:disable-next-line:max-classes-per-file
            class TestCommand {
                @Handler({ shortcut: 'default', description: 'Default handler' })
                handle() {
                    return;
                }
            }

            const metadata = Reflect.getMetadata(HANDLER_METADATA_NAME, TestCommand.prototype.handle);
            expect(metadata).toEqual({ shortcut: 'default', description: 'Default handler' });
        });
    });

    describe('DefaultHandler', () => {
        it('should set default handler metadata on a method', () => {
            // tslint:disable-next-line:max-classes-per-file
            class TestCommand {
                @DefaultHandler()
                handle() {
                    return;
                }
            }

            const metadata = Reflect.getMetadata(HANDLER_METADATA_NAME, TestCommand.prototype.handle);
            expect(metadata).toEqual({ shortcut: HANDLER_DEFAULT_NAME });
        });
    });

    describe('CliArgument', () => {
        it('should set CLI argument metadata on a method parameter', () => {
            // tslint:disable-next-line:max-classes-per-file
            class TestCommand {
                handle(
                    @CliArgument({ name: 'arg1', description: 'Argument 1', optional: false })
                    arg1: string,
                ) {
                    return;
                }
            }

            const metadata = Reflect.getMetadata(CLI_ARGUMENTS_METADATA_NAME, TestCommand.prototype.handle);
            expect(metadata).toEqual([{ name: 'arg1', description: 'Argument 1', optional: false }]);
        });

        it('should accumulate multiple CLI arguments on a method', () => {
            // tslint:disable-next-line:max-classes-per-file
            class TestCommand {
                handle(
                    @CliArgument({ name: 'arg1', description: 'Argument 1', optional: false })
                    arg1: string,
                    @CliArgument({ name: 'arg2', description: 'Argument 2', optional: true })
                    arg2: string,
                ) {
                    return;
                }
            }

            const metadata = Reflect.getMetadata(CLI_ARGUMENTS_METADATA_NAME, TestCommand.prototype.handle);
            expect(metadata).toEqual([
                { name: 'arg1', description: 'Argument 1', optional: false },
                { name: 'arg2', description: 'Argument 2', optional: true },
            ]);
        });
    });
});