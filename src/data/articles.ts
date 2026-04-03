/**
 * Long-form articles for Thought Layer + /articles/:slug pages.
 */

export type ArticleSlug =
  | "designer-ai-conductor"
  | "creative-tax"
  | "ai-smart-designers"
  | "teaching-inquisitively"
  | "decoding-intuitiveness"
  | "avoiding-intellectual-masturbation";

export type ArticleBodyBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "figure"; caption: string }
  | { type: "link"; href: string; label: string; description?: string };

export interface Article {
  slug: ArticleSlug;
  title: string;
  subtitle: string;
  author: string;
  roleLine: string;
  published: string;
  coverSrc: string;
  coverAlt: string;
  tags: string[];
  blocks: ArticleBodyBlock[];
  searchBlob: string;
}

/** Search / insight card shape (compat with ThoughtLayer + useSearch). */
export interface ThoughtListItem {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
}

function buildSearchBlob(a: Omit<Article, "searchBlob">): string {
  const parts = [a.title, a.subtitle, a.author, a.roleLine, a.tags.join(" ")];
  for (const b of a.blocks) {
    if (b.type === "h2" || b.type === "p") parts.push(b.text);
    else if (b.type === "ul") parts.push(b.items.join(" "));
    else if (b.type === "figure") parts.push(b.caption);
    else if (b.type === "link") parts.push(b.label, b.href, b.description ?? "");
  }
  return parts.join(" ").toLowerCase();
}

const articleDesignerAiConductor: Omit<Article, "searchBlob"> = {
  slug: "designer-ai-conductor",
  title: "Designer to AI Conductor — Embracing the New Creative Role",
  subtitle:
    "From hands-on pixels to guiding prompts and iterations—how the creative role is shifting when AI joins the process.",
  author: "Midhun Krishnakumar",
  roleLine: "Design @ Adobe",
  published: "December 16, 2024",
  coverSrc: "/images/articles/ai-conductor.jpeg",
  coverAlt: "Designer to AI Conductor",
  tags: ["AI", "Design", "Creativity", "Adobe"],
  blocks: [
    {
      type: "p",
      text: "For most of my career, being a designer meant getting hands-on—prototyping ideas, building layouts, and obsessing over every pixel. But things are changing fast.",
    },
    {
      type: "p",
      text: "With AI stepping into the picture, I’ve found myself in a very different role. I’m no longer just the one creating; now, I’m guiding, tweaking, and collaborating with AI tools to bring ideas to life. It’s a strange, exciting, and sometimes overwhelming shift—one that’s making me rethink what it means to be a “creative.”",
    },
    { type: "p", text: "Here’s what this change looks like for me:" },
    { type: "h2", text: "From Making to Orchestrating" },
    {
      type: "p",
      text: "I used to spend hours manually creating designs. Now, I’m crafting prompts, running iterations, and curating the best outputs from AI tools. It’s not about outsourcing creativity—it’s about steering it in a new way.",
    },
    {
      type: "p",
      text: "The AI generates options, but the final call, the human touch, and the emotional depth? That’s still on me. My role has shifted from “creator” to something closer to a conductor. I’m setting the direction, orchestrating tools, and making sure everything still feels authentic and meaningful.",
    },
    { type: "h2", text: "What’s Changed in My Creative Process" },
    {
      type: "p",
      text: "Working with AI has added new layers to the way I approach design:",
    },
    {
      type: "ul",
      items: [
        "Crafting prompts: Writing the right instructions for AI has become an art form. A well-thought-out prompt can unlock some amazing ideas.",
        "More iterations, faster: AI lets me test tons of ideas in minutes. The hard part? Knowing which ones are worth taking forward.",
        "Keeping the heart in the work: While AI handles repetitive tasks, it’s up to me to make sure the work has soul and stays true to the vision.",
      ],
    },
    { type: "h2", text: "What AI Means for Creativity" },
    {
      type: "p",
      text: "At first, I was nervous. Would AI take over? Would it water down the craft? But I’ve realized it’s not here to replace what we do—it’s here to enhance it.",
    },
    {
      type: "p",
      text: "AI is like a creative sidekick. It helps me push boundaries by exploring ideas I might not have had time for, save energy on repetitive work so I can focus on bigger concepts, and iterate faster so the whole process feels more fluid and dynamic.",
    },
    {
      type: "p",
      text: "The best part? I’m able to take on challenges I couldn’t have imagined before because I have AI as a collaborator.",
    },
    { type: "h2", text: "What’s Next?" },
    {
      type: "p",
      text: "This shift isn’t always easy. It takes practice to work with AI in a way that feels natural. But it’s exciting to see how these tools are stretching what’s possible for all of us in creative fields.",
    },
    {
      type: "p",
      text: "How are you working with AI in your creative process? Are you finding ways to make it work for you, or are you still figuring it out? I’d love to hear your thoughts and experiences—this is uncharted territory for all of us, and the more we share, the better we can navigate it together.",
    },
  ],
};

const articleCreativeTax: Omit<Article, "searchBlob"> = {
  slug: "creative-tax",
  title: "Designers, Start Planning with Creative Tax in Mind",
  subtitle:
    "Mental and emotional recovery time isn’t optional—why “creative tax” belongs in every roadmap and 1:1.",
  author: "Midhun Krishnakumar",
  roleLine: "Design @ Adobe",
  published: "May 25, 2025",
  coverSrc: "/images/articles/creative-tax.jpeg",
  coverAlt: "Creative Tax in design workflows",
  tags: ["Wellbeing", "Design Leadership", "Process", "Adobe"],
  blocks: [
    {
      type: "p",
      text: "We often talk about deadlines, scope, iterations, and delivery timelines. But how often do we talk about what it takes mentally to stay creative, inspired, and effective?",
    },
    {
      type: "p",
      text: "That is where Creative Tax comes in. It is not a financial term. It is a mental well-being practice. It is the buffer time you should be building into your schedule to disconnect, reset, and realign before moving to the next creative task. And if you are not accounting for it already, it is time to start.",
    },
    { type: "h2", text: "What Is Creative Tax?" },
    {
      type: "p",
      text: "Creative Tax is the mental and emotional cost of doing creative work. Unlike transactional or mechanical tasks, creative thinking pulls from your imagination, emotional reserves, personal experiences, and your ability to see connections others might miss. That is a heavy lift.",
    },
    {
      type: "p",
      text: "Even a simple task, such as designing a banner that technically takes an hour, can drain you if you are moving from one task to the next with no pause in between. Over time, this continuous grind leads to burnout, stale ideas, and a frustrating sense of monotony.",
    },
    {
      type: "figure",
      caption:
        "The creative tax: a packed schedule stacks task after task with little real recovery (“cool off” you never get) versus the same workload with intentional green “creative tax” buffers between tasks so your brain can reset.",
    },
    { type: "h2", text: "Why Designers Need to Embrace It" },
    {
      type: "ul",
      items: [
        "Creativity is not endless. Without rest and variety, the quality of your ideas will fade.",
        "Context switching is real. Jumping between tasks without a reset drains your mental energy.",
        "Design is not production. It is exploration, empathy, storytelling, and problem solving.",
        "You are human—and that is a good thing. But your mental energy needs recovery time.",
      ],
    },
    { type: "h2", text: "How to Include Creative Tax in Your Schedule" },
    {
      type: "ul",
      items: [
        "Buffer your estimates. If something takes three days, plan for four. Not because you will be slower, but because you will be better.",
        "Step away without guilt. Go for a walk. Sketch something random. These feeds matter.",
        "Take your PTOs. Vacation is renewal. Creativity thrives on new experiences.",
        "Avoid stacking creative tasks. Place idea-heavy work between lighter or administrative tasks.",
        "Protect your focus. Interruptions dilute creative energy. Guard your deep work time.",
      ],
    },
    { type: "h2", text: "The Role of Design Managers" },
    {
      type: "p",
      text: "If you are a design leader, this is your cue to look closely. Are your reportees building creative tax into their tasks and timelines? If not, you need to educate them. Talk openly about it in one-on-ones. Explain why it matters. And advocate for it in project planning conversations with other stakeholders.",
    },
    {
      type: "p",
      text: "If your team is constantly executing without space to think or breathe, you are not getting their best work—you are getting what is left of them.",
    },
    { type: "h2", text: "A Personal Note" },
    {
      type: "p",
      text: "I first introduced the idea of creative tax during our Adobe team on-site as part of a broader discussion on mental well-being. The response was deeply encouraging. It sparked honest conversations around burnout, overcommitment, and the invisible costs of creative output.",
    },
    { type: "h2", text: "The Value of Creative Tax" },
    {
      type: "p",
      text: "Think of creative tax as a strategic investment, not wasted time. The result? Better ideas, smoother workflows, fewer revisions, and more joy in what you create.",
    },
    {
      type: "ul",
      items: [
        "Fresh and original ideas",
        "Stronger storytelling",
        "Higher motivation",
        "Better long-term creative health",
      ],
    },
    { type: "h2", text: "Final Thought" },
    {
      type: "p",
      text: "Creative tax is not a luxury. It is a necessity. The next time you estimate a task or plan your week, ask yourself: “Have I included my creative tax?” Because if you want new ideas, you need new experiences—and to experience fully, you sometimes need to switch off.",
    },
    {
      type: "link",
      href: "https://www.figma.com/proto/3AJ8e9mV9ZYxWOUuRRfvRa/Mental-health-is-important?page-id=0%3A1&node-id=101-2&viewport=183%2C192%2C0.07&t=tqqHS6SWAE3nfzDd-1&scaling=contain&content-scaling=fixed&starting-point-node-id=101%3A2",
      label: "View my mental-wellbeing presentation (Figma prototype)",
      description: "Prototype password: safari-tested-fabric-stitch",
    },
  ],
};

const articleAiSmartDesigners: Omit<Article, "searchBlob"> = {
  slug: "ai-smart-designers",
  title: "AI will replace designers. Just not the smart ones.",
  subtitle:
    "What actually changes when AI eats structured work—and how to stay on the right side of the shift.",
  author: "Midhun Krishnakumar",
  roleLine: "Design @ Adobe",
  published: "March 22, 2026",
  coverSrc: "/images/articles/ai-replace-designers.jpeg",
  coverAlt: "AI will replace designers — just not the smart ones",
  tags: ["AI", "UX", "Career", "Future of Design"],
  blocks: [
    {
      type: "p",
      text: "We are in one of those phases in tech where everything feels like it is shifting all at once. You open your laptop, and something that felt cutting edge last month already feels outdated. It is exciting, but also slightly unsettling.",
    },
    {
      type: "p",
      text: "We have been here before. The internet changed everything. Then mobile did it again. Then cloud quietly reshaped how we build and scale products. Each time, the same anxiety showed up. Are we still relevant? And each time, the people who adapted stayed—the roles just evolved around them.",
    },
    {
      type: "p",
      text: "Now it is AI. And this time it feels more personal—because it is stepping into parts of the work we used to take pride in. If you are a UX designer, you have probably had that moment: you try a tool, it generates a flow or a screen, and you think—alright, this is uncomfortably good.",
    },
    {
      type: "p",
      text: "So the question becomes real. What happens to my role? How do I prepare? The honest answer is that parts of your job are automatable. You do not have to be replaceable.",
    },
    { type: "h2", text: "What AI is actually changing" },
    {
      type: "p",
      text: "I have been working closely with AI-driven workflows for a while now, and one thing stands out: AI is extremely good at structured, repeatable work—the kind we got efficient at over the years. That is exactly what gets automated first.",
    },
    {
      type: "p",
      text: "Which forces a harder question: if that part of the work is handled, what is left for us? AI has simply made the expectation explicit that designers stretch across research, visuals, and content more than ever.",
    },
    {
      type: "p",
      text: "Today, a product manager can generate rough wireframes. A designer can generate UI, content, and even snippets of code. A developer can scaffold features faster than before. The boundaries between roles start to blur—what used to be handoffs becomes a shared space where everyone overlaps earlier.",
    },
    { type: "h2", text: "From pipeline to shared space" },
    {
      type: "p",
      text: "Earlier, work felt structured: you completed your part, passed it along, and trusted the system to move forward. Now it feels more fluid. Leadership wants something tangible quickly—enough to react to, question, and iterate on. The cycle becomes: build fast, learn faster, refine continuously.",
    },
    { type: "h2", text: "The uncomfortable truth" },
    {
      type: "p",
      text: "Less structure can create confusion. Ownership can blur. Quality can slip if no one anchors decisions. But AI is also what makes this speed workable—it amplifies individuals so they can contribute across areas that used to be out of reach. The system only breaks if people do not learn to use that leverage.",
    },
    { type: "h2", text: "The headcount reality no one talks about" },
    {
      type: "p",
      text: "When one person can do the work that earlier required two or three, teams tend to get leaner. This is not about design losing importance—it is about efficiency going up. The goal is not to panic; the goal is to be intentional about where you stand.",
    },
    { type: "h2", text: "What this means for UX designers" },
    {
      type: "p",
      text: "Your job is not disappearing. But the version of the job that is purely about producing screens is under pressure. The expectation is broader: think beyond execution, contribute to direction, move faster without losing clarity, and work across functions instead of waiting for perfect inputs.",
    },
    {
      type: "p",
      text: "The shift is subtle but important: less about raw output, more about judgment.",
    },
    { type: "h2", text: "The shift you cannot ignore" },
    {
      type: "p",
      text: "It feels a bit like we are steam engines being fitted with rocket boosters. The booster is not optional—you have to adapt to the speed and friction that come with it. You either learn how to use it, or you get left behind by those who do.",
    },
    { type: "h2", text: "How to prepare for this" },
    {
      type: "ul",
      items: [
        "Earn your seat at the table. Bring more than design—framing problems and strong judgment differentiate you from generative output.",
        "Treat AI as leverage. Build systems for research, ideation, and iteration that compound over time.",
        "Get comfortable with co-creation. Polished big reveals are giving way to ongoing collaboration with product and engineering.",
      ],
    },
    { type: "h2", text: "Where this is going" },
    {
      type: "p",
      text: "It is not hard to imagine builders who understand business, design, and code well enough to ship end-to-end—not perfectly, but fast enough to make an impact. We are not fully there yet, but we are moving in that direction.",
    },
    { type: "h2", text: "Final thought" },
    {
      type: "p",
      text: "The question is not whether AI will take your job. The question is whether you are becoming the kind of designer this shift actually needs. The ones who adapt will not just stay relevant—they will end up having far more influence than before.",
    },
    {
      type: "p",
      text: "Hero imagery for this piece was created with Adobe Firefly / Gemini NanoBanana Pro (content credentials as applicable).",
    },
  ],
};

const articleTeachingInquisitively: Omit<Article, "searchBlob"> = {
  slug: "teaching-inquisitively",
  title: "The Art of Teaching Inquisitively",
  subtitle:
    "My childhood revolved around finding explanation for why things are the way they are. Inquisitiveness played a major role in choosing design as my career.",
  author: "Midhun Krishnakumar",
  roleLine: "Design @ Adobe",
  published: "October 3, 2020",
  coverSrc: "/images/articles/teaching-inquisitively.jpeg",
  coverAlt: "The art of teaching inquisitively",
  tags: ["Education", "Mentorship", "Design Thinking", "Learning"],
  blocks: [
    {
      type: "p",
      text: "My childhood revolved around finding explanation for why are the things the way they are. I presume that we all had gone through such a phase in our lives. Inquisitiveness played a major role in my life to choose design as my career and I believe that the interest to understand something by mere observation and questioning can fuel the fire of learning from within.",
    },
    {
      type: "p",
      text: "I have seen the trend in schools and colleges. We have a textbook that we're supposed to refer to. All concepts are explained explicitly with examples. I suggest a different approach which I believe would yield a more positive impact in understanding fundamentals of a subject with the yearning to learn more.",
    },
    { type: "h2", text: "Make students question Why, How and What" },
    {
      type: "p",
      text: "As teachers, we kill the inquisitive mind of a student by explaining everything for them. I feel, open ended conversations with adequate supervision could make students think more on the line of 'Why' rather than only 'What'.",
    },
    {
      type: "p",
      text: "The inception of handy internet access has certainly reduced human ability to think. Answers are in our fingertips. But early 2000's back home was much different. Every time my family used to go out, my father used to point out certain parts of a machine and asked me \"What do you think that is? Why is it used?\" These small questions from time to time made me think a lot about mechanics and I yearned to learn more about it.",
    },
    {
      type: "p",
      text: "This way of understanding something turned out to be very effective as I just didn't learn something, I learned why it exists, how it evolved and why the things are the way they are.",
    },
    {
      type: "p",
      text: "Self teaching became a part of me. I remember things I've learned this way rather than the textbook explanation of subjects. As I was in my 7th grade, I linked physics concepts I learned in class to all the objects around me and it was magical to understand how things worked. It created a positive impact on learning something new. I cherished these moments and the concepts got hardwired into my memory through these live examples.",
    },
    { type: "h2", text: "How I feel teaching should evolve" },
    {
      type: "p",
      text: "Electronic Teaching Aids have become very popular in the last decade. With that we went further away from the world that surrounds us. In ancient India, Gurukul systems provided opportunities for students to understand and question each process in nature and learn by understanding them from their own perspective. People were so close to the nature that they started decoding patterns around them and created scriptures that almost explains everything we see around us today.",
    },
    {
      type: "p",
      text: "Trying to combine how sages taught their disciples then and our current education structures, I believe that these steps below could align students to a more inquisitive approach to a subject than just mugging up concepts.",
    },
    {
      type: "ul",
      items: [
        "Examples In Nature: While preparing the subject, do some background research on the area where the institute is located. List out how you can explain concepts with the help of things around.",
        "Lay Off The Internet: Encourage students to stay away from internet in order to find answers. Impart the culture of discussing with each other before picking up your smart phone. Make them understand the value of healthy discussion and constructive debates. Allow them to think as wildly as possible.",
        "Inclusive Activities: Students vary in interests. Every activity conducted should be inclusive in the briefs. This will allow students to stitch their personal interests and new concepts to create wonderful learning opportunities.",
        "Guide Them: I prefer the term Guide over Teachers. We certainly open up new opportunities where students can learn, but we should let them teach themselves. We merely guide them with ethical, moral and realistic parameters.",
        "Teamwork: The ability to collaborate in a team gives students the sense of empathy by understanding one another and learning from each other. Even though it's a team effort, try evaluating them individually and as a team.",
        "Know Each Student: Spend individual quality time understanding the strong and weak points of a student depending on the subject and guide them accordingly. Casual talks between activities and individual sessions if you feel it's necessary.",
        "Outside The Walls: Take your class outside the four walls of the institute and create the fun element in learning. Knitting concepts with examples from nature, you can make them see things in real life and learn.",
      ],
    },
    { type: "h2", text: "Comprehensive Evaluation" },
    {
      type: "p",
      text: "Students try hard to score more in a subject hence forgetting to actually learn something. It's sadly the current education structure that we see as guides. There are a few points regarding how we can make this more effective.",
    },
    {
      type: "ul",
      items: [
        "Compare growth, not each other: Evaluate how a student has transformed within the duration of the course. No activity should be a comparison level. It should be about reflecting learning of the course in any way possible.",
        "Evaluate from Day 1: Don't keep evaluation for an end result. Evaluate continuously throughout the course and on the last day give them individual inputs on how they can focus more. This will reduce the stress on students and they tend to focus on learning rather than grades.",
      ],
    },
    {
      type: "p",
      text: "These points could create a more enthusiastic approach for students towards learning and gives you as a guide, more opportunities to learn from your students.",
    },
    {
      type: "p",
      text: "You can only be a good guide if you are open enough to improvise activities that can engage students to individually learn the same subject through different ways. Always remember that effective learning comes from the art of teaching inquisitively.",
    },
  ],
};

const articleDecodingIntuitiveness: Omit<Article, "searchBlob"> = {
  slug: "decoding-intuitiveness",
  title: "Decoding Intuitiveness",
  subtitle:
    "Series of study on decoding basic human behaviours — understanding why pattern recognition works and how intuitions shape user experience.",
  author: "Midhun Krishnakumar",
  roleLine: "Design @ Adobe",
  published: "October 3, 2020",
  coverSrc: "/images/articles/decoding-intuitiveness.jpeg",
  coverAlt: "Decoding Intuitiveness",
  tags: ["UX Research", "Psychology", "Human Behaviour", "Design"],
  blocks: [
    {
      type: "p",
      text: "Everyday, we come across creative and exciting ways to handle User Experience and we have heard how important is pattern recognition in a user interface. We say it reduces cognitive strain and a user can direct oneself to complete a task by following a pattern. But ever imagined why pattern recognition works?",
    },
    {
      type: "p",
      text: "Similarly many user experience philosophies point towards effective utilisation of cognitive biases which basically \"makes a user take string of choices in a sequential progression in order to complete a workflow.\" But if we ask the user on why did they make these choices we might get replies as \"I felt like it\", \"I don't know.\" This part of human behaviour is termed as intuitiveness. Let's try understand how intuitiveness works.",
    },
    { type: "h2", text: "\"I Have A Gut Feeling!\"" },
    {
      type: "p",
      text: "Familiar with this phrase? We describe them as intuitions. Intuition is the ability to acquire knowledge without recourse to conscious reasoning.",
    },
    {
      type: "p",
      text: "The ability to take decision is based on understanding and experience. When a user acts upon something, the action is a combination of their past experience with expectation which we term as intuition. This can be experienced every time we try something new. If it turns out to be what we expect, it's a good user experience.",
    },
    {
      type: "p",
      text: "Intuitions could be termed as a building block of human behaviour. We talked about users with experience, what about a new born? Does a baby perform intuitive actions? If so, how?",
    },
    { type: "h2", text: "The Newborn Traits" },
    {
      type: "p",
      text: "We say newborns are inexperienced. Well I differ this notion as some examples of newborn behaviour are from no experience at all. This tells us something about how humans learn.",
    },
    {
      type: "p",
      text: "Some of the experiences that their forefathers have been practicing since dawn of time gets carried forward through genes as genetic memory. In understanding intuitions, we can observe what the first actions of a new born are.",
    },
    {
      type: "p",
      text: "Newborns start understanding the world before they are born. The ability to learn starts even while they are in their mother's womb. Considering newborns, breastfeeding could be one of the first actions one faces.",
    },
    {
      type: "p",
      text: "Now if we understand the whole process in terms of interaction design, breasts are interfaces and the newborns are naive users. The user has no prior understanding of the interface yet it turns out to be intuitive enough for the user to use it. So there is something other than learned experience that helps users to take a decision.",
    },
    { type: "h2", text: "Genetic Information" },
    {
      type: "p",
      text: "Genetic information is modified through generations, rather it's perfected gradually to increase the chance of one's survivability in a changing environment. It rejects features what we haven't used for generations, and adds new information from experiences gained.",
    },
    {
      type: "p",
      text: "From the 100th Monkey Effect we get more questions on how information gets transferred without any medium. Going through multiple research papers on genetics and genetic memory, we could say that information crucially relevant to human survival is encrypted in genes.",
    },
    { type: "h2", text: "Patterns and Anomalies" },
    {
      type: "p",
      text: "Pattern recognition is an understanding that helped humans to survive through difficult times. The idea of \"if this is different from the rest, it means something\" — it could be good or bad and that's something you learn through experience. But with each of our 5 senses, we intuitively recognise patterns.",
    },
    {
      type: "p",
      text: "Logical connection between individual bodies helps us understand the relative dependency on each other and provides us with insights that helps in decision making.",
    },
    { type: "h2", text: "How does it help in experience design?" },
    {
      type: "p",
      text: "As designers, I believe we need to understand why people make decisions the way they do. Gestalt's Theory provides us insights on key principles if followed judiciously could create good design. But how does it work? And that is the true journey we all need to take as experience designers to understand the science of human behaviour. Because understanding the root of these principles could help us create simpler and effective designs.",
    },
    {
      type: "p",
      text: "\"I believe in intuitions and inspirations. I sometimes feel that I'm right. I don't know that I am.\" — Albert Einstein",
    },
  ],
};

const articleAvoidingIntellectualMasturbation: Omit<Article, "searchBlob"> = {
  slug: "avoiding-intellectual-masturbation",
  title: "Avoiding Intellectual Masturbation",
  subtitle:
    "It's a designer's parasite. A lesson on stopping the endless dreaming and starting to act on solving issues at hand.",
  author: "Midhun Krishnakumar",
  roleLine: "Design @ Adobe",
  published: "October 3, 2020",
  coverSrc: "/images/articles/intellectual-masturbation.jpeg",
  coverAlt: "Avoiding Intellectual Masturbation",
  tags: ["Mindset", "Productivity", "Design Education", "Personal Growth"],
  blocks: [
    {
      type: "p",
      text: "It's a designer's parasite. You'll get to know what it was as you read. It takes some unique incidents to register and make us realise all the wrong things we do. I had one such incident which changed my perspective on how to get things done on a day to day basis.",
    },
    { type: "h2", text: "The Background" },
    {
      type: "p",
      text: "The heading is rather catchy and it could be the reason that this lesson sticked with me for so long! It was 3rd year in my Bachelors in college. Even after being in Industrial design, I had my unique aversion towards workshop skill courses. I was more of a critical thinker and dreamer who was least interested in hands-on prototyping. I stuck with 3D modelling. This is when Mr Sahil Thapa came as our faculty for basic electronic course. Being a young faculty amidst us, we all bonded with him quickly.",
    },
    {
      type: "p",
      text: "Along with my co-dreamers we had monumental ideas of what we wanted to do and started creating 3D CAD models. We were trying to avoid the workshop as much as possible during these times.",
    },
    { type: "h2", text: "One-to-one Sessions" },
    {
      type: "p",
      text: "We came to an understanding that we need 12 different electronic components to make this product. We approached the institute to buy these components but days passed and there was no reply from them. We used this as a great excuse to run away from making things in class. We were interested in the course but we met with a dead end and even as designers we couldn't come up with an alternative. Again there was no limit for our imagination. We were dreaming of using voice assistants to create a PA system for our college and so on.",
    },
    {
      type: "p",
      text: "The time came for our mid course progress evaluation. Sahil came to me and asked me to explain the idea which I presented with rendered 3D models and a classy deck. Then he wanted to see the actual product development. Without wasting any time I started off ranting on how the college couldn't provide us with required materials and so on. He listened to my entire story and was curious to know about some things.",
    },
    {
      type: "p",
      text: "Sahil: \"So, The college is not supporting in terms of resources huh?\" Me: \"Yeah we were running behind them all these while\u2026no use..\" Sahil: \"So do you know from where they buy these materials?\" Me: \"Yea, It's somewhere in Vijayawada, I can find that out.\" Sahil: \"Oh that's great\u2026 Do you have enough money for your purchases?\" Me: \"Yea, We can arrange!\" Sahil: \"Then what's stopping you from going and purchasing them yourself?\"",
    },
    {
      type: "p",
      text: "I heard crickets in the background.",
    },
    {
      type: "p",
      text: "Sahil: \"Words can build monuments on clouds and there will never be a shortage of new ideas. But if you want to know whether your ideas would work, you need to stop your Intellectual Masturbation in class.\"",
    },
    {
      type: "p",
      text: "I felt like someone shredded me and used it to light a bonfire. He gave me the rest of the day off and asked me to leave for Vijayawada immediately. I wandered around the place to find this shop and finally came across the electronics market. From that moment I felt I need to change the way I do things. This realisation had come a bit late in my college life but it was well needed. Never again had I depended on people to get something done for myself. It was not just about the course but the smaller things in life.",
    },
    { type: "h2", text: "How to Avoid It" },
    {
      type: "p",
      text: "Take any day to day activity that you perform and look into it. List out all activities where you depend on other people to get things done. How many times have you taken the blame because others couldn't keep up to the deadlines? Understand and introspect these moments and find alternatives. There are millions of alternatives to get things done. As long as it's ethical, there shouldn't be a problem.",
    },
    {
      type: "p",
      text: "Since then, each time I got a new idea and I had to prototype them, I went out in search of all these materials. I approached people who had expertise in the related fields to clear my doubts. I never wasted any time in extended preparation. I started acting more and getting first hand results. It improved my confidence and expertise in many fields and I am always thankful to Sahil for opening my eyes.",
    },
    {
      type: "p",
      text: "I really hope that none of us would ever resort to just intellectual masturbation. Rather start acting on solving the issues at hand early and effectively.",
    },
  ],
};

export const ARTICLES: Article[] = [
  articleAiSmartDesigners,
  articleCreativeTax,
  articleDesignerAiConductor,
  articleTeachingInquisitively,
  articleDecodingIntuitiveness,
  articleAvoidingIntellectualMasturbation,
].map((a) => ({ ...a, searchBlob: buildSearchBlob(a) }));

export function getArticleBySlug(slug: string | undefined): Article | undefined {
  if (!slug) return undefined;
  return ARTICLES.find((a) => a.slug === slug);
}

/** `id` / `location.hash` for a Thought Layer card (e.g. back from `/articles/:slug`). */
export function thoughtLayerCardId(slug: string): string {
  return `thought-${slug}`;
}

export function getArticleNeighbors(slug: string): { prev: Article | null; next: Article | null } {
  const i = ARTICLES.findIndex((a) => a.slug === slug);
  if (i < 0) return { prev: null, next: null };
  return {
    prev: i > 0 ? ARTICLES[i - 1]! : null,
    next: i < ARTICLES.length - 1 ? ARTICLES[i + 1]! : null,
  };
}

export function getThoughtListItems(): ThoughtListItem[] {
  return ARTICLES.map((a) => ({
    id: a.slug,
    title: a.title,
    excerpt: a.subtitle,
    tags: a.tags,
  }));
}
