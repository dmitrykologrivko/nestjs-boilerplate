import { Bootstrapper, BootstrapOptions } from './bootstrap.interfaces';
import { bootstrapServer } from './bootstrap-server.util';
import { bootstrapManagement } from './bootstrap-management.util';
import { COMMAND_ARG } from '../management/management.constants';

export async function bootstrapApplication(options: BootstrapOptions): Promise<Bootstrapper> {
   if (process.argv.includes(COMMAND_ARG)) {
       return await bootstrapManagement(options);
   } else {
       return await bootstrapServer(options);
   }
}
