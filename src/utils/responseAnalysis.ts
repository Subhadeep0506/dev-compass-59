/**
 * Utility functions for analyzing AI responses
 */

/**
 * Detects if a response contains apologetic language indicating the AI couldn't provide a good answer
 */
export const isApologeticResponse = (response: string): boolean => {
    const apologeticWords = [
        'sorry',
        'apologize',
        'apologies',
        "unable to",
        "don't have information",
        "cannot provide",
        "no information available",
        "insufficient information"
    ];

    const lowerResponse = response.toLowerCase();
    return apologeticWords.some(word => lowerResponse.includes(word));
};

/**
 * Test cases for the apologetic response detector
 */
export const testApologeticResponse = () => {
    const testCases = [
        // Should return true (apologetic)
        { input: "Sorry, I don't have information about that topic.", expected: true },
        { input: "I apologize, but I can't help with that question.", expected: true },
        { input: "I'm not sure about that specific detail.", expected: true },
        { input: "Unfortunately, I don't have enough information to answer.", expected: true },

        // Should return false (not apologetic)
        { input: "Here's the information you requested about Godot nodes.", expected: false },
        { input: "To create a timer in Godot, you can use the Timer node.", expected: false },
        { input: "The CharacterBody2D node is perfect for player characters.", expected: false },
        { input: "This approach works well for most game scenarios.", expected: false },
    ];

    console.log("Testing apologetic response detection:");

    testCases.forEach(({ input, expected }, index) => {
        const result = isApologeticResponse(input);
        const passed = result === expected;

        console.log(`Test ${index + 1}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`  Input: "${input}"`);
        console.log(`  Expected: ${expected}, Got: ${result}`);
        console.log('');
    });
};