import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getRequest } from '../helpers';

export const Token = createParamDecorator((_, context: ExecutionContext) => {
  const req = getRequest(context);
  return req.token || null;
});
