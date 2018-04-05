import {
  ClientModel, ITransferService, PagedResult, PagingModel, TransferModel, TransferredDocumentModel,
  TransferStatus
} from './TransferService';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Injectable, OnInit} from '@angular/core';

const _mockClients: ClientModel[] = [
  {clientId: '1', clientDescription: 'Client 1'},
  {clientId: '2', clientDescription: 'Client 2'},
  {clientId: '3', clientDescription: 'Client 3'},
  {clientId: '4', clientDescription: 'Client 3'},
];

const _mockTransfers: TransferModel [] = [
  { clientId: '1', transferId: 'client1_transfer_1', documentCount: 2, status: TransferStatus.COMPLETED },
  { clientId: '1', transferId: 'client1_transfer_2', documentCount: 1, status: TransferStatus.COMPLETED },
  { clientId: '1', transferId: 'client1_transfer_3', documentCount: 3, status: TransferStatus.ABORTED },
  { clientId: '1', transferId: 'client1_transfer_4', documentCount: 1, status: TransferStatus.IN_PROGRESS },
  { clientId: '3', transferId: 'client3_transfer_1', documentCount: 1, status: TransferStatus.COMPLETED },
  { clientId: '3', transferId: 'client3_transfer_2', documentCount: 3, status: TransferStatus.IN_PROGRESS },
  { clientId: '3', transferId: 'client3_transfer_3', documentCount: 1, status: TransferStatus.ABORTED },
  { clientId: '3', transferId: 'client3_transfer_4', documentCount: 1, status: TransferStatus.IN_PROGRESS },
];

function fromArray<ModelT>(items: ModelT []): PagedResult<ModelT> {
  return {
    page: 1,
    pageSize: items.length,
    totalItems: items.length,
    totalPages: 1,
    items: items,
  };
}

@Injectable()
export class MockTransferService extends ITransferService implements OnInit {
  _clients = new BehaviorSubject( fromArray(_mockClients) );
  _transfers = new BehaviorSubject( fromArray(_mockTransfers) );

  ngOnInit() {
  }

  getRegisteredClients(paging: PagingModel): Observable<PagedResult<ClientModel>> {
    return this._clients;
  }

  getClientTransfers(clientId: string, paging: PagingModel): Observable<PagedResult<TransferModel>> {
    return this._transfers.map( t => t.filter( x => x.clientId == clientId ) ) ;
  }

  getTransferredDocuments(transferId: string, paging: PagingModel): Observable<PagedResult<TransferredDocumentModel>> {
    return undefined;
  }

}
