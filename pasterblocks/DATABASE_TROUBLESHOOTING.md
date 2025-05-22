# Database Connection Troubleshooting Guide

This guide will help you diagnose and fix issues with the online leaderboard in PasterBlocks.

## Symptoms

If your leaderboard shows "Using Local Data" instead of "Online Leaderboard", the application is failing to connect to the database. This means scores will only be saved locally on each device and not shared.

## Diagnostic Tools

We've added several diagnostic tools to help identify the issue:

### 1. Debug Database Connection

Access this endpoint to check if your database connection is working:

```
https://[your-netlify-domain]/.netlify/functions/debug-db?token=[your-admin-token]
```

This will show:
- If environment variables are set correctly
- If the database connection is working
- What tables exist and how many rows they contain

### 2. API Test

Access this endpoint to test if the API is accessible:

```
https://[your-netlify-domain]/.netlify/functions/api-test?token=[your-admin-token]
```

This will show:
- If API endpoints are accessible
- Test results from calling the leaderboard API
- Troubleshooting information for CORS issues

## Common Issues and Solutions

### 1. Environment Variables Not Set

**Problem:** The `DATABASE_URL` environment variable is missing in Netlify.

**Solution:**
1. Go to https://app.netlify.com/teams/creditsonx/builds
2. Select your site
3. Go to "Site settings" → "Environment variables"
4. Add or update the `DATABASE_URL` with your Neon PostgreSQL connection string
5. Add or update the `ADMIN_TOKEN` with a secure token for admin functions

### 2. Database Not Initialized

**Problem:** The database tables don't exist yet.

**Solution:**
1. After setting environment variables, visit:
   ```
   https://[your-netlify-domain]/.netlify/functions/init-db?token=[your-admin-token]
   ```
2. This should create the necessary tables

### 3. Incorrect Database URL

**Problem:** The database URL may be incorrect or the database is not accessible.

**Solution:**
1. Check your Neon database dashboard to ensure it's active
2. Check that the database URL format is correct:
   ```
   postgres://username:password@endpoint:port/database
   ```
3. Make sure you're using the correct connection string from Neon

### 4. Redirect Issues

**Problem:** API redirects aren't working correctly.

**Solution:**
1. Check your `netlify.toml` file to ensure it has these redirects:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   ```
2. Redeploy your site after making changes

## Step-by-Step Troubleshooting

1. **Verify environment variables are set**
   - Use the debug-db endpoint to check DATABASE_URL

2. **Initialize the database**
   - Use the init-db endpoint if tables don't exist

3. **Test API endpoints directly**
   - Use the api-test endpoint to verify API access

4. **Check browser console logs**
   - Open browser developer tools to see detailed error messages
   - Added enhanced logging will show API connection errors

5. **Restart your application**
   - Rebuild and redeploy your application to Netlify after making changes

## Need More Help?

If you're still experiencing issues after following these steps, gather the output from:
- debug-db endpoint
- api-test endpoint
- Browser console logs

These logs will help diagnose more complex issues with your setup.
