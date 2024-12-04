import { Request, Response } from "express";
import { hashPassword } from "../services/password.service";
import prisma from "../models/user";
import { hash } from "crypto";

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await hashPassword(password);

    const user = await prisma.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    res.status(201).json(user);
  } catch (error: any) {
    if (error?.code === "P2002" && error?.meta?.target?.includes("email")) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await prisma.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = parseInt(req.params.id); //Por parametro

  try {
    const user = await prisma.findUnique({
      where: {
        id: userId,
      },
    });
    res.status(200).json(user);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = parseInt(req.params.id); //Por parametro
  const { email, password } = req.body;

  let dataToUpdate: any = { ...req.body };

  if (password) {
    const hashedPassword = await hashPassword(password);
    dataToUpdate.password = hashedPassword;
  }

  if (email) {
    dataToUpdate.email = email;
  }

  try {
    const user = await prisma.update({
      where: {
        id: userId,
      },
      data: dataToUpdate,
    });
    res.status(200).json(user);
  } catch (error: any) {
    //todo error handling
    if (error?.code === "P2002" && error?.meta?.target?.includes("email")) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }

    if (error?.code === "P2025") {
      res.status(404).json({ error: "User not found" });
      return;
    }
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = parseInt(req.params.id); //Por parametro

  try {
    const user = await prisma.delete({
      where: {
        id: userId,
      },
    });
    res.status(200).json(user).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
