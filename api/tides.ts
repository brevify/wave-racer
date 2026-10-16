import type { Request, Response } from 'express';
import { fetchNEAData } from './NEA.ts';

export default async function handler(req: Request, res: Response) {
  return fetchNEAData('tides', req, res);
}
