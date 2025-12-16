---
applyTo: "**/*.{ts,tsx}"
---

# API Development Patterns

## Layered Architecture Standards

This application follows a strict **layered architecture** with clear separation of concerns. All API-related code MUST follow these patterns.

---

## 1. Model Layer (Data Validation)

**Location**: `src/lib/models/`

**Purpose**: Define data structures and validation rules using Zod schemas.

### Requirements

- Use **Zod schemas** exclusively for validation
- Create separate schemas for Create, Update, and full entity
- Derive TypeScript types from schemas using `z.infer<>`
- All timestamps must use ISO 8601 format (`.datetime()`)
- All IDs must be UUIDs (`.uuid()`)

### Pattern

```typescript
import { z } from 'zod';

// 1. Base schema with all fields
export const EntitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  ownerId: z.string().uuid(),
  deletedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// 2. Create schema omits auto-generated fields
export const CreateEntitySchema = EntitySchema.omit({
  id: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
});

// 3. Update schema makes all fields optional
export const UpdateEntitySchema = EntitySchema
  .omit({ id: true, ownerId: true, createdAt: true })
  .partial();

// 4. Export TypeScript types
export type Entity = z.infer<typeof EntitySchema>;
export type CreateEntityDTO = z.infer<typeof CreateEntitySchema>;
export type UpdateEntityDTO = z.infer<typeof UpdateEntitySchema>;

// 5. Document type for Cosmos DB (if different from domain model)
export interface EntityDocument extends Entity {
  // Add Cosmos-specific fields if needed
}
```

### Rules

- ✅ Use descriptive field names with clear purpose
- ✅ Add validation messages for better error feedback
- ✅ Keep models focused on data structure only
- ❌ Do NOT include business logic in models
- ❌ Do NOT add methods to schema types

---

## 2. Repository Layer (Data Access)

**Location**: `src/lib/database/repositories/`

**Purpose**: Encapsulate all database operations for a single container.

### Requirements

- One repository per Cosmos DB container
- Use **Singleton pattern** for repository instances
- All timestamps use `new Date().toISOString()`
- Soft deletes via `deletedAt` field
- Filter out soft-deleted records by default
- Container names from `src/lib/database/containers.ts`

### Pattern

```typescript
import { v4 as uuidv4 } from 'uuid';
import { CONTAINERS } from '@/lib/database/containers';
import { getCosmosClient } from '@/lib/database/cosmosClient';
import { DatabaseError, NotFoundError } from '@/lib/errors/ApiError';
import type { Entity, CreateEntityDTO, UpdateEntityDTO } from '@/lib/models/entity.model';
import { EntitySchema, CreateEntitySchema, UpdateEntitySchema } from '@/lib/models/entity.model';

class EntityRepository {
  private static instance: EntityRepository;

  private constructor() {}

  public static getInstance(): EntityRepository {
    if (!EntityRepository.instance) {
      EntityRepository.instance = new EntityRepository();
    }
    return EntityRepository.instance;
  }

  private async getContainer() {
    const cosmosClient = getCosmosClient();
    return cosmosClient.getContainer(CONTAINERS.ENTITIES);
  }

  async findAll(includeDeleted = false): Promise<Entity[]> {
    try {
      const container = await this.getContainer();
      const query = includeDeleted
        ? 'SELECT * FROM c'
        : 'SELECT * FROM c WHERE (IS_NULL(c.deletedAt) OR c.deletedAt = null)';

      const { resources } = await container.items.query(query).fetchAll();
      return resources.map((doc) => EntitySchema.parse(doc));
    } catch (error) {
      throw new DatabaseError('Failed to fetch entities');
    }
  }

  async findById(id: string, includeDeleted = false): Promise<Entity | null> {
    try {
      const container = await this.getContainer();
      const query = includeDeleted
        ? 'SELECT * FROM c WHERE c.id = @id'
        : 'SELECT * FROM c WHERE c.id = @id AND (IS_NULL(c.deletedAt) OR c.deletedAt = null)';

      const { resources } = await container.items
        .query({ query, parameters: [{ name: '@id', value: id }] })
        .fetchAll();

      if (resources.length === 0) return null;
      return EntitySchema.parse(resources[0]);
    } catch (error) {
      throw new DatabaseError(`Failed to fetch entity ${id}`);
    }
  }

  async create(dto: CreateEntityDTO): Promise<Entity> {
    try {
      const validated = CreateEntitySchema.parse(dto);
      const now = new Date().toISOString();
      
      const entity: Entity = {
        id: uuidv4(),
        ...validated,
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
      };

      const container = await this.getContainer();
      await container.items.create(entity);
      
      return entity;
    } catch (error) {
      throw new DatabaseError('Failed to create entity');
    }
  }

  async update(id: string, dto: UpdateEntityDTO): Promise<Entity> {
    try {
      const validated = UpdateEntitySchema.parse(dto);
      const existing = await this.findById(id);
      
      if (!existing) {
        throw new NotFoundError('Entity', id);
      }

      const updated: Entity = {
        ...existing,
        ...validated,
        updatedAt: new Date().toISOString(),
      };

      const container = await this.getContainer();
      await container.item(id, id).replace(updated);
      
      return updated;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to update entity ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const existing = await this.findById(id);
      
      if (!existing) {
        throw new NotFoundError('Entity', id);
      }

      const deleted: Entity = {
        ...existing,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const container = await this.getContainer();
      await container.item(id, id).replace(deleted);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to delete entity ${id}`);
    }
  }
}

// Export singleton getter
export const getEntityRepository = () => EntityRepository.getInstance();
```

### Rules

- ✅ Use Singleton pattern for all repositories
- ✅ Validate all input with Zod schemas
- ✅ Always use try-catch for database operations
- ✅ Throw custom ApiError types (DatabaseError, NotFoundError)
- ✅ Use soft deletes (set `deletedAt` timestamp)
- ✅ Export getter function, not class directly
- ❌ Do NOT include business logic in repositories
- ❌ Do NOT handle authorization in repositories
- ❌ Do NOT call other repositories directly

---

## 3. Controller Layer (Business Logic)

**Location**: `src/lib/controllers/`

**Purpose**: Orchestrate repository calls, enforce business rules and authorization.

### Requirements

- One controller per domain entity
- Validate all input with Zod schemas
- Enforce authorization rules
- Orchestrate multiple repository calls
- Throw custom ApiError exceptions
- Return standardized response objects

### Pattern

```typescript
import { getEntityRepository } from '@/lib/database/repositories/entityRepository';
import { getUserRepository } from '@/lib/database/repositories/userRepository';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '@/lib/errors/ApiError';
import { createSuccessResponse } from '@/lib/middleware/errorHandler';
import type { CreateEntityDTO, UpdateEntityDTO } from '@/lib/models/entity.model';
import { CreateEntitySchema, UpdateEntitySchema } from '@/lib/models/entity.model';

export class EntitiesController {
  /**
   * Get a single entity by ID
   */
  async getEntity(id: string, userId: string, userRole: string) {
    const entityRepo = getEntityRepository();
    const entity = await entityRepo.findById(id);

    if (!entity) {
      throw new NotFoundError('Entity', id);
    }

    // Authorization check
    const canView = 
      userRole === 'admin' || 
      entity.ownerId === userId;

    if (!canView) {
      throw new ForbiddenError('You do not have access to this entity');
    }

    return createSuccessResponse({ entity });
  }

  /**
   * Create a new entity
   */
  async createEntity(dto: CreateEntityDTO, userId: string) {
    // 1. Validate input
    const validated = CreateEntitySchema.parse(dto);

    // 2. Verify user exists
    const userRepo = getUserRepository();
    const user = await userRepo.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User', userId);
    }

    // 3. Create entity
    const entityRepo = getEntityRepository();
    const entity = await entityRepo.create({
      ...validated,
      ownerId: userId,
    });

    // 4. Return success response
    return createSuccessResponse({ entity }, 201);
  }

  /**
   * Update an existing entity
   */
  async updateEntity(
    id: string,
    dto: UpdateEntityDTO,
    userId: string,
    userRole: string
  ) {
    // 1. Validate input
    const validated = UpdateEntitySchema.parse(dto);

    // 2. Verify entity exists
    const entityRepo = getEntityRepository();
    const entity = await entityRepo.findById(id);

    if (!entity) {
      throw new NotFoundError('Entity', id);
    }

    // 3. Authorization check
    const canModify = 
      userRole === 'admin' || 
      entity.ownerId === userId;

    if (!canModify) {
      throw new ForbiddenError('You cannot modify this entity');
    }

    // 4. Update entity
    const updated = await entityRepo.update(id, validated);

    // 5. Return success response
    return createSuccessResponse({ entity: updated });
  }

  /**
   * Delete an entity
   */
  async deleteEntity(id: string, userId: string, userRole: string) {
    // 1. Verify entity exists
    const entityRepo = getEntityRepository();
    const entity = await entityRepo.findById(id);

    if (!entity) {
      throw new NotFoundError('Entity', id);
    }

    // 2. Authorization check
    const canDelete = 
      userRole === 'admin' || 
      entity.ownerId === userId;

    if (!canDelete) {
      throw new ForbiddenError('You cannot delete this entity');
    }

    // 3. Delete entity
    await entityRepo.delete(id);

    // 4. Return success response
    return createSuccessResponse({ message: 'Entity deleted successfully' });
  }
}

// Export singleton getter
let controllerInstance: EntitiesController;
export const getEntitiesController = () => {
  if (!controllerInstance) {
    controllerInstance = new EntitiesController();
  }
  return controllerInstance;
};
```

### Rules

- ✅ Validate ALL input with Zod schemas
- ✅ Check authorization BEFORE any data operations
- ✅ Use repository getter functions (not direct instantiation)
- ✅ Throw ApiError types for all failures
- ✅ Return createSuccessResponse() for all success cases
- ✅ Add JSDoc comments for public methods
- ✅ Export controller via getter function
- ❌ Do NOT perform database operations directly
- ❌ Do NOT use direct fetch() calls
- ❌ Do NOT mix authorization and business logic

---

## 4. API Route Layer (HTTP Endpoints)

**Location**: `src/app/api/`

**Purpose**: Handle HTTP requests, authenticate users, delegate to controllers.

### Requirements

- Use Next.js App Router file-based routing
- Wrap ALL routes with `withErrorHandler()` middleware
- Authenticate with NextAuth `auth()` helper
- Extract parameters from `context.params` (must await)
- Parse request body with `await request.json()`
- Delegate ALL business logic to controllers

### Pattern

```typescript
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { getEntitiesController } from '@/lib/controllers/entities.controller';
import { UnauthorizedError } from '@/lib/errors/ApiError';
import { withErrorHandler } from '@/lib/middleware/errorHandler';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/entities/[id]
 * Get a single entity by ID
 */
export const GET = withErrorHandler(
  async (_request: NextRequest, context: RouteContext) => {
    // 1. Authenticate
    const session = await auth();
    if (!session?.user) {
      throw new UnauthorizedError('Authentication required');
    }

    // 2. Extract parameters (MUST await)
    const { id } = await context.params;

    // 3. Delegate to controller
    const controller = getEntitiesController();
    return await controller.getEntity(id, session.user.id, session.user.role);
  }
);

/**
 * PUT /api/entities/[id]
 * Update an existing entity
 */
export const PUT = withErrorHandler(
  async (request: NextRequest, context: RouteContext) => {
    // 1. Authenticate
    const session = await auth();
    if (!session?.user) {
      throw new UnauthorizedError('Authentication required');
    }

    // 2. Extract parameters and body
    const { id } = await context.params;
    const body = await request.json();

    // 3. Delegate to controller
    const controller = getEntitiesController();
    return await controller.updateEntity(
      id,
      body,
      session.user.id,
      session.user.role
    );
  }
);

/**
 * DELETE /api/entities/[id]
 * Delete an entity (soft delete)
 */
export const DELETE = withErrorHandler(
  async (_request: NextRequest, context: RouteContext) => {
    // 1. Authenticate
    const session = await auth();
    if (!session?.user) {
      throw new UnauthorizedError('Authentication required');
    }

    // 2. Extract parameters
    const { id } = await context.params;

    // 3. Delegate to controller
    const controller = getEntitiesController();
    return await controller.deleteEntity(id, session.user.id, session.user.role);
  }
);
```

### Rules

- ✅ ALWAYS wrap routes with `withErrorHandler()`
- ✅ Authenticate FIRST with `await auth()`
- ✅ MUST `await context.params` before accessing properties
- ✅ Add JSDoc comment for each exported handler
- ✅ Delegate ALL logic to controllers
- ✅ Keep routes thin (authentication + delegation only)
- ❌ Do NOT include business logic in routes
- ❌ Do NOT call repositories directly
- ❌ Do NOT perform authorization checks (use controllers)

---

## 5. HTTP Client Layer (Frontend API Communication)

**Location**: `src/lib/http/`

**Purpose**: Centralized, type-safe HTTP client for all API requests.

### CRITICAL RULE

**Direct `fetch()` calls are STRICTLY FORBIDDEN in application code.**

All API interactions MUST use the centralized HTTP client system.

### Client Hierarchy

1. **UnauthenticatedClient** - Public endpoints (auth, password reset)
2. **ClientAuthenticatedClient** - Authenticated user endpoints
3. **AdminAuthenticatedClient** - Admin-only endpoints

### Adding New API Endpoints

#### Step 1: Define Types in `src/lib/http/types.ts`

```typescript
// Request/Response types
export interface CreateEntityInput {
  name: string;
  description?: string;
}

export interface EntityResponse {
  entity: {
    id: string;
    name: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ListEntitiesResponse {
  entities: EntityResponse['entity'][];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Add to appropriate client interface
export interface ClientAuthenticatedEndpoints {
  // Entities
  getEntity(id: string): Promise<EntityResponse>;
  listEntities(params?: { page?: number; limit?: number }): Promise<ListEntitiesResponse>;
  createEntity(data: CreateEntityInput): Promise<EntityResponse>;
  updateEntity(id: string, data: Partial<CreateEntityInput>): Promise<EntityResponse>;
  deleteEntity(id: string): Promise<{ message: string }>;
}
```

#### Step 2: Implement in Client

```typescript
// src/lib/http/clientAuthenticatedClient.ts
import type {
  CreateEntityInput,
  EntityResponse,
  ListEntitiesResponse,
} from './types';

export class ClientAuthenticatedClient extends UnauthenticatedClient {
  // Entity endpoints
  async getEntity(id: string): Promise<EntityResponse> {
    return this.get<EntityResponse>(`/api/entities/${id}`);
  }

  async listEntities(params?: { page?: number; limit?: number }): Promise<ListEntitiesResponse> {
    return this.get<ListEntitiesResponse>('/api/entities', { params });
  }

  async createEntity(data: CreateEntityInput): Promise<EntityResponse> {
    return this.post<EntityResponse>('/api/entities', data);
  }

  async updateEntity(id: string, data: Partial<CreateEntityInput>): Promise<EntityResponse> {
    return this.put<EntityResponse>(`/api/entities/${id}`, data);
  }

  async deleteEntity(id: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/api/entities/${id}`);
  }
}
```

#### Step 3: Export Types from `src/lib/http/index.ts`

```typescript
export type {
  CreateEntityInput,
  EntityResponse,
  ListEntitiesResponse,
} from './types';
```

#### Step 4: Use in Components

```typescript
import { getClientAuthenticatedClient, HttpError } from '@/lib/http';
import type { CreateEntityInput } from '@/lib/http';

async function handleCreateEntity(data: CreateEntityInput) {
  try {
    const client = getClientAuthenticatedClient();
    const result = await client.createEntity(data);
    
    console.log('Entity created:', result.entity);
  } catch (error) {
    if (error instanceof HttpError) {
      console.error('HTTP Error:', error.status, error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}
```

### Rules

- ✅ ALL API calls MUST use HTTP client (never direct fetch)
- ✅ Define types in `types.ts` before implementation
- ✅ Use appropriate client tier (Unauthenticated/Client/Admin)
- ✅ Export all types from `index.ts`
- ✅ Handle HttpError in components
- ✅ Use TypeScript generics for type safety
- ❌ NEVER use `fetch()` directly in components
- ❌ Do NOT define types inline in client methods
- ❌ Do NOT skip error handling

### Verification

Before committing, verify no direct fetch calls exist:

```bash
# Should only return baseClient.ts
grep -r "fetch(" src/**/*.{ts,tsx}
```

**Any `fetch()` call outside of `src/lib/http/baseClient.ts` is a code violation.**

---

## 6. Error Handling Pattern

**Location**: `src/lib/errors/ApiError.ts`, `src/lib/middleware/errorHandler.ts`

### Custom Error Hierarchy

```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public errorCode: number,
    public errorStringCode: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, id?: string) {
    super(
      `${resource}${id ? ` with id ${id}` : ''} not found`,
      1001,
      `${resource.toLowerCase()}_not_found`,
      404
    );
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 1002, 'validation_error', 400);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized access') {
    super(message, 1004, 'unauthorized', 401);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, 1005, 'forbidden', 403);
  }
}

export class ConflictError extends ApiError {
  constructor(resource: string) {
    super(`${resource} already exists`, 1006, 'resource_conflict', 409);
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string) {
    super(message, 1003, 'database_error', 500);
  }
}
```

### Standardized Error Response

```json
{
  "errorCode": 1001,
  "errorStringCode": "entity_not_found",
  "message": "Entity with id abc-123 not found",
  "details": {}
}
```

### Rules

- ✅ ALWAYS throw custom ApiError types
- ✅ Use specific error classes (NotFoundError, ValidationError, etc.)
- ✅ Include resource name and ID in NotFoundError
- ✅ Use descriptive error messages
- ❌ Do NOT throw generic Error
- ❌ Do NOT use HTTP status codes directly

---

## Summary: The Full Request Flow

```
Client Component (React)
  ↓ Uses HTTP Client
src/lib/http/clientAuthenticatedClient.ts
  ↓ Calls API Route
src/app/api/entities/[id]/route.ts
  ↓ withErrorHandler() wrapper
  ↓ NextAuth authentication
  ↓ Delegates to Controller
src/lib/controllers/entities.controller.ts
  ↓ Validates with Zod schemas
  ↓ Checks authorization
  ↓ Calls Repository
src/lib/database/repositories/entityRepository.ts
  ↓ Validates with Zod schemas
  ↓ Performs database operations
Cosmos DB Container
```

## Quick Reference Checklist

When adding a new API feature:

- [ ] Create Zod schemas in `src/lib/models/`
- [ ] Create repository in `src/lib/database/repositories/`
- [ ] Create controller in `src/lib/controllers/`
- [ ] Create API routes in `src/app/api/`
- [ ] Add types to `src/lib/http/types.ts`
- [ ] Implement methods in appropriate HTTP client
- [ ] Export types from `src/lib/http/index.ts`
- [ ] Test with proper error handling
- [ ] Verify no direct `fetch()` calls exist
