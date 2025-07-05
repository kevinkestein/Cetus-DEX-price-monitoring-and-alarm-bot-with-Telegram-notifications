# Cetus DEX API Integration Guide

## Summary

After testing the Cetus DEX ecosystem, the most reliable method to fetch price data is through the **GeckoTerminal API**, which aggregates data from multiple DEXes including Cetus on the Sui Network.

## API Endpoints

### Base URL
```
https://api.geckoterminal.com/api/v2
```

### Key Endpoints

1. **Get All Networks**
   ```
   GET /networks
   ```

2. **Get Pools on Sui Network**
   ```
   GET /networks/sui-network/pools
   ```

3. **Get Specific Pool Data**
   ```
   GET /networks/sui-network/pools/{pool_address}
   ```

## Cetus DEX Pool Addresses on Sui Network

| Trading Pair | Pool Address | 24h Volume |
|-------------|-------------|------------|
| USDC/SUI | `0x51e883ba7c0b566a26cbc8a94cd33eb0abd418a77cc1e60ad22fd9b1f29cd2ab` | ~$18.3M |
| WAL/SUI | `0xf4238fa592c9ed7f148fd091cb2c4147cb15ad81b797115ce42971923ebf6e4c` | ~$583K |
| DEEP/SUI | `0xd978d331772a5b90d5a4781e1232d18afd12019d0c35db79e3674beeda8f9126` | ~$623K |

## Request Headers

No authentication required. Standard HTTP headers:
```
Content-Type: application/json
User-Agent: YourApp/1.0
```

## Rate Limiting

- **Free Tier**: 30 requests per minute
- **Paid Tier**: 500 requests per minute
- No rate limit headers observed in responses
- Recommended: 1-2 second delays between requests

## Response Structure

### Pool Data Response
```json
{
  "data": {
    "id": "sui-network_0x51e883ba7c0b566a26cbc8a94cd33eb0abd418a77cc1e60ad22fd9b1f29cd2ab",
    "type": "pool",
    "attributes": {
      "base_token_price_usd": "1.00021932574946",
      "quote_token_price_usd": "2.9",
      "base_token_address": "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
      "quote_token_address": "0x2::sui::SUI",
      "pool_fee_percent": "0.05",
      "volume_usd": {
        "h24": "18339962.626522"
      },
      "transactions": {
        "h24": {
          "buys": 6952,
          "sells": 6952
        }
      },
      "reserve_in_usd": "7099736.595"
    }
  }
}
```

## Working cURL Example

```bash
# Get USDC/SUI pool data
curl -X GET "https://api.geckoterminal.com/api/v2/networks/sui-network/pools/0x51e883ba7c0b566a26cbc8a94cd33eb0abd418a77cc1e60ad22fd9b1f29cd2ab" \
  -H "Content-Type: application/json"
```

## JavaScript Implementation

```javascript
async function getCetusPrice(pair = 'USDC/SUI') {
  const poolAddresses = {
    'USDC/SUI': '0x51e883ba7c0b566a26cbc8a94cd33eb0abd418a77cc1e60ad22fd9b1f29cd2ab',
    'WAL/SUI': '0xf4238fa592c9ed7f148fd091cb2c4147cb15ad81b797115ce42971923ebf6e4c',
    'DEEP/SUI': '0xd978d331772a5b90d5a4781e1232d18afd12019d0c35db79e3674beeda8f9126'
  };
  
  const poolAddress = poolAddresses[pair];
  if (!poolAddress) {
    throw new Error(`Unsupported pair: ${pair}`);
  }
  
  const response = await fetch(
    `https://api.geckoterminal.com/api/v2/networks/sui-network/pools/${poolAddress}`
  );
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  const pool = data.data.attributes;
  
  return {
    pair: pair,
    basePrice: parseFloat(pool.base_token_price_usd),
    quotePrice: parseFloat(pool.quote_token_price_usd),
    volume24h: parseFloat(pool.volume_usd.h24),
    transactions24h: pool.transactions.h24.buys + pool.transactions.h24.sells,
    reserveUSD: parseFloat(pool.reserve_in_usd),
    timestamp: new Date().toISOString()
  };
}

// Usage
getCetusPrice('USDC/SUI').then(price => {
  console.log(`USDC Price: $${price.basePrice}`);
  console.log(`SUI Price: $${price.quotePrice}`);
  console.log(`24h Volume: $${price.volume24h.toLocaleString()}`);
});
```

## Key Findings

1. **No Native ETH on Sui**: Sui Network doesn't have native ETH pools. Main pairs are with SUI as the quote token.

2. **Available Pairs**: 
   - USDC/SUI (highest volume)
   - WAL/SUI 
   - DEEP/SUI
   - Other altcoin/SUI pairs

3. **Price Calculation**: 
   - Prices are provided in USD
   - Ratio = base_token_price_usd / quote_token_price_usd

4. **Data Quality**: 
   - Real-time updates
   - High volume pools (~$18M daily for USDC/SUI)
   - Reliable uptime

## Alternative Data Sources

1. **CoinGecko API**: Now includes GeckoTerminal data via `/onchain` endpoints
2. **DexScreener API**: Alternative DEX aggregator with similar data
3. **Cetus SDK**: For direct on-chain integration (more complex)

## Recommendations

- Use GeckoTerminal API for price monitoring
- Focus on USDC/SUI as the most liquid pair
- Implement 2-second delays between requests
- Monitor for 429 rate limit responses
- Cache responses for 30-60 seconds to reduce API calls

## Error Handling

Common errors:
- `404`: Pool not found
- `429`: Rate limit exceeded  
- `500`: API temporary issues

Implement exponential backoff and retry logic for production use.