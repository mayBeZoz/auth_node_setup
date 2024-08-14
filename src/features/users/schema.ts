import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

export const createUserSchema = z.object({

    body:z.object({
        firstName:z.string({required_error:"User first name is required."})
        .min(3,'User first name must be at least 3 characters.')
        .max(20,"User first name must be less than 20 characters."),

        lastName:z.string({required_error:"User Last name is required."})
        .min(3,'User Last name must be at least 3 characters.')
        .max(20,"User Last name must be less than 20 characters."),

        password:z.string().regex(passwordRegex, {
            message: 'Password must be at least 6 characters long and include at least one capital letter, one number and special character.',
        }),

        confirmPassword:z.string(),

        email:z.string({required_error:"User first name is required."})
        .email('Email is not valid.'),
    })
    
})
.strict()
.refine(data => data.body.password === data.body.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'], 
    
})


export type TCreateUserPayload = z.infer<typeof createUserSchema>['body']

