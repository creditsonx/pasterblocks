# PasterBlocks Netlify Deployment Instructions

Your PasterBlocks Solana Tetris game has been deployed to:
- Main URL: https://same-xk9hc6fhmpz-latest.netlify.app
- Version preview URL: http://682d3870b728c97f6c4a7336--same-xk9hc6fhmpz-latest.netlify.app

## Setting Up Environment Variables

To complete the deployment, you need to set up the following environment variables in your Netlify project settings:

1. Go to your Netlify dashboard
2. Select the 'same-xk9hc6fhmpz-latest' site
3. Navigate to "Site Settings" → "Environment variables"
4. Add the following environment variables:

| Variable Name | Value |
|---------------|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_CGNXR5QBWJw8@ep-aged-water-a58jjqdl-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `ADMIN_TOKEN` | `pasterblocks_admin_token_2025` |
| `NODE_ENV` | `production` |

5. Save the environment variables
6. Trigger a new deployment by going to "Deploys" and clicking "Trigger deploy" → "Deploy site"

## Initializing the Database

After setting up the environment variables and redeploying, you need to initialize the database:

```bash
curl -X POST https://same-xk9hc6fhmpz-latest.netlify.app/.netlify/functions/init-db \
  -H "Authorization: Bearer pasterblocks_admin_token_2025" \
  -H "Content-Type: application/json"
```

## Testing the Deployment

1. Visit your Netlify site URL: https://same-xk9hc6fhmpz-latest.netlify.app
2. Connect your Solana wallet
3. Play the Tetris game to generate a score
4. Check that the score appears in the leaderboard
5. Test the admin panel by clicking the "Admin Panel" button and using the admin token

## Troubleshooting

If you encounter any issues:

1. Check Netlify function logs in the Netlify dashboard
2. Verify that environment variables are correctly set
3. Make sure your Neon database is running and accessible
4. Test API endpoints using curl or Postman

For database-specific issues, check the Neon dashboard for connection statistics and logs.
