import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { industry } = await req.json();

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

  return NextResponse.json({ post, headlines });
}
