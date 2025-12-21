import * as z from "zod"

const registrationSchema = z.object({
    fullname : z.string().min(3, "Fullname must be at least 3 characters long"),
    email: z.email({ message: "Invalid email address format" }), // <-- ZOD's built-in email check
         
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(100, { message: "Password cannot exceed 100 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" }) // <-- Custom rule for strength
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
});
const loginSchema = z.object({
    email: z.email({ message: "Invalid email address format" }),
     password: z.string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(100, { message: "Password cannot exceed 100 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" }) // <-- Custom rule for strength
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
}); 

export { registrationSchema , loginSchema };