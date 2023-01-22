import { BaseCrudService } from '../../application/service/base-crud.service';
import { BaseDto } from '../../application/dto/base.dto';
import { BaseEntityDto } from '../../application/dto/base-entity.dto';
import { ListInput } from '../../application/dto/list.input';
import { RetrieveInput } from '../../application/dto/retrieve.input';
import { CreateInput } from '../../application/dto/create.input';
import { UpdateInput } from '../../application/dto/update.input';
import { DestroyInput } from '../../application/dto/destroy.input';
import { BasePaginatedContainer } from '../../application/pagination/base-paginated-container.interface';
import { Request } from '../request/request';
import { fromExpressRequest } from '../request/request.utils';
import { BaseCrudController } from './base-crud.controller';

export abstract class CrudController<D extends BaseEntityDto,
    // List
    LI extends ListInput = ListInput,
    LO extends BaseEntityDto = D,
    PC extends BasePaginatedContainer<LO> = BasePaginatedContainer<LO>,
    // Retrieve
    RI extends RetrieveInput = RetrieveInput,
    RO extends BaseEntityDto = D,
    // Create
    CP extends BaseDto = D,
    CI extends CreateInput<CP> = CreateInput<CP>,
    CO extends BaseEntityDto = D,
    // Update
    UP extends BaseEntityDto = D,
    UI extends UpdateInput<UP> = UpdateInput<UP>,
    UO extends BaseEntityDto = D,
    // Destroy
    DI extends DestroyInput = DestroyInput> extends BaseCrudController<D, any, LI, LO, PC, RI, RO, CP, CI, CO, UP, UI, UO, DI> {

    protected constructor(service: BaseCrudService<any, D, LI, LO, PC, RI, RO, CP, CI, CO, UP, UI, UO, DI>) {
        super(service);
    }

    protected mapRequest(req: any): Request {
        return fromExpressRequest(req);
    }
}
