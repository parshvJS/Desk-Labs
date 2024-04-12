import { z } from "zod"

const logInSchema = z.object({
  email: z.string().min(1, "Please Enter Email").email(),
  password: z.string().min(8, "Password must be at least 8 characters long")
    .max(50, "Password must not exceed 50 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
});

const signInSchema = z.object({
  name: z.string().min(1, "Please Enter Name"),
  email: z.string().min(2, "Please Enter Email"),
  password: z.string().min(8, "Password must be at least 8 characters long")
    .max(50, "Password must not exceed 50 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")

})

const ImageSchema = z.object({
  url: z.string(),
  alt: z.string(),
});

const postSchema = z.object({
  tags: z.string().min(1,{message:"Minimum 1 tag is required"}),
  
  caption: z.string().min(5,{message:"please enter specific caption !"}),
  desc: z.string().min(2,{message:"Please enter specific post description !"}).max(530,"Description Is Too Large !"),
  // budget: z.string().min(1,"please enter the budget to build this setup !"),
  // productLinks: z.string(),
});
const commentSchema= z.object({
  comment:z.string().min(1,{
    message:"Please Enter Your Comment"
  })
})
export {
  logInSchema,
  signInSchema,
  postSchema,
  commentSchema
}
