// Simple test to fetch USDC/SUI price from Cetus DEX via GeckoTerminal API

async function testPriceFetch() {
  console.log('🔍 Testing Cetus USDC/SUI Price Fetch...\n');
  
  const poolAddress = '0x51e883ba7c0b566a26cbc8a94cd33eb0abd418a77cc1e60ad22fd9b1f29cd2ab';
  const url = `https://api.geckoterminal.com/api/v2/networks/sui-network/pools/${poolAddress}`;
  
  try {
    console.log(`📡 Fetching from: ${url}`);
    
    const response = await fetch(url);
    console.log(`📋 Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const pool = data.data.attributes;
    
    // Extract price data
    const usdcPrice = parseFloat(pool.base_token_price_usd);
    const suiPrice = parseFloat(pool.quote_token_price_usd);
    const volume24h = parseFloat(pool.volume_usd.h24);
    const poolFee = pool.pool_fee_percent;
    
    console.log('\n💰 PRICE DATA:');
    console.log(`USDC Price: $${usdcPrice.toFixed(6)}`);
    console.log(`SUI Price: $${suiPrice.toFixed(6)}`);
    console.log(`Pool Fee: ${poolFee}%`);
    console.log(`24h Volume: $${volume24h.toLocaleString()}`);
    
    // Calculate exchange rate
    const usdcPerSui = usdcPrice / suiPrice;
    const suiPerUsdc = suiPrice / usdcPrice;
    
    console.log('\n🔄 EXCHANGE RATES:');
    console.log(`1 SUI = ${usdcPerSui.toFixed(6)} USDC`);
    console.log(`1 USDC = ${suiPerUsdc.toFixed(6)} SUI`);
    
    console.log('\n✅ Price fetch successful!');
    
    return {
      success: true,
      data: {
        usdcPrice,
        suiPrice,
        volume24h,
        poolFee,
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('\n❌ Error fetching price:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testPriceFetch();