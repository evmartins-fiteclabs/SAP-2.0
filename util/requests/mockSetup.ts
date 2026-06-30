/**
 * Mock setup para modo DEV (quando não há backend disponível).
 * Credenciais aceitas:
 *   admin / admin  → cargo TECNICO
 *   user  / user   → cargo ESTAGIARIO
 */
import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import Funcionario, { Token } from "@/interfaces/Funcionario";
import Post from "@/interfaces/Post";
import Comentario from "@/interfaces/Comentario";

// ─── Dados mockados ────────────────────────────────────────────────────────────

const MOCK_USERS: Record<
  string,
  { credentials: { email: string; senha: string }; funcionario: Funcionario }
> = {
  admin: {
    credentials: { email: "admin", senha: "admin" },
    funcionario: {
      id: "mock-admin-001",
      nome: "Admin",
      sobrenome: "Mock",
      email: "admin@mock.dev",
      cargo: "TECNICO",
      ativo: true,
      urlImagem: undefined,
    },
  },
  user: {
    credentials: { email: "user", senha: "user" },
    funcionario: {
      id: "mock-user-001",
      nome: "User",
      sobrenome: "Mock",
      email: "user@mock.dev",
      cargo: "ESTAGIARIO",
      ativo: true,
      urlImagem: undefined,
      supervisor: { id: "mock-admin-001", nome: "Admin Mock" },
    },
  },
};

const MOCK_TOKEN: Token = {
  token: "mock-jwt-token-dev",
  expiration: "2099-12-31",
  subject: "mock-subject",
  tokenType: "bearer",
  valid: true,
};

let mockPosts: Post[] = [
  {
    id: "post-002",
    idAutor: "mock-user-001",
    dataPublicacao: new Date("2026-04-21T08:30:00"),
    titulo: "Post de estagiário",
    conteudo: "Conteúdo de exemplo.",
    imagemPost: undefined,
  },
];

let mockComentarios: Comentario[] = [
  {
    id: "com-001",
    idPost: "post-001",
    idAutor: "mock-user-001",
    conteudo: "Ótimo post!",
  },
  {
    id: "com-002",
    idPost: "post-001",
    idAutor: "mock-admin-001",
    conteudo: "Obrigado pelo comentário.",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function mockResponse<T>(data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: "OK (mock)",
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  };
}

function generateId() {
  return "mock-" + Math.random().toString(36).substring(2, 10);
}

// ─── Interceptor principal ────────────────────────────────────────────────────

export function setupMockInterceptors() {
  axios.interceptors.request.use(async (config) => {
    const url = config.url ?? "";
    const method = (config.method ?? "get").toLowerCase();

    // POST /authentication/login
    if (url.includes("/authentication/login") && method === "post") {
      const body = config.data
        ? typeof config.data === "string"
          ? JSON.parse(config.data)
          : config.data
        : {};

      const { email, senha } = body as { email: string; senha: string };
      const match = Object.values(MOCK_USERS).find(
        (u) => u.credentials.email === email && u.credentials.senha === senha
      );

      if (match) {
        throw Object.assign(
          new axios.Cancel("__mock__"),
          { __mockResponse: mockResponse({ funcionario: match.funcionario, token: MOCK_TOKEN }) }
        );
      } else {
        throw Object.assign(
          new axios.Cancel("__mock__"),
          {
            __mockResponse: (() => {
              const err: any = new Error("Credenciais inválidas");
              err.response = { status: 401 };
              err.isAxiosError = true;
              return err;
            })(),
            __mockError: true,
          }
        );
      }
    }

    // GET /funcionarios/one?by=uid&uid=:id
    if (url.includes("/funcionarios/one") && url.includes("by=uid") && method === "get") {
      const uid = new URLSearchParams(url.split("?")[1]).get("uid") ?? "";
      const match = Object.values(MOCK_USERS).find((u) => u.funcionario.id === uid);
      const funcionario = match?.funcionario ?? {
        id: uid,
        nome: "Usuário",
        sobrenome: "Mock",
        email: "mock@mock.dev",
        cargo: "ESTAGIARIO" as const,
        ativo: true,
      };
      throw Object.assign(new axios.Cancel("__mock__"), {
        __mockResponse: mockResponse(funcionario),
      });
    }

    // GET /posts/all
    if (url.includes("/posts/all") && method === "get") {
      throw Object.assign(new axios.Cancel("__mock__"), {
        __mockResponse: mockResponse([...mockPosts]),
      });
    }

    // GET /posts/:id/comentarios
    if (url.match(/\/posts\/[^/]+\/comentarios/) && method === "get") {
      const postId = url.split("/posts/")[1].split("/comentarios")[0];
      const result = mockComentarios.filter((c) => c.idPost === postId);
      throw Object.assign(new axios.Cancel("__mock__"), {
        __mockResponse: mockResponse(result),
      });
    }

    // GET /posts/:id  (deve ficar depois do /all e /comentarios)
    if (url.match(/\/posts\/[^/]+$/) && method === "get") {
      const postId = url.split("/posts/")[1];
      const post = mockPosts.find((p) => p.id === postId);
      if (post) {
        throw Object.assign(new axios.Cancel("__mock__"), {
          __mockResponse: mockResponse({ ...post }),
        });
      }
    }

    // POST /posts/
    if (url.match(/\/posts\/?$/) && method === "post") {
      const body = config.data
        ? typeof config.data === "string"
          ? JSON.parse(config.data)
          : config.data
        : {};
      const newPost: Post = {
        id: generateId(),
        dataPublicacao: new Date(),
        ...body,
      };
      mockPosts.unshift(newPost);
      throw Object.assign(new axios.Cancel("__mock__"), {
        __mockResponse: mockResponse(newPost, 201),
      });
    }

    // DELETE /posts/delete/many
    if (url.includes("/posts/delete/many") && method === "delete") {
      const ids: string[] = config.data
        ? typeof config.data === "string"
          ? JSON.parse(config.data)
          : config.data
        : [];
      mockPosts = mockPosts.filter((p) => !ids.includes(p.id));
      throw Object.assign(new axios.Cancel("__mock__"), {
        __mockResponse: mockResponse(null, 204),
      });
    }

    // DELETE /posts/delete/:id
    if (url.match(/\/posts\/delete\/[^/]+$/) && method === "delete") {
      const postId = url.split("/posts/delete/")[1];
      mockPosts = mockPosts.filter((p) => p.id !== postId);
      throw Object.assign(new axios.Cancel("__mock__"), {
        __mockResponse: mockResponse(null, 204),
      });
    }

    // POST /comentarios
    if (url.match(/\/comentarios\/?$/) && method === "post") {
      const body = config.data
        ? typeof config.data === "string"
          ? JSON.parse(config.data)
          : config.data
        : {};
      const newComentario: Comentario = { id: generateId(), ...body };
      mockComentarios.push(newComentario);
      throw Object.assign(new axios.Cancel("__mock__"), {
        __mockResponse: mockResponse(newComentario, 201),
      });
    }

    // DELETE /comentarios/delete/:id
    if (url.match(/\/comentarios\/delete\/[^/]+$/) && method === "delete") {
      const comentarioId = url.split("/comentarios/delete/")[1];
      mockComentarios = mockComentarios.filter((c) => c.id !== comentarioId);
      throw Object.assign(new axios.Cancel("__mock__"), {
        __mockResponse: mockResponse(null, 204),
      });
    }

    // Demais endpoints: retornar vazio para não travar a app
    if (url.includes(process.env.EXPO_PUBLIC_BASE_URL ?? "__no_base__")) {
      console.warn(`[MOCK] Endpoint não mockado: ${method.toUpperCase()} ${url}`);
      throw Object.assign(new axios.Cancel("__mock__"), {
        __mockResponse: mockResponse([], 200),
      });
    }

    return config;
  });

  // Interceptor de resposta: transforma o Cancel em resposta real ou erro
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isCancel(error) && (error as any).__mockResponse) {
        if ((error as any).__mockError) {
          return Promise.reject((error as any).__mockResponse);
        }
        return Promise.resolve((error as any).__mockResponse);
      }
      return Promise.reject(error);
    }
  );

  console.log("[MOCK] Interceptors ativos — modo DEV sem backend.");
}
