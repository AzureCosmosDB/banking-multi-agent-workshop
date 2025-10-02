export enum CardType {
  None = 0,
  Visa = 1,
  MasterCard = 2,
  AmericanExpress = 3,
  Discover = 4,
  UnionPay = 5,
  JCB = 6,
  Maestro = 7,
  Cirrus = 8
}

export interface Account {
  id?: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  accountHolder: string;
  accountStatus: string;
  cardNumber?: string;
  cardType?: CardType;
  limit?: number;
  openDate?: Date;
  lastActivity?: Date;
}

export interface AccountCard {
  id?: string;
  accountNumber?: string;
  balance: string;
  cardNumber: string;
  name: string;
  accountId?: string;
  accountType?: string;
  limit?: string;
  accountStatus?: string;
  cardType?: CardType;
}