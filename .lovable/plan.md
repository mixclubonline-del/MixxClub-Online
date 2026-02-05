
# Fix Dream Engine Image Generation Response Parsing

## Problem Diagnosis

The Dream Engine edge function is failing with `Error: No image generated in response` because it parses the Lovable AI gateway response incorrectly.

**Current (Broken) Parsing:**
```typescript
const content = data.choices?.[0]?.message?.content;
if (Array.isArray(content)) {
  const imageContent = content.find((c: any) => c.type === "image_url");
  if (imageContent?.image_url?.url) {
    return { url: imageContent.image_url.url, provider: "lovable-gemini-3-pro" };
  }
}
```

**Actual Lovable AI Gateway Response Format:**
```json
{
  "choices": [{
    "message": {
      "images": [{ "image_url": { "url": "data:image/png;base64,..." } }],
      "content": "..."
    }
  }]
}
```

**Evidence:** The working `generate-landing-image` function correctly uses:
```typescript
const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
```

---

## Solution

Update the `generateImage` function in `dream-engine/index.ts` to:

1. Parse the response using the correct path: `data.choices[0].message.images[0].image_url.url`
2. Add fallback logic to handle multiple possible response formats for resilience
3. Add detailed logging of the actual response structure when parsing fails (to help debug future issues)

---

## Code Changes

### File: `supabase/functions/dream-engine/index.ts`

Replace lines 106-116 with:

```typescript
const data = await response.json();

// Primary path: Lovable AI gateway format with images array
const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
if (imageUrl) {
  return { url: imageUrl, provider: "lovable-gemini-3-pro" };
}

// Fallback 1: Check content array format (OpenAI-style multimodal)
const content = data.choices?.[0]?.message?.content;
if (Array.isArray(content)) {
  const imageContent = content.find((c: any) => c.type === "image_url");
  if (imageContent?.image_url?.url) {
    return { url: imageContent.image_url.url, provider: "lovable-gemini-3-pro" };
  }
}

// Fallback 2: Direct inline data from Gemini native format
const inlineData = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
if (inlineData?.inlineData) {
  const dataUrl = `data:${inlineData.inlineData.mimeType};base64,${inlineData.inlineData.data}`;
  return { url: dataUrl, provider: "lovable-gemini-3-pro" };
}

// Log actual response structure for debugging
console.error("Unexpected response structure:", JSON.stringify(data).substring(0, 500));
throw new Error("No image generated in response");
```

---

## Why This Fix Works

| Issue | Fix |
|-------|-----|
| Wrong response path | Use `message.images[0].image_url.url` matching working functions |
| Single point of failure | Add fallback parsing for multiple API response formats |
| Silent failures | Log actual response when all parsers fail |

---

## Validation Steps

After deploying:

1. Navigate to `/dream-engine`
2. Enter any image prompt (e.g., "A vibrant sunset over mountains")
3. Select a context and click generate
4. Verify image appears in preview (no 500 error)
5. Check edge function logs for successful generation message
