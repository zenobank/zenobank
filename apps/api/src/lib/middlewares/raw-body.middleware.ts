import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import * as bodyParser from 'body-parser';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => any) {
    bodyParser.raw({ type: '*/*' })(req, res, (err?: any) => {
      if (err) {
        return next();
      }
      // Store the raw body in a separate property for signature verification
      (req as any).rawBody = req.body;
      // Parse the raw body to JSON and store it in req.body for processing
      try {
        const rawString = req.body.toString('utf8');
        req.body = JSON.parse(rawString);
      } catch (parseError) {
        // If parsing fails, keep the raw body
        console.warn('Failed to parse raw body to JSON:', parseError);
      }
      next();
    });
  }
}
