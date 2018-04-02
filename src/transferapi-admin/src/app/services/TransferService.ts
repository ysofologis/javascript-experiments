import {Observable} from 'rxjs/Observable';
import {Injectable} from '@angular/core';

export interface PagingModel {
  page: number;
  pageSize: number;
}

export interface PagedResult<ModelT> {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  items: ModelT [];
}

export interface ClientModel {
    clientId: string;
    clientDescription: string;
}
export enum TransferStatus {
  STARTED = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
  ABORTED = 4,
}
export interface TransferModel {
  transferId: string;
  clientId: string;
  dateStarted?: Date;
  dateCompleted?: Date;
  status: TransferStatus;
  documentCount: number;
}
export interface TransferredDocumentModel {
  transferId: string;
  documentNumber: string;
  status: number;
  attachmentCount: number;
}

@Injectable()
export abstract class ITransferService {
  abstract getRegisteredClients(paging: PagingModel): Observable< PagedResult<ClientModel> >;
  abstract getClientTransfers(clientId: string, paging: PagingModel): Observable< PagedResult<TransferModel> >;
  abstract getTransferredDocuments(transferId: string, paging: PagingModel): Observable< PagedResult<TransferredDocumentModel> >;
}
