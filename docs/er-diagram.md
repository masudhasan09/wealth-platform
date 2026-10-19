# Entity-Relationship Diagram

This diagram documents the core data models, relationships, and enums defined in `prisma/schema.prisma`.

```mermaid
erDiagram
  User ||--o{ Account : owns
  Account ||--o{ Transaction : scopes
  Account ||--o{ Liability : has
  Instrument ||--o{ Transaction : tracks
  Instrument ||--o{ Price : records
  Instrument ||--o{ ValuationMark : marks
  Instrument ||--o| BondDetails : "has if bond"
  Instrument ||--o| PropertyDetails : "has if property"
  Instrument ||--o{ Liability : "collateral for"
  Transaction ||--o{ TaxLot : opens

  User {
    string id PK
    string email UK
    string name
    string passwordHash
    datetime createdAt
    datetime updatedAt
  }

  Account {
    string id PK
    string userId FK
    string name
    AccountType type
    string currency
    string description
    datetime closedAt
    datetime createdAt
    datetime updatedAt
  }

  Instrument {
    string id PK
    AssetClass assetClass
    string symbol
    string name
    string currency
    string identifiers "JSON"
    datetime createdAt
    datetime updatedAt
  }

  BondDetails {
    string id PK
    string instrumentId FK,UK
    string faceValue
    string couponRate
    CouponFrequency couponFrequency
    datetime maturityDate
    datetime issueDate
    DayCount dayCount
    datetime callDate
    string callPrice
  }

  PropertyDetails {
    string id PK
    string instrumentId FK,UK
    string address
    string purchasePrice
    datetime purchaseDate
    string ownershipPct
    string propertyType
  }

  Transaction {
    string id PK
    string accountId FK
    string instrumentId FK
    TransactionType type
    datetime date
    string quantity
    string price
    string amount
    string fee
    datetime voidedAt
    string voidedReason
    string note
    string externalId
    datetime createdAt
    datetime updatedAt
  }

  Price {
    string id PK
    string instrumentId FK
    datetime date
    string value
    PriceSource source
    datetime asOf
    ValuationMethod method
    datetime createdAt
  }

  ValuationMark {
    string id PK
    string instrumentId FK
    datetime date
    string value
    ValuationMethod method
    string note
    datetime createdAt
  }

  Liability {
    string id PK
    string accountId FK
    string linkedInstrumentId FK
    string name
    string principal
    string rate
    int termMonths
    datetime startDate
    string currency
    datetime createdAt
    datetime updatedAt
  }

  TaxLot {
    string id PK
    string transactionId FK
    string quantity
    string costBasisPerUnit
    datetime openDate
    datetime closedAt
    datetime createdAt
    datetime updatedAt
  }
```

## Immutable Ledger Architecture
- **Holdings, cash balances, and cost bases are derived**: never store editable snapshot values directly.
- **Auditable**: voiding a transaction sets `voidedAt` and `voidedReason`; it is never physically removed from the ledger.
- **Multi-Asset**: `Instrument` supports `equity`, `crypto`, `fixed_income`, `real_estate`, and `cash`. Specialized details (`BondDetails`, `PropertyDetails`) attach via 1-to-1 relations.
