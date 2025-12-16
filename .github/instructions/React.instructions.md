---
applyTo: "**/*.{tsx,jsx}"
---

# React Patterns

## Modern React Standards (2025)

### Mantine Component Framework Integration

- **Always prefer Mantine components** over hand-written implementations
- **Check shared components directory first** for existing Mantine-based components
- **Extend Mantine components** rather than creating UI components from scratch
- **Leverage Mantine's built-in hooks** and utilities for form handling, state management
- **Use Mantine's accessibility features** as the foundation for all UI components

### Component Architecture

- Use functional components exclusively with hooks
- Prefer composition over inheritance
- Implement proper component boundaries and single responsibility
- Use React.memo() for performance optimization when needed
- Leverage React.forwardRef() for ref forwarding
- **Build shared components by extending Mantine base components**

### Hooks Best Practices

- Use custom hooks for reusable stateful logic
- Follow hooks naming convention (`use` prefix)
- Optimize with useMemo() and useCallback() judiciously
- Use useRef() for DOM manipulation and mutable values
- Implement useImperativeHandle() sparingly and with clear justification
- **Leverage Mantine hooks** (useForm, useDisclosure, useHover, etc.) over custom implementations

#### CRITICAL: Mantine useForm in useEffect - Avoiding Infinite Loops

**NEVER include the `form` object from `useForm()` in a `useEffect` dependency array.** This is the primary cause of infinite render loops in Mantine applications.

**Problem:** The `form` object from `useForm()` is stable (internally memoized), but React's exhaustive-deps rule doesn't know this and will warn if you use it in `useEffect` without listing it as a dependency. Including it causes infinite loops because:
1. `useEffect` runs and calls `form.setValues()`
2. This triggers a re-render
3. React sees `form` in dependencies and re-runs the effect
4. Infinite loop ensues

**Solution:** Use `useRef` to track changing values and explicitly disable the exhaustive-deps warning:

```typescript
// ❌ WRONG - Causes infinite loop
const form = useForm({ initialValues: { name: '' } });

useEffect(() => {
  if (opened && initialValues) {
    form.setValues(initialValues);
  }
}, [opened, initialValues, form]); // ⚠️ form causes infinite loop

// ✅ CORRECT - Use ref and controlled dependencies
const form = useForm({ initialValues: { name: '' } });
const initialValuesRef = useRef(initialValues);
initialValuesRef.current = initialValues;

useEffect(() => {
  if (opened && initialValuesRef.current) {
    form.setValues(initialValuesRef.current);
    form.resetDirty(initialValuesRef.current);
  }
  // Only run when modal opens - form is stable from useForm
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [opened]);
```

**Key Pattern Requirements:**
1. Create a ref to track props that change: `const propsRef = useRef(props);`
2. Update ref in render: `propsRef.current = props;`
3. Use ref inside `useEffect`: `form.setValues(propsRef.current);`
4. Only include intentional triggers in deps: `[opened]` for modals
5. Always add comment explaining why: `// form is stable from useForm`
6. Always disable exhaustive-deps: `// eslint-disable-next-line react-hooks/exhaustive-deps`

**When This Pattern Applies:**
- Modals that reset form state on open
- Forms that populate from async data
- Any component using `form.setValues()` or `form.reset()` in `useEffect`

**Verification Checklist:**
- [ ] `form` object is NOT in dependency array
- [ ] Comment explains why deps are controlled
- [ ] `eslint-disable-next-line` is present
- [ ] Props that change are tracked via `useRef`
- [ ] Only intentional triggers (like `opened`) are in deps

### State Management

- Use useState() for local component state
- Leverage useReducer() for complex state logic
- Implement Context API for shared state (avoid prop drilling)
- Use external state management (Zustand, Jotai) for global state
- Prefer server state libraries (TanStack Query, SWR) for API data

### Async Operations & Loading States

**ALWAYS use Mantine's built-in `loading` prop for async button actions.** Never manually show/hide buttons or create custom loaders.

#### Required Pattern for Async Buttons

```typescript
// ✅ CORRECT - Use loading state with Mantine Button
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
    await someAsyncOperation();
    notifications.show({ 
      title: 'Success', 
      message: 'Operation completed',
      color: 'green' 
    });
  } catch (error) {
    notifications.show({ 
      title: 'Error', 
      message: 'Operation failed',
      color: 'red' 
    });
  } finally {
    setIsSubmitting(false);
  }
};

return (
  <Group>
    <Button 
      variant="subtle" 
      onClick={onCancel}
      disabled={isSubmitting}  // Disable cancel during operation
    >
      Cancel
    </Button>
    <Button 
      onClick={handleSubmit}
      loading={isSubmitting}  // Built-in loader replaces button content
    >
      Submit
    </Button>
  </Group>
);
```

#### Key Requirements

1. **Loading State**: Create boolean state for each async operation
2. **Set Loading True**: Before async operation starts
3. **Set Loading False**: In `finally` block (ensures cleanup on error)
4. **Button Loading Prop**: Use `loading={isLoading}` on action button
5. **Disable Other Buttons**: Use `disabled={isLoading}` on cancel/secondary buttons
6. **Never Conditional Render**: Don't hide/show buttons based on loading state

#### Benefits of Mantine's Loading Pattern

✅ **Built-in Spinner**: Automatic loading indicator in button
✅ **Auto-Disable**: Button automatically becomes non-interactive
✅ **Accessibility**: Proper ARIA attributes for screen readers
✅ **Visual Feedback**: User knows operation is in progress
✅ **No Layout Shift**: Button maintains size during loading
✅ **Consistent UX**: Same pattern across entire application

#### Common Use Cases

**Modal Actions:**
```typescript
const [isDeleting, setIsDeleting] = useState(false);

const confirmDelete = async () => {
  setIsDeleting(true);
  try {
    await client.deleteItem(itemId);
    notifications.show({ title: 'Deleted', color: 'green' });
    onClose();
  } catch (error) {
    notifications.show({ title: 'Error', color: 'red' });
  } finally {
    setIsDeleting(false);
  }
};

return (
  <Modal opened={opened} onClose={onClose}>
    <Group justify="flex-end">
      <Button variant="subtle" onClick={onClose} disabled={isDeleting}>
        Cancel
      </Button>
      <Button color="red" onClick={confirmDelete} loading={isDeleting}>
        Delete
      </Button>
    </Group>
  </Modal>
);
```

**Form Submission:**
```typescript
const [isSaving, setIsSaving] = useState(false);

const handleSave = async (values: FormValues) => {
  setIsSaving(true);
  try {
    await client.updateData(values);
    notifications.show({ title: 'Saved', color: 'green' });
  } catch (error) {
    notifications.show({ title: 'Error', color: 'red' });
  } finally {
    setIsSaving(false);
  }
};

return (
  <form onSubmit={form.onSubmit(handleSave)}>
    {/* form fields */}
    <Button type="submit" loading={isSaving}>
      Save Changes
    </Button>
  </form>
);
```

**Action Icons with Confirmation:**
```typescript
const [isResending, setIsResending] = useState(false);

const handleResend = async () => {
  setIsResending(true);
  try {
    await client.resendEmail(emailId);
    notifications.show({ title: 'Email Resent', color: 'green' });
  } catch (error) {
    notifications.show({ title: 'Error', color: 'red' });
  } finally {
    setIsResending(false);
  }
};

return (
  <Modal opened={opened} onClose={onClose}>
    <Group justify="flex-end">
      <Button variant="subtle" onClick={onClose} disabled={isResending}>
        Cancel
      </Button>
      <Button onClick={handleResend} loading={isResending}>
        Resend Email
      </Button>
    </Group>
  </Modal>
);
```

#### Verification Checklist

Before committing any async button implementation:

- [ ] Loading state variable created (`const [isLoading, setIsLoading] = useState(false)`)
- [ ] Loading set to `true` before async operation
- [ ] Loading set to `false` in `finally` block
- [ ] Action button uses `loading={isLoading}` prop
- [ ] Cancel/secondary buttons use `disabled={isLoading}` prop
- [ ] No conditional rendering of buttons based on loading state
- [ ] Success/error notifications shown appropriately

### HTTP Client Architecture (MANDATORY)

**Direct `fetch()` calls are FORBIDDEN in application code.** All API interactions MUST use the centralized HTTP client system.

#### Client Hierarchy

The application uses a three-tier HTTP client architecture located in `src/lib/http/`:

1. **UnauthenticatedClient** - For public endpoints (auth, public data)
2. **ClientAuthenticatedClient** - For authenticated user endpoints (extends Unauthenticated)
3. **AdminAuthenticatedClient** - For admin-only endpoints (extends ClientAuthenticated)

#### Required Usage Pattern

```typescript
// ❌ FORBIDDEN - Direct fetch calls
const response = await fetch('/api/user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

// ✅ CORRECT - Use appropriate HTTP client
import { getClientAuthenticatedClient } from '@/lib/http';

const client = getClientAuthenticatedClient();
const response = await client.createUser(data);
```

#### Client Selection Guide

**Use `UnauthenticatedClient`** for:
- Password reset flows (`forgotPassword`, `resetPassword`)
- Public feature flags
- Health checks
- Any endpoint that doesn't require authentication

```typescript
import { getUnauthenticatedClient } from '@/lib/http';

const client = getUnauthenticatedClient();
await client.forgotPassword({ email });
await client.resetPassword({ token, password });
```

**Use `ClientAuthenticatedClient`** for:
- User profile operations
- Session management
- User-specific data
- Any authenticated but non-admin endpoint

```typescript
import { getClientAuthenticatedClient } from '@/lib/http';

const client = getClientAuthenticatedClient();
await client.getSession();
await client.updateUser(userId, data);
```

**Use `AdminAuthenticatedClient`** for:
- Admin panel operations
- Feature flag management (CRUD)
- Admin-only configuration
- Any admin-restricted endpoint

```typescript
import { getAdminAuthenticatedClient } from '@/lib/http';

const client = getAdminAuthenticatedClient();
await client.getAllFeatureFlags();
await client.createFeatureFlag(data);
await client.deleteFeatureFlag(id);
```

#### Error Handling Pattern

All HTTP clients throw `HttpError` for failed requests. Always handle errors properly:

```typescript
import { HttpError, getUnauthenticatedClient } from '@/lib/http';

try {
  const client = getUnauthenticatedClient();
  const result = await client.forgotPassword({ email });
  
  if (!result.success) {
    setError(result.message);
    return;
  }
  
  setSuccess(true);
} catch (error) {
  if (error instanceof HttpError) {
    // Extract error message from response data
    const errorMessage = (error.data as { error?: string })?.error || 
                        'Request failed';
    setError(errorMessage);
  } else {
    setError('An unexpected error occurred');
  }
}
```

#### Adding New Endpoints

When adding a new API endpoint, follow this process:

1. **Add types to `src/lib/http/types.ts`:**
```typescript
export interface MyNewInput {
  field: string;
}

export interface MyNewResponse {
  success: boolean;
  data?: any;
}

// Add to appropriate interface
export interface ClientAuthenticatedEndpoints {
  // ... existing methods
  myNewMethod(data: MyNewInput): Promise<MyNewResponse>;
}
```

2. **Implement in appropriate client:**
```typescript
// src/lib/http/clientAuthenticatedClient.ts
async myNewMethod(data: MyNewInput): Promise<MyNewResponse> {
  return this.post<MyNewResponse>('/my-endpoint', data);
}
```

3. **Export types from `src/lib/http/index.ts`**

4. **Use in components:**
```typescript
import { getClientAuthenticatedClient } from '@/lib/http';

const client = getClientAuthenticatedClient();
const result = await client.myNewMethod(data);
```

#### Benefits of This Architecture

✅ **Type Safety** - All requests and responses are type-checked
✅ **Single Source of Truth** - API contracts defined in one place
✅ **Consistent Error Handling** - Unified `HttpError` across application
✅ **Centralized Configuration** - Base URLs and headers in one place
✅ **Testability** - Mock clients instead of global fetch
✅ **Developer Experience** - Autocomplete for all API methods
✅ **Maintainability** - Changes to endpoints require single file update

#### Verification

Before committing, verify no direct fetch calls exist:
```bash
# Should only return baseClient.ts
grep -r "fetch(" src/**/*.{ts,tsx}
```

**Any `fetch()` call outside of `src/lib/http/baseClient.ts` is a code violation.**

### Performance Optimization

- Implement code splitting with React.lazy() and Suspense
- Use React.memo() for expensive components
- Optimize re-renders with proper dependency arrays
- Leverage React.startTransition() for non-urgent updates
- Use React.useDeferredValue() for expensive computations

### Image Display Standards

- **Always use ImageViewer for showcase images**: Replace `<img>` tags with `ImageViewer` component for any images meant for user viewing (case studies, portfolio screenshots, etc.)
- **Import from shared components**: `import { ImageViewer } from "@/components/ui/ImageViewer"`
- **Provide meaningful alt text and descriptions**: Use `alt` prop for accessibility and `description` prop for context in enlarged view
- **Use consistent aspect ratios**: Wrap ImageViewer in `aspect-video` containers for uniform display
- **Follow the pattern**: `<div className="aspect-video"><ImageViewer src="..." alt="..." description="..." className="w-full h-full" /></div>`

### Error Handling & Boundaries

- Implement Error Boundaries for graceful error handling
- Use error boundaries at appropriate component tree levels
- Provide fallback UI for error states
- Log errors appropriately for debugging

### Component Patterns

- Use render props pattern for flexible component APIs
- Implement compound components for related UI elements
- Use higher-order components (HOCs) sparingly
- Prefer hooks over HOCs for logic reuse
- Implement controlled vs uncontrolled component patterns appropriately

### Accessibility & Semantics

- Use semantic HTML elements
- Implement proper ARIA attributes
- Ensure keyboard navigation support
- Provide screen reader friendly content
- Test with accessibility tools

### Testing Considerations

- Write components with testability in mind
- Use data-testid attributes for test queries
- Separate business logic into testable hooks
- Mock external dependencies appropriately

### Examples

```tsx
// Extending Mantine components for shared use
import { Button, ButtonProps } from "@mantine/core";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SharedButtonProps extends ButtonProps {
  variant?: "primary" | "secondary" | "danger";
}

export const SharedButton = forwardRef<HTMLButtonElement, SharedButtonProps>(
  ({ variant = "primary", className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        color={variant === "primary" ? "blue" : variant === "secondary" ? "gray" : "red"}
        className={cn(className)}
        {...props}
      />
    );
  }
);

// Using Mantine form hooks
import { useForm } from "@mantine/form";
import { TextInput, Button, Group } from "@mantine/core";

function UserForm() {
  const form = useForm({
    initialValues: {
      name: "",
      email: "",
    },
    validate: {
      name: (value) => (value.length < 2 ? "Name too short" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  return (
    <form onSubmit={form.onSubmit(console.log)}>
      <TextInput
        label="Name"
        placeholder="Your name"
        {...form.getInputProps("name")}
      />
      <TextInput
        label="Email"
        placeholder="your@email.com"
        {...form.getInputProps("email")}
      />
      <Group justify="flex-end" mt="md">
        <Button type="submit">Submit</Button>
      </Group>
    </form>
  );
}

// Custom hook for API data with Mantine notifications
import { notifications } from "@mantine/notifications";

function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch((err) => {
        setError(err.message);
        notifications.show({
          title: "Error",
          message: "Failed to load user data",
          color: "red",
        });
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading, error };
}

// Optimized component with memo using Mantine theming
const UserCard = React.memo<{ user: User; onClick: (id: string) => void }>(
  ({ user, onClick }) => {
    const handleClick = useCallback(() => {
      onClick(user.id);
    }, [onClick, user.id]);

    return (
      <Card
        bg="var(--mantine-color-body)"
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={handleClick}
      >
        <Title order={4} c="var(--mantine-color-text)">{user.name}</Title>
        <Text c="dimmed">{user.email}</Text>
      </Card>
    );
  }
);

// Error boundary component
class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback: React.ComponentType<{ error: Error }>;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <this.props.fallback error={this.state.error!} />;
    }
    return this.props.children;
  }
}

// ImageViewer component usage for showcase images
import { ImageViewer } from "@/components/ui/ImageViewer";

function CaseStudyImages() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="aspect-video">
        <ImageViewer
          src="/images/portfolio-case-study-1.png"
          alt="Portfolio homepage layout and navigation implementation"
          description="Initial homepage layout with hero section, navigation, and responsive design implementation"
          className="w-full h-full rounded-lg border border-gray-200"
          fit="cover"
        />
      </div>
      <div className="aspect-video">
        <ImageViewer
          src="/images/portfolio-case-study-2.png"
          alt="Services section and component architecture"
          description="Services section with case study integration and modern component architecture"
          className="w-full h-full rounded-lg border border-gray-200"
          fit="cover"
        />
      </div>
    </div>
  );
}
```
