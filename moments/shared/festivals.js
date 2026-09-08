/* Everything that differs between festivals. The shell in app.js reads one
   entry, chosen by the <html data-festival> attribute on each page.

   Each style carries a single prompt body. ChatGPT gets it prefixed with the
   lead-in, because its ?q= submits the moment the tab opens and the model
   would otherwise be answering about an image it has not been given. AI Studio
   only prefills, so it gets the body alone and the visitor attaches the photo
   before pressing Run. */

const LEAD_GPT = `I am going to upload one photo in my next message. Do NOT generate, draw or describe anything yet — wait for that photo to arrive.

When it does, edit it exactly as specified below.

Right now, reply with nothing except this line:
מוכן! עכשיו העלו את התמונה 📸

--- INSTRUCTIONS FOR WHEN THE PHOTO ARRIVES ---

`;

const FRAME_GPT = `FRAME:
Portrait orientation, 4:5 aspect ratio (for example 1080 x 1350). Do not produce a tall narrow image.
Frame this as a medium shot, not a close-up. Nothing important may be cut off by the edges.

SUBJECTS:
Use the photo as the only source for the people. Keep every face exactly as it is - same features, same expressions, same proportions. If there are pets in the photo keep them too, with the same face and the same coat. Do not add or remove anyone.`;

const NOTEXT_GPT = `NO TEXT - this is important:
Do not write any words, letters, Hebrew, numbers, watermark, logo or signature anywhere on the image. The top of the frame must stay clean and open with nothing in it - no lettering, no ornament, no branches crossing into it. Lettering is added separately afterwards, so anything you draw there would have to be covered over.

Please avoid: distorted faces, extra fingers or limbs, duplicated people, a missing or duplicated pet, a cropped-off foreground, a tall narrow frame, and any text or decorative flourish in the upper part of the frame.`;

const FESTIVALS = {

    'rosh-hashana': {
        tag: 'ראש השנה · תשפ״ז',
        h1: 'גלויה לראש השנה',
        emoji: '🍎',
        footer: 'שנה טובה ומתוקה 🍎🍯',
        shareTitle: 'שנה טובה ומתוקה',
        styles: [
            { key: 'festive', label: 'חגיגי־לבן 🕊️', after: 'images/after1.webp' },
            { key: 'royal', label: 'מלכותי 🍎', after: 'images/after2.webp' },
            { key: 'honey', label: 'מאוייר 🍯', after: 'images/after3.webp' },
        ],
        greetings: [
            { title: 'שנה טובה ומתוקה', body: 'שתהא השנה הבאה עלינו לטובה, מתוקה כדבש, מלאה בשמחה, בריאות איתנה והגשמת חלומות.' },
            { title: 'שנה טובה ומתוקה', body: 'שתיבנה שנתנו מתוך שלום, ביטחון, שקט ושלווה בכל גבולות הארץ.' },
            { title: 'כתיבה וחתימה טובה', body: 'שנזכה לשנת בריאות, איתנות ושלום, ושנכתב ונחתם בספר החיים הטובים.' },
        ],
        prompts: {
            festive: {
                chatgpt: `${LEAD_GPT}Edit the photo into a bright Rosh Hashana greeting image.

${FRAME_GPT}
Compose top to bottom as: top ~20% soft pale sky left completely empty, middle ~45% the people seated together, bottom ~35% a white-clothed holiday table with a shofar and a tallit clearly visible.

CLOTHING - change this:
Dress everyone in white and cream festive clothing: soft linen and knitwear, long sleeves, nothing branded, nothing patterned. Change only the clothes - faces, hair, skin and expressions stay exactly as they are in the photo.

SCENE:
Remove the original background completely and seat everyone at a holiday table in a calm, airy room with tall windows and pale stone walls, or on a bright terrace. Adults behind the table, children in front, all facing the camera with forearms resting on it.

THE TABLE - keep it bare, this matters:
A crisp white linen tablecloth, and on it exactly two objects and nothing else:
1. A ram's horn shofar lying across the front of the table, curved and spiralled, in natural cream and honey-brown horn.
2. A white tallit prayer shawl with fine blue stripes and knotted corner fringes, folded softly beside it or draped over a chair back.
No food of any kind. No apples, no honey, no challah, no pomegranates, no fruit, no bowls, no plates, no cutlery, no glasses, no candles, no flowers. The rest of the cloth stays empty and uncluttered - the emptiness is the point.

LIGHT AND LOOK:
Bright, clean daylight with a gentle warm cast. Airy and serene - white on white on cream, soft shadows, nothing dark or moody, no heavy contrast, no dramatic side light. Natural colour, gentle depth of field, a calm and reverent feeling rather than a cinematic one.

Blend everyone in seamlessly with no cut-out edges, matched colour temperature and correct scale and perspective.

${NOTEXT_GPT}`,
                gemini: `Edit the photo into a bright Rosh Hashana greeting image.

${FRAME_GPT}
Compose top to bottom as: top ~20% soft pale sky left completely empty, middle ~45% the people seated together, bottom ~35% a white-clothed holiday table with a shofar and a tallit clearly visible.

CLOTHING - change this:
Dress everyone in white and cream festive clothing: soft linen and knitwear, long sleeves, nothing branded, nothing patterned. Change only the clothes - faces, hair, skin and expressions stay exactly as they are in the photo.

SCENE:
Remove the original background completely and seat everyone at a holiday table in a calm, airy room with tall windows and pale stone walls, or on a bright terrace. Adults behind the table, children in front, all facing the camera with forearms resting on it.

THE TABLE - keep it bare, this matters:
A crisp white linen tablecloth, and on it exactly two objects and nothing else:
1. A ram's horn shofar lying across the front of the table, curved and spiralled, in natural cream and honey-brown horn.
2. A white tallit prayer shawl with fine blue stripes and knotted corner fringes, folded softly beside it or draped over a chair back.
No food of any kind. No apples, no honey, no challah, no pomegranates, no fruit, no bowls, no plates, no cutlery, no glasses, no candles, no flowers. The rest of the cloth stays empty and uncluttered - the emptiness is the point.

LIGHT AND LOOK:
Bright, clean daylight with a gentle warm cast. Airy and serene - white on white on cream, soft shadows, nothing dark or moody, no heavy contrast, no dramatic side light. Natural colour, gentle depth of field, a calm and reverent feeling rather than a cinematic one.

Blend everyone in seamlessly with no cut-out edges, matched colour temperature and correct scale and perspective.

${NOTEXT_GPT}`
            },
            royal: {
                chatgpt: `${LEAD_GPT}Edit the photo into a Rosh Hashana holiday-table greeting image.

${FRAME_GPT}
Compose top to bottom as: top ~20% open sky left completely empty, middle ~45% the people seated together, bottom ~35% the holiday table with its full setting clearly visible.

SCENE:
Remove the original background completely and seat everyone at a lavish Rosh Hashana table on a stone terrace at dusk. Adults behind the table, children in front, all facing the camera with forearms resting on it.

THE TABLE - keep it fully in frame:
A deep burgundy cloth seen from slightly above eye level so the whole surface reads. Polished red apples, a honey bowl with a wooden dipper mid-drip, split pomegranates showing their seeds, a round braided challah, brass lanterns with lit candles, crystal glasses and gold-rimmed plates. The table fills the bottom third edge to edge.

LIGHTING:
Warm candlelight from the table upward onto the faces, cool dusk light filling the shadows, a rim light along hair and shoulders, consistent shadow direction, and realistic contact shadows where arms rest on the table.

LOOK:
Cinematic and opulent - saturated crimson, gold and deep plum against the blue of dusk. Strong contrast, glowing highlights, fine grain, shallow depth of field. Blend everyone in seamlessly with correct scale and perspective.

${NOTEXT_GPT}`,
                gemini: `Edit the photo into a Rosh Hashana holiday-table greeting image.

${FRAME_GPT}
Compose top to bottom as: top ~20% open sky left completely empty, middle ~45% the people seated together, bottom ~35% the holiday table with its full setting clearly visible.

SCENE:
Remove the original background completely and seat everyone at a lavish Rosh Hashana table on a stone terrace at dusk. Adults behind the table, children in front, all facing the camera with forearms resting on it.

THE TABLE - keep it fully in frame:
A deep burgundy cloth seen from slightly above eye level so the whole surface reads. Polished red apples, a honey bowl with a wooden dipper mid-drip, split pomegranates showing their seeds, a round braided challah, brass lanterns with lit candles, crystal glasses and gold-rimmed plates. The table fills the bottom third edge to edge.

LIGHTING:
Warm candlelight from the table upward onto the faces, cool dusk light filling the shadows, a rim light along hair and shoulders, consistent shadow direction, and realistic contact shadows where arms rest on the table.

LOOK:
Cinematic and opulent - saturated crimson, gold and deep plum against the blue of dusk. Strong contrast, glowing highlights, fine grain, shallow depth of field. Blend everyone in seamlessly with correct scale and perspective.

${NOTEXT_GPT}`
            },
            honey: {
                chatgpt: `${LEAD_GPT}Turn the photo into a hand-painted Rosh Hashana storybook illustration.

FRAME:
Portrait orientation, 4:5 aspect ratio (for example 1080 x 1350). Do not produce a tall narrow image.
Compose top to bottom as: top ~22% warm empty sky left completely clean, middle ~48% the family seated together, bottom ~30% a picnic spread of honey pots and apples in the grass.

STYLE - this is the whole point:
A classic English children's storybook illustration in the 1920s tradition. Soft pen-and-ink outlines, thin and slightly uneven, as if drawn with a nib. Loose watercolour washes that do not quite stay inside the lines, with the cream of the paper showing through in places. Visible paper grain and a gently aged tone at the edges.
Warm and simple: honey amber, soft gold, muted sage green, dusty rose, ink brown. Nothing saturated, nothing glossy.
Hand-drawn and gentle - absolutely not 3D, not Pixar, not digital vector art, not anime, not a photograph with a filter.
Leave generous quiet space; the composition should feel airy, not crowded.

SUBJECTS:
Use the photo as the reference for who is in the scene. Redraw everyone as storybook characters but keep each one clearly recognisable - same hair colour and shape, same rough ages, same warm expressions, the same closeness between them. Simple, softly drawn faces with a few confident lines; not caricatures. Keep any pets in the photo, drawn in the same style with the same colouring.

SCENE:
The family sits together in the grass under a large old tree at the edge of a meadow on a mild honey-coloured afternoon.
Around them: several round earthenware honey pots, one open with a wooden dipper resting across it and a slow drip of honey. Red apples in a wicker basket and a few scattered in the grass. A pomegranate or two split open. A small woven blanket.
Behind them: soft rolling hills, a few round trees, tall grass, and a hollow trunk with a simple beehive and three or four little bees drawn as small loops in the air.
No buildings, no crowds, nothing modern.

LIGHT:
Soft, warm, late-afternoon light. Gentle washes rather than hard shadows, and a faint golden glow around the group.

NO TEXT - this is important:
Do not write any words, letters, Hebrew, numbers, watermark, logo or signature anywhere on the image. The top 22% must stay clean open sky with nothing in it - no lettering, no ornament, no branches or leaves crossing into it. Lettering is added separately afterwards.

Please avoid: photorealism, 3D rendering, glossy digital shading, heavy black outlines, distorted hands, extra limbs, duplicated people, a missing or duplicated pet, and any text or decorative flourish in the upper part of the frame.`,
                gemini: `Turn the photo into a hand-painted Rosh Hashana storybook illustration.

FRAME:
Portrait orientation, 4:5 aspect ratio (for example 1080 x 1350). Do not produce a tall narrow image.
Compose top to bottom as: top ~22% warm empty sky left completely clean, middle ~48% the family seated together, bottom ~30% a picnic spread of honey pots and apples in the grass.

STYLE - this is the whole point:
A classic English children's storybook illustration in the 1920s tradition. Soft pen-and-ink outlines, thin and slightly uneven, as if drawn with a nib. Loose watercolour washes that do not quite stay inside the lines, with the cream of the paper showing through in places. Visible paper grain and a gently aged tone at the edges.
Warm and simple: honey amber, soft gold, muted sage green, dusty rose, ink brown. Nothing saturated, nothing glossy.
Hand-drawn and gentle - absolutely not 3D, not Pixar, not digital vector art, not anime, not a photograph with a filter.
Leave generous quiet space; the composition should feel airy, not crowded.

SUBJECTS:
Use the photo as the reference for who is in the scene. Redraw everyone as storybook characters but keep each one clearly recognisable - same hair colour and shape, same rough ages, same warm expressions, the same closeness between them. Simple, softly drawn faces with a few confident lines; not caricatures. Keep any pets in the photo, drawn in the same style with the same colouring.

SCENE:
The family sits together in the grass under a large old tree at the edge of a meadow on a mild honey-coloured afternoon.
Around them: several round earthenware honey pots, one open with a wooden dipper resting across it and a slow drip of honey. Red apples in a wicker basket and a few scattered in the grass. A pomegranate or two split open. A small woven blanket.
Behind them: soft rolling hills, a few round trees, tall grass, and a hollow trunk with a simple beehive and three or four little bees drawn as small loops in the air.
No buildings, no crowds, nothing modern.

LIGHT:
Soft, warm, late-afternoon light. Gentle washes rather than hard shadows, and a faint golden glow around the group.

NO TEXT - this is important:
Do not write any words, letters, Hebrew, numbers, watermark, logo or signature anywhere on the image. The top 22% must stay clean open sky with nothing in it - no lettering, no ornament, no branches or leaves crossing into it. Lettering is added separately afterwards.

Please avoid: photorealism, 3D rendering, glossy digital shading, heavy black outlines, distorted hands, extra limbs, duplicated people, a missing or duplicated pet, and any text or decorative flourish in the upper part of the frame.`
            },
        }
    },

    'yom-kippur': {
        mode: 'cards',
        tag: 'יום כיפור · תשפ״ז',
        h1: 'ברכה ליום כיפור',
        emoji: '🕊️',
        footer: 'גמר חתימה טובה וצום קל 🕊️',
        shareTitle: 'גמר חתימה טובה',
        cards: [
            { slug: 'yk-card1', label: 'נר', tone: 'dark' },
            { slug: 'yk-card2', label: 'שחר', tone: 'light' },
            { slug: 'yk-card3', label: 'שער פתוח', tone: 'light' },
            { slug: 'yk-card4', label: 'רימון', tone: 'light' },
            { slug: 'yk-card5', label: 'ענף זית', tone: 'light' },
            { slug: 'yk-card6', label: 'לבן', tone: 'light' },
            { slug: 'yk-card7', label: 'תקיעת שופר', tone: 'dark' },
            { slug: 'yk-card8', label: 'טלית וסידור', tone: 'light' },
            { slug: 'yk-card9', label: 'ספר תורה בירושלים', tone: 'dark' },
        ],
        greetings: [
            { title: 'גמר חתימה טובה וצום קל', body: 'שנזכה להניח מאחור את הצער, לסלוח לאחרים ולעצמנו, ולהתחיל דף חדש ונקי.' },
            { title: 'גמר חתימה טובה', body: 'ביום הקדוש הזה, שבו הלבבות נפתחים והנפש מבקשת טוהר וסליחה - שנה של בריאות איתנה, שלווה ואהבה.' },
            { title: 'צום קל ומועיל', body: 'שתיכתבו ותיחתמו בספר החיים והברכה, ושנה מתוקה תבוא עלינו לטובה.' },
            { title: 'שתתקבל תפילתכם', body: 'שנה של שקט, של בריאות, ושל בשורות טובות - לכם ולכל מי שיקר לכם.' },
        ],
    },

    'sukkot': {
        tag: 'סוכות · תשפ״ז',
        h1: 'גלויה לסוכות',
        emoji: '🌿',
        footer: 'חג סוכות שמח 🌿',
        shareTitle: 'חג סוכות שמח',
        styles: [
            { key: 'sukkah', label: 'סוכת שלום 🌿', after: 'images/after1.webp' },
            { key: 'minim', label: 'ארבעת המינים 🌴', after: 'images/after2.webp' },
            { key: 'simcha', label: 'ושמחת בחגך 🍷', after: 'images/after3.webp' },
        ],
        greetings: [
            { title: 'חג סוכות שמח', body: 'שנזכה לשבת בסוכה של שלום, להכניס אורחים באהבה, ושנתמלא בשמחה ובברכה.' },
            { title: 'חג שמח ומאיר', body: 'שסוכת שלומך תפרוס עלינו ועל כל בני משפחתנו, ושנמשיך לחוות רגעים של ביחד, חום ואהבה.' },
            { title: 'חג סוכות שמח', body: 'יהי רצון שכשם שאנו מאגדים את ארבעת המינים יחד, כך תתאחד ותתחזק האהבה בינינו תמיד.' },
        ],
        prompts: {
            sukkah: {
                chatgpt: `${LEAD_GPT}Edit the photo into a warm Sukkot greeting image.

FRAME:
Portrait orientation, 4:5 aspect ratio (for example 1080 x 1350). Do not produce a tall narrow image.
Compose top to bottom as: top ~22% the sukkah roof with open sky showing through, left clear; middle ~58% the people standing together; bottom ~20% the decorated sukkah wall behind them.
Frame this as a medium shot, not a close-up.

${FRAME_GPT}

SCENE:
Remove the original background completely and place everyone standing together inside a sukkah on a mild autumn evening.
They stand close together and relaxed, facing the camera, an arm around a shoulder. Nobody is seated and nobody is on the floor.
The sukkah: a simple wooden frame hung all around with flowing WHITE FABRIC - light white cotton sheets draped from the beams down to the ground on every side, gathered and tied back at the corners, stirring gently in the evening air. The walls are white cloth, NOT bamboo, NOT reed matting, NOT woven mats, NOT wooden boards.
The roof is green palm fronds and leafy branches laid loosely across the beams, with clear gaps letting the deep blue evening sky and a few early stars show through.
Hanging from the roof: paper chains in warm colours, a string of small warm lights, a few dried pomegranates and painted gourds. A couple of children's drawings pinned to the white cloth.
There is NO table in this image, and no food of any kind. The sukkah itself is the subject.

LIGHT AND LOOK:
Warm golden light from the hanging bulbs, cool blue evening sky above through the roof. Soft shadows, cosy and intimate, natural colour, gentle depth of field. Blend everyone in seamlessly - no cut-out edges, matched colour temperature, correct scale and perspective.

${NOTEXT_GPT}
Also avoid: a table, food, plates or dishes of any kind, floor cushions, mats or beanbags, anyone sitting on the ground, a picnic or tent look, bamboo or reed walls, and a solid opaque roof with no sky showing.`,
                gemini: `Edit the photo into a warm Sukkot greeting image.

FRAME:
Portrait orientation, 4:5 aspect ratio (for example 1080 x 1350). Do not produce a tall narrow image.
Compose top to bottom as: top ~22% the sukkah roof with open sky showing through, left clear; middle ~58% the people standing together; bottom ~20% the decorated sukkah wall behind them.
Frame this as a medium shot, not a close-up.

${FRAME_GPT}

SCENE:
Remove the original background completely and place everyone standing together inside a sukkah on a mild autumn evening.
They stand close together and relaxed, facing the camera, an arm around a shoulder. Nobody is seated and nobody is on the floor.
The sukkah: a simple wooden frame hung all around with flowing WHITE FABRIC - light white cotton sheets draped from the beams down to the ground on every side, gathered and tied back at the corners, stirring gently in the evening air. The walls are white cloth, NOT bamboo, NOT reed matting, NOT woven mats, NOT wooden boards.
The roof is green palm fronds and leafy branches laid loosely across the beams, with clear gaps letting the deep blue evening sky and a few early stars show through.
Hanging from the roof: paper chains in warm colours, a string of small warm lights, a few dried pomegranates and painted gourds. A couple of children's drawings pinned to the white cloth.
There is NO table in this image, and no food of any kind. The sukkah itself is the subject.

LIGHT AND LOOK:
Warm golden light from the hanging bulbs, cool blue evening sky above through the roof. Soft shadows, cosy and intimate, natural colour, gentle depth of field. Blend everyone in seamlessly - no cut-out edges, matched colour temperature, correct scale and perspective.

${NOTEXT_GPT}
Also avoid: a table, food, plates or dishes of any kind, floor cushions, mats or beanbags, anyone sitting on the ground, a picnic or tent look, bamboo or reed walls, and a solid opaque roof with no sky showing.`
            },
            minim: {
                chatgpt: `${LEAD_GPT}Edit the photo into a bright Sukkot greeting image.

FRAME:
Portrait orientation, 4:5 aspect ratio (for example 1080 x 1350). Do not produce a tall narrow image.
Compose top to bottom as: top ~20% open sky, left completely empty; middle ~55% the people, framed from the waist up; bottom ~25% greenery and a low table edge.
Frame this as a medium shot so the hands and what they hold are clearly visible.

${FRAME_GPT}

WHAT THEY HOLD - get these right, they are specific objects:
One adult holds a lulav upright in one hand: a single tall straight closed palm frond, roughly forearm length, standing vertically. Bound at its base are three myrtle branches with small dense round leaves on one side, and two willow branches with long narrow leaves on the other, in a woven palm-leaf holder.
In the other hand, cupped close to the chest, is an etrog: a yellow citron, larger and more oval than a lemon, with bumpy ridged skin and a small protruding tip at the top.
Everyone else simply stands close together.

SCENE:
Remove the original background and place them outdoors beside a sukkah on a clear bright morning - woven mat walls and a leafy roof edge at one side, a stone wall and olive trees behind, open sky above.

LIGHT AND LOOK:
Bright clean morning daylight, gently warm. Soft even fill so no face falls into shadow. Natural colour, photorealistic, shallow depth of field with the background softly blurred. Blend everyone in seamlessly - no cut-out edges, matched colour temperature, realistic shadows.

${NOTEXT_GPT}
Also avoid: an etrog that looks like a plain smooth lemon, a bowl of lemons anywhere in the frame, a lulav that looks like a loose bouquet or an open fan, and more than one lulav.`,
                gemini: `Edit the photo into a bright Sukkot greeting image.

FRAME:
Portrait orientation, 4:5 aspect ratio (for example 1080 x 1350). Do not produce a tall narrow image.
Compose top to bottom as: top ~20% open sky, left completely empty; middle ~55% the people, framed from the waist up; bottom ~25% greenery and a low table edge.
Frame this as a medium shot so the hands and what they hold are clearly visible.

${FRAME_GPT}

WHAT THEY HOLD - get these right, they are specific objects:
One adult holds a lulav upright in one hand: a single tall straight closed palm frond, roughly forearm length, standing vertically. Bound at its base are three myrtle branches with small dense round leaves on one side, and two willow branches with long narrow leaves on the other, in a woven palm-leaf holder.
In the other hand, cupped close to the chest, is an etrog: a yellow citron, larger and more oval than a lemon, with bumpy ridged skin and a small protruding tip at the top.
Everyone else simply stands close together.

SCENE:
Remove the original background and place them outdoors beside a sukkah on a clear bright morning - woven mat walls and a leafy roof edge at one side, a stone wall and olive trees behind, open sky above.

LIGHT AND LOOK:
Bright clean morning daylight, gently warm. Soft even fill so no face falls into shadow. Natural colour, photorealistic, shallow depth of field with the background softly blurred. Blend everyone in seamlessly - no cut-out edges, matched colour temperature, realistic shadows.

${NOTEXT_GPT}
Also avoid: an etrog that looks like a plain smooth lemon, a bowl of lemons anywhere in the frame, a lulav that looks like a loose bouquet or an open fan, and more than one lulav.`
            },
            simcha: {
                chatgpt: `${LEAD_GPT}Edit the photo into a festive Sukkot greeting image.

FRAME:
Portrait orientation, 4:5 aspect ratio (for example 1080 x 1350). Do not produce a tall narrow image.
Compose top to bottom as: top ~20% the sukkah roof and decorations, left clear; middle ~45% the people seated behind the table; bottom ~35% the table, clearly visible.
Frame this as a medium shot. Pull back far enough that the table reads clearly.

${FRAME_GPT}

SCENE:
Remove the original background and seat everyone at a holiday table inside a sukkah in the evening. Adults behind the table, children in front, all facing the camera with forearms resting on it.

THE TABLE - keep it simple, this matters:
A plain cloth, and on it only three things:
1. A platter of roast meat at the centre, carved.
2. A decanter of red wine with a few filled glasses.
3. A round challah on a wooden board.
Nothing else. No salads, no side dishes, no fruit bowls, no vegetables, no candlesticks, no decorative clutter. The table reads as generous but restrained - three things, well lit, with clean cloth showing between them.

ABOVE THEM:
The sukkah roof of green palm fronds with warm string lights and hanging paper chains.

LIGHT AND LOOK:
Warm string lights as the main source, coming from above onto the faces. Rich but restrained - deep reds, warm wood, green above. Natural colour, glowing highlights. Blend everyone in seamlessly - no cut-out edges, matched colour temperature, realistic contact shadows where arms rest on the table.

${NOTEXT_GPT}
Also avoid: a crowded table, salads, side dishes, fruit bowls or extra tableware.`,
                gemini: `Edit the photo into a festive Sukkot greeting image.

FRAME:
Portrait orientation, 4:5 aspect ratio (for example 1080 x 1350). Do not produce a tall narrow image.
Compose top to bottom as: top ~20% the sukkah roof and decorations, left clear; middle ~45% the people seated behind the table; bottom ~35% the table, clearly visible.
Frame this as a medium shot. Pull back far enough that the table reads clearly.

${FRAME_GPT}

SCENE:
Remove the original background and seat everyone at a holiday table inside a sukkah in the evening. Adults behind the table, children in front, all facing the camera with forearms resting on it.

THE TABLE - keep it simple, this matters:
A plain cloth, and on it only three things:
1. A platter of roast meat at the centre, carved.
2. A decanter of red wine with a few filled glasses.
3. A round challah on a wooden board.
Nothing else. No salads, no side dishes, no fruit bowls, no vegetables, no candlesticks, no decorative clutter. The table reads as generous but restrained - three things, well lit, with clean cloth showing between them.

ABOVE THEM:
The sukkah roof of green palm fronds with warm string lights and hanging paper chains.

LIGHT AND LOOK:
Warm string lights as the main source, coming from above onto the faces. Rich but restrained - deep reds, warm wood, green above. Natural colour, glowing highlights. Blend everyone in seamlessly - no cut-out edges, matched colour temperature, realistic contact shadows where arms rest on the table.

${NOTEXT_GPT}
Also avoid: a crowded table, salads, side dishes, fruit bowls or extra tableware.`
            },
        }
    },
};

/* app.js wants a flat key -> preview-image map */
Object.values(FESTIVALS).forEach((f) => {
    if (f.styles) f.stylePreview = Object.fromEntries(f.styles.map((s) => [s.key, s.after]));
});
