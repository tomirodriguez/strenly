---
name: domain
description: |
  Comprehensive guidance for creating DDD building blocks: Value Objects, Entities, and Aggregates.
  Use this skill when modeling domain concepts in the core layer. Helps distinguish between concepts
  that have identity (Entities), concepts defined by their attributes (Value Objects), and
  consistency boundaries (Aggregates).
  Do NOT load for DTOs, API response types, database models, or infrastructure concerns.
---

<objective>
Creates domain building blocks that encapsulate business logic following DDD principles. This skill helps you identify the correct building block type and implement it with proper patterns.
</objective>

<decision_flowchart>
**Before writing code, answer these questions:**

```
Does the concept need a unique identity?
├── NO → Does it have validation rules?
│         ├── YES → VALUE OBJECT (e.g., Email, Money, DateRange)
│         └── NO  → Plain type or enum (e.g., status literals)
│
└── YES → Can it exist independently?
          ├── NO  → ENTITY owned by Aggregate (e.g., OrderItem)
          └── YES → Is it a consistency boundary?
                    ├── YES → AGGREGATE ROOT (e.g., Order, ShoppingCart)
                    └── NO  → STANDALONE ENTITY (e.g., Customer, Product)
```

**Quick classification:**
| If the concept... | It's a... |
|-------------------|-----------|
| Has no ID, compared by attributes | Value Object |
| Has ID, can be referenced directly | Entity |
| Has ID, owns other entities, enforces invariants | Aggregate Root |
| Has ID, lives inside an aggregate | Child Entity |
</decision_flowchart>

<location>
```
src/domain/
├── value-objects/           # Value Objects (no identity)
│   ├── email.ts
│   ├── money.ts
│   ├── address.ts
│   └── date-range.ts
├── entities/                # Entities and Aggregates
│   ├── customer.ts          # Entity
│   ├── product.ts           # Entity
│   ├── order.ts             # Aggregate Root
│   └── order-item.ts        # Child Entity (owned by Order)
└── errors/
    └── index.ts             # Domain error types
```
</location>

<value_objects>
## Value Objects

Value Objects have NO identity. They are defined entirely by their attributes. Two Value Objects with the same attributes are considered equal.

### Characteristics
- **No ID**: Never have an `id` field
- **Immutable**: All properties are readonly
- **Self-validating**: Validate on creation, always valid once created
- **Equality by value**: Compared by attributes, not reference
- **Side-effect free**: No mutations, return new instances

### When to Use
- Descriptive attributes: `Email`, `PhoneNumber`, `Color`
- Measurements: `Money`, `Weight`, `Percentage`
- Ranges: `DateRange`, `PriceRange`
- Complex values: `Address`, `Coordinates`, `TimeSlot`

### Pattern: Constrained Type (Simple)
Use for values from a fixed set:

```typescript
// domain/value-objects/order-status.ts
export const ORDER_STATUSES = [
  'pending', 'confirmed', 'shipped', 'delivered', 'cancelled',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

// Type guard for runtime validation
export function isValidOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && ORDER_STATUSES.includes(value as OrderStatus)
}

// Derived behavior
export type StatusGroup = 'active' | 'completed' | 'cancelled'

const STATUS_GROUPS: Record<OrderStatus, StatusGroup> = {
  pending: 'active',
  confirmed: 'active',
  shipped: 'active',
  delivered: 'completed',
  cancelled: 'cancelled',
}

export function getStatusGroup(status: OrderStatus): StatusGroup {
  return STATUS_GROUPS[status]
}
```

### Pattern: Validated Type (Complex)
Use when validation rules are more complex:

```typescript
// domain/value-objects/email.ts
import { err, ok, type Result } from 'neverthrow'

export type Email = {
  readonly value: string
  readonly domain: string
  readonly local: string
}

export type EmailError = { type: 'INVALID_EMAIL'; message: string }

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function createEmail(input: string): Result<Email, EmailError> {
  const trimmed = input.trim().toLowerCase()

  if (!EMAIL_REGEX.test(trimmed)) {
    return err({ type: 'INVALID_EMAIL', message: 'Invalid email format' })
  }

  const [local, domain] = trimmed.split('@')

  return ok({ value: trimmed, domain, local })
}

// Equality helper
export function emailsEqual(a: Email, b: Email): boolean {
  return a.value === b.value
}
```

### Pattern: Composite Value Object
Use when a VO contains multiple related fields:

```typescript
// domain/value-objects/money.ts
import { err, ok, type Result } from 'neverthrow'

export const CURRENCIES = ['USD', 'EUR', 'GBP'] as const
export type Currency = (typeof CURRENCIES)[number]

export type Money = {
  readonly amount: number      // In cents
  readonly currency: Currency
}

export type MoneyError =
  | { type: 'NEGATIVE_AMOUNT'; message: string }
  | { type: 'CURRENCY_MISMATCH'; message: string }

export function createMoney(amount: number, currency: Currency): Result<Money, MoneyError> {
  if (amount < 0) {
    return err({ type: 'NEGATIVE_AMOUNT', message: 'Amount cannot be negative' })
  }
  return ok({ amount, currency })
}

// Operations preserve immutability
export function addMoney(a: Money, b: Money): Result<Money, MoneyError> {
  if (a.currency !== b.currency) {
    return err({ type: 'CURRENCY_MISMATCH', message: 'Cannot add different currencies' })
  }
  return ok({ amount: a.amount + b.amount, currency: a.currency })
}

export function moneyEquals(a: Money, b: Money): boolean {
  return a.amount === b.amount && a.currency === b.currency
}
```
</value_objects>

<entities>
## Entities

Entities have identity that persists across time and different representations. Two Entities with the same ID are the same entity, even if their attributes differ.

### Characteristics
- **Identity**: Always have a unique `id` field
- **Lifecycle**: Created, modified, potentially deleted
- **Mutable state**: Can change over time (via immutable updates)
- **Equality by ID**: Same ID = same entity
- **Business rules**: Enforce invariants specific to this concept

### When to Use
- Domain objects that need to be tracked: `Customer`, `Product`, `User`
- Objects referenced by other parts of the system
- Objects with a lifecycle (created → modified → archived)

### Pattern: Standard Entity

```typescript
// domain/entities/customer.ts
import { err, ok, type Result } from 'neverthrow'

export type CustomerStatus = 'active' | 'inactive' | 'suspended'

export type Customer = {
  readonly id: string
  readonly organizationId: string
  readonly name: string
  readonly email: string
  readonly status: CustomerStatus
  readonly createdAt: Date
  readonly updatedAt: Date
}

export type CustomerError =
  | { type: 'NAME_REQUIRED'; message: string }
  | { type: 'NAME_TOO_LONG'; message: string }
  | { type: 'INVALID_EMAIL'; message: string }

type CreateCustomerInput = {
  id: string                    // Provided by use case (via generateId)
  organizationId: string
  name: string
  email: string
  status?: CustomerStatus
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function createCustomer(input: CreateCustomerInput): Result<Customer, CustomerError> {
  const trimmedName = input.name.trim()
  if (trimmedName.length === 0) {
    return err({ type: 'NAME_REQUIRED', message: 'Name is required' })
  }
  if (trimmedName.length > 100) {
    return err({ type: 'NAME_TOO_LONG', message: 'Name must not exceed 100 characters' })
  }

  const email = input.email.trim().toLowerCase()
  if (!EMAIL_REGEX.test(email)) {
    return err({ type: 'INVALID_EMAIL', message: 'Invalid email format' })
  }

  const now = new Date()

  return ok({
    id: input.id,
    organizationId: input.organizationId,
    name: trimmedName,
    email,
    status: input.status ?? 'active',
    createdAt: now,
    updatedAt: now,
  })
}

// Reconstitute from database (skip validation - data is already valid)
export function reconstituteCustomer(props: Customer): Customer {
  return { ...props }
}

// Query helpers using Pick<> for minimal requirements
export const isActive = (customer: Pick<Customer, 'status'>): boolean =>
  customer.status === 'active'
```

### Pattern: Entity with State Machine

```typescript
// domain/entities/order.ts
import { err, ok, type Result } from 'neverthrow'

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export type Order = {
  readonly id: string
  readonly customerId: string
  readonly status: OrderStatus
  // ... other fields
}

export type OrderError =
  | { type: 'INVALID_STATUS_TRANSITION'; message: string; from: OrderStatus; to: OrderStatus }

// Define valid transitions
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

export function canTransitionTo(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to)
}

export function transitionStatus(
  order: Order,
  newStatus: OrderStatus
): Result<Order, OrderError> {
  if (order.status === newStatus) {
    return ok(order)  // No-op if same status
  }

  if (!canTransitionTo(order.status, newStatus)) {
    return err({
      type: 'INVALID_STATUS_TRANSITION',
      message: `Cannot transition from ${order.status} to ${newStatus}`,
      from: order.status,
      to: newStatus,
    })
  }

  return ok({ ...order, status: newStatus })
}
```

### ID Generation Rule

**The domain entity receives the ID as input. It does NOT generate IDs.**

ID generation is an infrastructure concern. The use case injects a `generateId` dependency and passes the ID to the domain factory:

```typescript
// In use case:
type Dependencies = {
  repository: CustomerRepository
  generateId: () => string  // Injected (e.g., nanoid, uuid)
}

const customerResult = createCustomer({
  id: deps.generateId(),  // Use case provides the ID
  organizationId: input.organizationId,
  name: input.name,
  email: input.email,
})
```
</entities>

<aggregates>
## Aggregates

Aggregates are clusters of Entities and Value Objects treated as a single unit for data changes. The Aggregate Root is the only entry point for modifications.

### Characteristics
- **Consistency boundary**: All invariants within the aggregate are enforced
- **Single root**: Only the root can be referenced from outside
- **Transactional unit**: Saved/loaded as a whole
- **Child ownership**: Children cannot exist without the root

### When to Use
- Groups of objects that must stay consistent together
- Objects with complex relationships: `Order → OrderItems`
- When you need to enforce invariants across multiple objects

### Identifying Aggregates

Ask: "If I delete X, what else must be deleted?"

- Delete an Order → Delete its OrderItems (owned)
- Delete a Customer → Orders remain (separate aggregate, referenced)
- Delete a Product → Products referenced in orders remain (referenced, not owned)

```
Order (Aggregate Root)
├── OrderItem (Child Entity)
│   └── Money (Value Object)
└── ShippingAddress (Value Object)
```

### Pattern: Aggregate Root

```typescript
// domain/entities/order.ts
import { err, ok, type Result } from 'neverthrow'

export type OrderItem = {
  readonly id: string
  readonly productId: string
  readonly quantity: number
  readonly unitPrice: number
}

export type Order = {
  readonly id: string
  readonly customerId: string
  readonly status: 'draft' | 'confirmed'
  readonly items: readonly OrderItem[]
  readonly createdAt: Date
  readonly updatedAt: Date
}

export type OrderError =
  | { type: 'MAX_ITEMS_EXCEEDED'; message: string }
  | { type: 'ITEM_NOT_FOUND'; message: string }
  | { type: 'ORDER_NOT_EDITABLE'; message: string }

const MAX_ITEMS = 100

// Aggregate-level invariant check
function assertEditable(order: Order): Result<void, OrderError> {
  if (order.status !== 'draft') {
    return err({ type: 'ORDER_NOT_EDITABLE', message: 'Order can only be modified in draft status' })
  }
  return ok(undefined)
}

export function addItem(order: Order, item: OrderItem): Result<Order, OrderError> {
  const editCheck = assertEditable(order)
  if (editCheck.isErr()) return err(editCheck.error)

  if (order.items.length >= MAX_ITEMS) {
    return err({ type: 'MAX_ITEMS_EXCEEDED', message: `Cannot exceed ${MAX_ITEMS} items` })
  }

  return ok({
    ...order,
    items: [...order.items, item],
    updatedAt: new Date(),
  })
}

export function removeItem(order: Order, itemId: string): Result<Order, OrderError> {
  const editCheck = assertEditable(order)
  if (editCheck.isErr()) return err(editCheck.error)

  if (!order.items.find(i => i.id === itemId)) {
    return err({ type: 'ITEM_NOT_FOUND', message: `Item ${itemId} not found` })
  }

  return ok({
    ...order,
    items: order.items.filter(i => i.id !== itemId),
    updatedAt: new Date(),
  })
}

// Query helpers
export function calculateTotal(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
}
```

### Pattern: Child Entity (Owned by Aggregate)

Child entities have identity but cannot exist outside their aggregate:

```typescript
// domain/entities/order-item.ts
export type OrderItem = {
  readonly id: string
  readonly orderId: string        // Reference to parent
  readonly productId: string
  readonly quantity: number
  readonly unitPrice: number
}

// No standalone factory - created through aggregate operations
// Reconstitute when loading aggregate from persistence
export function reconstituteOrderItem(props: OrderItem): OrderItem {
  return { ...props }
}
```

### Aggregate Loading Strategy

Load aggregates with their children in a single repository call:

```typescript
// ports/order-repository.port.ts
export interface OrderRepository {
  findById(ctx: Context, id: string): ResultAsync<Order | null, RepositoryError>
  // Returns Order with all its OrderItems

  save(ctx: Context, order: Order): ResultAsync<void, RepositoryError>
  // Persists entire aggregate in a transaction
}
```
</aggregates>

<quick_reference>
## Quick Reference

### Value Object Template
```typescript
// Constrained type (fixed values)
export const VALUES = ['a', 'b', 'c'] as const
export type MyVO = (typeof VALUES)[number]
export function isValid(value: unknown): value is MyVO {
  return typeof value === 'string' && VALUES.includes(value as MyVO)
}

// Validated type (complex rules)
export type MyVO = { readonly field: string }
export function createMyVO(input: string): Result<MyVO, MyVOError> { /* validate */ }
```

### Entity Template
```typescript
export type MyEntity = {
  readonly id: string
  readonly organizationId: string
  // ... fields
  readonly createdAt: Date
  readonly updatedAt: Date
}

export function createMyEntity(input: CreateInput): Result<MyEntity, MyEntityError> { /* validate */ }
export function reconstituteMyEntity(props: MyEntity): MyEntity { return { ...props } }
```

### Aggregate Root Template
```typescript
export type MyAggregate = {
  readonly id: string
  readonly children: readonly ChildEntity[]
  // ... other fields
}

export function addChild(root: MyAggregate, child: Child): Result<MyAggregate, Error> { /* enforce invariants */ }
export function removeChild(root: MyAggregate, childId: string): Result<MyAggregate, Error> { /* validate */ }
```
</quick_reference>

<success_criteria>
## Success Criteria

### Value Object Checklist
- [ ] No `id` field
- [ ] All properties are `readonly`
- [ ] Factory returns `Result<VO, VOError>` (or type guard for simple constrained types)
- [ ] Provides equality comparison if needed
- [ ] Pure functions only (no side effects)

### Entity Checklist
- [ ] Has unique `id` field
- [ ] ID received as input (not generated in domain)
- [ ] All properties are `readonly`
- [ ] Factory returns `Result<Entity, EntityError>`
- [ ] Provides `reconstitute` function for loading from DB
- [ ] Query helpers use `Pick<>` for minimal requirements

### Aggregate Root Checklist
- [ ] Owns child entities (children reference parent via ID)
- [ ] All modifications go through root
- [ ] Enforces cross-entity invariants
- [ ] Loaded/saved as a complete unit
- [ ] Children cannot be referenced from outside aggregate
</success_criteria>

<resources>
For complete implementations, see:
- Value Objects: `references/value-object-examples.md`
- Entities: `references/entity-examples.md`
- Aggregates: `references/aggregate-examples.md`
</resources>
