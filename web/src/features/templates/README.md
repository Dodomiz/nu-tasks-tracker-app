# Task Template Feature - Frontend Implementation

## Overview

This implementation covers **Epic E1: Template Discovery & Selection** and **Epic E3: Admin Template Management** from the Task Library work plan. It provides users with the ability to browse, search, filter, select, create, edit, and delete task templates.

## Implemented User Stories

### Epic E1: Template Discovery & Selection

### ✅ US-001: View Available Templates
- RTK Query API integration (`templateApi.ts`)
- Combined list of system + group templates
- Clear visual distinction between template types
- Type-safe TypeScript interfaces

### ✅ US-002: Search and Filter Templates
- Real-time search by name and description
- Category dropdown filter
- Difficulty range filter (1-10)
- Combined filters with AND logic
- Clear filters functionality
- Results count display

### ✅ US-003: Template Selection in Task Form
- `TemplatePicker` component with selection state
- Pre-fill form fields from template
- Editable pre-filled values
- Template indicator showing source
- Clear selection option

### ✅ US-004: Template Preview Modal
- Detailed template information display
- "Use This Template" action
- Keyboard accessible (ESC to close)
- Focus trap for accessibility
- Responsive design

### Epic E3: Admin Template Management

### ✅ US-010: Create Custom Template Form
- TemplateForm component with create/edit modes
- Form validation using react-hook-form
- Category dropdown integration
- Difficulty slider (1-10)
- Frequency selector
- System template read-only protection

### ✅ US-011: Edit Group Template
- Edit mode for group-specific templates
- Pre-filled form with existing values
- System templates show read-only warning
- Update mutation with optimistic updates

### ✅ US-012: Delete Group Template
- Delete confirmation modal
- Soft delete implementation
- System templates cannot be deleted
- Clear user feedback

### ✅ US-013: Template Management Page
- Dedicated admin page at `/groups/:groupId/templates`
- Separate sections for system and custom templates
- Search and filter controls
- Template count display
- Create/Edit/Delete actions
- Mobile-responsive design

## File Structure

```
web/src/
├── types/
│   └── template.ts                           # TypeScript interfaces for templates
├── features/
│   └── templates/
│       ├── index.ts                          # Feature exports
│       ├── api/
│       │   └── templateApi.ts                # RTK Query endpoints
│       ├── components/
│       │   ├── TemplatePicker.tsx            # Template selection with filters
│       │   ├── TemplatePreviewModal.tsx      # Preview modal
│       │   ├── TemplateForm.tsx              # Create/Edit form (Epic E3)
│       │   └── DeleteTemplateModal.tsx       # Delete confirmation (Epic E3)
│       └── pages/
│           └── TemplateManagement.tsx        # Admin management page (Epic E3)
```

## Components

### TemplatePicker

Displays a list of templates with search and filter capabilities.

**Props:**
- `templates: TaskTemplate[]` - Array of templates to display
- `onSelect: (template: TaskTemplate) => void` - Callback when template selected
- `selectedTemplateId?: string` - Currently selected template ID
- `categories?: Array<{ id: string; name: string }>` - Categories for filtering
- `showFilters?: boolean` - Show/hide filter controls (default: true)

**Features:**
- Client-side filtering (no server round-trips)
- Debounced search (300ms)
- Difficulty range slider
- Category grouping
- System vs. custom template badges
- Responsive design (mobile/desktop)

**Example Usage:**
```tsx
import { TemplatePicker } from '@/features/templates';

function MyComponent() {
  const { data: templates } = useGetTemplatesQuery({ groupId });
  const [selected, setSelected] = useState<TaskTemplate | null>(null);

  return (
    <TemplatePicker
      templates={templates}
      onSelect={setSelected}
      selectedTemplateId={selected?.id}
      categories={categories}
    />
  );
}
```

### TemplatePreviewModal

Modal for previewing template details before selection.

**Props:**
- `template: TaskTemplate | null` - Template to preview
- `isOpen: boolean` - Modal visibility state
- `onClose: () => void` - Callback when modal closes
- `onUseTemplate: (template: TaskTemplate) => void` - Callback when "Use Template" clicked
- `categoryName?: string` - Category name for display

**Features:**
- Keyboard navigation (ESC to close, Tab trap)
- Backdrop click to close
- Accessibility attributes (ARIA)
- Difficulty visualization (dots)
- Responsive layout

**Example Usage:**
```tsx
import { TemplatePreviewModal } from '@/features/templates';

function MyComponent() {
  const [previewTemplate, setPreviewTemplate] = useState<TaskTemplate | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TemplatePreviewModal
      template={previewTemplate}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onUseTemplate={(template) => {
        // Handle template selection
        setIsOpen(false);
      }}
      categoryName="Household"
    />
  );
}
```

### TemplateForm (Epic E3)

Form component for creating or editing templates with validation.

**Props:**
- `groupId: string` - Group ID for category lookup
- `template?: TaskTemplate` - Template to edit (omit for create mode)
- `onSubmit: (data: CreateTemplateRequest | UpdateTemplateRequest) => Promise<void>` - Form submission handler
- `onCancel: () => void` - Cancel callback
- `isSubmitting?: boolean` - Loading state
- `mode?: 'create' | 'edit'` - Form mode (default: 'create')

**Features:**
- React Hook Form validation
- Category dropdown with loading state
- Difficulty slider (1-10) with visual feedback
- Duration input (minutes)
- Frequency selector
- System template read-only protection
- Mobile-responsive layout

### DeleteTemplateModal (Epic E3)

Confirmation modal for template deletion.

**Props:**
- `template: TaskTemplate` - Template to delete
- `isOpen: boolean` - Modal visibility state
- `isDeleting: boolean` - Delete operation loading state
- `onConfirm: () => void` - Confirm deletion callback
- `onCancel: () => void` - Cancel callback

**Features:**
- Keyboard navigation (ESC to close)
- Focus trap for accessibility
- Clear warning message
- Loading state during deletion
- ARIA attributes for screen readers

### TemplateManagement Page (Epic E3)

Admin page for managing templates at `/groups/:groupId/templates`.

**Features:**
- View system and custom templates separately
- Search by name
- Filter by category and difficulty
- Create new custom templates
- Edit group templates (system templates read-only)
- Delete group templates with confirmation
- Template count display
- Empty state handling
- Mobile-responsive grid/list layout
- Optimistic UI updates

**Route Protection:**
- Requires authentication
- Admin role recommended (enforce in backend)

## API Integration

### RTK Query Hooks

```tsx
import {
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
} from '@/features/templates';

// Get all templates for a group
const { data: templates, isLoading } = useGetTemplatesQuery({
  groupId: '123',
  categoryId: 'abc', // optional
  difficultyMin: 3,  // optional
  difficultyMax: 7,  // optional
});

// Get single template
const { data: template } = useGetTemplateQuery({
  groupId: '123',
  id: 'template-id',
});

// Create group template (admin only)
const [createTemplate] = useCreateTemplateMutation();
await createTemplate({
  groupId: '123',
  name: 'Code Review',
  difficultyLevel: 5,
  defaultFrequency: 'Daily',
});

// Update template (admin only)
const [updateTemplate] = useUpdateTemplateMutation();
await updateTemplate({
  groupId: '123',
  id: 'template-id',
  name: 'Updated Name',
  difficultyLevel: 6,
});

// Delete template (admin only, soft delete)
const [deleteTemplate] = useDeleteTemplateMutation();
await deleteTemplate({ groupId: '123', id: 'template-id' });
```

### Caching Strategy

- **Cache duration:** 10 minutes (600 seconds)
- **Invalidation:** Create/Update/Delete operations invalidate template list
- **Tags:** Each template has individual tag + LIST tag for collection

## TypeScript Types

### TaskTemplate

```typescript
interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  difficultyLevel: number; // 1-10
  estimatedDurationMinutes?: number;
  defaultFrequency: TaskFrequency;
  isSystemTemplate: boolean;
  groupId?: string; // null if isSystemTemplate=true
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
  isDeleted: boolean;
}
```

### TaskFrequency

```typescript
type TaskFrequency = 
  | 'OneTime'
  | 'Daily'
  | 'Weekly'
  | 'BiWeekly'
  | 'Monthly'
  | 'Quarterly'
  | 'Yearly';
```

## Integration with Existing TaskForm

When the actual TaskForm component is created, integrate templates as follows:

```tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useGetTemplatesQuery } from '@/features/templates';
import { TemplatePicker } from '@/features/templates';

function TaskForm({ groupId, onSubmit }) {
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  const { data: templates } = useGetTemplatesQuery({ groupId });
  const { register, setValue, watch, handleSubmit } = useForm();

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    
    // Pre-fill form using React Hook Form's setValue
    setValue('name', template.name);
    setValue('description', template.description || '');
    setValue('categoryId', template.categoryId || '');
    setValue('difficultyLevel', template.difficultyLevel);
    setValue('frequency', template.defaultFrequency);
    setValue('estimatedDurationMinutes', template.estimatedDurationMinutes);
  };

  const onFormSubmit = (data) => {
    onSubmit({
      ...data,
      templateId: selectedTemplate?.id, // Include for backend
      templateName: selectedTemplate?.name, // Include for audit trail
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      {/* Toggle */}
      <label>
        <input
          type="checkbox"
          checked={useTemplate}
          onChange={(e) => setUseTemplate(e.target.checked)}
        />
        Create from Template
      </label>

      {/* Template Picker */}
      {useTemplate && (
        <TemplatePicker
          templates={templates}
          onSelect={handleTemplateSelect}
          selectedTemplateId={selectedTemplate?.id}
        />
      )}

      {/* Rest of form fields with React Hook Form... */}
    </form>
  );
}
```

## Styling

Uses **Tailwind CSS** with the following design tokens:

- **Primary:** `blue-600`, `blue-700` (buttons, selected states)
- **Gray scale:** `gray-50` to `gray-900` (backgrounds, text, borders)
- **Semantic colors:**
  - Blue: Selected states, info
  - Green: Frequency badges
  - Purple: Duration badges
  - Gray: System template badges

## Accessibility

- ✅ Keyboard navigation (Tab, Shift+Tab, ESC)
- ✅ ARIA attributes (`role`, `aria-labelledby`, `aria-describedby`)
- ✅ Focus trap in modals
- ✅ Screen reader friendly labels
- ✅ Color contrast compliance

## Performance

- ✅ Client-side filtering (no API calls for search/filter)
- ✅ Debounced search input (300ms)
- ✅ `useMemo` for filtered results
- ✅ RTK Query caching (10 minutes)
- ✅ Optimistic updates for mutations

## Testing TODO

- [ ] Unit tests for TemplatePicker (Vitest + React Testing Library)
- [ ] Unit tests for TemplatePreviewModal
- [ ] Integration tests for templateApi (MSW mocks)
- [ ] Accessibility tests (jest-axe)
- [ ] Visual regression tests (Chromatic/Percy)

## Next Steps

### Sprint 2: Backend Implementation
- Create TaskTemplate domain model
- Implement TemplateRepository
- Create TemplateService with validation
- Build Template API endpoints
- Extend Task creation with templateId

### Sprint 3: Admin Management
- Template management page
- Create/Edit/Delete custom templates
- Template list with system/custom distinction
- Comprehensive test coverage

## Known Limitations

- **Mock data required:** Backend API not yet implemented (Sprint 2)
- **No TaskForm yet:** Integration example provided, actual TaskForm TBD
- **No i18n:** English only, Hebrew translation in Phase 2
- **No pagination:** Loads all templates (acceptable for MVP with <500 templates)

## Support

For questions or issues, refer to:
- [Design Document](../../../docs/design-task-library.md)
- [Work Plan](../../../docs/workplan-task-library.md)
- [PRD](../../../docs/prd.md#fr-004-task-library)
