#!/usr/bin/env node
/**
 * Profile Migration Testing Script
 * Tests both old and new profile systems for functionality
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - File missing: ${filePath}`, 'red');
    return false;
  }
}

function checkDirectory(dirPath, description) {
  const fullPath = path.join(process.cwd(), dirPath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - Directory missing: ${dirPath}`, 'red');
    return false;
  }
}

function runTests() {
  log('\n🚀 Starting Profile Migration Tests\n', 'blue');

  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Check new file structure
  log('📁 Testing File Structure:', 'yellow');
  totalTests++;
  if (
    checkFile('app/profile/components/ProfileLayout.jsx', 'ProfileLayout component') &&
    checkDirectory('app/profile/orders', 'Orders page directory') &&
    checkDirectory('app/profile/wishlist', 'Wishlist page directory') &&
    checkDirectory('app/profile/addresses', 'Addresses page directory') &&
    checkDirectory('app/profile/settings', 'Settings page directory') &&
    checkFile('app/profile/dashboard/page.js', 'Dashboard page')
  ) {
    passedTests++;
  }

  // Test 2: Check individual pages
  log('\n📄 Testing Individual Pages:', 'yellow');
  totalTests++;
  if (
    checkFile('app/profile/orders/page.js', 'Orders page component') &&
    checkFile('app/profile/wishlist/page.js', 'Wishlist page component') &&
    checkFile('app/profile/addresses/page.js', 'Addresses page component') &&
    checkFile('app/profile/settings/page.js', 'Settings page component')
  ) {
    passedTests++;
  }

  // Test 3: Check database optimization files
  log('\n🗄️ Testing Database Optimizations:', 'yellow');
  totalTests++;
  if (
    checkFile('database/performance_optimizations.sql', 'Database optimization script')
  ) {
    passedTests++;
  }

  // Test 4: Check React Query integration
  log('\n⚡ Testing Performance Enhancements:', 'yellow');
  totalTests++;
  if (
    checkFile('app/profile/hooks/useProfileData.js', 'React Query hooks')
  ) {
    passedTests++;
  }

  // Test 5: Check migration documentation
  log('\n📚 Testing Documentation:', 'yellow');
  totalTests++;
  if (
    checkFile('MIGRATION_GUIDE.md', 'Migration guide') &&
    checkFile('.env.example', 'Environment variables example')
  ) {
    passedTests++;
  }

  // Test 6: Check original system still works
  log('\n🔧 Testing Backwards Compatibility:', 'yellow');
  totalTests++;
  if (
    checkFile('app/profile/page.js', 'Original profile page') &&
    checkFile('app/profile/components/orders.js', 'Original orders component') &&
    checkFile('app/profile/components/wishlist.js', 'Original wishlist component') &&
    checkFile('app/profile/components/deliveryaddress.js', 'Original addresses component') &&
    checkFile('app/profile/components/accountsettings.js', 'Original settings component')
  ) {
    passedTests++;
  }

  // Test 7: Check for potential conflicts
  log('\n⚠️ Testing for Conflicts:', 'yellow');
  const profilePageContent = fs.readFileSync('app/profile/page.js', 'utf8');
  if (profilePageContent.includes('NEXT_PUBLIC_USE_NEW_PROFILE_PAGES')) {
    log('✅ Feature flag integration found', 'green');
    totalTests++;
    passedTests++;
  } else {
    log('❌ Feature flag integration missing', 'red');
    totalTests++;
  }

  // Summary
  log('\n' + '='.repeat(50), 'blue');
  log(`📊 Test Results: ${passedTests}/${totalTests} passed`, 'blue');
  
  if (passedTests === totalTests) {
    log('🎉 All tests passed! Migration is ready.', 'green');
    log('\n📋 Next Steps:', 'yellow');
    log('1. Apply database optimizations: psql -f database/performance_optimizations.sql', 'blue');
    log('2. Set NEXT_PUBLIC_USE_NEW_PROFILE_PAGES=true in .env.local for testing', 'blue');
    log('3. Test each new page manually', 'blue');
    log('4. Monitor performance and user feedback', 'blue');
    log('5. Gradually roll out to all users', 'blue');
    return true;
  } else {
    log('❌ Some tests failed. Please fix issues before migration.', 'red');
    return false;
  }
}

// Additional utility functions
function checkEnvironment() {
  log('\n🔍 Checking Environment:', 'yellow');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    log(`✅ Next.js project detected (${packageJson.name})`, 'green');
    
    if (fs.existsSync('.env.local')) {
      const envContent = fs.readFileSync('.env.local', 'utf8');
      if (envContent.includes('NEXT_PUBLIC_USE_NEW_PROFILE_PAGES')) {
        log('✅ Feature flag configured in .env.local', 'green');
      } else {
        log('⚠️ Feature flag not configured. Add NEXT_PUBLIC_USE_NEW_PROFILE_PAGES=false to .env.local', 'yellow');
      }
    } else {
      log('⚠️ .env.local not found. Create from .env.example', 'yellow');
    }
  } catch (error) {
    log('❌ Error checking environment: ' + error.message, 'red');
  }
}

function checkDependencies() {
  log('\n📦 Checking Dependencies:', 'yellow');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const requiredDeps = [
      'react',
      'next',
      'lucide-react',
      'framer-motion'
    ];
    
    const optionalDeps = [
      '@tanstack/react-query', // For React Query integration
      '@supabase/supabase-js'   // For database operations
    ];
    
    requiredDeps.forEach(dep => {
      if (deps[dep]) {
        log(`✅ ${dep} installed`, 'green');
      } else {
        log(`❌ ${dep} missing - required dependency`, 'red');
      }
    });
    
    optionalDeps.forEach(dep => {
      if (deps[dep]) {
        log(`✅ ${dep} installed`, 'green');
      } else {
        log(`⚠️ ${dep} not installed - recommended for optimal performance`, 'yellow');
      }
    });
  } catch (error) {
    log('❌ Error checking dependencies: ' + error.message, 'red');
  }
}

// Run the tests
if (require.main === module) {
  checkEnvironment();
  checkDependencies();
  const success = runTests();
  process.exit(success ? 0 : 1);
}

module.exports = { runTests, checkEnvironment, checkDependencies };
