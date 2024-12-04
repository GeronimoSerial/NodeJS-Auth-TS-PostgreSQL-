import { Request, Response } from "express";
import { comparePassword, hashPassword } from "../services/password.service";
import prisma from "../models/user";
import { generateToken } from "../services/auth.service";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await hashPassword(password);
    console.log(hashedPassword);

    const user = await prisma.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    //token
    const token = generateToken(user);
    res.status(201).json({ token });
  } catch (error: any) {
    //todo error handling
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    if (error?.code === "P2002" && error?.meta?.target?.includes("email")) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }

    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await prisma.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User or password incorrect" });
      return;
    }

    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      res.status(404).json({ error: "User or password incorrect" });
      return;
    }

    const token = generateToken(user);
    res.status(200).json({ token });
    
  } catch (error) {
    console.log(error)
  }
};
