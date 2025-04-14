import { Test, TestingModule } from '@nestjs/testing';
import { Reflector, ModulesContainer, MetadataScanner } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { CommandsScanner } from '../../management/commands-scanner';
import { Command, DefaultHandler, CliArgument } from '../../management/management.decorators';

// Test command class
@Injectable()
@Command({ name: 'testCommand', description: 'A test command' })
class TestCommand {
    @DefaultHandler()
    handler(
        @CliArgument({ name: 'arg1', description: 'Argument 1', optional: false }) arg1: string
    ) {
        return `Handled: ${arg1}`;
    }
}

describe('CommandsScanner (Integration)', () => {
    let scanner: CommandsScanner;
    let modulesContainer: ModulesContainer;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TestCommand],
        }).compile();

        modulesContainer = module.get(ModulesContainer);
        const reflector = new Reflector();
        const metadataScanner = new MetadataScanner();

        scanner = new CommandsScanner(reflector, modulesContainer, metadataScanner);
    });

    it('should detect commands and handlers with metadata', () => {
        const commands = scanner.scanCommands();

        expect(commands.size).toBe(1);

        const command = Array.from(commands)[0];
        expect(command.name).toBe('testCommand');
        expect(command.description).toBe('A test command');
        expect(command.handlers).toHaveLength(1);

        const handler = command.handlers[0];
        expect(handler.methodName).toBe('handler');
        expect(handler.shortcut).toBe('default');
        expect(handler.arguments).toHaveLength(1);
        expect(handler.arguments[0].name).toBe('arg1');
        expect(handler.arguments[0].description).toBe('Argument 1');
        expect(handler.arguments[0].optional).toBe(false);
    });
});
