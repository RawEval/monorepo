# Vercel CLI Troubleshooting

## Issue: "No projects found"

This usually means you're logged into the wrong account/team scope.

## Solution

### Step 1: Check Current Login

```bash
npx vercel whoami
```

This shows which account you're logged into.

### Step 2: List All Teams/Scopes

```bash
npx vercel teams list
```

This shows all teams/accounts you have access to.

### Step 3: Switch to Correct Team/Account

If your projects are under a different team:

```bash
# List teams to see available options
npx vercel teams list

# Switch to the correct team (replace TEAM_NAME with actual team name)
npx vercel switch TEAM_NAME

# Or if it's your personal account
npx vercel switch YOUR_USERNAME
```

### Step 4: Verify Projects

After switching, list projects again:

```bash
npx vercel projects list
```

## Alternative: Check Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Check the top-right corner - which account/team are you logged into?
3. Look at the URL - it might show the team name
4. If you see projects in the dashboard but not in CLI, you're in the wrong scope

## Common Scenarios

### Scenario 1: Projects are under a team, but you're on personal account
```bash
# List teams
npx vercel teams list

# Switch to team
npx vercel switch rawevals-projects  # or whatever your team name is
```

### Scenario 2: Projects are under personal account, but you're on a team
```bash
# Switch to personal account
npx vercel switch YOUR_USERNAME
```

### Scenario 3: Need to login again
```bash
npx vercel logout
npx vercel login
```

## Finding Your Projects

If you can see projects in Vercel Dashboard but not in CLI:

1. Check the team/account name in the dashboard URL
2. Use that name with `vercel switch`
3. Or check project settings in dashboard to see which team they belong to

## Quick Fix Commands

```bash
# Check current account
npx vercel whoami

# List all teams
npx vercel teams list

# Switch to team (if needed)
npx vercel switch TEAM_NAME

# List projects again
npx vercel projects list

# If still not found, logout and login again
npx vercel logout
npx vercel login
```
