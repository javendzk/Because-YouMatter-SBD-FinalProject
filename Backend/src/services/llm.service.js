const axios = require('axios');
require('dotenv').config();


exports.generateFeedback = async (dayDescription, mood) => {
    try {
        let promptTemplate = '';
        
        if (mood === 'awesome' || mood === 'good') {
            promptTemplate = `
            User's day description: ${dayDescription}
            User's mood: ${mood}
            
            Based on the above information, provide the following:
            1. A personalized, cheerful response celebrating their positive mood that acknowledges specific aspects of their day if mentioned.
            2. Suggest 2-3 activities or things they could do tomorrow to maintain this positive energy.
            3. A warm, encouraging message as if you're their supportive friend who is genuinely happy for them.
            4. Generate 3 specific tags that represent themes or topics from their day description.
            5. Generate a brief insight about how their mood is influenced by factors in their day and what they might learn from this.
            
            Make your response upbeat and happy, focusing on maintaining their positive emotional state.
            
            Format your response as a JSON object with these exact keys:
            {
                "webMessage": "Your cheerful response followed by suggested activities for tomorrow", 
                "telegramMessage": "Your warm, friendly message as their companion who is happy for their good day",
                "tags": ["tag1", "tag2", "tag3"],
                "insight": "Brief insight about mood influences and potential learning"
            }
            
            The webMessage should be like: "We're glad that you had an amazing time [Name]! Well done and keep up the spirit! To commemorate today's mood, here's a couple of things you might want to do tomorrow: [Suggestions]"
            
            The telegramMessage should be meaningful, helpful, and sound like a supportive friend who is celebrating with them.
            
            The tags should be concise (1-2 words each) and reflect key themes.
            
            The insight should be 1-2 sentences that help the user understand what influenced their mood today.
            `;
        } else {
            promptTemplate = `
            User's day description: ${dayDescription}
            User's mood: ${mood}
            
            Based on the above information, provide the following:
            1. A personalized, empathetic response that validates their feelings and shows understanding.
            2. Suggest 2-3 practical coping strategies or self-care activities that might help improve their day. do not use numbering! ONLY WRITE IN PARAGRAGH FORM. dont make it too long aswell.
            3. A supportive, encouraging message as if you're their caring friend who wants to help them feel better.
            4. Generate 3 specific tags that represent themes or topics from their day description.
            5. Generate a brief insight about how their mood is influenced by factors in their day and what they might learn from this.
            
            Make your response warm, caring and supportive. Provide practical advice tailored to their specific situation.
            
            Format your response as a JSON object with these exact keys:
            {
                "webMessage": "Your empathetic response followed by suggested coping activities", 
                "telegramMessage": "Your supportive message as a caring friend who is there for them",
                "tags": ["tag1", "tag2", "tag3"],
                "insight": "Brief insight about mood influences and potential learning"
            }
            
            The webMessage should acknowledge their feelings, validate them, and offer practical steps to help improve their mood.
            
            The telegramMessage should be meaningful, helpful, and sound like a supportive friend who genuinely cares and wants to cheer them up.
            
            The tags should be concise (1-2 words each) and reflect key themes.
            
            The insight should be 1-2 sentences that help the user understand what influenced their mood today. Example: "Your mood today was influenced by work stress. Consider how your response to workplace challenges affects your emotional well-being."
            `;
        }

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: promptTemplate }],
                temperature: 0.7,
                max_tokens: 400
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            }
        );

        const content = response.data.choices[0].message.content;
        let parsedResponse;
        
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedResponse = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
            
            // Ensure all required fields exist
            if (!parsedResponse.tags || !Array.isArray(parsedResponse.tags)) {
                parsedResponse.tags = generateDefaultTags(dayDescription, mood);
            }
            
            if (!parsedResponse.insight) {
                parsedResponse.insight = generateDefaultInsight(mood);
            }
            
        } catch (parseError) {
            console.error('Error parsing LLM response:', parseError);
            
            const defaultTags = generateDefaultTags(dayDescription, mood);
            const defaultInsight = generateDefaultInsight(mood);
            
            if (mood === 'awesome' || mood === 'good') {
                parsedResponse = {
                    webMessage: "That's fantastic! We're thrilled to see you're having a great day! To keep this positive momentum, consider trying some mindfulness exercises tomorrow, spending time in nature, or connecting with someone who makes you happy.",
                    telegramMessage: "I'm genuinely happy that things are going well for you! These good moments are worth celebrating - you deserve this happiness! Remember that you're doing great, and I'm here cheering you on every step of the way. Keep sharing your journey with me!",
                    tags: defaultTags,
                    insight: defaultInsight
                };
            } else {
                parsedResponse = {
                    webMessage: "Thank you for sharing your feelings with us. It's completely okay to have days like this. To help improve tomorrow, try some gentle self-care activities like a short walk, listening to your favorite music, or practicing deep breathing for a few minutes.",
                    telegramMessage: "I hear you, and what you're feeling is valid. Everyone has difficult days, and I want you to know I'm right here with you through this. Be gentle with yourself - you're doing better than you think. Tomorrow brings new possibilities, and I believe in your strength to get through this. I'm here whenever you need someone to talk to.",
                    tags: defaultTags,
                    insight: defaultInsight
                };
            }
        }
        
        return {
            message: JSON.stringify({ dayDescription, mood }),
            response: JSON.stringify(parsedResponse),
            tags: parsedResponse.tags,
            insight: parsedResponse.insight
        };
    } catch (error) {
        console.error('Error in generateFeedback service:', error);
        
        const defaultTags = generateDefaultTags(dayDescription, mood);
        const defaultInsight = generateDefaultInsight(mood);
        
        const fallbackResponse = {
            webMessage: "Thank you for sharing your day with us. We're here to support you.",
            telegramMessage: "I appreciate you sharing your feelings with me. I'm here for you.",
            tags: defaultTags,
            insight: defaultInsight
        };
        
        return {
            message: JSON.stringify({ dayDescription, mood }),
            response: JSON.stringify(fallbackResponse),
            tags: defaultTags,
            insight: defaultInsight
        };
    }
};

function generateDefaultTags(dayDescription, mood) {
    const commonTags = ['daily-reflection', 'emotional-health'];
    
    let moodTag;
    if (mood === 'awesome' || mood === 'good') {
        moodTag = 'positive-mood';
    } else if (mood === 'okay') {
        moodTag = 'neutral-mood';
    } else {
        moodTag = 'challenging-day';
    }
    
    return [moodTag, ...commonTags];
}

function generateDefaultInsight(mood) {
    if (mood === 'awesome' || mood === 'good') {
        return "Your positive mood today shows the importance of recognizing good moments. Reflecting on what went well can help you cultivate more positive experiences in the future.";
    } else if (mood === 'okay') {
        return "Neutral days are part of life's rhythm. Paying attention to what keeps you balanced can help you maintain emotional stability even when facing challenges.";
    } else {
        return "Difficult days help us learn about our emotional responses. Consider what specific factors affected your mood today and what coping strategies might help next time.";
    }
}
