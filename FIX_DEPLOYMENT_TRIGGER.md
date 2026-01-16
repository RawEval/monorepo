# 🚨 Fix: Deployments Not Triggering on Push

## Quick Fix (Most Common Issue)

**90% of the time, Auto-deploy is disabled or Root Directory doesn't match.**

## Step-by-Step Fix

### For Landing Project

1. **Go to Git Settings:**
   https://vercel.com/rawevals-projects/monorepo-landing/settings/git

2. **Verify/Update:**
   - ✅ Repository: `RawEval/monorepo`
   - ✅ Production Branch: `main`
   - ✅ Root Directory: `apps/landing` ⚠️ **MUST MATCH**
   - ✅ **Auto-deploy: ENABLED** ⚠️ **CRITICAL - Check this first!**

3. **Go to General Settings:**
   https://vercel.com/rawevals-projects/monorepo-landing/settings/general

4. **Verify Root Directory matches:**
   - Root Directory: `apps/landing` ⚠️ **Must be same as Git Root Directory**

5. **Click "Save" at the bottom**

### For Chat Project

1. **Go to Git Settings:**
   https://vercel.com/rawevals-projects/monorepo-chat/settings/git

2. **Verify/Update:**
   - ✅ Repository: `RawEval/monorepo`
   - ✅ Production Branch: `main`
   - ✅ Root Directory: `apps/chat` ⚠️ **MUST MATCH**
   - ✅ **Auto-deploy: ENABLED** ⚠️ **CRITICAL - Check this first!**

3. **Go to General Settings:**
   https://vercel.com/rawevals-projects/monorepo-chat/settings/general

4. **Verify Root Directory matches:**
   - Root Directory: `apps/chat` ⚠️ **Must be same as Git Root Directory**

5. **Click "Save" at the bottom**

## Common Issues

### Issue 1: Auto-deploy is OFF
**Fix:** Enable it in Settings → Git → Auto-deploy toggle

### Issue 2: Root Directory Mismatch
**Symptom:** General shows `apps/landing` but Git shows empty or different
**Fix:** 
- Set both to `apps/landing` (or `apps/chat`)
- They MUST be identical
- Save both pages

### Issue 3: Git Not Connected
**Fix:**
- Go to Settings → Git
- Click "Connect Git Repository"
- Select `RawEval/monorepo`
- Set branch: `main`
- Set Root Directory: `apps/landing` or `apps/chat`
- Enable Auto-deploy
- Save

### Issue 4: Wrong Production Branch
**Fix:**
- Settings → Git → Production Branch
- Should be `main`
- If different, change it

## Test After Fixing

1. Make a test commit:
   ```bash
   git commit --allow-empty -m "Test: Verify auto-deploy works"
   git push origin main
   ```

2. Check Vercel Dashboard → Deployments
   - Should see 2 new deployments within 30 seconds
   - One for `monorepo-landing`
   - One for `monorepo-chat`

3. If deployments appear:
   - ✅ Fixed! Auto-deploy is working
   - Monitor build logs to ensure builds succeed

4. If deployments still don't appear:
   - Check webhook status in Settings → Git
   - Try disconnecting and reconnecting Git
   - Check GitHub repository settings for webhooks

## Verification Checklist

For **each project**, verify:

- [ ] Git Settings → Repository: `RawEval/monorepo`
- [ ] Git Settings → Production Branch: `main`
- [ ] Git Settings → Root Directory: `apps/landing` (or `apps/chat`)
- [ ] Git Settings → **Auto-deploy: ENABLED** ⚠️
- [ ] General Settings → Root Directory: `apps/landing` (or `apps/chat`)
- [ ] General Settings → Root Directory **matches** Git Root Directory
- [ ] Both settings pages saved

## Quick Links

**Landing Project:**
- Git Settings: https://vercel.com/rawevals-projects/monorepo-landing/settings/git
- General Settings: https://vercel.com/rawevals-projects/monorepo-landing/settings/general

**Chat Project:**
- Git Settings: https://vercel.com/rawevals-projects/monorepo-chat/settings/git
- General Settings: https://vercel.com/rawevals-projects/monorepo-chat/settings/general

---

**After fixing, push a test commit and deployments should trigger automatically!**
