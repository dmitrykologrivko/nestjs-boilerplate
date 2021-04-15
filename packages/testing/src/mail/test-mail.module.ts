import { Module, Global } from '@nestjs/common';
import { ConsoleMailService } from './console-mail.service';
import { MemoryMailService } from './memory-mail.service';
import { NullMailService } from './null-mail.service';

@Global()
@Module({
    providers: [
        ConsoleMailService,
        MemoryMailService,
        NullMailService,
    ],
    exports: [
        ConsoleMailService,
        MemoryMailService,
        NullMailService,
    ],
})
export class TestMailModule {}
