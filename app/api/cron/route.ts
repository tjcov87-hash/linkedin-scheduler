import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import axios from "axios";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  const industry = "logistics";

  // Fetch latest news
  let headlines: string[] = [];
  let newsContext = "";
  try {
    const newsRes = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: industry,
        language: "en",
        sortBy: "publishedAt",
        pageSize: 5,
        apiKey: process.env.NEWS_API_KEY,
      },
    });
    const articles = newsRes.data.articles || [];
    headlines = articles.map((a: { title: string }) => a.title);
    newsContext = articles
      .map((a: { title: string; description: string }) => `- ${a.title}: ${a.description}`)
      .join("\n");
  } catch (err) {
    console.error("News fetch error:", err);
    newsContext = `Recent trends in the ${industry} industry.`;
  }

  // Generate LinkedIn post with Claude
  const prompt = `You are a LinkedIn content expert. Based on the following recent news about the ${industry} industry, write an engaging LinkedIn post.

Recent news:
${newsContext}

Requirements:
- Professional but conversational tone
- 150-250 words
- Include 1-2 key insights from the news
- End with a thought-provoking question to encourage engagement
- Add 3-5 relevant hashtags at the end
- Do NOT use emojis excessively, maximum 2
- Write in first person as an industry professional`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const post = (message.content[0] as { text: string }).text;

  // Send email
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL as string,
    to: process.env.RESEND_TO_EMAIL as string,
    subject: `Your LinkedIn post for today - ${new Date().toLocaleDateString("en-GB")}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0077B5;">Good morning! Your LinkedIn post is ready</h2>
        <p style="color: #666;">Here are the latest ${industry} headlines that inspired today's post:</p>
        <ul style="color: #888; font-size: 13px;">
          ${headlines.map((h) => `<li>${h}</li>`).join("")}
        </ul>
        <h3 style="color: #333;">Your post — copy & paste into LinkedIn:</h3>
        <div style="background: #f5f5f5; border-left: 4px solid #0077B5; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; color: #333; margin: 0;">${post}</pre>
        </div>
        <a href="https://www.linkedin.com/feed/" style="background: #0077B5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Open LinkedIn
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">Sent automatically by your LinkedIn Post Scheduler</p>
      </div>
    `,
  });

  return NextResponse.json({ success: true, post });
}
