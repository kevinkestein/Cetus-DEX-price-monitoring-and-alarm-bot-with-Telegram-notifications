// Cetus DEX API Testing Script
// This script tests the GeckoTerminal API endpoints for Cetus DEX price data

const API_BASE_URL = 'https://api.geckoterminal.com/api/v2';

// Known Cetus pool addresses on Sui Network
const CETUS_POOLS = {
  'USDC/SUI': '0x51e883ba7c0b566a26cbc8a94cd33eb0abd418a77cc1e60ad22fd9b1f29cd2ab',
  'WAL/SUI': '0xf4238fa592c9ed7f148fd091cb2c4147cb15ad81b797115ce42971923ebf6e4c',
  'DEEP/SUI': '0xd978d331772a5b90d5a4781e1232d18afd12019d0c35db79e3674beeda8f9126'
};

// Function to get all Cetus pools on Sui Network
async function getCetusPools() {
  try {
    const response = await fetch(`${API_BASE_URL}/networks/sui-network/pools?page=1&include=dex`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Filter for Cetus DEX pools
    const cetusPools = data.data.filter(pool => 
      pool.relationships?.dex?.data?.id === 'sui-network_cetus'
    );
    
    console.log('=== CETUS DEX POOLS ON SUI NETWORK ===');
    cetusPools.forEach(pool => {
      const baseToken = pool.attributes.base_token_symbol;
      const quoteToken = pool.attributes.quote_token_symbol;
      const poolName = pool.attributes.name;
      const volume24h = pool.attributes.volume_usd['h24'];
      
      console.log(`${poolName}: $${parseFloat(volume24h).toLocaleString()} (24h volume)`);
      console.log(`Pool Address: ${pool.id}`);
      console.log('---');
    });
    
    return cetusPools;
  } catch (error) {
    console.error('Error fetching Cetus pools:', error);
    return [];
  }
}

// Function to get specific pool price data
async function getPoolPrice(poolAddress, pairName) {
  try {
    const response = await fetch(`${API_BASE_URL}/networks/sui-network/pools/${poolAddress}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const pool = data.data;
    
    console.log(`\n=== ${pairName} PRICE DATA ===`);
    console.log(`Pool Address: ${pool.id}`);
    console.log(`Base Token: ${pool.attributes.base_token_symbol} ($${pool.attributes.base_token_price_usd})`);
    console.log(`Quote Token: ${pool.attributes.quote_token_symbol} ($${pool.attributes.quote_token_price_usd})`);
    console.log(`Pool Fee: ${pool.attributes.pool_fee_percent}%`);
    console.log(`24h Volume: $${parseFloat(pool.attributes.volume_usd.h24).toLocaleString()}`);
    console.log(`24h Transactions: ${pool.attributes.transactions.h24.buys + pool.attributes.transactions.h24.sells}`);
    console.log(`Reserve in USD: $${parseFloat(pool.attributes.reserve_in_usd).toLocaleString()}`);
    
    // Price calculations
    const basePrice = parseFloat(pool.attributes.base_token_price_usd);
    const quotePrice = parseFloat(pool.attributes.quote_token_price_usd);
    const ratio = basePrice / quotePrice;
    
    console.log(`\nPrice Ratio: 1 ${pool.attributes.base_token_symbol} = ${ratio.toFixed(6)} ${pool.attributes.quote_token_symbol}`);
    
    return {
      poolAddress: pool.id,
      baseToken: {
        symbol: pool.attributes.base_token_symbol,
        address: pool.attributes.base_token_address,
        priceUSD: basePrice
      },
      quoteToken: {
        symbol: pool.attributes.quote_token_symbol, 
        address: pool.attributes.quote_token_address,
        priceUSD: quotePrice
      },
      volume24h: parseFloat(pool.attributes.volume_usd.h24),
      transactions24h: pool.attributes.transactions.h24.buys + pool.attributes.transactions.h24.sells,
      reserveUSD: parseFloat(pool.attributes.reserve_in_usd),
      ratio: ratio
    };
    
  } catch (error) {
    console.error(`Error fetching price for ${pairName}:`, error);
    return null;
  }
}

// Function to test rate limiting
async function testRateLimit() {
  console.log('\n=== TESTING RATE LIMITS ===');
  const startTime = Date.now();
  
  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch(`${API_BASE_URL}/networks/sui-network/pools/0x51e883ba7c0b566a26cbc8a94cd33eb0abd418a77cc1e60ad22fd9b1f29cd2ab`);
      
      // Check for rate limit headers
      const rateLimit = response.headers.get('x-ratelimit-limit');
      const rateUsed = response.headers.get('x-ratelimit-used');
      const rateRemaining = response.headers.get('x-ratelimit-remaining');
      
      console.log(`Request ${i + 1}: Status ${response.status}`);
      if (rateLimit) {
        console.log(`Rate Limit: ${rateUsed}/${rateLimit} (${rateRemaining} remaining)`);
      }
      
      if (!response.ok) {
        console.log(`Error response: ${await response.text()}`);
      }
      
      // Wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Request ${i + 1} failed:`, error);
    }
  }
  
  const endTime = Date.now();
  console.log(`Total time: ${endTime - startTime}ms`);
}

// Main test function
async function main() {
  console.log('🚀 Testing Cetus DEX API Integration\n');
  
  // Test 1: Get all Cetus pools
  await getCetusPools();
  
  // Test 2: Get specific pool prices
  for (const [pairName, poolAddress] of Object.entries(CETUS_POOLS)) {
    await getPoolPrice(poolAddress, pairName);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit friendly
  }
  
  // Test 3: Test rate limiting
  await testRateLimit();
  
  console.log('\n✅ API testing completed!');
}

// Run the tests
if (typeof window === 'undefined') {
  // Node.js environment
  main().catch(console.error);
} else {
  // Browser environment
  console.log('This script is designed to run in Node.js. Use fetch() directly in browser.');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getCetusPools,
    getPoolPrice,
    CETUS_POOLS,
    API_BASE_URL
  };
}