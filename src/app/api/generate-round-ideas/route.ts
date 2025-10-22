import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { existingRounds } = await request.json();
    
    // Use OpenAI API if available, otherwise use a simpler generator
    const openaiKey = process.env.OPENAI_API_KEY;
    
    console.log('OpenAI Key present:', !!openaiKey);
    
    if (openaiKey) {
      console.log('Attempting OpenAI API call...');
      // Use OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a creative music league round idea generator. This is primarily a MUSIC DISCOVERY league - helping people find new, obscure, and underrated music. Most rounds should focus on discovery (80-90%). You can include a few creative non-discovery themes if they\'re genuinely interesting. Write naturally and simply - avoid flowery language or trying too hard.'
            },
            {
              role: 'user',
              content: `Here are ALL the round themes we've done so far:\n\n${existingRounds}\n\nGenerate 20 NEW round ideas that are DIFFERENT from what we've already done.

Key rules:
- DO NOT repeat or closely copy any of the existing rounds above
- First 15 ideas: Focus on music discovery (obscure artists, underrated songs, local bands, deep cuts, etc)
- Last 5 ideas: GO WILD. Super creative, out-of-the-box, weird concepts. Still music-based but totally unexpected and fun
- Keep the language simple and direct - don't add unnecessary descriptive fluff
- Be specific and clear
- Make them actually different from each other (don't repeat the same concept)
- Study the existing rounds to match the style, but DON'T copy them

Return ONLY the 20 ideas, one per line, no numbering.`
            }
          ],
          temperature: 0.85,
          max_tokens: 1000,
        }),
      });
      
      console.log('OpenAI Response status:', response.status);
      const data = await response.json();
      console.log('OpenAI Response data:', JSON.stringify(data).substring(0, 200));
      
      if (data.choices && data.choices[0]) {
        const ideasText = data.choices[0].message.content;
        const ideas = ideasText
          .split('\n')
          .filter((line: string) => line.trim())
          .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
          .slice(0, 20);
        
        console.log('Successfully generated ideas:', ideas.length);
        return NextResponse.json({
          success: true,
          ideas,
        });
      } else {
        console.log('No choices in OpenAI response, using fallback');
      }
    } else {
      console.log('No OpenAI key found, using fallback');
    }
    
    // Fallback: Music discovery focused ideas
    const fallbackIdeas = [
      "Artists with under 50k monthly listeners that should be huge",
      "The best song by a band that broke up way too soon",
      "A deep cut that's way better than the singles",
      "Local bands from your area that nobody else knows about",
      "Artists who only released one album but absolutely nailed it",
      "Songs you discovered opening for a bigger act",
      "A genre you didn't know existed until recently",
      "Songs from the best year in music that everyone's sleeping on",
      "Artists who were ahead of their time",
      "Hidden gems from otherwise forgettable albums",
      "The best B-side that should've been the single",
      "Artists from your hometown that never made it big",
      "Songs from bands that changed their name and sound",
      "The most underrated live album ever",
      "Artists who got overshadowed by their more famous bandmates",
      "Songs from soundtracks nobody watched",
      "Regional scenes that never went national",
      "Artists who quit music at their peak",
      "Songs that were bigger in other countries",
      "The best debut single from a band that fizzled out"
    ];
    
    return NextResponse.json({
      success: true,
      ideas: fallbackIdeas,
      note: 'Using fallback generator. Add OPENAI_API_KEY to environment variables for AI-powered suggestions.'
    });
    
  } catch (error) {
    console.error('Error generating ideas:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate ideas'
    }, { status: 500 });
  }
}

