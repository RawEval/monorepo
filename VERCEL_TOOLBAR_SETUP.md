# Vercel Toolbar Integration Guide

This guide explains how the Vercel Toolbar is integrated into all RawEval apps and how to configure it.

## ✅ What's Been Done

The Vercel Toolbar has been integrated into all 4 Next.js apps following the [official Vercel documentation](https://vercel.com/docs/vercel-toolbar/in-production-and-localhost/add-to-production):

- ✅ **Landing App** (`apps/landing`)
- ✅ **Chat App** (`apps/chat`)
- ✅ **Experts App** (`apps/experts`)
- ✅ **Admin App** (`apps/admin`)

### Implementation

Each app has:

1. **`components/staff-toolbar.tsx`** - Client component that renders the Vercel Toolbar
2. **Updated `app/layout.tsx`** - Added `StaffToolbar` component wrapped in Suspense

The toolbar is conditionally rendered and will only show for team members when properly configured in Vercel.

---

## 📦 Installation

### Step 1: Install the Package

```bash
# Install @vercel/toolbar at workspace root
pnpm add -w @vercel/toolbar
```

**Note:** If you encounter pnpm store issues, run:

```bash
pnpm install
```

### Step 2: Verify Installation

Check that the package is in `package.json`:

```json
{
  "dependencies": {
    "@vercel/toolbar": "^x.x.x"
  }
}
```

---

## 🚀 Enabling the Toolbar

### Option 1: Vercel Dashboard (Recommended)

The easiest way to enable the toolbar is through the Vercel dashboard:

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your team from the scope selector
3. Navigate to **Settings** → **General**
4. Find **Vercel Toolbar** section
5. Under **Production** and **Preview**, select **On** from the dropdown
6. Save changes

**For Project-Level Configuration:**

1. Select your specific project (e.g., `monorepo-landing`)
2. Go to **Settings** → **General**
3. Find **Vercel Toolbar** section
4. Enable for **Production** and **Preview**
5. Optionally allow project-level override of team settings

### Option 2: Browser Extension

Team members can also use the Vercel Browser Extension:

1. Install the [Vercel Browser Extension](https://vercel.com/docs/vercel-toolbar/browser-extension)
2. Ensure you're logged in to vercel.com
3. The toolbar will automatically appear on Vercel-hosted sites your team owns
4. Must be enabled in Vercel dashboard first

### Option 3: Visit with Toolbar (One-Time)

From the Vercel dashboard:

1. Go to your project → **Deployments**
2. Click the dropdown on the **Visit** button
3. Select **Visit with Toolbar**
4. This opens the deployment with the toolbar enabled (one-time)

---

## 🔧 How It Works

### Automatic Team Member Detection

The Vercel Toolbar automatically detects team membership when:

1. Enabled in Vercel dashboard (team or project level)
2. User is logged in to their Vercel account
3. User is a member of the team that owns the deployment

**No additional authentication logic is required** - Vercel handles this automatically.

### Conditional Rendering

The `StaffToolbar` component is wrapped in `Suspense` to ensure:

- ✅ No blocking of page rendering
- ✅ Graceful fallback if toolbar fails to load
- ✅ Optimal performance

```tsx
<Suspense fallback={null}>
  <StaffToolbar />
</Suspense>
```

### Preventing Visitor Prompts

The toolbar is configured to:

- ✅ Only show to team members (automatic)
- ✅ Not prompt regular visitors to log in
- ✅ Work seamlessly with Vercel's authentication system

---

## 🎯 Features

Once enabled, team members can:

- **📝 Comment on Production** - Leave comments directly on production deployments
- **🐛 Debug Issues** - Access debugging tools and performance metrics
- **📊 View Analytics** - See deployment analytics and performance data
- **⚡ Quick Actions** - Access quick actions for deployments
- **🔗 Share Links** - Generate shareable links with toolbar enabled

---

## 🔒 Security

The toolbar respects Vercel's security model:

- ✅ Only shows to authenticated team members
- ✅ Respects team and project permissions
- ✅ No authentication prompts for regular visitors
- ✅ Works with Vercel's RBAC system

---

## 🛠️ Advanced Configuration

### Custom Authentication Check

If you want to add additional authentication logic, update the `StaffToolbar` component:

```tsx
// apps/landing/components/staff-toolbar.tsx
'use client';

import { Suspense } from 'react';
import { VercelToolbar } from '@vercel/toolbar/next';
import { useSession } from '@/hooks/use-session'; // Your auth hook

export function StaffToolbar() {
  const session = useSession();

  // Additional check: only show if user is authenticated AND is team member
  if (!session?.isTeamMember) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <VercelToolbar />
    </Suspense>
  );
}
```

### Environment Variable Control

For development testing, you can add environment variable control:

```tsx
export function StaffToolbar() {
  // Only show in development if explicitly enabled
  if (process.env.NODE_ENV === 'development') {
    if (process.env.NEXT_PUBLIC_VERCEL_TOOLBAR_ENABLED !== 'true') {
      return null;
    }
  }

  return (
    <Suspense fallback={null}>
      <VercelToolbar />
    </Suspense>
  );
}
```

---

## 📝 File Structure

```
apps/
├── landing/
│   ├── app/
│   │   └── layout.tsx          # Imports StaffToolbar
│   └── components/
│       └── staff-toolbar.tsx   # Vercel Toolbar component
├── chat/
│   ├── app/
│   │   └── layout.tsx
│   └── components/
│       └── staff-toolbar.tsx
├── experts/
│   ├── app/
│   │   └── layout.tsx
│   └── components/
│       └── staff-toolbar.tsx
└── admin/
    ├── app/
    │   └── layout.tsx
    └── components/
        └── staff-toolbar.tsx
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Package installed: `pnpm list @vercel/toolbar`
- [ ] Toolbar enabled in Vercel dashboard (team or project level)
- [ ] Deployed to Vercel (production or preview)
- [ ] User is logged in to Vercel account
- [ ] User is a team member
- [ ] Browser extension installed (optional but recommended)
- [ ] Toolbar appears on production deployments (for team members)

---

## 🐛 Troubleshooting

### Toolbar Not Showing

**Issue:** Toolbar doesn't appear on production

**Solutions:**

1. ✅ Check Vercel dashboard → Settings → General → Vercel Toolbar is **On**
2. ✅ Verify user is logged in to vercel.com
3. ✅ Confirm user is a team member
4. ✅ Check browser console for errors
5. ✅ Try installing the Vercel Browser Extension
6. ✅ Ensure deployment is recent (older deployments may not support toolbar)

### All Visitors See Toolbar

**Issue:** Regular visitors see login prompts

**Solution:**

- ✅ The toolbar automatically handles this - it only shows for team members
- ✅ If you see this, check Vercel dashboard settings
- ✅ Verify `StaffToolbar` component is not conditionally checking incorrectly

### Toolbar Shows in Development

**Issue:** Toolbar appears in local development

**Solution:**

- ✅ This is expected if Vercel Toolbar is enabled in dashboard
- ✅ Add environment variable check if you want to disable in dev:
  ```tsx
  if (process.env.NODE_ENV === 'development') {
    return null; // Don't show in dev
  }
  ```

---

## 📚 Resources

- [Vercel Toolbar Documentation](https://vercel.com/docs/vercel-toolbar/in-production-and-localhost/add-to-production)
- [Browser Extension Guide](https://vercel.com/docs/vercel-toolbar/browser-extension)
- [Managing Toolbar Settings](https://vercel.com/docs/vercel-toolbar/managing-toolbar)
- [Vercel Toolbar Features](https://vercel.com/docs/vercel-toolbar)

---

## 🎉 Next Steps

1. **Install the package:** `pnpm add -w @vercel/toolbar`
2. **Enable in Vercel dashboard** (team or project level)
3. **Deploy to Vercel**
4. **Test with team member account**
5. **Install browser extension** (optional)

---

**That's it! The Vercel Toolbar is now fully integrated and ready to use!** 🚀
