export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  category: string
  body: string
}

const posts: BlogPost[] = [
  {
    slug: 'getting-the-most-out-of-your-studio-session',
    title: 'Getting the Most Out of Your Studio Session',
    excerpt: 'Whether you\'re booking your first hour or your fiftieth, a little preparation goes a long way. Here\'s how to make every minute count.',
    date: '28 Mar 2026',
    category: 'Tips',
    body: `Walking into a professional studio can feel like stepping onto a stage — exciting, but easy to waste time if you're not ready. Whether you're a DJ polishing a set, a producer laying down a track, or a podcaster recording an episode, the clock starts the moment you walk through the door. Here's how to squeeze every drop of value from your booking.

**Know your goal before you arrive.** It sounds obvious, but "I want to work on some music" isn't a goal — it's a vibe. A goal looks like: "I want to record a rough mix of three tracks for my upcoming set" or "I want to nail the intro and first segment of episode four." Having a clear target keeps you focused and gives you something to measure your session against.

**Prepare your files and projects at home.** If you're producing, have your project file organised — label your tracks, bounce stems if you're collaborating, and make sure your samples are consolidated. DJs should have their playlists built and tracks analysed in their software. Podcasters should have a rough script or at least bullet points for each segment. The studio is for creating, not for admin.

**Arrive five minutes early.** This gives you time to settle in, connect your laptop, and get comfortable with the space. Rushing in at the last second means your first ten minutes are spent catching your breath instead of creating.

**Don't chase perfection on take one.** It's tempting to loop the same eight bars until they're flawless, but momentum matters more than perfection in the early stages. Get a full pass down first, then go back and refine. You'll make better creative decisions when you can hear the whole picture.

**Take notes as you go.** Jot down timestamps, ideas for later, or things you want to revisit. When the session ends, you'll have a clear list of next steps instead of trying to remember what you were thinking two hours ago.

**Use the engineer or staff if they're available.** Studio 808's team knows the rooms inside out. If you're unsure about signal routing, mic placement, or monitor levels, just ask. That's what we're here for — and a quick pointer can save you twenty minutes of troubleshooting.

A great studio session isn't about talent alone — it's about preparation meeting opportunity. Plan ahead, stay focused, and you'll walk out with something you're proud of every single time.`,
  },
  {
    slug: 'what-to-bring-to-your-first-recording-session',
    title: 'What to Bring to Your First Recording Session',
    excerpt: 'First time in the studio? Here\'s a checklist of everything you need to pack — and a few things to leave at home.',
    date: '14 Mar 2026',
    category: 'Guides',
    body: `Your first recording session is a milestone. Whether you're stepping into the booth to record vocals, laying down a beat, or tracking a podcast pilot, showing up prepared makes all the difference between a productive session and a frustrating one.

**Your laptop and charger.** This one seems obvious, but you'd be surprised how many people forget the charger. If your session runs longer than expected — and the good ones often do — a dead battery will cut you short. Bring your power cable and any adapters you might need for connecting to the studio's interface or monitors.

**Headphones.** The studio has monitors, but a decent pair of closed-back headphones is essential for tracking and for checking your mix in isolation. You don't need to spend hundreds — anything that gives you a clear, honest sound will do the job.

**A USB stick or external drive.** Cloud storage is great for backups, but when you need to move large project files or stems quickly, nothing beats a physical drive. Format it to work with both Mac and PC (exFAT is your safest bet) and make sure there's plenty of free space.

**Your project files, organised.** If you're producing, have your DAW project saved, with all samples and plugins accounted for. Freeze or bounce any tracks that rely on plugins the studio might not have. If you're a DJ, bring your library pre-analysed in Rekordbox, Serato, or whichever software you use. Podcasters should bring their episode outline or script.

**Water and snacks.** Studios are climate-controlled and sessions can run long. Staying hydrated keeps your ears fresh and your concentration sharp. A cereal bar or some nuts can save you from that mid-session energy crash without needing to leave the room.

**A notebook or your phone for notes.** Ideas come fast in the studio. Jot down timestamps, lyric changes, mix notes, or ideas for the next session. It takes seconds and saves you from the "what was that thing I wanted to change?" moment later.

**What to leave at home:** distractions. Put your phone on silent, close your email, and tell your mates you're busy. Studio time is focused time — treat it like a meeting with your most important client (because it is: yourself).

Walk in prepared and you'll walk out with something worth sharing. That's the whole point.`,
  },
  {
    slug: 'how-to-prepare-tracks-for-mixing',
    title: 'How to Prepare Your Tracks for Mixing',
    excerpt: 'Sending stems to a mix engineer — or even mixing your own work? Proper prep makes the difference between a smooth session and a nightmare.',
    date: '25 Feb 2026',
    category: 'Production',
    body: `Mixing is where a good recording becomes a great record. But even the best mix engineer can't fix a mess — and a messy session starts long before the faders move. Whether you're handing your tracks to someone else or sitting down to mix your own work, preparation is everything.

**Consolidate and bounce your stems.** Every track in your session should start from the same point — bar one, beat one. Consolidate all your audio so there are no floating clips, and bounce each track as a continuous WAV file. This ensures nothing shifts out of time when the session is opened on a different system.

**Label everything clearly.** "Audio_14_copy_2" tells nobody anything. Rename your tracks to something human-readable: "Kick", "Snare Top", "Lead Vocal", "Synth Pad L". If you have multiple takes, keep only the best ones — or clearly mark which take is the hero.

**Remove any master bus processing.** If you've been mixing as you go (no judgement — we all do it), bypass any plugins on your master bus before bouncing stems. Compression, limiting, and EQ on the master will bake in decisions that the mix engineer can't undo. Leave the master chain for the mastering stage.

**Clean up silence and noise.** Trim dead air from the beginning and end of vocal takes. Cut out bleed, chair creaks, and mouth clicks where possible. You don't need to be surgical — just tidy. A clean session mixes faster, which means better results in less time.

**Include a rough mix.** Even if you hate how it sounds, bounce a stereo rough mix and include it with your stems. This gives the mix engineer a reference for what you're aiming at — the vibe, the balance, which elements should be upfront. It's a starting point, not a contract.

**Note your tempo and key.** Include a simple text file with the BPM, time signature, and key of the track. If there are tempo changes, note where they happen. This saves time and avoids guesswork.

**Choose the right format.** 24-bit WAV files at the session's original sample rate (usually 44.1kHz or 48kHz) are the standard. Don't convert to MP3 — you'll lose quality that you can't get back. If file sizes are an issue, use a zip archive or a file-sharing service.

Proper prep might take you thirty minutes, but it saves hours in the mix room. Your engineer will thank you — and your track will sound better for it.`,
  },
  {
    slug: 'benefits-of-rehearsal-space-for-djs',
    title: 'Why Every DJ Needs Dedicated Rehearsal Space',
    excerpt: 'Your bedroom setup got you started, but there\'s a reason professionals practise in a proper room. Here\'s what changes when you step up.',
    date: '8 Feb 2026',
    category: 'DJing',
    body: `Every DJ starts somewhere — usually a bedroom, a laptop, and a controller balanced on a desk that's also home to last night's dinner plate. And that's fine for learning the basics. But there comes a point where your environment starts holding you back, and that's when dedicated rehearsal space changes the game.

**You hear what the audience will hear.** Bedroom monitors are great for production, but they don't replicate a club or event environment. A proper rehearsal room with full-range monitors and treated acoustics lets you hear how your transitions, EQ moves, and effects actually sound at volume. That low-end mud you couldn't hear on your desktop speakers? It's been there all along — and now you can fix it.

**You build performance stamina.** Playing a two-hour set in your bedroom while scrolling your phone between tracks is not the same as standing behind decks for two hours with full focus. Rehearsal space lets you practise performing, not just mixing. That means maintaining energy, reading an imaginary crowd, and staying locked in from start to finish.

**You learn the gear you'll use on stage.** Most venues run Pioneer CDJ setups or similar industry-standard equipment. If you've only ever mixed on a controller, the jump to CDJs on the night of a gig can be jarring. Regular rehearsal time on professional equipment builds muscle memory so you're not fumbling with unfamiliar hardware when it matters.

**You can experiment without consequences.** Trying a risky transition during a live set is brave. Trying it in rehearsal is smart. Dedicated practice time is where you test new techniques, work out tricky key changes, and figure out which tracks work together before you're in front of a crowd. The best DJs don't wing it — they prepare so well that it looks effortless.

**You separate practice from everything else.** When you rehearse at home, distractions are everywhere — your phone, your housemates, the temptation to "just quickly check" something. A rehearsal room is a dedicated space with a single purpose. You walk in, you work, you walk out better than when you arrived.

**You develop a professional mindset.** Booking time, showing up, and treating practice like a commitment changes how you approach your craft. It's the difference between "I mess around with DJing" and "I'm a DJ who takes this seriously." That shift in mindset shows up in your sets, your bookings, and your reputation.

Studio 808's DJ rooms are built for exactly this — industry-standard kit, proper monitors, and a space that's yours for the session. Whether you're preparing for a gig or just putting in the hours, it's time well spent.`,
  },
  {
    slug: 'behind-the-scenes-at-studio-808',
    title: 'Behind the Scenes at Studio 808',
    excerpt: 'A look inside our Chelmsford studios — how we built them, what makes them tick, and the community that brings them to life.',
    date: '20 Jan 2026',
    category: 'News',
    body: `Studio 808 started in 2014 with a simple idea: give Chelmsford's musicians, DJs, and creators a proper space to work. Not a converted garage with egg boxes on the walls — a real, professionally treated studio where the equipment is reliable, the acoustics are honest, and the environment lets you focus on what you came to do.

**The rooms.** We run four studios out of our Navigation Road unit. Two DJ rehearsal rooms are kitted out with Pioneer CDJ-3000s, DJM-900NXS2 mixers, and full-range monitoring — the same gear you'll find in any professional venue. Our main production studio is built for recording, mixing, and producing across any genre, with a treated control room and a selection of outboard and microphones. And our podcast studio is set up for spoken-word recording with broadcast-quality mics, a multi-channel mixer, and acoustic treatment designed to keep your voice clean and present.

**The build.** Getting the acoustics right was the hardest part. We worked with acoustic consultants to design each room for its specific purpose — the DJ rooms needed to handle sustained bass without muddying the mids, the production studio needed an accurate monitoring environment, and the podcast room needed to be dead enough for voice but not so dead that it sounds unnatural. Every panel, bass trap, and diffuser is placed with intention.

**The equipment.** We maintain and update our gear regularly. Equipment that's unreliable or outdated doesn't belong in a professional studio. Every cable is tested, every piece of software is licensed and up to date, and every room is checked before each session. When you book time at 808, you can trust that everything works.

**The community.** The best thing about Studio 808 isn't the gear — it's the people who use it. Over the past twelve years, we've hosted everyone from first-time podcasters to touring DJs, bedroom producers to commercial recording artists. Some come once for a specific project; others are in every week, putting in the hours. We've watched people grow from nervous beginners to confident creators, and that's what makes running this place worth it.

**What's next.** We're always looking at how we can improve. Better equipment, better rooms, better services for the people who use them. We don't announce things until they're ready, but if you've been here before, you'll know that Studio 808 in 2026 is a very different place from Studio 808 in 2014 — and we're not done yet.

If you've never visited, come and have a look. We'll show you around, talk through what you're working on, and help you figure out which room and setup works best for your project. No hard sell — just a conversation.`,
  },
]

export default posts
