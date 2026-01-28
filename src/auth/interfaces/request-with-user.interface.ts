// src/auth/interfaces/request-with-user.interface.ts
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
    refreshToken: string;
  };
}
