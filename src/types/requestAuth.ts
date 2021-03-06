import { Request as DefaultRequest } from 'express';

import { ParamsDictionary, Query } from './request';

export interface RequestAuthBody<B> extends DefaultRequest {
  userId?: number;
  userEnrollment?: string;
  userRoleSlug?: string;
  body: B;
}

export interface RequestAuthParams<P extends ParamsDictionary> extends DefaultRequest {
  userId?: number;
  userEnrollment?: string;
  userRoleSlug?: string;
  params: P;
}

export interface RequestAuthQuery<Q extends Query> extends DefaultRequest {
  userId?: number;
  userEnrollment?: string;
  userRoleSlug?: string;
  query: Q;
}

export interface RequestAuth<B = never, P extends ParamsDictionary = never, Q extends Query = never>
  extends DefaultRequest {
  userId?: number;
  userEnrollment?: string;
  userRoleSlug?: string;
  body: B;
  params: P;
  query: Q;
}

export interface RequestAuthBodyQueryParamsId<B, Q extends Query> extends DefaultRequest {
  userId?: number;

  body: B;
  query: Q;

  params: {
    id: string;
  };
}

export interface RequestAuthBodyParamsId<B> extends DefaultRequest {
  userId?: number;
  userEnrollment?: string;
  userRoleSlug?: string;
  body: B;

  params: {
    id: string;
  };
}

export interface RequestAuthQueryParamsId<Q extends Query> extends DefaultRequest {
  userId?: number;
  userEnrollment?: string;
  userRoleSlug?: string;
  query: Q;

  params: {
    id: string;
  };
}

export interface RequestAuthParamsId extends DefaultRequest {
  userId?: number;

  params: {
    id: string;
  };
}
