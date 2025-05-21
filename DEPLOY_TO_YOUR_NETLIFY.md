# Deploying to Your Netlify Account

Follow these steps to deploy the updated project to your Netlify account at https://app.netlify.com/teams/creditsonx/builds:

## 1. Push Changes to GitHub

You'll need to push the latest changes to your GitHub repository:

```bash
git add .
git commit -m "Update branding and tier colors"
git push origin master   # or main, depending on your default branch
```

## 2. Connect to Netlify (if not already connected)

If your GitHub repository is not already connected to Netlify:

1. Go to https://app.netlify.com/teams/creditsonx/builds
2. Click "Add new site" → "Import an existing project"
3. Select "GitHub" as your Git provider
4. Find and select the "creditsonx/pasterblocks" repository
5. Use the following build settings:
   - Build command: `curl -fsSL https://bun.sh/install | bash && ~/.bun/bin/bun install && ~/.bun/bin/bun run build`
   - Publish directory: `dist`
   - Under advanced settings, add these environment variables:
     - `DATABASE_URL`: Your Neon PostgreSQL database URL
     - `ADMIN_TOKEN`: Your admin token for accessing protected routes

## 3. If Already Connected to Netlify

If your GitHub repository is already connected to Netlify:

1. After pushing changes to GitHub, Netlify should automatically detect the new commit and start a new deployment
2. Go to https://app.netlify.com/teams/creditsonx/builds to monitor the build progress
3. Once completed, verify the changes on your live site

## 4. Initialize the Database (if needed)

If you haven't initialized the database yet:

1. Access your site's Netlify functions endpoint:
   ```
   https://[your-netlify-domain]/.netlify/functions/init-db
   ```
2. Add the admin token as a query parameter:
   ```
   https://[your-netlify-domain]/.netlify/functions/init-db?token=[your-admin-token]
   ```

## 5. Testing

1. Visit your deployed site
2. Verify the updated text and tier colors
3. Test the leaderboard functionality

## Important Changes Made

- Updated "Play to earn $PASTERBLOCKS" text to mention "Rewards Distributed Every 24 hours"
- Replaced all "@credits" mentions with "@pasterblocks"
- Updated profile label from "@pasternak" to "@pasterblocks"
- Updated tier colors for leaderboard ranks:
  * Diamond tier (1-5): light blue
  * Platinum tier (6-20): silver
  * Gold tier (21-30): gold
  * Silver tier (31-40): silver
  * Bronze tier (41-50): bronze
