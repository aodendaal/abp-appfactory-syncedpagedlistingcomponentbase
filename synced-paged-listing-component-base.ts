import { Injector, OnInit, Type } from '@angular/core';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { HubConnection } from '@aspnet/signalr';

export abstract class SyncedPagedListingComponentBase<EntityDto> extends PagedListingComponentBase<EntityDto> implements OnInit {

    protected syncHub: HubConnection;
    protected readonly syncKey: string;
    protected isConnected: boolean = false;

    constructor(injector: Injector, syncType: Type<EntityDto>) {
        super(injector);
        this.syncKey = syncType.name;
    }

    ngOnInit(): void {
        this.sync();
        super.ngOnInit();
    }

    sync(): void {
        abp.event.on("abp.signalr.connected", () => {
            this.syncHub = abp.signalr.hubs.common;
            this.isConnected = true;
            this.syncHub.on(this.syncKey, () => {
                this.refresh();
            });
            this.syncHub.onclose(() => {
                this.isConnected = false;
            });
        });
    }

    refresh(): void {
        this.getDataPage(this.pageNumber);
    }
}
