#!/usr/bin/env ts-node
/**
 * Google Cloud Storage Setup Script
 * 
 * Run this script to configure the GCS bucket for WeCcelerate:
 * - Create bucket (if not exists)
 * - Set CORS configuration
 * - Set lifecycle rules
 * - Create folder structure
 * 
 * Usage:
 *   npx ts-node scripts/setup-gcs.ts
 * 
 * Prerequisites:
 *   - GCS service account JSON key file
 *   - Environment variables configured
 */

import { Storage } from '@google-cloud/storage';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  projectId: process.env.GCS_PROJECT_ID || 'weccelerate-platform',
  keyFilename: process.env.GCS_KEY_FILE || './gcs-service-account.json',
  bucketName: process.env.GCS_BUCKET_NAME || 'weccelerate-assets',
  location: 'ME-WEST1', // Tel Aviv region
};

const FOLDERS = [
  'vault/',
  'vault/documents/',
  'vault/presentations/',
  'vault/financials/',
  'media/',
  'media/images/',
  'media/videos/',
  'media/thumbnails/',
  'events/',
  'events/images/',
  'avatars/',
  'temp/',
];

// =============================================================================
// SETUP FUNCTIONS
// =============================================================================

async function main() {
  console.log('🚀 WeCcelerate GCS Setup Script\n');
  console.log(`Project: ${CONFIG.projectId}`);
  console.log(`Bucket: ${CONFIG.bucketName}`);
  console.log(`Location: ${CONFIG.location}\n`);

  // Initialize storage client
  const storage = new Storage({
    projectId: CONFIG.projectId,
    keyFilename: CONFIG.keyFilename,
  });

  // 1. Create or get bucket
  console.log('1️⃣  Checking bucket...');
  let bucket;
  try {
    [bucket] = await storage.bucket(CONFIG.bucketName).get();
    console.log(`   ✅ Bucket exists: ${CONFIG.bucketName}`);
  } catch (error: any) {
    if (error.code === 404) {
      console.log(`   📦 Creating bucket: ${CONFIG.bucketName}`);
      [bucket] = await storage.createBucket(CONFIG.bucketName, {
        location: CONFIG.location,
        storageClass: 'STANDARD',
        uniformBucketLevelAccess: {
          enabled: true,
        },
      });
      console.log(`   ✅ Bucket created: ${CONFIG.bucketName}`);
    } else {
      throw error;
    }
  }

  // 2. Configure CORS
  console.log('\n2️⃣  Configuring CORS...');
  await bucket.setCorsConfiguration([
    {
      maxAgeSeconds: 3600,
      method: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS'],
      origin: [
        'https://weccelerate.co.il',
        'https://*.weccelerate.co.il',
        'http://localhost:3000',
        'http://localhost:3001',
      ],
      responseHeader: [
        'Content-Type',
        'Content-Length',
        'Content-Disposition',
        'Cache-Control',
        'Content-Range',
        'Accept-Ranges',
        'X-GUploader-UploadID',
      ],
    },
  ]);
  console.log('   ✅ CORS configured');

  // 3. Configure lifecycle rules
  console.log('\n3️⃣  Configuring lifecycle rules...');
  await bucket.setMetadata({
    lifecycle: {
      rule: [
        // Delete temp files after 7 days
        {
          action: { type: 'Delete' },
          condition: {
            age: 7,
            matchesPrefix: ['temp/'],
          },
        },
        // Move old vault files to Nearline after 90 days
        {
          action: { type: 'SetStorageClass', storageClass: 'NEARLINE' },
          condition: {
            age: 90,
            matchesPrefix: ['vault/'],
          },
        },
        // Move very old vault files to Coldline after 365 days
        {
          action: { type: 'SetStorageClass', storageClass: 'COLDLINE' },
          condition: {
            age: 365,
            matchesPrefix: ['vault/'],
          },
        },
        // Delete incomplete multipart uploads after 1 day
        {
          action: { type: 'Delete' },
          condition: {
            age: 1,
            isLive: false,
          },
        },
      ],
    },
  });
  console.log('   ✅ Lifecycle rules configured');

  // 4. Create folder structure
  console.log('\n4️⃣  Creating folder structure...');
  for (const folder of FOLDERS) {
    try {
      const file = bucket.file(`${folder}.keep`);
      const exists = (await file.exists())[0];
      if (!exists) {
        await file.save('', { contentType: 'text/plain' });
        console.log(`   📁 Created: ${folder}`);
      } else {
        console.log(`   ✓  Exists: ${folder}`);
      }
    } catch (error) {
      console.log(`   ⚠️  Warning: Could not create ${folder}`);
    }
  }

  // 5. Set IAM policies for public media folder
  console.log('\n5️⃣  Configuring access policies...');
  try {
    // Make media folder publicly readable (for thumbnails, etc.)
    await bucket.setMetadata({
      iamConfiguration: {
        uniformBucketLevelAccess: {
          enabled: true,
        },
      },
    });

    // Add public access for media folder via IAM
    const [policy] = await bucket.iam.getPolicy();
    
    // Check if allUsers binding exists
    const hasPublicAccess = policy.bindings?.some(
      (b) => b.role === 'roles/storage.objectViewer' && 
             b.members?.includes('allUsers') &&
             b.condition?.expression?.includes('media/')
    );

    if (!hasPublicAccess) {
      policy.bindings = policy.bindings || [];
      policy.bindings.push({
        role: 'roles/storage.objectViewer',
        members: ['allUsers'],
        condition: {
          title: 'Public media access',
          description: 'Allow public access to media folder',
          expression: 'resource.name.startsWith("projects/_/buckets/' + CONFIG.bucketName + '/objects/media/")',
        },
      });
      
      await bucket.iam.setPolicy(policy);
      console.log('   ✅ Public access configured for media folder');
    } else {
      console.log('   ✓  Public access already configured');
    }
  } catch (error) {
    console.log('   ⚠️  Could not configure IAM (may need admin access)');
  }

  // 6. Verify setup
  console.log('\n6️⃣  Verifying setup...');
  const [metadata] = await bucket.getMetadata();
  console.log(`   Bucket: ${metadata.name}`);
  console.log(`   Location: ${metadata.location}`);
  console.log(`   Storage Class: ${metadata.storageClass}`);
  console.log(`   Created: ${metadata.timeCreated}`);

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('✅ GCS SETUP COMPLETE!');
  console.log('═'.repeat(50));
  console.log('\nEnvironment variables to set:\n');
  console.log(`GCS_PROJECT_ID=${CONFIG.projectId}`);
  console.log(`GCS_BUCKET_NAME=${CONFIG.bucketName}`);
  console.log(`GCS_KEY_FILE=./gcs-service-account.json`);
  console.log('\nBucket URL: https://storage.googleapis.com/' + CONFIG.bucketName);
  console.log('\n');
}

// =============================================================================
// RUN
// =============================================================================

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Setup failed:', error.message);
    console.error(error);
    process.exit(1);
  });
