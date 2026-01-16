# Frontend Integration for Serviceability Check

To implement the location restriction on the frontend (React), follow these steps:

## 1. API Integration
The backend exposes the following endpoint:
`GET /api/orders/serviceability/check/<pincode>/?area=<area_name>`

**Response:**
```json
{
    "serviceable": true,
    "pincode": "380015",
    "area": "Satellite",
    "message": "Delivery available."
}
```
Or error:
```json
{
    "serviceable": false,
    "message": "We do not serve the area \"Satellite\" in pincode 380015."
}
```

## 2. Component Logic (Checkout/Address Form)

Use a custom hook or state to manage the validation.

```jsx
// Example Concept
import { useState, useCallback } from 'react';
import axios from 'axios';
import { debounce } from 'lodash'; 

const CheckoutForm = () => {
    const [pincode, setPincode] = useState('');
    const [area, setArea] = useState('');
    const [isServiceable, setIsServiceable] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Debounce the API call to avoid spamming while typing
    const checkServiceability = useCallback(debounce(async (pin, areaName) => {
        if (pin.length !== 6) return;
        
        setIsLoading(true);
        setError('');
        
        try {
            const url = `/api/orders/serviceability/check/${pin}/?area=${encodeURIComponent(areaName || '')}`;
            const response = await axios.get(url);
            
            if (response.data.serviceable) {
                setIsServiceable(true);
            } else {
                setIsServiceable(false);
                setError(response.data.message);
            }
        } catch (err) {
            setIsServiceable(false);
            setError("Unable to verify location.");
        } finally {
            setIsLoading(false);
        }
    }, 500), []);

    // Handlers
    const handlePincodeChange = (e) => {
        const val = e.target.value;
        setPincode(val);
        // Reset status on change
        setIsServiceable(false); 
        checkServiceability(val, area);
    };

    const handleAreaChange = (e) => {
        const val = e.target.value;
        setArea(val);
        // Re-validate if pincode is valid
        if (pincode.length === 6) {
           checkServiceability(pincode, val);
        }
    };

    return (
        <div>
            <input 
                type="text" 
                placeholder="Pincode" 
                maxLength={6} 
                onChange={handlePincodeChange} 
            />
            <input 
                type="text" 
                placeholder="Area / Locality" 
                onChange={handleAreaChange} 
            />
            
            {isLoading && <span>Checking...</span>}
            {error && <div className="text-red-500">{error}</div>}
            
            <button disabled={!isServiceable || isLoading}>
                Place Order
            </button>
        </div>
    );
};
```

## 3. Best Practices
- **Debounce**: Always debounce the API call (wait 300-500ms after user stops typing).
- **Blocking**: Disable the "Place Order" or "Next" button until `isServiceable` is true.
- **Feedback**: Show clear success/error messages (e.g., green checkmark or red text).
- **Auto-Fill**: If the API returns City/State (which `ServiceablePincode` model stores), auto-fill those fields in your address form to improve UX.
