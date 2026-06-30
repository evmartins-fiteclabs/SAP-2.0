import Post, { newPost } from "@/interfaces/Post";
import axios from "axios";

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
  const finalPost: newPost = {
    ...postData,
    imagemPost: postData.imagemPost !== undefined ? postData.imagemPost : "",
  };

  const response = await axios.post(`${BASE_URL}/`, finalPost, {
    headers: { Authorization: "Bearer " + token },
  });
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
