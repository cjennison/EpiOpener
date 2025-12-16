# Testing Instructions

## Testing Philosophy

### Core Principles

1. **Test Behavior, Not Implementation**
   - Focus on what the code does, not how it does it
   - Tests should survive refactoring
   - Avoid testing internal state or private methods

2. **Write Testable Code**
   - Extract business logic from React components into services and utilities
   - Keep components thin - they should orchestrate, not compute
   - Pure functions are easier to test than stateful components
   - Avoid DOM testing when logic testing is sufficient

3. **Pragmatic Coverage**
   - Test core functionality first, edge cases second
   - Not every permutation needs a test initially
   - Add tests when bugs are found to prevent regression
   - 70% coverage threshold is a guide, not a goal

4. **Test Stability**
   - Tests should be resilient to UI changes
   - Avoid testing CSS classes, exact HTML structure, or styling
   - Test user-facing behavior and API contracts
   - Mock external dependencies to prevent flaky tests

## Testing Framework

### Technology Stack

- **Vitest** - Modern test runner with native ESM support
- **React Testing Library** - Component testing focused on user behavior
- **happy-dom** - Lightweight DOM implementation for Node.js
- **@testing-library/user-event** - User interaction simulation

### When to Use Each

#### Unit Tests (Preferred)
Use for pure functions, services, utilities, models, and business logic.

**Good candidates:**
- Services (`AccountEngine`, `pathResolver`, validators)
- Controllers (business logic layer)
- Utility functions (`formatCurrency`, `calculateAge`)
- Models and schemas (Zod validation)
- Hooks (custom hooks with no DOM dependencies)

**Example:**
```typescript
// ✅ GOOD - Pure logic, easy to test
describe('AccountEngine', () => {
  it('should update nested field value', () => {
    const engine = new AccountEngine(mockAccount);
    engine.update('assetCatalog.assets[0].balanceCents', 200000);
    
    expect(engine.get('assetCatalog.assets[0].balanceCents')).toBe(200000);
  });
});
```

#### Integration Tests
Use for testing interactions between services, repositories, and controllers.

**Good candidates:**
- Controller → Repository interactions
- Service → HTTP client interactions
- Multi-step workflows

**Example:**
```typescript
// ✅ GOOD - Tests integration without DOM
describe('AccountsController', () => {
  it('should create account and log audit event', async () => {
    const controller = new AccountsController();
    const account = await controller.createAccount(mockData);
    
    expect(account.id).toBeDefined();
    expect(mockAuditLogger).toHaveBeenCalled();
  });
});
```

#### Component Tests (Use Sparingly)
Only when testing user interactions that can't be extracted to services.

**Good candidates:**
- Form submission flows
- User event handlers
- Accessibility features
- Critical UI workflows

**Avoid testing:**
- CSS classes or styling
- Exact HTML structure
- Implementation details
- Internal component state

**Example:**
```typescript
// ✅ GOOD - Tests user behavior
describe('LoginForm', () => {
  it('should submit credentials when form is valid', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    
    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });
});

// ❌ BAD - Tests implementation details
describe('LoginForm', () => {
  it('should have className "login-form"', () => {
    const { container } = render(<LoginForm />);
    expect(container.firstChild).toHaveClass('login-form'); // Too brittle
  });
});
```

## Code Organization for Testability

### Extract Logic from Components

❌ **Bad - Logic in Component**
```typescript
function AssetList({ assets }: Props) {
  const totalValue = assets.reduce((sum, asset) => {
    const value = asset.balanceCents / 100;
    const taxMultiplier = asset.taxStatus === 'taxable' ? 0.8 : 1.0;
    return sum + (value * taxMultiplier);
  }, 0);
  
  return <div>Total: ${totalValue.toFixed(2)}</div>;
}
```

✅ **Good - Logic in Service**
```typescript
// src/lib/services/assetCalculations.ts
export function calculateTotalValue(assets: Asset[]): number {
  return assets.reduce((sum, asset) => {
    const value = asset.balanceCents / 100;
    const taxMultiplier = asset.taxStatus === 'taxable' ? 0.8 : 1.0;
    return sum + (value * taxMultiplier);
  }, 0);
}

// Component becomes thin
function AssetList({ assets }: Props) {
  const totalValue = calculateTotalValue(assets);
  return <div>Total: ${totalValue.toFixed(2)}</div>;
}

// Easy to test without DOM
describe('calculateTotalValue', () => {
  it('should apply tax multiplier to taxable assets', () => {
    const assets = [
      { balanceCents: 100000, taxStatus: 'taxable' },
      { balanceCents: 50000, taxStatus: 'tax-deferred' },
    ];
    
    expect(calculateTotalValue(assets)).toBe(1300); // (1000 * 0.8) + 500
  });
});
```

### Dependency Injection

✅ **Good - Testable with DI**
```typescript
export class AccountEngine {
  constructor(
    private account: Account,
    private httpClient: HttpClient = getClientAuthenticatedClient()
  ) {}
}

// Test with mock client
const mockClient = { updateAccount: vi.fn() };
const engine = new AccountEngine(mockAccount, mockClient);
```

### Pure Functions Over Side Effects

✅ **Good - Pure and Testable**
```typescript
export function formatAccountName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}
```

❌ **Bad - Side Effects**
```typescript
let accountName = '';

export function setAccountName(firstName: string, lastName: string): void {
  accountName = `${firstName} ${lastName}`.trim(); // Mutates global state
}
```

## Test Structure

### File Organization

```
src/
├── lib/
│   └── services/
│       ├── accountEngine.ts
│       └── accountEngine.test.ts       # Co-located with source
├── components/
│   └── forms/
│       ├── LoginForm.tsx
│       └── LoginForm.test.tsx          # Co-located with component
└── test/
    ├── setup.ts                        # Global test setup
    └── utils.ts                        # Test utilities
```

### Test Naming

Use descriptive names that explain the expected behavior:

✅ **Good**
```typescript
it('should mark account as dirty after field update', () => { ... });
it('should preserve original value when same field updated multiple times', () => { ... });
it('should not sync to API when in sandbox mode', () => { ... });
```

❌ **Bad**
```typescript
it('works', () => { ... });
it('test update', () => { ... });
it('should do the thing', () => { ... });
```

### Arrange-Act-Assert Pattern

```typescript
it('should calculate tax-adjusted portfolio value', () => {
  // Arrange - Set up test data
  const assets = [
    createMockAsset({ balanceCents: 100000, taxStatus: 'taxable' }),
    createMockAsset({ balanceCents: 50000, taxStatus: 'tax-deferred' }),
  ];
  
  // Act - Execute the code under test
  const result = calculatePortfolioValue(assets);
  
  // Assert - Verify the outcome
  expect(result.totalValue).toBe(1300);
  expect(result.taxableValue).toBe(800);
  expect(result.deferredValue).toBe(500);
});
```

## What to Test

### Core Functionality (Priority 1)

Test the main success paths and critical business logic:

- ✅ Account engine state management
- ✅ Data validation (Zod schemas)
- ✅ Business calculations (portfolio value, tax calculations)
- ✅ API interactions (controller methods)
- ✅ Change tracking and changelog
- ✅ Authentication and authorization

### Edge Cases (Priority 2)

Add when bugs are found or during code review:

- ✅ Null/undefined handling
- ✅ Empty arrays and objects
- ✅ Boundary values (min/max)
- ✅ Error conditions

### User Workflows (Priority 3)

Test critical user journeys:

- ✅ Form submission
- ✅ Multi-step wizards
- ✅ Authentication flows

## What NOT to Test

### Implementation Details

❌ **Don't test:**
- Private methods or internal state
- CSS classes or styling
- Exact HTML structure
- Framework internals (React hooks, lifecycle methods)
- Third-party library behavior

### Over-Testing

❌ **Avoid:**
```typescript
// Testing every possible input combination
it('should add 1 + 1', () => expect(add(1, 1)).toBe(2));
it('should add 2 + 2', () => expect(add(2, 2)).toBe(4));
it('should add 3 + 3', () => expect(add(3, 3)).toBe(6));
// ... 100 more tests
```

✅ **Better:**
```typescript
describe('add', () => {
  it('should add positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
  
  it('should handle negative numbers', () => {
    expect(add(-2, 3)).toBe(1);
  });
  
  it('should handle zero', () => {
    expect(add(0, 5)).toBe(5);
  });
});
```

## Mocking Guidelines

### Mock External Dependencies

Always mock HTTP calls, database access, and external services:

```typescript
vi.mock('@/lib/http', () => ({
  getClientAuthenticatedClient: () => ({
    updateAccount: vi.fn().mockResolvedValue({ account: mockAccount }),
  }),
}));
```

### Don't Mock What You're Testing

❌ **Bad**
```typescript
// Testing AccountEngine but mocking its core method
vi.spyOn(engine, 'update').mockImplementation(() => { ... });
```

✅ **Good**
```typescript
// Mock dependencies, test real implementation
vi.mock('@/lib/http');
const engine = new AccountEngine(mockAccount);
engine.update('name', 'Test'); // Real method execution
```

### Use Test Utilities

Create reusable test helpers in `src/test/utils.ts`:

```typescript
export function createMockAccount(overrides?: Partial<Account>): Account {
  return {
    id: 'test-id',
    name: 'Test Account',
    ...overrides,
  };
}
```

## Assertions

### Be Specific

✅ **Good**
```typescript
expect(result.totalValue).toBe(1500.50);
expect(result.assets).toHaveLength(3);
expect(result.isPublished).toBe(true);
```

❌ **Bad**
```typescript
expect(result).toBeTruthy(); // Too vague
expect(result.assets.length > 0).toBe(true); // Use toHaveLength
```

### Test Meaningful Properties

✅ **Good**
```typescript
expect(changelog).toHaveLength(1);
expect(changelog[0]).toMatchObject({
  path: 'name',
  changeType: 'modified',
  oldValue: 'Old Name',
  newValue: 'New Name',
});
```

❌ **Bad**
```typescript
expect(JSON.stringify(changelog)).toContain('name'); // Too fragile
```

## Running Tests

### Development Workflow

```bash
# Watch mode during development
npm run test

# Run specific test file
npm run test accountEngine

# Run with UI for debugging
npm run test:ui
```

### Pre-Commit

```bash
# Run all tests before committing
npm run test:run

# Check coverage
npm run test:coverage
```

### CI/CD Pipeline

Tests must pass before merging. Coverage reports uploaded to track trends.

## Coverage Guidelines

### Target: 70% Overall

Focus coverage on:
- ✅ Services and utilities (aim for 90%+)
- ✅ Controllers (aim for 80%+)
- ✅ Models and validators (aim for 85%+)
- ⚠️ Components (aim for 50%+, test behavior only)
- ❌ App directory (excluded, integration tests separate)

### Coverage is a Tool, Not a Goal

- High coverage doesn't guarantee quality tests
- 100% coverage is not required or recommended
- Focus on testing critical paths and business logic
- Add tests when bugs are found (TDD for fixes)

## Test-Driven Development (TDD)

### When to Use TDD

✅ **Good candidates for TDD:**
- Bug fixes (write failing test first)
- New utility functions
- Business logic changes
- API endpoints

❌ **Skip TDD for:**
- Rapid prototyping
- UI exploration
- Unclear requirements
- One-off scripts

### TDD Process

1. **Write failing test** - Red
2. **Make it pass** - Green
3. **Refactor** - Clean up while tests pass
4. **Repeat**

## Common Pitfalls

### 1. Testing Too Much UI

❌ **Bad**
```typescript
expect(container.querySelector('.header')).toBeInTheDocument();
expect(container.querySelector('.header > h1')).toHaveTextContent('Account');
expect(container.querySelector('.header > h1')).toHaveClass('text-xl');
```

✅ **Good**
```typescript
expect(screen.getByRole('heading', { name: 'Account' })).toBeInTheDocument();
```

### 2. Brittle Selectors

❌ **Bad**
```typescript
container.querySelector('div > div > button:nth-child(2)');
```

✅ **Good**
```typescript
screen.getByRole('button', { name: 'Save Account' });
```

### 3. Testing Implementation

❌ **Bad**
```typescript
expect(component.state.isLoading).toBe(true);
expect(mockFn).toHaveBeenCalledTimes(1);
expect(component.render).toHaveBeenCalled();
```

✅ **Good**
```typescript
expect(screen.getByRole('progressbar')).toBeInTheDocument();
expect(await screen.findByText('Success')).toBeInTheDocument();
```

### 4. Not Cleaning Up

❌ **Bad**
```typescript
describe('MyComponent', () => {
  let mockData;
  
  it('test 1', () => {
    mockData = { value: 1 }; // Mutates shared state
  });
  
  it('test 2', () => {
    // mockData is polluted from test 1
  });
});
```

✅ **Good**
```typescript
describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('test 1', () => {
    const mockData = { value: 1 }; // Local scope
  });
});
```

## Code Review Checklist

When reviewing test code, ensure:

- [ ] Tests are focused and test one thing
- [ ] Test names clearly describe expected behavior
- [ ] Logic is extracted from components where possible
- [ ] Mocks are used for external dependencies only
- [ ] Assertions are specific and meaningful
- [ ] Tests don't rely on implementation details
- [ ] Tests are maintainable and unlikely to break during refactoring
- [ ] Coverage focuses on core functionality first
- [ ] No brittle CSS or HTML structure assertions
