import * as client from "openid-client";
import { Strategy as OIDCStrategy, type VerifyFunction } from "openid-client/passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Check required environment variables
if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  const sessionSecret = process.env.SESSION_SECRET || "dev-secret-key-change-in-production";
  
  return session({
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUserFromReplit(claims: any) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

async function upsertUserFromGoogle(profile: any) {
  await storage.upsertUser({
    id: profile.id,
    email: profile.emails?.[0]?.value,
    firstName: profile.name?.givenName,
    lastName: profile.name?.familyName,
    profileImageUrl: profile.photos?.[0]?.value,
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Replit OAuth Setup
  const config = await getOidcConfig();
  const replitVerify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = { provider: 'replit' };
    updateUserSession(user, tokens);
    await upsertUserFromReplit(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
    const strategy = new OIDCStrategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback/replit`,
      },
      replitVerify,
    );
    passport.use(strategy);
  }

  // Google OAuth Setup
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // Get the domain from REPLIT_DOMAINS for the callback URL
    const domain = process.env.REPLIT_DOMAINS!.split(",")[0];
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `https://${domain}/api/callback/google`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = { 
          provider: 'google',
          access_token: accessToken,
          refresh_token: refreshToken,
          claims: {
            sub: profile.id,
            email: profile.emails?.[0]?.value,
            first_name: profile.name?.givenName,
            last_name: profile.name?.familyName,
            profile_image_url: profile.photos?.[0]?.value,
          }
        };
        await upsertUserFromGoogle(profile);
        return done(null, user);
      } catch (error) {
        return done(error as Error, false);
      }
    }));
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Auth routes
  app.get("/api/login/replit", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/login/google", 
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get("/api/callback/replit", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/callback/google",
    passport.authenticate("google", { failureRedirect: "/api/login" }),
    (req, res) => {
      res.redirect("/");
    }
  );

  // Default login route - redirect to choose provider
  app.get("/api/login", (req, res) => {
    res.send(`
      <html>
        <head>
          <title>Choose Login Method - TimeFlow</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background: #f8fafc; }
            .container { max-width: 400px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            h1 { text-align: center; color: #1e293b; margin-bottom: 30px; }
            .login-button { display: block; width: 100%; padding: 12px 20px; margin: 12px 0; text-decoration: none; border-radius: 8px; text-align: center; font-weight: 500; border: 2px solid transparent; transition: all 0.2s; }
            .replit { background: #667eea; color: white; }
            .replit:hover { background: #5a67d8; }
            .google { background: white; color: #374151; border: 2px solid #d1d5db; }
            .google:hover { border-color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Sign in to TimeFlow</h1>
            <a href="/api/login/replit" class="login-button replit">Continue with Replit</a>
            <a href="/api/login/google" class="login-button google">Continue with Google</a>
          </div>
        </body>
      </html>
    `);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      const user = req.user as any;
      if (user?.provider === 'replit') {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      } else {
        res.redirect("/");
      }
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // For Google OAuth, we don't need to check token expiration in the same way
  if (user?.provider === 'google') {
    return next();
  }

  // For Replit OAuth, check token expiration and refresh if needed
  if (!user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};