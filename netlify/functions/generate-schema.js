// netlify/functions/generate-schema.js
// This function calls Claude Sonnet 4.6 to structure annotations into final schema
// IMPORTANT: This is the ONLY place where Sonnet 4.6 is called. Haiku is used elsewhere.

const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Function to estimate tokens (rough approximation)
function estimateTokens(annotations) {
  let charCount = 0;
  annotations.forEach((a) => {
    charCount += (a.provision?.length || 0);
    charCount += (a.title?.length || 0);
    charCount += (a.guidance?.length || 0);
    charCount += (a.flags?.length || 0) * 2;
    charCount += (a.source?.length || 0);
  });
  // Rough: ~4 characters per token
  return Math.ceil(charCount / 4) + 500; // Add overhead for system prompt
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { annotations } = JSON.parse(event.body);

    if (!annotations || !Array.isArray(annotations) || annotations.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No annotations provided" }),
      };
    }

    // Step 1: Return token estimate (frontend shows modal, user confirms)
    const estimatedTokens = estimateTokens(annotations);

    // If this is just a token estimate request (no explicit confirm flag),
    // return the estimate for the frontend modal
    if (event.headers["x-estimate-only"] === "true") {
      return {
        statusCode: 200,
        body: JSON.stringify({
          estimatedTokens: estimatedTokens,
          estimatedCost: `$${((estimatedTokens / 1000) * 0.003).toFixed(4)}`, // Rough Sonnet 4.6 pricing
          message: `This will use approximately ${estimatedTokens} tokens`,
        }),
      };
    }

    // Step 2: User confirmed, generate schema using Claude Sonnet 4.6
    const systemPrompt = `You are a rules engine expert. Your job is to take raw annotations and structure them into a formal context rule schema. Each rule should have:
- id: Auto-numbered CTX-001, CTX-002, etc.
- category: One of: membership, dues, discipline, elections, quorum, amendments, scope, procedure, insignia, officers, committees, province, ritual, hazing, finance
- provision: The article/by-law reference (e.g. "Art. I §003")
- title: Short human-readable title
- guidance: The interpretation notes (your most important field)
- examples: Array of scenarios with ruling and reason (synthesize from guidance if not provided)
- flags: Array of keywords that trigger this rule
- severity: HARD_REJECT, HIGH, MEDIUM, or INFO
- source: Where this interpretation comes from

Return ONLY valid JSON, no markdown, no code blocks.`;

    const userPrompt = `Structure these annotations into the final schema JSON format:

${JSON.stringify(annotations, null, 2)}

For each annotation:
1. Auto-assign a CTX-### ID
2. Keep all provided fields (guidance, flags, severity, source)
3. Extract 2-3 example scenarios from the guidance text if not explicitly provided
4. Ensure category and severity are valid (see system prompt)

Return as JSON array. Do not include any preamble or explanation.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514", // SONNET 4.6 - RESERVED FOR THIS ONLY
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const schemaJson = response.content[0].text;

    // Parse to ensure valid JSON
    let parsedSchema;
    try {
      parsedSchema = JSON.parse(schemaJson);
    } catch (e) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Claude returned invalid JSON",
          raw: schemaJson,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        schema: parsedSchema,
        tokenUsage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || "Unknown error generating schema",
      }),
    };
  }
};
