import dotenv from 'dotenv';
import { auth } from 'express-oauth2-jwt-bearer';
import { RequestHandler } from 'express';

dotenv.config();

const checkJwt: RequestHandler = auth({
  // Validate the audience and the issuer.
  audience: process.env.AUTH0_API_IDENTIFIER,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
});

export default checkJwt;
