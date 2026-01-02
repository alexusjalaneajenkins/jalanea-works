/**
 * Test script for the Cloud Agent
 *
 * Run with: npm run test
 *
 * Vision Providers:
 * - mock: FREE testing (default) - no API key needed
 * - gemini: Uses your existing Gemini key
 * - claude: Uses Anthropic API key
 */

import 'dotenv/config';
import { JobApplicationAgent, VisionProvider } from './agent.js';
import { UserProfile } from './vision.js';

async function testAgent() {
  console.log('🧪 Starting Cloud Agent Test\n');

  // Determine which vision provider to use
  const visionProvider = (process.env.VISION_PROVIDER || 'mock') as VisionProvider;

  console.log(`📡 Vision Provider: ${visionProvider.toUpperCase()}`);
  console.log(visionProvider === 'mock'
    ? '   ✅ FREE mode - no API costs!'
    : `   💰 Paid mode - API calls will be charged\n`);

  // Build config based on provider
  const config: any = {
    visionProvider,
    headless: false, // Set to true for production (false lets you see the browser)
    maxActions: 20, // Limit actions for testing
  };

  // Add API keys only when needed
  if (visionProvider === 'claude') {
    config.anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!config.anthropicApiKey) {
      console.error('❌ Error: ANTHROPIC_API_KEY required for Claude vision');
      console.log('\nSet VISION_PROVIDER=mock for free testing, or add your API key to .env');
      process.exit(1);
    }
  } else if (visionProvider === 'gemini') {
    config.geminiApiKey = process.env.GEMINI_API_KEY;
    if (!config.geminiApiKey) {
      console.error('❌ Error: GEMINI_API_KEY required for Gemini vision');
      console.log('\nSet VISION_PROVIDER=mock for free testing, or add your API key to .env');
      process.exit(1);
    }
  }

  // Create agent
  const agent = new JobApplicationAgent(config);

  // Set up a test user profile
  const testProfile: UserProfile = {
    name: 'Alex Jenkins',
    email: 'alex@example.com',
    phone: '555-123-4567',
    location: 'Orlando, FL',
    resumeText: 'Experienced web developer with 3 years of experience...',
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'CSS'],
    experience: '3 years as a Frontend Developer at Tech Company',
    education: 'AS in Graphic and Interactive Design',
    desiredJobTitles: ['Web Developer', 'Frontend Developer', 'UI Developer'],
    workType: 'remote',
    desiredSalary: '$50,000 - $70,000',
  };

  agent.setUserProfile(testProfile);

  // Listen for events
  agent.on('event', (event) => {
    switch (event.type) {
      case 'status':
        console.log(`📊 Status: ${event.data.message}`);
        break;
      case 'action':
        console.log(`🎯 Action: ${event.data.type} - ${event.data.reason}`);
        break;
      case 'screenshot':
        console.log(`📸 Screenshot captured (${event.data.width}x${event.data.height})`);
        break;
      case 'job_applied':
        console.log(`✅ Job applied! Total: ${event.data.count}`);
        break;
      case 'error':
        console.log(`❌ Error: ${event.data.message}`);
        break;
    }
  });

  try {
    // Test 1: Simple navigation test
    console.log('\n📍 Test 1: Navigation test');
    console.log('   Navigating to Indeed and searching for jobs...\n');

    await agent.start(
      'Go to indeed.com and search for "web developer" jobs in "Orlando, FL". Browse the first few results.'
    );

    // Wait for completion or timeout
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        console.log('\n⏰ Test timeout reached');
        resolve();
      }, 60000); // 1 minute timeout

      agent.on('event', (event) => {
        if (event.data.state === 'completed' || event.data.state === 'error') {
          clearTimeout(timeout);
          resolve();
        }
      });
    });

    // Get final state
    const state = agent.getState();
    console.log('\n📊 Final State:');
    console.log(`   Status: ${state.status}`);
    console.log(`   Actions: ${state.actionsPerformed}`);
    console.log(`   Jobs Applied: ${state.jobsApplied}`);
    console.log(`   Errors: ${state.errors.length}`);

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    // Clean up
    await agent.stop();
    console.log('\n✅ Test completed');
    process.exit(0);
  }
}

// Run the test
testAgent();
