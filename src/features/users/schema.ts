import { z } from "zod";
import { UserRoles } from "../../core/utils/constants";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;



export const createUserSchema = z.object({

    body:z.object({
        firstName:z.string({required_error:"User first name is required."})
        .min(3,'User first name must be at least 3 characters.')
        .max(20,"User first name must be less than 20 characters."),

        lastName:z.string({required_error:"User Last name is required."})
        .min(3,'User Last name must be at least 3 characters.')
        .max(20,"User Last name must be less than 20 characters."),

        password:z.string({
            required_error:"password is required"
        }).regex(passwordRegex, {
            message: 'Password must be at least 6 characters long and include at least one capital letter, one number and special character.',
        }),

        confirmPassword:z.string({
            required_error:"confirm password field is required"
        }),

        email:z.string({required_error:"User first name is required."})
        .email('Email is not valid.'),
    })
    .strict()    
    .refine(data => data.password === data.confirmPassword, {
        message: 'Passwords must match',
        path: ['confirmPassword'], 
        
    }),

})


export const submitUserAccountValidationOTP = z.object({
    body:z.object({
        accountVerificationOTP:z.string({
            required_error:"account verification code is required"
        }).length(6,'account verification code must be 6 numbers')
    }).strict(),
    params:z.object({
        id:z.string({
            required_error:"user id is required"
        })
    }),

})


export const submitUserResetPasswordOTP = z.object({
    body:z.object({
        resetPasswordOTP:z.string({
            required_error:"account verification code is required"
        }).length(6,'account verification code must be 6 numbers'),
        newPassword:z.string({
            required_error:"password is required"
        }).regex(passwordRegex, {
            message: 'Password must be at least 6 characters long and include at least one capital letter, one number and special character.',
        })
    }).strict(),
    params:z.object({
        email:z.string({
            required_error:"user email is required"
        })
    }),

})

export const getUserResetPasswordOTP = z.object({
    params:z.object({
        email:z.string({
            required_error:"user email is required"
        })
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
    }),

}) 

export const getAllUsersSchema = z.object({
    query:z.object({
        limit:z.string().optional(),
        page:z.string().optional(),
        search:z.string().optional()
    }).optional(),
})

export const getUserByIdSchema = z.object({
    params:z.object({
        id:z.string({
            required_error:"user id is required"
        })
    }),
}) 

export const updateUserSchema = z.object({
    body: z.object({
        firstName:z.string()
        .min(3,'User first name must be at least 3 characters.')
        .max(20,"User first name must be less than 20 characters.")
        .optional(),

        lastName:z.string()
        .min(3,'User last name must be at least 3 characters.')
        .max(20,"User last name must be less than 20 characters.")
        .optional(),
    }).strict(),
    params:z.object({
        id:z.string({
            required_error:"user id is required"
        })
    })
})

export const changeUserRoleSchema = z.object({
    body:z.object({
        role:z.enum([UserRoles.ADMIN,UserRoles.SUPER_ADMIN,UserRoles.USER],{
            required_error:"user role is required"
        })
    }),
    params:z.object({
        id:z.string({
            required_error:"user id is required"
        })
    })
})

export const deleteUserSchema = z.object({
    params:z.object({
        id:z.string({
            required_error:"user id is required"
        })
    })
})

export type TCreateUserPayload = z.infer<typeof createUserSchema>['body']

export type TAccountVerificationPayload = z.infer<typeof submitUserAccountValidationOTP>['body']
export type TAccountVerificationParams = z.infer<typeof submitUserAccountValidationOTP>['params']

export type TSubmitResetPasswordPayload = z.infer<typeof submitUserResetPasswordOTP>['body']
export type TSubmitResetPasswordParams = z.infer<typeof submitUserResetPasswordOTP>['params']

export type TUserLoginPayload = z.infer<typeof userLoginSchema>['body']

export type TGetAllUsersQuery = z.infer<typeof getAllUsersSchema>['query']

export type TGetUserByIdParams = z.infer<typeof getUserByIdSchema>['params']

export type TUpdateUserPayload = z.infer<typeof updateUserSchema>['body']
export type TUpdateUserParams = z.infer<typeof updateUserSchema>['params']

export type TDeleteUserParams = z.infer<typeof deleteUserSchema>['params']

export type TChangeUserRolePayload = z.infer<typeof changeUserRoleSchema>['body']
export type TChangeUserRoleParams = z.infer<typeof changeUserRoleSchema>['params']

export type TGetResetPasswordParams = z.infer<typeof getUserResetPasswordOTP>['params']

export type TUserTokenPayload = {
    _id:string,
    email:string,
    role:UserRoles
}

