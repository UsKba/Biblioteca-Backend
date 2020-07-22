import { Request as DefaultRequest } from 'express';

import { ParamsDictionary, Query } from '.';

export interface RequestAuthBody<B> extends DefaultRequest {
  userEnrollment?: number;
  body: B;
}

export interface RequestAuthParams<P extends ParamsDictionary> extends DefaultRequest {
  userEnrollment?: number;
  params: P;
}

export interface RequestAuthQuery<Q extends Query> extends DefaultRequest {
  userEnrollment?: number;
  query: Q;
}

export interface RequestAuth<B = never, Q extends Query = never, P extends ParamsDictionary = never>
  extends DefaultRequest {
  userEnrollment?: number;

  body: B;
  params: P;
  query: Q;
}

export interface RequestAuthBodyQueryParamsId<B, Q extends Query> extends DefaultRequest {
  userEnrollment?: number;

  body: B;
  query: Q;

  params: {
    id: string;
  };
}

export interface RequestAuthBodyParamsId<B> extends DefaultRequest {
  userEnrollment?: number;
  body: B;

  params: {
    id: string;
  };
}

export interface RequestAuthQueryParamsId<Q extends Query> extends DefaultRequest {
  userEnrollment?: number;
  query: Q;

  params: {
    id: string;
  };
}

export interface RequestAuthParamsId extends DefaultRequest {
  userEnrollment?: number;

  params: {
    id: string;
  };
}
