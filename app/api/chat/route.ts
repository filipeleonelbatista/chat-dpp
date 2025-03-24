// pages/api/chat.ts
import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google as googleai } from '@ai-sdk/google';
import { google, youtube_v3 } from 'googleapis';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: Message[];
  page?: number;
  includeInitialContext?: boolean;
  selectedPersona: string;
}

interface CommentContext {
  author: string;
  text: string;
  likes: number;
}

interface VideoContext {
  videoId: string;
  title: string;
  description: string;
  transcript: string;
  likes: number;
  topComments: CommentContext[];
}

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

async function getChannelDetails(
  channelId: string
): Promise<youtube_v3.Schema$ChannelListResponse> {
  const response = await youtube.channels.list({
    part: ['snippet', 'contentDetails', 'statistics'],
    id: [channelId],
  });
  return response.data;
}

async function getTopComments(videoId: string): Promise<CommentContext[]> {
  try {
    const commentsResponse = await youtube.commentThreads.list({
      part: ['snippet'],
      videoId,
      maxResults: 50, // busque até 50 comentários para ter uma amostra
      textFormat: 'plainText',
    });
    const comments = commentsResponse.data.items || [];
    const commentContexts: CommentContext[] = comments.map((item) => {
      const commentSnippet = item.snippet?.topLevelComment?.snippet;
      return {
        author: commentSnippet?.authorDisplayName || '',
        text: commentSnippet?.textDisplay || '',
        likes: commentSnippet?.likeCount || 0,
      };
    });
    commentContexts.sort((a, b) => b.likes - a.likes);
    return commentContexts.slice(0, 10);
  } catch (error) {
    console.error(`Erro ao buscar comentários para o vídeo ${videoId}:`, error);
    return [];
  }
}

async function getTopVideos(channelId: string): Promise<VideoContext[]> {
  const channelData = await getChannelDetails(channelId);
  if (!channelData.items || !channelData.items[0]) {
    throw new Error('Canal não encontrado.');
  }
  const uploadsPlaylistId =
    channelData.items[0].contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) {
    throw new Error('Playlist de uploads não encontrada.');
  }

  const playlistResponse = await youtube.playlistItems.list({
    part: ['contentDetails'],
    playlistId: uploadsPlaylistId,
    maxResults: 50,
  });
  const videoIds = playlistResponse.data.items
    ?.map((item) => item.contentDetails?.videoId)
    .filter((id): id is string => Boolean(id)) as string[];

  const videosResponse = await youtube.videos.list({
    part: ['snippet', 'statistics'],
    id: videoIds,
  });
  const videos = videosResponse.data.items || [];

  const videoContexts: VideoContext[] = await Promise.all(
    videos.map(async (video) => {
      const videoId = video.id!;
      const title = video.snippet?.title || '';
      const description = video.snippet?.description || '';
      const likes = parseInt(video.statistics?.likeCount || '0', 10);
      const transcript = 'Transcrição não disponível via API.';
      const topComments = await getTopComments(videoId);
      return { videoId, title, description, transcript, likes, topComments };
    })
  );

  videoContexts.sort((a, b) => b.likes - a.likes);
  return videoContexts.slice(0, 10);
}

async function getVideosContext(): Promise<string> {
  const channelId = process.env.CHANNEL_ID;
  if (!channelId) {
    throw new Error('CHANNEL_ID não configurado.');
  }
  const topVideos = await getTopVideos(channelId);
  let context = 'Top 10 vídeos com mais likes do canal:\n';
  topVideos.forEach((video) => {
    context += `Título: ${video.title}\n`;
    context += `Descrição: ${video.description}\n`;
    context += `Transcrição: ${video.transcript}\n`;
    context += `Likes: ${video.likes}\n`;
    context += `Comentários:\n`;
    video.topComments.forEach((comment) => {
      context += `  Usuário: ${comment.author}\n`;
      context += `  Comentário: ${comment.text}\n`;
      context += `  Likes: ${comment.likes}\n\n`;
    });
    context += `\n`;
  });
  return context;
}

export async function POST(req: Request) {
  try {
    const { messages, includeInitialContext }: RequestBody = await req.json();
    let youtubeContext = '';
    if (includeInitialContext) {
      youtubeContext = await getVideosContext();
    }

    const conversationHistory = messages
      .map((msg) => {
        const sender = msg.role === 'user' ? 'Usuário' : 'Assistente';
        return `${sender}: ${msg.content}`;
      })
      .join('\n');

    const promptParts: string[] = [];
    if (includeInitialContext && youtubeContext) {
      promptParts.push(`Contexto do canal do YouTube:\n${youtubeContext}\n`);
    }
    promptParts.push(`Histórico da conversa:\n${conversationHistory}\n`);

    const { text } = await generateText({
      model: googleai('gemini-1.5-flash'),
      system: `Você é um dos donos do canal e está respondendo como o mesmo.
Responda às perguntas dos usuários de forma profissional e levemente informal e divertida do canal.
Utilize o contexto dos vídeos e dos comentários para fundamentar suas respostas de forma autêntica e criativa.
Se houver conteudos no histórico da conversa NÃO SE APRESENTE novamennte, isso é imperativo, basta serguir 
a conversa conforme o histórico.
`,
      prompt: promptParts.join('\n'),
    });

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro ao processar sua mensagem' },
      { status: 500 }
    );
  }
}
