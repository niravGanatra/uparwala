/**
 * Retry utility with exponential backoff
 * Handles Railway cold starts and transient network issues
 */

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.baseDelay - Base delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 10000)
 * @param {Function} options.shouldRetry - Function to determine if should retry (default: retry on network errors)
 * @returns {Promise} - Result of the function
 */
export async function retryWithBackoff(fn, options = {}) {
    const {
        maxRetries = 3,
        baseDelay = 1000,
        maxDelay = 10000,
        shouldRetry = (error) => {
            // Retry on network errors, timeouts, and 5xx server errors
            if (!error.response) return true; // Network error
            const status = error.response.status;
            return status >= 500 || status === 408 || status === 429;
        }
    } = options;

    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't retry if we shouldn't
            if (!shouldRetry(error) || attempt === maxRetries) {
                throw error;
            }

            // Calculate delay with exponential backoff + jitter
            const delay = Math.min(
                baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
                maxDelay
            );

            console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

/**
 * Wrapper for API calls with retry logic
 * @param {Function} apiCall - The API call function
 * @param {Object} retryOptions - Options for retry behavior
 * @returns {Promise} - API response
 */
export async function withRetry(apiCall, retryOptions = {}) {
    return retryWithBackoff(apiCall, retryOptions);
}

export default { retryWithBackoff, withRetry };
