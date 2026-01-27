import { z } from 'zod';
import { insertUserSchema, insertIssueSchema, insertCommentSchema, insertAnnouncementSchema, insertLostFoundSchema, users, issues, comments, announcements, lostFound } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  issues: {
    list: {
      method: 'GET' as const,
      path: '/api/issues',
      responses: {
        200: z.array(z.custom<typeof issues.$inferSelect & { reporter?: typeof users.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/issues',
      input: insertIssueSchema,
      responses: {
        201: z.custom<typeof issues.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/issues/:id',
      responses: {
        200: z.custom<typeof issues.$inferSelect & { reporter?: typeof users.$inferSelect, comments?: (typeof comments.$inferSelect & { user?: typeof users.$inferSelect })[] }>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/issues/:id',
      input: insertIssueSchema.partial(),
      responses: {
        200: z.custom<typeof issues.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  comments: {
    create: {
      method: 'POST' as const,
      path: '/api/comments',
      input: insertCommentSchema,
      responses: {
        201: z.custom<typeof comments.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  announcements: {
    list: {
      method: 'GET' as const,
      path: '/api/announcements',
      responses: {
        200: z.array(z.custom<typeof announcements.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/announcements',
      input: insertAnnouncementSchema,
      responses: {
        201: z.custom<typeof announcements.$inferSelect>(),
      },
    },
  },
  lostFound: {
    list: {
      method: 'GET' as const,
      path: '/api/lost-found',
      responses: {
        200: z.array(z.custom<typeof lostFound.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/lost-found',
      input: insertLostFoundSchema,
      responses: {
        201: z.custom<typeof lostFound.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/lost-found/:id',
      input: insertLostFoundSchema.partial(),
      responses: {
        200: z.custom<typeof lostFound.$inferSelect>(),
      },
    },
  },
  analytics: {
    get: {
      method: 'GET' as const,
      path: '/api/analytics',
      responses: {
        200: z.object({
          totalIssues: z.number(),
          pendingIssues: z.number(),
          resolvedIssues: z.number(),
          byCategory: z.record(z.number()),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
