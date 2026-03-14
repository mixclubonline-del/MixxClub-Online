

# Dream First: Hallway Entrance Branding Concepts

## What We See Now
The hallway has a nice studio corridor vibe, but the Mixxclub logo and tagline sit on top like a HUD overlay. It doesn't feel like you're walking up to a club — it feels like someone put a watermark on a photo.

## What We Dream
Generate 3-4 concept images that show what the hallway *should* feel like with Mixxclub branding integrated into the physical environment. These become our reference art for the build.

## Image Concepts to Generate

### Concept 1 — "The Neon Marquee"
A cinematic POV shot walking down a dark luxury hallway toward a glowing neon "MIXXCLUB" sign mounted above the far doorway. Pink-to-cyan gradient neon tubing. The sign casts colored light onto the walls and floor. Below the sign: "FROM BEDROOM TO BILLBOARD" etched into frosted glass. Studio doors on either side glow warmly. Think: exclusive nightclub entrance meets recording studio.

### Concept 2 — "The Floor Projection"
Same hallway perspective but the branding is on the floor — a large illuminated Mixxclub infinity symbol projected or embedded into polished concrete/marble flooring. The symbol glows with the brand gradient. Moody overhead lighting. The word "MIXXCLUB" is subtly etched into the wall at the far end. Think: luxury hotel lobby meets underground music venue.

### Concept 3 — "The Velvet Rope"
A wider shot showing the hallway entrance from the outside. Velvet rope or subtle barrier at the threshold. Above the entrance: a backlit "MIXXCLUB" sign with the infinity symbol. Red and cyan ambient lighting spilling out from inside. You can see the studio doors beyond. Think: you're about to step into something exclusive.

### Concept 4 — "The Living Brand"
The hallway with the Mixxclub infinity symbol integrated into the architecture — carved into the ceiling as a skylight, or formed by the arrangement of recessed lights. The word "MIXXCLUB" appears as brushed metal lettering on the wall, gallery-style. Warm amber and cool cyan lighting creates depth. Think: high-end creative agency office meets music label headquarters.

## Technical Execution
- Call the existing `generate-promo-image` edge function 4 times
- Prompts crafted for `google/gemini-3-pro-image-preview`
- 1080x1080 square format for concept review
- Stored in `brand-assets` bucket under `hallway-concepts/`
- Share all 4 in chat for review before building anything

## After the Dream
Once you pick a direction (or a mashup), we rebuild the hallway scene to match that vision — potentially generating a new hallway background image, updating the overlay structure, and making the branding feel architectural rather than overlaid.

