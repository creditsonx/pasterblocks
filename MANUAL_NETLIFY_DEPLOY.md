# Manual Netlify Deployment Instructions

It appears that automatic deployment through Same isn't working correctly. Follow these steps to manually deploy to your Netlify account:

## 1. Download the dist folder

First, you need to download the built files from our current session:

1. In Same, click the folder icon on the left sidebar
2. Navigate to the `dist` folder
3. Right-click on the `dist` folder and select "Download"
4. This will download a zip file containing the built site

## 2. Deploy to Netlify manually

1. Go to your Netlify dashboard: https://app.netlify.com/teams/creditsonx
2. Click "Add new site" > "Deploy manually"
3. Drag and drop the zip file you downloaded
4. Wait for the upload and deployment to complete

## 3. Configure site settings

After deployment:

1. Click on your new site
2. Go to "Site settings" > "Build & deploy" > "Edit settings"
3. Configure the following:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Click "Save"

## 4. Set up environment variables

1. Go to "Site settings" > "Environment variables"
2. Add the following variables:
   ```
   FIREBASE_API_KEY=AIzaSyDfrXxYZ3DP14w9zx-lKBzKp8AQUgKBEoA
   FIREBASE_PROJECT_ID=pasterblocks-leaderboard
   ```
3. Click "Save"

## 5. Set up redirects

1. Create a file named `_redirects` in your site's root directory with the following content:
   ```
   /* /index.html 200
   ```
2. Go to "Site settings" > "Functions" and make sure the Functions directory is set to `netlify/functions`

## 6. Verify the deployment

1. Visit your site URL
2. Test the leaderboard functionality
3. Ensure it shows "Online Leaderboard" status in the top right of the leaderboard

## If you need to update the site in the future

1. Download the updated dist folder
2. Go to your site in Netlify
3. Click "Deploys" > "Drag and drop" to upload your new files

## Current status

The app is now using Firebase Realtime Database for the leaderboard, which means:
- The leaderboard will be permanently online
- All players globally will see the same leaderboard
- No need for database initialization or server maintenance
- Scores are stored securely and persist across sessions
