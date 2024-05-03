/* tslint:disable *//* eslint-disable */import "sst"
declare module "sst" {
  export interface Resource {
    Database: import("@cloudflare/workers-types").D1Database
  }
}
export {}