import type { VerifiedErpContext } from "../access/access-contract.ts";

export type ErpIdentity = Readonly<{ issuer: string; userId: string }>;

export type ErpCompany = Readonly<{ id: string; name: string }>;

export type ErpCompanyReader = {
  findOwnership(): Promise<VerifiedErpContext["ownership"]>;
  readCompany(): Promise<ErpCompany | null>;
};

// A future implementation must bind the verified identity and requested company
// to one transaction and apply RLS on every read.
export interface ErpDataAdapter<Reader extends ErpCompanyReader = ErpCompanyReader> {
  withCompanyScope<T>(
    identity: ErpIdentity,
    companyId: string,
    read: (reader: Reader) => Promise<T>,
  ): Promise<T>;
}
