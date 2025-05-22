# Netlify Deployment Instructions

Follow these steps to deploy the updated PasterBlocks game to your Netlify account:

## 1. Go to Your Netlify Team

1. Navigate to: https://app.netlify.com/teams/creditsonx
2. Sign in if necessary

## 2. Deploy from GitHub

### Option A: If you already have a site connected to your GitHub repo:

1. Go to the site in your Netlify dashboard
2. Go to the "Deploys" tab
3. Click "Trigger deploy" > "Deploy site"

### Option B: To create a new site:

1. Click "Add new site" > "Import an existing project"
2. Choose "GitHub" as your Git provider
3. Select the "creditsonx/pasterblocks" repository
4. Use these build settings:
   - Owner: creditsonx
   - Branch: main (or master, depending on your default branch)
   - Base directory: (leave empty)
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`

## 3. Configure Environment Variables

After deploying, go to Site settings > Environment variables and add:

```
FIREBASE_API_KEY=AIzaSyDfrXxYZ3DP14w9zx-lKBzKp8AQUgKBEoA
FIREBASE_PROJECT_ID=pasterblocks-leaderboard
```

## 4. Wait for Deployment

The deployment should take 1-2 minutes. You'll see a notification when it's complete.

## 5. Verify the Site

1. Once deployed, click the site URL to view your live site
2. Test the leaderboard functionality
3. Make sure it shows "Online Leaderboard" status

## Troubleshooting

If you encounter issues:

1. Check Netlify deploy logs for errors
2. Verify your environment variables are set correctly
3. Make sure GitHub permissions are properly configured

The Firebase integration should work without requiring any additional setup, as the Firebase project is already configured and publicly accessible.
