import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Agent } from '../entities/Agent';
import { AppDataSource } from '../db/data-source';


declare global {
  namespace Express {
    interface Request {
      agentId?: number | string; // Adjust to 'number' or 'string' based on your Agent ID type
    }
  }
}


interface AgentTokenPayload {
  id: number | string;
  email: string;
}

interface AgentTokenPayload {
  id: number | string;
  email: string;
}

export const authenticateAgent = (req: Request, res: Response, next: NextFunction) => {
  try {
   
    const token = req.cookies?.agent_auth_token;
    
    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized. No token provided."
      });
    }
    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as AgentTokenPayload;

    req.agentId = decoded.id;

    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    
    // Differentiate between token expiration and invalid tokens if needed
    const message = error instanceof jwt.TokenExpiredError 
      ? "Unauthorized. Token has expired." 
      : "Unauthorized. Invalid token.";

    return res.status(401).json({
      status: false,
      message
    });
  }
};




export const checkAuth = async (req: Request, res: Response) => {
  try {
    // 1. Read token directly from request cookies
    const token = req.cookies?.agent_auth_token;

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized. No token provided."
      });
    }

    // 2. Verify token inline
    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as AgentTokenPayload;

    // 3. Fetch agent from Database to get the Name
    const agentRepository = AppDataSource.getRepository(Agent);
    const agent = await agentRepository.findOne({
      // @ts-ignore
      where: { id: decoded.id },
      // Select the fields you need (update these based on your DB columns)
      select: ['id', 'email', 'first_name', 'last_name', 'agency_name'] 
    });

    if (!agent) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized. Agent no longer exists."
      });
    }

    // 4. Return success response with user payload including name
    // Example: Combining first and last name, or falling back to agency_name/email
    const agentName = agent.first_name 
      ? `${agent.first_name} ${agent.last_name}` 
      : (agent.agency_name || agent.email);

    return res.status(200).json({
      status: true,
      message: "Agent authenticated successfully",
      agentId: agent.id,
      email: agent.email,
      name: agentName 
    });

  } catch (error) {
    console.error('[CheckAuth Error]:', error);

    const message = error instanceof jwt.TokenExpiredError 
      ? "Unauthorized. Token has expired." 
      : "Unauthorized. Invalid token.";

    return res.status(401).json({
      status: false,
      message
    });
  }
};


export const logoutAgent = (req: Request, res: Response) => {
  try {
    // Clear the HTTP-Only cookie by setting its expiration date to the past
    res.clearCookie('agent_auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      // Ensure path or domain match if they were explicitly specified when setting the cookie
      path: '/' 
    });

    return res.status(200).json({
      status: true,
      message: "Agent logged out successfully."
    });
  } catch (error) {
    console.error('[Logout Error]:', error);
    
    return res.status(500).json({
      status: false,
      message: "Internal server error during logout."
    });
  }
};