import { Request, Response } from "express";
import { User, NewUser } from "../db/schema";
import { createUser, getUserByEmail, updateUser, upgradeUser } from "../db/queries/users.js";
import { hashPassword, checkPasswordHash, makeJWT, validateJWT, getBearerToken, getAPIKey } from "../auth.js";
import config from "../config.js";
import { createRefreshToken, getRefreshToken, revokeRefreshToken } from "../db/queries/refreshTokens.js";

export type UserResponseType = Omit<User, "hashedPassword">;

const ACCESS_TOKEN_DEFAULT_EXPIRATION: number = 3600; // default to 1 hour

function toUserResponseType(user: User | NewUser): UserResponseType {
  const { hashedPassword: _hashedPassword, ...userResponse } = user;
  return userResponse as UserResponseType;
}

export async function handlerUsersCreate(req: Request, res: Response) {
  type userQueryType = {
    password: string;
    email: string;
  };
  try {
    const query = req.body as userQueryType;
    const hashedPassword = await hashPassword(query.password);
    const newUser: NewUser | undefined = await createUser({ email: query.email, hashedPassword: hashedPassword });
    if (!newUser) {
      res.status(400).send({"error": "User could not be created"});
      return;
    }
    res.status(201).set("Content-Type", "application/json").send(JSON.stringify(toUserResponseType(newUser)));
  } catch (error) {
    res.status(400).send({"error": "Invalid query parameters"});
  }
}

export async function handlerUsersUpdate(req: Request, res: Response) {
  type userQueryType = {
    password: string;
    email: string;
  };
  type UpdateUserType = Pick<User, "id" | "email" | "hashedPassword">;
  let userId: string;
  try {
    const token = getBearerToken(req);
    userId = validateJWT(token, config.secret);
  } catch (error) {
    res.status(401).send({"error": "Unauthorized"});
    return;
  }

  try {
    const query = req.body as userQueryType;
    const hashedPassword: string = await hashPassword(query.password);
    if (typeof hashedPassword != 'string') {
      throw new Error('hashing the new password failed');
    }
    const partialUser: UpdateUserType = { id: userId, email: query.email, hashedPassword: hashedPassword };
    const updatedUser: User | null = await updateUser(partialUser as User);
    res.status(200).set("Content-Type", "application/json").send(JSON.stringify(toUserResponseType(updatedUser)));
  } catch (error) {
    res.status(400).send({"error": "Invalid query parameters"});
  }
}

export async function handlerLogin(req: Request, res: Response) {
  type LoginQueryType = {
    email: string;
    password: string;
  };
  res.header("Content-Type", "application/json");
  let parsedBody: LoginQueryType;
  try {
      parsedBody = req.body;
  } catch (error) {
      res.status(400).send({"error": "Invalid JSON"});
      return;
  }
  const user = await getUserByEmail(parsedBody.email);
  if (!user) {
    res.status(401).send({"error": "Invalid email or password"});
    return;
  }
  const isPasswordValid = await checkPasswordHash(parsedBody.password, user.hashedPassword);
  if (!isPasswordValid) {
    res.status(401).send({"error": "Invalid email or password"});
    return;
  }
  type LoginResponseType = UserResponseType & { token: string, refreshToken: string }
  const token: string = makeJWT(user.id.toString(), ACCESS_TOKEN_DEFAULT_EXPIRATION, config.secret);
  const expirationDate: Date = new Date(Date.now() + 60 * 24 * 3600); // default to 60 days
  const refreshToken: string | undefined = await createRefreshToken(user.id, expirationDate);
  if (!refreshToken) {
    res.status(500).send({"error": "Could not create refresh token"});
    return;
  }
  const loginResponse: LoginResponseType = {...toUserResponseType(user), "token": token, "refreshToken": refreshToken };
  res.status(200).send(JSON.stringify(loginResponse));
}

export async function handlerRefresh(req: Request, res: Response) {
  try {
    const refreshTokenString: string = getBearerToken(req);
    const refreshToken = await getRefreshToken(refreshTokenString);
    if (!refreshToken) {
      res.status(401).send(JSON.stringify({"error": "Invalid refresh token"}));
      return;
    }
    if (refreshToken.expiresAt < new Date()) {
      res.status(401).send(JSON.stringify({"error": "Refresh token has expired"}));
      return;
    }
    if (refreshToken.revokedAt != null) {
      res.status(401).send(JSON.stringify({"error": "Refresh token has been revoked"}));
      return;
    }
    const accessToken: string = makeJWT(refreshToken.userId, ACCESS_TOKEN_DEFAULT_EXPIRATION, config.secret);
    res.status(200).send(JSON.stringify({ token: accessToken }));
  } catch (error) {
    res.status(401).send(JSON.stringify({"error": "Unauthorized"}));
    return;
  }
}

export async function handlerRevoke(req: Request, res: Response) {
  try {
    const refreshTokenString: string = getBearerToken(req);
    const refreshToken = await getRefreshToken(refreshTokenString);
    if (!refreshToken) {
      res.status(401).send(JSON.stringify({"error": "Invalid refresh token"}));
      return;
    }
    if (refreshToken.expiresAt < new Date()) {
      res.status(401).send(JSON.stringify({"error": "Refresh token has expired"}));
      return;
    }
    if (refreshToken.revokedAt != null) {
      res.status(401).send(JSON.stringify({"error": "Refresh token has been revoked"}));
      return;
    }
    const revoked: boolean = await revokeRefreshToken(refreshTokenString);
    if (!revoked) {
      res.status(500).send(JSON.stringify({"error": "Could not revoke refresh token"}));
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(401).send(JSON.stringify({"error": "Unauthorized"}));
    return;
  }
}

export async function handlerPolkaWebhooks(req: Request, res: Response) {
  try {
    const apikKey: string = getAPIKey(req);
    if (apikKey !== config.polkaKey) {
      throw new Error('Invalid Polka API Key')
    }
  } catch (error) {
    res.status(401).send();
    return;
  }

  type WebhooksQueryType = {
    event: string;
    data: {
      userId: string;
    }
  };

  let parsedBody: WebhooksQueryType;
  try {
      parsedBody = req.body;
  } catch (error) {
      res.status(400).send({"error": "Invalid JSON"});
      return;
  }
  if (parsedBody.event !== "user.upgraded") {
    res.status(204).send();
    return;
  }
  
  try {
    const upgradeResult: boolean | null = await upgradeUser(parsedBody.data.userId);
    if (!upgradeResult) {
      throw new Error('We failed to upgrade the user')
    }
    res.status(204).send();
  } catch (error) {
    res.status(404).send();

  }
}
