import { initTRPC } from '@trpc/server';
import axios from 'axios';
import superjson from 'superjson';

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    let message = shape.message;
    if (error.cause && axios.isAxiosError(error.cause)) {
      const responseData = error.cause.response?.data;
      if (responseData?.message) {
        message = responseData.message;
      }
    }

    return {
      ...shape,
      message,
      data: shape.data,
    };
  },
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ next }) => {
  return next({
    ctx: {
      session: {},
    },
  });
});
