import { mock, MockProxy } from 'jest-mock-extended';
import { ManagementService } from '../../management/management.service';
import { CommandsScanner } from '../../management/commands-scanner';
import { Command, Handler, CliArgument } from '../../management/management.interfaces';

describe('ManagementService', () => {
    class TestManagementService extends ManagementService {
        private arguments: string[] = [];

        constructor(commandsScanner: CommandsScanner) {
            super(commandsScanner);
        }

        setArguments(args: string[]): void {
            this.arguments = args;
        }

        protected getArguments(): string[] {
            return this.arguments;
        }
    }

    let service: TestManagementService;
    let scannerMock: MockProxy<CommandsScanner>;

    beforeEach(async () => {
        scannerMock = mock<CommandsScanner>();
        service = new TestManagementService(scannerMock);
    });

    describe('#exec', () => {
        it('should throw an error if no command is provided', async () => {
            await expect(service.exec()).rejects.toThrow(
                'Command name is not provided! Please provide --command argument',
            );
        });

        it('should throw an error if the command is not found', async () => {
            service.setArguments(['--command=unknownCommand']);
            scannerMock.scanCommands.mockReturnValue(new Set());

            await expect(service.exec()).rejects.toThrow(
                'Could not find "unknownCommand" in registered commands',
            );
        });

        it('should throw an error if the handler is not found', async () => {
            service.setArguments(['--command=testCommand']);
            const command: Command = {
                name: 'testCommand',
                description: 'Test command',
                instance: {},
                handlers: [],
            };
            scannerMock.scanCommands.mockReturnValue(new Set([command]));

            await expect(service.exec()).rejects.toThrow(
                'Handler "default" is not registered in command "testCommand"',
            );
        });

        it('should execute the handler with bound arguments', async () => {
            service.setArguments(['--command=testCommand:customHandler', '--arg1=value1', '--arg2=value2']);

            const handlerArgs: CliArgument[] = [
                { name: 'arg1', description: '', optional: false },
                { name: 'arg2', description: '', optional: true, defaultValue: 'defaultValue' },
            ];

            const handler: Handler = {
                methodName: 'customHandler',
                shortcut: 'customHandler',
                description: 'Custom handler',
                arguments: handlerArgs,
            };

            const command: Command = {
                name: 'testCommand',
                description: 'Test command',
                instance: {
                    customHandler: jest.fn(),
                },
                handlers: [handler],
            };

            scannerMock.scanCommands.mockReturnValue(new Set([command]));

            await service.exec();

            expect(command.instance.customHandler).toHaveBeenCalledWith('value1', 'value2');
        });

        it('should throw an error if a required argument is missing', async () => {
            service.setArguments(['--command=testCommand:customHandler']);

            const handlerArgs: CliArgument[] = [
                { name: 'arg1', description: '', optional: false },
            ];

            const handler: Handler = {
                methodName: 'customHandler',
                shortcut: 'customHandler',
                description: 'Custom handler',
                arguments: handlerArgs,
            };

            const command: Command = {
                name: 'testCommand',
                description: 'Test command',
                instance: {
                    customHandler: jest.fn(),
                },
                handlers: [handler],
            };

            scannerMock.scanCommands.mockReturnValue(new Set([command]));

            await expect(service.exec()).rejects.toThrow('Missing required argument "arg1"');
        });
    });
});
