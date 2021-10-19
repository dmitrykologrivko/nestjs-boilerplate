import { Module } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { CommandsScanner } from './commands-scanner';
import { ManagementService } from './management.service';

@Module({
    providers: [
        MetadataScanner,
        CommandsScanner,
        ManagementService
    ],
})
export class ManagementModule {}
