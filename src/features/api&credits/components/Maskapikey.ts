// Utility function to mask API keys
// Shows first 12 characters and last 4 characters, masks the middle

export const maskApiKey = (key: string): string => {
  if (!key || key.length <= 16) return key;
  
  const visibleStart = key.substring(0, 12);
  const visibleEnd = key.substring(key.length - 4);
  const maskedMiddle = "•".repeat(key.length - 16);
  
  return `${visibleStart}${maskedMiddle}${visibleEnd}`;
};

// Example usage in GenerateModal component:
/*
  In your GenerateModal component (step 3 - success screen), update the key display:

  {lastGeneratedKeys?.map((keyObj, index) => (
    <div key={index} className="...">
      <div className="...">
        {maskApiKey(keyObj.key)}  // Display masked key
      </div>
      <button onClick={() => onCopyKey(keyObj.key)}>  // Copy full key
        Copy
      </button>
    </div>
  ))}
*/

// Example of what the masked keys will look like:
// Original: sk-test_cb957f93_JxvA0iDDraMvWoy1BLtJQ90Hz3YkktxP
// Masked:   sk-test_cb9•••••••••••••••••••••••••••••ktxP
//
// Original: sk-live_951e03e0_yC635PODqAwTx1exR9YbBenrp81i7j20
// Masked:   sk-live_951•••••••••••••••••••••••••••••7j20