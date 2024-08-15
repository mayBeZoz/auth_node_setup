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
    .strict()    
    .refine(data => data.password === data.confirmPassword, {
        message: 'Passwords must match',
        path: ['confirmPassword'], 
        
    })

})


export const submitUserAccountValidationOTP = z.object({
    body:z.object({
        accountVerificationOTP:z.string({
            required_error:"account verification code is required"
        }).length(6,'account verification code must be 6 numbers')
    }).strict(),
    params:z.object({
        id:z.string()
    })
})


export const userLoginSchema = z.object({
    body:z.object({
        email:z.string({
            required_error:"email is required"
        }).email('email is not valid'),
        password:z.string({
            required_error:"password is required"
        })
    })
}) 



export type TCreateUserPayload = z.infer<typeof createUserSchema>['body']
export type TAccountVerificationPayload = z.infer<typeof submitUserAccountValidationOTP>['body']
export type TAccountVerificationParams = z.infer<typeof submitUserAccountValidationOTP>['params']
export type TUserLoginPayload = z.infer<typeof userLoginSchema>['body']

export type TUserTokenPayload = {
    _id:string,
    email:string,
    verified:boolean,
    role:'user'
}

