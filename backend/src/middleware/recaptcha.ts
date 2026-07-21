import { Request, Response, NextFunction } from "express";
import axios from "axios";

export const verifyRecaptcha = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.body.recaptchaToken;

    if (!token) {
      res.status(400).json({
        success: false,
        message: "reCAPTCHA token is required",
      });
      return;
    }

    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET,
          response: token,
        },
      }
    );

    if (!response.data.success) {
      res.status(403).json({
        success: false,
        message: "reCAPTCHA verification failed",
      });
      return;
    }

    next();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "reCAPTCHA verification failed",
    });
  }
};