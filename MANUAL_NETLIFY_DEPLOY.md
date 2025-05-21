# Manual Netlify Deployment Guide

If you're experiencing issues with automatic deployments from GitHub to Netlify, follow these steps to manually deploy the project:

## Option 1: Deploy from Local Build (Recommended)

This option creates the build locally and then uploads just the production files to Netlify:

1. **Build the project locally**:
   ```bash
   bun install
   bun run build
   ```

2. **Upload the `dist` folder to Netlify**:
   - Go to [Netlify](https://app.netlify.com/)
   - Navigate to your site
   - Go to the "Deploys" tab
   - Click "Deploy manually"
   - Drag and drop the `dist` folder from your local project
   - Wait for the upload to complete

3. **Verify the deployment**:
   - Once the upload is complete, Netlify will process the files
   - Click the preview link to ensure your site is working correctly
   - Check that the leaderboard is displaying properly

## Option 2: Configure GitHub Deployment

If you prefer automated deployments from GitHub:

1. **Update `netlify.toml`**:
   - The file should look like this:
   ```toml
   [build]
     command = "npm install && npm run build"
     publish = "dist"
     environment = { NODE_VERSION = "20.18.0" }

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Remove Bun references**:
   - Edit `package.json` to use npm instead of bun:
   ```json
   "scripts": {
     "dev": "vite --host 0.0.0.0",
     "build": "tsc -b && vite build --outDir dist",
     "preview": "vite preview"
   }
   ```

3. **Push changes to GitHub**
   ```bash
   git add .
   git commit -m "Configure for Netlify deployment"
   git push
   ```

4. **Deploy on Netlify**:
   - Go to [Netlify](https://app.netlify.com/)
   - Navigate to your site
   - Go to the "Deploys" tab
   - Trigger a new deploy from GitHub

## Troubleshooting

If you encounter issues with the leaderboard:

1. **Check browser console for errors**:
   - Open browser DevTools (F12)
   - Look for any errors related to Firebase or data loading

2. **Verify placeholder data is configured**:
   - The application is now using placeholder data instead of Firebase
   - This ensures the leaderboard always displays data even without a backend

3. **Clear browser cache**:
   - Sometimes old JavaScript files may be cached
   - Try hard refreshing (Ctrl+F5) or clearing browser cache

4. **Test offline functionality**:
   - The app should work even without an internet connection
   - All functionality is client-side only

For additional assistance, please contact the development team.
