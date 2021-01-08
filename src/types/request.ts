import { Request as DefaultRequest } from 'express';

export interface ParamsDictionary {
  [key: string]: string;
}

export interface Query {
  [key: string]: undefined | string | string[] | Query | Query[];
}

export interface RequestBody<B> extends DefaultRequest {
  body: B;
}

export interface RequestParams<P extends ParamsDictionary> extends DefaultRequest {
  params: P;
}

export interface RequestQuery<Q extends ParamsDictionary> extends DefaultRequest {
  query: Q;
}

export interface Request<B = never, Q extends Query = never, P extends ParamsDictionary = never>
  extends DefaultRequest {
  body: B;
  params: P;
  query: Q;
}

export interface RequestBodyQueryParamsId<B, Q extends Query> extends DefaultRequest {
  body: B;
  query: Q;

  params: {
    id: string;
  };
}

export interface RequestQueryParamsId<Q extends Query> extends DefaultRequest {
  query: Q;

  params: {
    id: string;
  };
}

export interface RequestBodyParamsId<B> extends DefaultRequest {
  body: B;
  params: {
    id: string;
  };
}

export interface RequestParamsId extends DefaultRequest {
  params: {
    id: string;
  };
}
