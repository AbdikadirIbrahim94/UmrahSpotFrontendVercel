# Vercel Deployment Guide

This project is configured to deploy on Vercel as a serverless Express.js application.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional): `npm i -g vercel`
3. **Database**: Your PostgreSQL database must be accessible from the internet (not localhost)

## Configuration Files Created

- `vercel.json` - Vercel configuration
- `api/index.ts` - Serverless function entry point

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Add Vercel deployment configuration"
   git push
   ```

2. **Import Project on Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Vercel will auto-detect the configuration

3. **Set Environment Variables**
   In Vercel dashboard, go to Settings → Environment Variables and add:
   ```
   DATABASE_HOST=your-database-host
   DATABASE_PORT=5432
   DATABASE_USERNAME=your-username
   DATABASE_PASSWORD=your-password
   DATABASE_NAME=your-database-name
   DATABASE_TYPE=postgres
   DATABASE_SSL_ENABLED=true
   DATABASE_REJECT_UNAUTHORIZED=false
   DATABASE_SYNCHRONIZE=false
   DATABASE_LOG=false
   DATABASE_MAX_CONNECTIONS=10
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Option 2: Deploy via CLI

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_HOST
   vercel env add DATABASE_PORT
   vercel env add DATABASE_USERNAME
   vercel env add DATABASE_PASSWORD
   vercel env add DATABASE_NAME
   # ... add all other environment variables
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Important Notes

### Database Connection Pooling

Vercel uses serverless functions, which means:
- Each function invocation is isolated
- Database connections should be pooled properly
- The current setup uses lazy initialization (connects on first request)
- Consider using a connection pooler like PgBouncer for better performance

### Static Files

- Static files in `src/public/` are served via Express static middleware
- For better performance, consider using Vercel's static file serving
- Upload files should be stored in cloud storage (S3, Cloudinary, etc.) instead of local filesystem

### File Uploads

⚠️ **Important**: Vercel's serverless functions have a read-only filesystem. You cannot write files to the local filesystem.

**Solutions:**
1. Use cloud storage (AWS S3, Cloudinary, etc.)
2. Store file metadata in database
3. Use Vercel Blob Storage

### Path Adjustments

- All routes will be accessible at your Vercel domain
- The `/api` prefix is handled automatically by Vercel
- Ensure your frontend uses the correct API URLs

### Build Configuration

The `vercel.json` file routes all requests to `/api/index.ts`, which exports your Express app.

## Troubleshooting

### Database Connection Issues

1. Ensure your database is accessible from the internet
2. Whitelist Vercel IPs (if needed)
3. Use SSL connections (set `DATABASE_SSL_ENABLED=true`)
4. Check connection pool settings

### Static Files Not Loading

1. Verify file paths in `api/index.ts`
2. Check that files are committed to git (not in `.gitignore`)
3. Consider using CDN for static assets

### Build Errors

1. Check TypeScript compilation: `npm run build`
2. Verify all dependencies are in `package.json`
3. Check Vercel build logs in dashboard

## Local Testing

To test the serverless function locally:

```bash
# Install Vercel CLI
npm i -g vercel

# Run local dev server
vercel dev
```

This will simulate the Vercel serverless environment locally.

## Migration

Before deploying, run migrations:

```bash
# Set environment variables
export DATABASE_HOST=...
# ... other vars

# Run migrations
npm run migration:run
```

Or use Vercel's build command to run migrations during deployment.

## Support

For issues specific to:
- **Vercel**: Check [Vercel Documentation](https://vercel.com/docs)
- **TypeORM**: Check [TypeORM Documentation](https://typeorm.io/)
- **Express on Vercel**: Check [Vercel Express Guide](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js#using-express)

