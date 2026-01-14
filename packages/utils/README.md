# @raweval/utils

Shared utility functions for the RawEval monorepo.

## Usage

```typescript
import { cn, formatDate, isValidEmail } from '@raweval/utils';

// Merge Tailwind classes
const className = cn('px-4', 'py-2', isActive && 'bg-blue-500');

// Format date
const formattedDate = formatDate(new Date());

// Validate email
if (isValidEmail(email)) {
  // ...
}
```

## Available Utilities

### Styling
- `cn()` - Merge Tailwind CSS classes

### Formatting
- `formatDate()` - Format dates
- `formatDateTime()` - Format dates with time
- `formatCurrency()` - Format currency
- `formatNumber()` - Format numbers with commas
- `formatPercentage()` - Format percentages
- `formatBytes()` - Format file sizes
- `formatDuration()` - Format time durations
- `truncate()` - Truncate text
- `pluralize()` - Pluralize words

### Validation
- `isValidEmail()` - Validate email
- `isValidUrl()` - Validate URL
- `isEmpty()` - Check if string is empty
- `isStrongPassword()` - Validate password strength
- `sanitizeHtml()` - Sanitize HTML
