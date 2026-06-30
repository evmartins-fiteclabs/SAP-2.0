import Post, { newPost } from "@/interfaces/Post";
import axios from "axios";
import * as FileSystem from 'expo-file-system';

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL + "/posts";

export async function getPosts(token: string) {
  const response = await axios.get(`${BASE_URL}/all`, {
    headers: { Authorization: "Bearer " + token },
  });
  const posts = response.data as Post[];

  const postsNormalizados = posts.map((post) => ({
    ...post,
    dataPublicacao: new Date(post.dataPublicacao),
  }));
  return postsNormalizados;
}

export async function getPostById(postId: string, token: string) {
  const response = await axios.get(`${BASE_URL}/${postId}`, {
    headers: { Authorization: "Bearer " + token },
  });
  const post = response.data as Post;
  post.dataPublicacao = new Date(post.dataPublicacao);
  return post;
}

export async function deletePost({
  postId,
  token,
}: {
  postId: string;
  token: string;
}) {
  const response = await axios.delete(`${BASE_URL}/delete/${postId}`, {
    headers: { Authorization: "Bearer " + token },
  });
}

export async function addPost({ 
  postData, 
  token, 
}: { 
  postData: newPost; 
  token: string; 
}) { 
  let imagemBase64 = "";

  // Se existir uma URI de imagem, convertemos para Base64
  if (postData.imagemPost) {
    try {
      const base64Result = await FileSystem.readAsStringAsync(postData.imagemPost, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Montamos o data URI para o componente de imagem ler facilmente depois
      imagemBase64 = `data:image/jpeg;base64,${base64Result}`;
    } catch (error) {
      console.error("Erro ao converter imagem para Base64:", error);
    }
  }

  const finalPost = { 
    ...postData, 
    imagemPost: imagemBase64, // Agora enviamos os bytes/string real
  }; 

  const response = await axios.post(`${BASE_URL}/`, finalPost, { 
    headers: { Authorization: "Bearer " + token }, 
  }); 

  return response.data;
}

export async function deleteMultiplePosts({
  postIds,
  token,
}: {
  postIds: string[];
  token: string;
}) {
  const response = await axios.delete(`${BASE_URL}/delete/many`, {
    data: postIds,
    headers: { Authorization: "Bearer " + token },
  });
}
