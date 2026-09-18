import type { SectionId } from "./content"

export type Medium = "Photography" | "Videography" | "Both"

export type LearningLink = {
  label: string
  source: string
  href: string
}

export type LearningItem = {
  id: string
  title: string
  image: string
  medium: Medium
  duration: string
  summary: string
  outcome: string
  chapters?: { title: string; body: string; tryIt?: string }[]
  keyPoints?: string[]
  practice?: string
  links?: LearningLink[]
}

export const SECTION_INTROS: Record<SectionId, { kicker: string; description: string }> = {
  tutorials: {
    kicker: "Start here",
    description:
      "Short courses in a useful order. Read a chapter, change one setting, then make something with it.",
  },
  guides: {
    kicker: "Keep close on a shoot",
    description:
      "Focused answers for camera settings, technique, and common problems. Pick the guide you need right now.",
  },
  best: {
    kicker: "A trusted shelf",
    description:
      "Thoughtful teachers and working image-makers worth learning from after the fundamentals click.",
  },
}

const photoBasics: LearningLink = {
  label: "Start the free photography basics course",
  source: "Photography Life",
  href: "https://photographylife.com/photography-basics-video-course",
}

const exposureGuide: LearningLink = {
  label: "The exposure triangle",
  source: "StudioBinder",
  href: "https://www.studiobinder.com/blog/what-is-the-exposure-triangle-explained/",
}

export const SECTION_LIBRARY: Record<SectionId, LearningItem[]> = {
  tutorials: [
    {
      id: "photo-first-frame",
      image: "/images/golden_hour.png",
      title: "Your camera to your first intentional frame",
      medium: "Photography",
      duration: "35 min",
      summary:
        "Learn what a camera actually controls, leave Auto without panic, and make a photograph on purpose.",
      outcome: "You will make three correctly exposed photographs with three different creative choices.",
      chapters: [
        {
          title: "01 · What photography is",
          body: "Photography is deciding what light, moment, and arrangement belong inside a frame. The camera records that decision. A phone, compact, DSLR, and mirrorless camera all do the same basic job: a lens focuses light onto a light-sensitive surface.",
          tryIt: "Photograph the same subject from eye level, ground level, and very close. Do not change any settings yet.",
        },
        {
          title: "02 · Meet the camera",
          body: "The body holds the sensor, controls, battery, and storage. The lens controls angle of view and aperture. Learn where your shutter button, mode dial, exposure compensation, autofocus control, and playback button are. Your manual is useful; you do not need to memorise it.",
          tryIt: "Find those five controls, format an empty card in-camera, and set the file type to JPEG + RAW if available.",
        },
        {
          title: "03 · Exposure is a balance",
          body: "Aperture controls the size of the lens opening, shutter speed controls how long light reaches the sensor, and ISO controls amplification. Together they set brightness, but each also changes the look: depth, motion, or noise.",
          tryIt: "Use Program mode and rotate the dial. Notice how aperture and shutter speed trade places while brightness stays similar.",
        },
        {
          title: "04 · Use Aperture Priority first",
          body: "A or Av mode lets you choose aperture while the camera chooses shutter speed. Start around f/4 for one person or detail, and f/8 for a group or landscape. Watch the shutter speed and raise ISO when it becomes too slow to hand-hold.",
          tryIt: "Make the same portrait at your widest aperture and at f/8. Compare the background and sharp area.",
        },
        {
          title: "05 · Read the result",
          body: "Check the histogram, not only screen brightness. A graph piled against the right edge may mean lost highlights; against the left may mean blocked shadows. Blinkies or highlight warnings show clipped bright areas. Protect important highlights, then decide how much shadow you can accept.",
          tryIt: "Photograph a window-lit scene at −1, 0, and +1 exposure compensation. Choose the frame with the detail you care about.",
        },
      ],
      practice: "Make a three-frame story: a wide view, a medium view, and one close detail. Keep one clear subject in every frame.",
      links: [photoBasics, exposureGuide],
    },
    {
      id: "photo-exposure",
      image: "/images/potw_40.jpg",
      title: "Control light with shutter, aperture, and ISO",
      medium: "Photography",
      duration: "30 min",
      summary:
        "Understand the exposure triangle through visible results instead of memorising definitions.",
      outcome: "You will know which setting to change first for depth, motion, or low light.",
      chapters: [
        {
          title: "01 · Shutter speed draws time",
          body: "Fast speeds such as 1/1000 freeze action. Slow speeds such as 1/15 show movement and camera shake. A practical hand-held starting point is a shutter speed at least as fast as 1 divided by your full-frame-equivalent focal length, then adjust for your steadiness and stabilisation.",
          tryIt: "Photograph moving feet at 1/1000, 1/125, and 1/15. Pan with the subject for the slow frame.",
        },
        {
          title: "02 · Aperture controls depth",
          body: "A smaller f-number means a wider opening, more light, and usually shallower depth of field. A larger f-number means a smaller opening and usually more depth. Subject distance and focal length also strongly affect background blur.",
          tryIt: "Keep your framing fixed and compare the widest aperture with f/8. Focus on the same point.",
        },
        {
          title: "03 · ISO is the last lever",
          body: "Raise ISO when shutter and aperture can no longer give a usable exposure. Higher ISO usually reveals more noise and reduces editing latitude, but a sharp noisy image is often better than a blurred clean one. Auto ISO is useful when paired with a sensible minimum shutter speed.",
          tryIt: "Make the same indoor frame at ISO 100, 800, and 3200, matching brightness with shutter speed. Compare at normal viewing size.",
        },
        {
          title: "04 · Choose by intention",
          body: "For motion, choose shutter first. For depth of field, choose aperture first. For changing light, use Auto ISO within a limit you have tested. Manual mode is valuable when the light is stable; it is not a badge of seriousness.",
          tryIt: "Shoot one frozen action frame, one motion-blur frame, and one shallow-depth portrait.",
        },
      ],
      practice: "Make a nine-frame contact sheet: three shutter speeds × three apertures. Write one sentence about what changed in each row.",
      links: [exposureGuide],
    },
    {
      id: "photo-composition",
      image: "/images/silence_of_shadows.png",
      title: "Composition and visual storytelling",
      medium: "Both",
      duration: "28 min",
      summary:
        "Build frames that guide attention and connect into a story, for stills or moving images.",
      outcome: "You will make a coherent five-shot sequence without relying on expensive gear.",
      chapters: [
        {
          title: "01 · Decide what the frame is about",
          body: "Before raising the camera, finish this sentence: ‘This frame is about…’. Remove or reposition anything that competes with that answer. Composition starts with exclusion.",
          tryIt: "Make one cluttered frame, then simplify it by changing only your position.",
        },
        {
          title: "02 · Place visual weight",
          body: "The rule of thirds is a starting grid, not a law. Centred symmetry feels stable; off-centre placement creates direction; negative space gives the subject room or isolation. Bright, sharp, large, and high-contrast objects pull attention first.",
          tryIt: "Make centred, thirds-based, and edge-weighted versions of the same subject.",
        },
        {
          title: "03 · Create depth",
          body: "Use foreground, middle ground, and background. Leading lines can connect these layers. Overlap, scale, atmosphere, and focus all help a flat image feel spatial.",
          tryIt: "Frame through a doorway, leaves, or another foreground object without hiding your subject.",
        },
        {
          title: "04 · Sequence for a viewer",
          body: "A simple sequence uses an establishing wide shot, a medium action, a close detail, a point of view, and a closing image. Each new frame should add information rather than repeat the previous one.",
          tryIt: "Tell the story of making tea, crossing campus, or setting up a camera in exactly five frames.",
        },
      ],
      practice: "Photograph or film a five-shot sequence. Show it to someone without explanation and ask what they understood.",
      links: [
        {
          label: "Rule of thirds with examples",
          source: "StudioBinder",
          href: "https://www.studiobinder.com/blog/what-is-the-rule-of-thirds/",
        },
      ],
    },
    {
      id: "video-first-sequence",
      image: "/images/ff_holi_1.png",
      title: "Your first clean video sequence",
      medium: "Videography",
      duration: "40 min",
      summary:
        "Set frame rate, shutter, white balance, focus, and sound before filming a short sequence.",
      outcome: "You will capture an editable 20–30 second sequence with consistent pictures and usable sound.",
      chapters: [
        {
          title: "01 · Pick the delivery format",
          body: "Use 24 or 25 fps for a familiar cinematic cadence, or 30 fps for general online work. Use 50 or 60 fps only when you plan slow motion or need very smooth motion. 1080p is enough to learn; 4K gives crop room but needs more storage and processing.",
          tryIt: "Set 1080p at your local 25 or 30 fps standard and record ten seconds of movement.",
        },
        {
          title: "02 · Set natural motion blur",
          body: "As a starting point, use a shutter speed close to twice the frame rate: 1/50 for 25 fps or 1/60 for 30 fps. This is commonly called the 180-degree shutter rule. Change aperture, ISO, light, or an ND filter to control exposure before abandoning that shutter.",
          tryIt: "Wave a hand through frame at the normal shutter, then at a much faster shutter. Compare the motion texture.",
        },
        {
          title: "03 · Lock colour and focus",
          body: "Choose a white-balance preset or Kelvin value instead of Auto when a scene must cut together. Use continuous autofocus for moving people and manual focus for controlled shots. Check focus at the subject's eyes and avoid changing settings mid-take.",
          tryIt: "Record three matching clips with one locked white balance, then compare them with Auto white balance clips.",
        },
        {
          title: "04 · Record sound on purpose",
          body: "Move the microphone close to the voice. Watch meters and keep peaks safely below clipping, often around −12 dB as a practical target. Record ten seconds of room tone. Wind and clothing noise are easier to prevent than repair.",
          tryIt: "Record the same sentence from arm's length and from across the room. Listen with headphones.",
        },
        {
          title: "05 · Get edit-friendly coverage",
          body: "Hold each shot steady for a few seconds before and after the action. Capture wide, medium, close, detail, and reaction shots. Repeat important actions. Continuity matters more than flashy movement.",
          tryIt: "Film a five-shot sequence and hold every clip for at least eight seconds.",
        },
      ],
      practice: "Film and edit a 20–30 second silent process story. Add natural sound only after the picture order works.",
      links: [
        {
          label: "The 180-degree shutter rule",
          source: "StudioBinder",
          href: "https://www.studiobinder.com/blog/what-is-the-180-degree-shutter-rule/",
        },
      ],
    },
    {
      id: "video-light-movement",
      image: "/images/shutter_safari_piyush.jpg",
      title: "Light, sound, and camera movement",
      medium: "Videography",
      duration: "32 min",
      summary:
        "Use available light, clean audio, and motivated movement to make simple footage feel deliberate.",
      outcome: "You will light and record a short interview with one window and one microphone.",
      chapters: [
        {
          title: "01 · Read light direction",
          body: "Front light is clear and even, side light reveals shape, and backlight separates a subject but needs careful exposure. Start with a window at roughly 45 degrees to the face. Turn off mixed-colour room lights when they make skin tones inconsistent.",
          tryIt: "Rotate a subject beside a window and record front, side, and backlit versions.",
        },
        {
          title: "02 · Shape before adding gear",
          body: "Move the subject closer to the window for softer, brighter light. Use a white wall or card to lift shadows, or a dark cloth to deepen them. Distance and angle often matter more than buying another lamp.",
          tryIt: "Compare no fill, white-card fill, and dark negative fill on the shadow side.",
        },
        {
          title: "03 · Move only for a reason",
          body: "A locked frame lets performance lead. A pan reveals or follows; a push-in increases attention; a pull-back releases it. Rehearse the beginning and end, keep horizons level, and use your body as a stabiliser before reaching for a gimbal.",
          tryIt: "Record the same action locked-off, with a pan, and with a slow push-in. Choose the version that best serves the action.",
        },
        {
          title: "04 · Protect the voice",
          body: "Place a lavalier around a hand-span from the mouth or a directional microphone just outside frame. Monitor with headphones, reduce background noise at the source, and record a backup when the moment cannot be repeated.",
          tryIt: "Record thirty seconds of dialogue plus room tone and listen for hum, echo, clipping, and clothing rustle.",
        },
      ],
      practice: "Record a one-minute interview with window light, clean dialogue, one wide answer, and three cutaway shots.",
      links: [
        { label: "Shape natural and simple light", source: "StudioBinder", href: "https://www.studiobinder.com/blog/basics-of-film-lighting-techniques/" },
        { label: "Record clearer dialogue", source: "StudioBinder", href: "https://www.studiobinder.com/blog/sound-recording/" },
      ],
    },
    {
      id: "edit-first-story",
      image: "/images/daily_hustle.png",
      title: "Edit your first photo and video story",
      medium: "Both",
      duration: "35 min",
      summary:
        "Select, correct, and sequence without letting effects overpower the idea.",
      outcome: "You will export one finished photograph and one short video in sensible web formats.",
      chapters: [
        {
          title: "01 · Select before correcting",
          body: "Reject technical failures, then compare moments and meaning. Similar frames compete with each other, so keep the strongest. A small coherent set is more useful than a large average one.",
          tryIt: "Choose five frames from twenty without editing them. Explain each choice in one sentence.",
        },
        {
          title: "02 · Correct in a stable order",
          body: "Start with crop and horizon, then white balance, exposure, contrast, highlights and shadows, colour, and local adjustments. For video, build the story cut before colour or effects. Make one change at a time and compare with the original.",
          tryIt: "Reset one image and rebuild the edit in that order.",
        },
        {
          title: "03 · Make clean cuts",
          body: "Cut on action when possible and remove dead time. Let audio lead or trail a cut when it makes the transition smoother. Use dissolves only when time, memory, or mood calls for them; a direct cut is the default.",
          tryIt: "Create a 20-second sequence using only straight cuts and natural sound.",
        },
        {
          title: "04 · Export for the destination",
          body: "Keep a high-quality master. For web photos, export sRGB JPEG at an appropriate pixel size. For general web video, H.264 MP4 is widely compatible; match the timeline resolution and frame rate, and review the exported file from beginning to end.",
          tryIt: "Open the export on a phone and laptop. Check framing, colour, sound, subtitles, and file size.",
        },
      ],
      practice: "Publish nothing yet. Leave the work overnight, review once with fresh eyes, then make only changes you can name.",
      links: [
        { label: "Learn video editing with free lessons", source: "Blackmagic Design", href: "https://www.blackmagicdesign.com/products/davinciresolve/training" },
        { label: "Edit photographs with an open-source tool", source: "darktable", href: "https://docs.darktable.org/usermanual/development/en/" },
      ],
    },
  ],
  guides: [
    {
      id: "what-is-photography",
      image: "/images/daily_hustle.png",
      title: "What is photography?",
      medium: "Photography",
      duration: "4 min",
      summary: "A practical definition of the craft: notice, choose, time, and frame.",
      outcome: "Separate the photographer's decisions from the camera's automation.",
      chapters: [
        { title: "A photograph is a decision", body: "A camera gathers light, but it cannot decide why a moment matters. You choose what stays inside the frame, where the viewer looks first, and when to release the shutter. The same scene can become a portrait, a study of shape, or a record of an event depending on those choices.", tryIt: "Photograph one scene from three positions. Name the subject of each frame before reviewing it." },
        { title: "Technique serves attention", body: "Exposure, focus, and sharpness make your intention easier to read; none is the subject by itself. Start by finding the light and the relationship between subjects. Then adjust only the camera control that helps you show it. Phone cameras count too: viewpoint and timing remain yours even when exposure is automatic." },
      ],
      keyPoints: [
        "Light makes the image; timing and framing give it meaning.",
        "A better viewpoint usually improves a photograph more than a newer camera.",
        "Technical quality supports the subject. It is not the subject.",
      ],
      practice: "Make ten frames with one focal length and one subject. Change only position and timing.",
      links: [photoBasics],
    },
    {
      id: "camera-equipment",
      image: "/images/shutter_safari_winner.jpg",
      title: "Camera equipment without the shopping spiral",
      medium: "Both",
      duration: "6 min",
      summary: "What bodies, lenses, tripods, microphones, lights, cards, and batteries actually solve.",
      outcome: "Build a minimum kit around the work you want to make.",
      chapters: [
        { title: "Start with the job, not the catalogue", body: "For stills, a charged phone or camera, enough storage, and one versatile lens can cover a surprising number of assignments. A wider lens helps in tight spaces; a longer lens fills the frame from farther away. Neither improves a photograph automatically. Borrow different lenses before deciding which view you actually miss.", tryIt: "Write down the last three photos you could not make and identify the specific limitation in each." },
        { title: "A small video kit", body: "For video, plan power, memory cards, and a way to monitor sound before adding stabilizers or lights. A simple tripod solves unwanted shake; a microphone near the speaker usually helps more than an expensive mic mounted far away. Check your camera's input connector and whether the mic needs power before a shoot." },
      ],
      keyPoints: [
        "Start with the camera you already have and learn where it fails you.",
        "A standard zoom or one normal prime covers most student work.",
        "For video, clean sound and stable power/storage often matter before another lens.",
        "Buy or borrow only when a repeated limitation has a name.",
      ],
      practice: "Write your next shoot, its constraints, and the smallest kit that covers them.",
      links: [{ label: "Understand what different lenses actually change", source: "StudioBinder", href: "https://www.studiobinder.com/blog/understanding-camera-lenses-explained/" }],
    },
    {
      id: "shutter-speed",
      image: "/images/ff_holi_1.png",
      title: "Shutter speed",
      medium: "Both",
      duration: "5 min",
      summary: "Freeze, blur, or give video natural motion by controlling exposure time.",
      outcome: "Pick shutter speed from the movement you want to show.",
      chapters: [
        { title: "What the number means", body: "Shutter speed is the time each photograph is exposed. At 1/1000 second a moving cyclist may look frozen; at 1/30 second the same movement may streak. A slower exposure also records more light, but the camera can move during it. Brace your arms or use a support when testing slow speeds.", tryIt: "Keep the subject and framing fixed while trying 1/30, 1/125, and 1/500 second." },
        { title: "Video needs a different starting point", body: "Each video frame has its own exposure time. A useful starting point is a shutter near twice the frame interval: about 1/50 second at 25 fps or 1/60 at 30 fps. This keeps motion blur familiar, but it is a convention, not a law. In bright light, reduce light with an ND filter or aperture rather than forcing an extremely fast shutter by accident." },
      ],
      keyPoints: [
        "Fast shutter freezes action but admits less light.",
        "Slow shutter shows motion and magnifies camera shake.",
        "For video, start near 1/50 at 25 fps or 1/60 at 30 fps.",
      ],
      practice: "Shoot one moving subject at three speeds without changing the framing.",
      links: [
        {
          label: "Shutter speed explained",
          source: "StudioBinder",
          href: "https://www.studiobinder.com/blog/what-is-shutter-speed/",
        },
      ],
    },
    {
      id: "aperture",
      image: "/images/macro_magiv.png",
      title: "Aperture and depth of field",
      medium: "Both",
      duration: "5 min",
      summary: "Control lens opening, brightness, and how much of the scene appears sharp.",
      outcome: "Choose aperture for the relationship between subject and background.",
      chapters: [
        { title: "Read the f-number", body: "Aperture is the adjustable opening inside the lens. A low number such as f/2.8 is a wider opening and lets in more light; f/8 is narrower and lets in less. A wide opening often softens the background, which can separate a portrait from a busy location.", tryIt: "Keep your subject in the same place and compare f/2.8 (or your widest setting) with f/8." },
        { title: "Depth is not controlled by aperture alone", body: "Move closer to a subject or move the background farther away and background blur becomes more obvious. For a group, use a narrower aperture and check that people at different distances are acceptably sharp. In video, very shallow focus may look attractive in a paused frame but be difficult to maintain when the subject moves." },
      ],
      keyPoints: [
        "A low f-number is a wide opening; a high f-number is a small opening.",
        "Depth also changes with focal length, subject distance, and background distance.",
        "Lenses are often sharpest a few stops down, but the right look matters more.",
      ],
      practice: "Photograph a person at the widest aperture and at f/8 from the same position.",
      links: [{ label: "See aperture and depth of field explained", source: "StudioBinder", href: "https://www.studiobinder.com/blog/what-is-aperture/" }],
    },
    {
      id: "iso",
      image: "/images/shutter_safari_piyush.jpg",
      title: "ISO without fear",
      medium: "Both",
      duration: "4 min",
      summary: "Use ISO as a practical brightness control while understanding noise and latitude.",
      outcome: "Raise ISO when it protects motion, depth, or the moment.",
      chapters: [
        { title: "What ISO changes", body: "On a digital camera, raising ISO makes the captured signal brighter without collecting more light. It can reveal more noise and may reduce highlight headroom, but a usable noisy frame is often better than a blurred or missed one. Do not lower your shutter below what your subject needs just to keep ISO at its minimum.", tryIt: "Photograph a moving person indoors with Auto ISO, then inspect both sharpness and noise." },
        { title: "Choose a sensible starting point", body: "Use the camera's base ISO in strong light when shutter speed and aperture already work. In dim light, set the shutter and depth you need first, then let ISO rise. For video, test your camera's normal and high-gain settings; some models behave differently at particular ISO values. Avoid treating one maximum number as universal." },
      ],
      keyPoints: [
        "Use the lowest ISO that still permits the shutter and aperture you need.",
        "Noise is usually preferable to motion blur or a missed photograph.",
        "Test your own camera instead of trusting a universal maximum ISO.",
      ],
      practice: "Make and compare the same scene across your camera's common ISO values.",
      links: [{ label: "Understand ISO with visual examples", source: "StudioBinder", href: "https://www.studiobinder.com/blog/what-is-iso/" }],
    },
    {
      id: "composition",
      image: "/images/silence_of_shadows.png",
      title: "Composition",
      medium: "Both",
      duration: "7 min",
      summary: "Arrange shape, light, colour, space, and moment so the eye knows where to go.",
      outcome: "Build clear frames before reaching for compositional rules.",
      chapters: [
        { title: "Give the eye somewhere to land", body: "Ask what the viewer should notice first. Move the camera until that subject separates from the background by light, colour, size, or space. Check the edges for cut-off hands, bright distractions, and objects apparently growing from a person's head. These simple corrections often matter more than a grid overlay.", tryIt: "Make the same frame once from eye level and once from a lower or higher position." },
        { title: "Use rules as options", body: "Thirds can move a subject off-centre; symmetry can create stillness; leading lines can direct attention. None guarantees a strong picture. In video, consider where a moving subject will travel and leave room in that direction. A sequence also needs variety: pair a wide scene-setter with a medium action and a close detail." },
      ],
      keyPoints: [
        "Identify the subject, remove distractions, then choose balance and depth.",
        "Edges matter: scan all four before pressing record or shutter.",
        "Rules of thirds, symmetry, leading lines, and frames-within-frames are tools, not scores.",
      ],
      practice: "Make five distinct compositions of one ordinary object without moving it.",
      links: [
        {
          label: "Rules of shot composition",
          source: "StudioBinder",
          href: "https://www.studiobinder.com/blog/rules-of-shot-composition-in-film/",
        },
      ],
    },
    {
      id: "metering",
      image: "/images/golden_hour.png",
      title: "Metering and exposure compensation",
      medium: "Photography",
      duration: "5 min",
      summary: "Understand what the camera thinks is bright and tell it when that guess is wrong.",
      outcome: "Use matrix, centre-weighted, or spot metering with intention.",
      chapters: [
        { title: "What the meter assumes", body: "A camera meter reads reflected light and proposes an exposure, not an artistic answer. Matrix or evaluative mode considers much of the scene and is a reliable starting point. Very bright snow or a dark stage can fool that average: the camera may try to make either scene look middle-bright.", tryIt: "Fill the frame with white paper, then dark fabric. Notice how the automatic exposure changes." },
        { title: "Correct the guess", body: "In Program or priority modes, positive exposure compensation makes the image brighter and negative compensation makes it darker. Try small steps and check the histogram or highlight warnings. Spot metering reads a small area, which helps with a backlit face, but the spot must be placed deliberately and some cameras tie it to a specific focus point." },
      ],
      keyPoints: [
        "Matrix or evaluative metering is the dependable default.",
        "Spot metering measures a small area and needs careful placement.",
        "Exposure compensation is the fastest correction in automatic and priority modes.",
      ],
      practice: "Photograph a bright wall and dark fabric at 0, +1, and −1 compensation.",
      links: [{ label: "Learn how reflected-light metering works", source: "Cambridge in Colour", href: "https://www.cambridgeincolour.com/tutorials/camera-metering.htm" }],
    },
    {
      id: "camera-modes",
      image: "/images/potw_40.jpg",
      title: "Camera modes",
      medium: "Both",
      duration: "5 min",
      summary: "Choose Auto, Program, Aperture Priority, Shutter Priority, or Manual for the scene.",
      outcome: "Use the least complicated mode that preserves your creative decision.",
      chapters: [
        { title: "Let the camera handle what does not matter", body: "In Program (P), the camera chooses aperture and shutter while you can still adjust settings such as exposure compensation. In Aperture Priority (A/Av), you pick depth of field and the camera chooses shutter. In Shutter Priority (S/Tv), you pick the motion rendering and the camera chooses aperture. Watch the resulting value so the camera does not choose something impractical.", tryIt: "Photograph one static subject in P, A/Av, and S/Tv. Note which setting you controlled each time." },
        { title: "Use Manual for consistency", body: "Manual (M) is helpful when the light stays fixed, such as an interview or a stage with stable lighting, because exposure will not drift as the composition changes. It is not a badge of skill. Auto ISO can still alter brightness in M on many cameras, so turn it off when you need settings truly locked." },
      ],
      keyPoints: [
        "A/Av controls depth; S/Tv controls motion; Manual locks consistency.",
        "Program is useful when the moment matters more than a specific setting.",
        "Manual exposure is ideal for stable light and video continuity, not every situation.",
      ],
      practice: "Shoot one scene in Program, Aperture Priority, and Manual. Compare effort and consistency.",
      links: [photoBasics],
    },
    {
      id: "focusing",
      image: "/images/macro_magiv.png",
      title: "Focusing",
      medium: "Both",
      duration: "6 min",
      summary: "Match autofocus mode and area to still, moving, or controlled subjects.",
      outcome: "Put focus where the viewer expects it and confirm it before moving on.",
      chapters: [
        { title: "Separate focus mode from focus area", body: "Single AF locks focus for a still subject; continuous AF keeps updating as distance changes. The focus area tells the camera where to look: a small point is precise, while tracking can follow a moving subject. Set both deliberately. Face and eye detection help with people, but check that the chosen eye is actually sharp.", tryIt: "Focus on a stationary portrait with a single point, then track someone walking toward you." },
        { title: "Check before leaving", body: "Magnify playback on the eye or important detail rather than trusting a small screen preview. If focus misses repeatedly, increase light, choose a higher-contrast edge, or focus manually. For video, test autofocus before the real take; a focus hunt during dialogue is more distracting than a steady, slightly deeper focus plane." },
      ],
      keyPoints: [
        "Use single AF for still subjects and continuous AF for movement.",
        "A small focus area gives control; tracking helps when movement is unpredictable.",
        "For people, prioritise the nearest eye unless the story asks for something else.",
      ],
      practice: "Track someone walking toward you, then repeat with a static focus point.",
      links: [
        { label: "Focus a portrait on the eyes", source: "Nikon", href: "https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/quick-tips-for-taking-better-portraits" },
        { label: "Track a moving subject", source: "Nikon", href: "https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/photographing-sports-indoors-and-out" },
      ],
    },
    {
      id: "flash",
      image: "/images/shutter_safari_piyush.jpg",
      title: "Flash that does not look like flash",
      medium: "Photography",
      duration: "7 min",
      summary: "Use one flash as fill, bounce, or directional light instead of blasting the subject head-on.",
      outcome: "Balance ambient exposure with a restrained flash contribution.",
      chapters: [
        { title: "Separate room light from flash", body: "First expose the background using the shutter, aperture, and ISO. Then add flash to lift the subject. On many cameras, flash exposure compensation adjusts flash brightness separately from the ambient exposure. Begin with a modest amount of fill rather than trying to turn a dark room into daylight.", tryIt: "Make a no-flash frame, then add low-power flash without changing your viewpoint." },
        { title: "Make the source feel larger", body: "A small flash pointed directly at a face produces hard shadows. If a neutral wall or ceiling is nearby, bouncing the flash spreads the light and softens it. A coloured wall can tint skin, and a very high ceiling may waste most of the light. Check the camera's flash sync limit before selecting a faster shutter speed." },
      ],
      keyPoints: [
        "Expose the room first, then add flash for the subject.",
        "Bounce from a neutral wall or ceiling for a larger, softer source.",
        "Watch sync speed, reflective surfaces, and colour casts from painted walls.",
      ],
      practice: "Compare direct flash, bounced flash, and no flash in the same room.",
      links: [{ label: "Flash direction and exposure basics", source: "Nikon", href: "https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/the-basics-of-flash-photography" }],
    },
    {
      id: "sharp-pictures",
      image: "/images/potw_37.jpg",
      title: "How to take sharp pictures",
      medium: "Photography",
      duration: "6 min",
      summary: "Diagnose missed focus, subject motion, camera shake, and insufficient depth separately.",
      outcome: "Fix the actual cause of softness instead of adding sharpening later.",
      chapters: [
        { title: "Name the kind of blur", body: "If the background is sharp but a moving person is blurred, your shutter was too slow for the subject. If the whole frame smears in one direction, camera shake is likely. If sharp detail lies behind the intended subject, focus landed in the wrong place. If only one of several people is sharp, you may need more depth of field.", tryIt: "Inspect three blurry photos at full size and label the cause before changing a setting." },
        { title: "Fix one cause at a time", body: "For movement, use a faster shutter; for shake, improve your stance, use stabilization, or support the camera. For focus errors, choose a focus point and confirm it on playback. For groups, stop the lens down and arrange people at similar distances. Raising ISO is a reasonable trade if it enables the shutter or aperture you need." },
      ],
      keyPoints: [
        "Zoom in during review: blur direction often reveals shake or subject motion.",
        "Raise shutter speed, stabilise your stance, and use continuous AF for action.",
        "Stop down when several important subjects sit at different distances.",
        "Clean the lens and remove unnecessary filters before blaming the camera.",
      ],
      practice: "Make a sharp portrait at the slowest shutter speed you can reliably hand-hold.",
      links: [{ label: "Hold a camera steadily for sharper frames", source: "Photography Life", href: "https://photographylife.com/how-to-hold-a-camera" }],
    },
    {
      id: "video-basics",
      image: "/images/ff_holi_1.png",
      title: "Frame rate, resolution, and codecs",
      medium: "Videography",
      duration: "7 min",
      summary: "Choose recording settings from playback, storage, editing, and delivery needs.",
      outcome: "Set a simple format that your computer can edit and your audience can watch.",
      chapters: [
        { title: "Choose frame rate before recording", body: "Frame rate is the number of images recorded each second. Use 24, 25, or 30 fps for ordinary real-time footage according to your project's delivery format and local lighting. If you want smooth half-speed playback on a 25 fps timeline, capture at 50 fps and interpret it at 25. High frame rate alone does not create slow motion.", tryIt: "Record the same action at 25 and 50 fps, then play both on a 25 fps timeline." },
        { title: "Resolution is not the whole quality story", body: "1080p and 4K describe frame dimensions, not how cleanly the image is stored. Codec and bitrate affect file size, playback effort, and retained detail. Start with your camera's normal H.264 or H.265 mode, test a short clip in your editor, and check that sound plays. Move to more demanding formats only when a project needs them." },
      ],
      keyPoints: [
        "Choose frame rate before shutter speed; use high frame rates only with a playback plan.",
        "Resolution is frame size; codec controls how that information is compressed.",
        "10-bit and log can help demanding colour work, but add workflow cost for beginners.",
        "Consistency across clips matters more than choosing the largest number.",
      ],
      practice: "Record and edit ten-second clips in your camera's simplest 1080p and 4K options.",
      links: [
        { label: "Frame rate with examples and video", source: "StudioBinder", href: "https://www.studiobinder.com/blog/video-frame-rate/" },
        { label: "Understand video bitrate", source: "StudioBinder", href: "https://www.studiobinder.com/blog/what-is-video-bitrate-definition/" },
      ],
    },
    {
      id: "clean-audio",
      image: "/images/beginner-clean-audio.png",
      title: "Clean audio for video",
      medium: "Videography",
      duration: "6 min",
      summary: "Improve dialogue by microphone placement, monitoring, levels, and room control.",
      outcome: "Record speech that stays clear without clipping or heavy repair.",
      chapters: [
        { title: "Move the mic before buying one", body: "Speech gets clearer when the microphone is close to the speaker. A lavalier on the chest or a boom just outside the frame will usually beat a distant camera-mounted mic. Keep a lav clear of fabric that rubs, and listen for the change in room sound when the speaker turns away.", tryIt: "Record one sentence with the mic near the mouth, then from the camera position. Compare on headphones." },
        { title: "Control the room and levels", body: "Find a quieter space, close windows, stop fans when possible, and soften echo with curtains or blankets. Wear headphones during a test take: the level meter alone cannot reveal hum, rustle, or traffic. Lower gain if loud words clip. Leave headroom rather than making the waveform fill the meter." },
        { title: "Give the edit options", body: "Record about thirty seconds of room tone after the scene, then capture a safety take for important dialogue. If sound is recorded separately, clap once on camera to help sync the files. Label the good take and listen to it before packing up; audio repair is much harder than another recording." },
      ],
      keyPoints: [
        "Distance is decisive: move the microphone closer before buying a costlier one.",
        "Monitor with headphones and leave headroom for louder words.",
        "Reduce fans, traffic, echo, wind, and clothing noise at the source.",
        "Record room tone and a backup for important moments.",
      ],
      practice: "Record one sentence at 20 cm, 1 m, and 3 m. Compare speech-to-room ratio.",
      links: [
        { label: "Place a lavalier microphone correctly", source: "RØDE", href: "https://rode.com/en-us/about/news-info/how-to-use-a-lavalier-mic" },
        { label: "Sound-recording gear and techniques", source: "StudioBinder", href: "https://www.studiobinder.com/blog/sound-recording/" },
      ],
    },
    {
      id: "beginner-tips",
      image: "/images/golden_hour.png",
      title: "Photography and video tips for beginners",
      medium: "Both",
      duration: "5 min",
      summary: "A short operating checklist for making more work and fewer avoidable mistakes.",
      outcome: "Arrive prepared, notice more, and finish what you shoot.",
      chapters: [
        { title: "Before you leave", body: "Charge batteries, format only cards that are safely backed up, clean the front lens element, and confirm date, file format, frame rate, and microphone input. Make one ten-second test recording and play it back with sound. A simple check prevents a whole day of unusable footage.", tryIt: "Write a five-item pre-shoot checklist for your own camera and keep it in your bag." },
        { title: "While you work", body: "Make a wide view to establish place, a medium view to show action, and a close detail to give texture. Keep recording a little before and after the action so edits have room to breathe. Review focus and audio before changing location; do not judge a day only by the camera screen's prettiest frame." },
        { title: "Finish the story", body: "Copy files to two locations before wiping a card. Choose a small set of images or a one-minute sequence, edit it, and note what failed. Repeating one clear exercise teaches more than collecting unfinished footage. Your next shoot should test one specific improvement." },
      ],
      keyPoints: [
        "Charge batteries, clear cards, clean lenses, and verify date, format, frame rate, and audio.",
        "Work a scene: wide, medium, close, high, low, early, and late.",
        "Review mistakes by cause, then design the next shoot to practise that cause.",
        "Back up before formatting and finish small projects regularly.",
      ],
      practice: "Choose one constraint for a seven-day project: one place, lens, colour, or daily time.",
      links: [
        {
          label: "Make photographs feel deliberate",
          source: "Photography Life",
          href: "https://photographylife.com/how-to-make-photos-feel-deliberate",
        },
      ],
    },
  ],
  best: [
    {
      id: "sean-tucker",
      image: "/images/potw_31.jpg",
      title: "Sean Tucker",
      medium: "Photography",
      duration: "YouTube + essays",
      summary: "Clear teaching on light, portraiture, visual philosophy, and building an honest creative practice.",
      outcome: "Best after exposure basics, when you want to develop intention and voice.",
      links: [
        {
          label: "Watch the channel",
          source: "YouTube",
          href: "https://www.youtube.com/@seantuck",
        },
        {
          label: "Browse tutorials",
          source: "Sean Tucker",
          href: "https://www.seantucker.photography/tutorials2",
        },
      ],
    },
    {
      id: "art-of-photography",
      image: "/images/abstract_photography.jpg",
      title: "The Art of Photography",
      medium: "Photography",
      duration: "YouTube",
      summary: "Ted Forbes connects technique with photographic history, books, artists, and the ideas behind images.",
      outcome: "Use it to build visual literacy beyond camera settings.",
      links: [
        {
          label: "Watch the channel",
          source: "YouTube",
          href: "https://www.youtube.com/@TheArtofPhotography",
        },
      ],
    },
    {
      id: "magnum-contact-sheets",
      image: "/images/daily_hustle.png",
      title: "Magnum contact sheets",
      medium: "Photography",
      duration: "Free article",
      summary: "See how Elliott Erwitt worked toward a lasting photograph, frame by frame, through a contact sheet.",
      outcome: "Study selection and timing without opening a paid course.",
      links: [
        {
          label: "Read the contact-sheet story",
          source: "Magnum Photos",
          href: "https://www.magnumphotos.com/theory-and-practice/contact-sheet-mother-child-elliott-erwitt-portrait/",
        },
      ],
    },
    {
      id: "photography-life",
      image: "/images/macro_magiv.png",
      title: "Photography Life",
      medium: "Photography",
      duration: "Article library",
      summary: "A broad, structured library covering exposure, focus, lenses, composition, and field technique.",
      outcome: "Use it as a reference when a camera concept needs a deeper explanation.",
      links: [
        {
          label: "Open Photography Basics",
          source: "Photography Life",
          href: "https://photographylife.com/photography-basics",
        },
      ],
    },
    {
      id: "studiobinder",
      image: "/images/ff_holi_1.png",
      title: "StudioBinder",
      medium: "Videography",
      duration: "YouTube + articles",
      summary: "Highly visual explanations of composition, shot sizes, blocking, lighting, editing, and film language.",
      outcome: "Build a practical vocabulary for planning and discussing moving images.",
      links: [
        {
          label: "Watch the channel",
          source: "YouTube",
          href: "https://www.youtube.com/@StudioBinder",
        },
        {
          label: "Read cinematography techniques",
          source: "StudioBinder",
          href: "https://www.studiobinder.com/blog/cinematography-techniques-no-film-school/",
        },
      ],
    },
    {
      id: "film-riot",
      image: "/images/shutter_safari_piyush.jpg",
      title: "Film Riot",
      medium: "Videography",
      duration: "YouTube",
      summary: "Hands-on filmmaking lessons, lighting builds, camera technique, sound, and achievable effects.",
      outcome: "Follow when you learn best by making a small scene immediately.",
      links: [
        {
          label: "Watch the channel",
          source: "YouTube",
          href: "https://www.youtube.com/@filmriot",
        },
      ],
    },
    {
      id: "gerald-undone",
      image: "/images/potw_40.jpg",
      title: "Gerald Undone",
      medium: "Videography",
      duration: "YouTube",
      summary: "Careful technical explanations of exposure, codecs, colour, autofocus, lenses, and hybrid-camera workflows.",
      outcome: "Use after the first video course when you need to understand why a setting behaves as it does.",
      links: [
        {
          label: "Watch the channel",
          source: "YouTube",
          href: "https://www.youtube.com/@geraldundone",
        },
      ],
    },
    {
      id: "roger-deakins",
      image: "/images/silence_of_shadows.png",
      title: "Roger Deakins forum",
      medium: "Videography",
      duration: "Forum + podcast",
      summary: "Direct answers and long conversations about cinematography, collaboration, lighting, lenses, and set craft.",
      outcome: "Read the reasoning behind restrained, story-first cinematography.",
      links: [
        {
          label: "Explore the forum",
          source: "Roger Deakins",
          href: "https://www.rogerdeakins.com/",
        },
      ],
    },
    {
      id: "american-cinematographer",
      image: "/images/shutter_safari_piyush.jpg",
      title: "American Cinematographer",
      medium: "Videography",
      duration: "Interviews + articles",
      summary: "Production-level breakdowns with cinematographers on lighting, lenses, camera movement, and visual choices.",
      outcome: "Study how technical decisions serve story on finished productions.",
      links: [
        {
          label: "Read the articles",
          source: "ASC",
          href: "https://theasc.com/articles",
        },
      ],
    },
  ],
}
