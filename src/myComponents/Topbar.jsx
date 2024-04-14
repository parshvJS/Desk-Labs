import { Button } from '@/components/ui/button'
import { circleButton, topbarMenu } from '@/constants'
import React, { useState } from 'react'
import { Link, useLocation } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { logInSchema, signInSchema } from '../utils/zodFormSchema.js'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { cn } from "@/lib/utils"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { useUserContext } from '@/context/authContext'
import { useForm } from 'react-hook-form'
import { createNewUser, signInAccount, signOutAccount } from '@/utils/api.js'
import { useToast } from '@/components/ui/use-toast.js'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Loader from './Loader.jsx'


import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import menu from "../assets/menu-burger.svg"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

const Topbar = () => {
    const { pathname } = useLocation();
    const { isAuthenticated, checkAuthUser, user, setIsAuthenticated,isLoginOpen,setIsLoginOpen } = useUserContext()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const accountBtn = [
        {
            name: "Your Profile",
            route: `/profile/user=${user.id}`,
            lable: "profile",
            isOpr: false
        },
        {
            name: "Saves",
            route: `/saves/user=${user.id}`,
            label: "user saves",
            isOpr: false
        },
        {
            name: "Your Posts",
            route: `/posts/user=${user.id}`,
            label: "user posts",
            isOpr: false
        },
        {
            isOpr: true,
            name: "Log Out",
            label: "logout user"
        }
    ]
    const form = useForm({
        resolver: zodResolver(logInSchema),
        defaultValues: {
            email: "",
            password: ""
        },
    })
    const signInForm = useForm({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            name: "",
            email: "",
            password: ""
        },
    })

    async function loginSubmit(values) {
        try {
            setLoading(true)
            const newValues = {
                email: values.email,
                password: values.password
            }
            const loggedInUser = await signInAccount(newValues)
            if (loggedInUser.message) {
                toast({
                    title: "Can't Login",
                    description: loggedInUser.message,
                    variant: "destructive",

                })
            }

            else {
                checkAuthUser()
            }
        } catch (error) {
            throw error.message
        }
        finally {
            setLoading(false)
        }
    }



    async function signInSubmit(values) {
        try {
            setLoading(true)
            const signInUser = await createNewUser(values);
            if (signInUser.message ||signInUser.code >=400) {
                toast({
                    title: "Can't Sign In !",
                    description: signInUser.message,
                    variant: "destructive"
                })
            }

            else {

                loginSubmit(values)
            }



        } catch (error) {
            throw error.message
        }
        finally {
            setLoading(false)
        }

    }

    async function handleLogOut() {
        try {
            const logOut = await signOutAccount()
            if (!logOut) {
                toast({
                    title: "Can't Log Out",
                    description: "Error occured while logging you out !",
                    variant: "destructive"
                })
            }
            else {
                toast({
                    title: "Logout Successfull !",
                    variant: "success"
                })
                setIsAuthenticated(false)
            }

        } catch (error) {

        }
    }
    return (
        <div className='z-50 bg-white flex gap-2 w-full fixed h-16 items-center flex-col border-b-2 border-pri-400 '>
            <div className='bg-white   flex items-center gap-5 justify-between h-9 w-full md:px-7 px-4 pt-5 '>
                <p className='font-mono line-clamp-1 text-xl text-pri-500 font-bold'>Desk Labs</p>
                <div className='md:flex hidden'>
                    <NavigationMenu>
                        <NavigationMenuList>
                            {
                                topbarMenu.map(menu => {
                                    let isActive = pathname === menu.route; // Check if the current menu item is active
                                    return (
                                        <NavigationMenuItem key={menu.name}>
                                            <Link to={`${menu.route}`}>
                                                <NavigationMenuLink className={`${isActive ? "bg-pri-100 text-pri-500" : ""} ${navigationMenuTriggerStyle()}`}>
                                                    {menu.name}
                                                </NavigationMenuLink>
                                            </Link>
                                        </NavigationMenuItem>
                                    );
                                })
                            }
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                <div className=' flex w-fit items-center gap-3'>
                    {
                        isAuthenticated ?
                            (
                                <div className='flex justify-center md:flex '>
                                    <div className='flex justify-center mr-2 gap-3'>
                                        {circleButton.map(btn => {
                                            const isActive = pathname === btn.route;
                                            return (
                                                <TooltipProvider delayDuration={75}>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Link to={`${btn.route}`} key={btn.route}>

                                                                <Button className={`${isActive ? "bg-pri-100" : ""} w-10 h-10`} variant="circle" size="circle">
                                                                    <img src={`${!isActive ? btn.icon : btn.hoverIcon}`} alt={btn.name} className='w-4 h-4' />
                                                                </Button>

                                                            </Link>
                                                        </TooltipTrigger>

                                                        <TooltipContent>
                                                            <p>{btn.name}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            );
                                        })}
                                    </div>


                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button className='md:block hidden bg-transparent hover:bg-transparent w-10 h-fit outline-none'>
                                                <div >
                                                    <Avatar>
                                                        <AvatarImage src={user.imageUrl} />
                                                    </Avatar>
                                                </div>
                                                {/* <p className='hidden md:block text-black font-semibold'>{user.name}</p> */}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56">
                                            <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem>Profile</DropdownMenuItem>
                                                <DropdownMenuItem>Saves</DropdownMenuItem>
                                                <DropdownMenuItem>Your Posts</DropdownMenuItem>
                                                <DropdownMenuItem>Settings</DropdownMenuItem>
                                                <DropdownMenuItem><p className='text-red-700' onClick={handleLogOut}>Log Out</p></DropdownMenuItem>
                                            </DropdownMenuGroup>

                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>



                            ) :
                            (
                                <div className='md:block hidden'>

                                    <div className='gap-2 flex '>
                                        <Dialog open={isLoginOpen} onOpenChange={()=>{ setIsLoginOpen(!isLoginOpen)}} className="w-[90%] md:w-auto">
                                            <DialogTrigger asChild>
                                                <Button className="bg-transparent  hover:bg-pri-100 text-pri-400">Login</Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[425px] w-[90%] md:w-[30%]">
                                                <DialogHeader>
                                                    <DialogTitle><p className='text-xl font-semibold text-pri-550'>Log In To Your Account</p></DialogTitle>
                                                </DialogHeader>
                                                <div>
                                                    <Form {...form}>
                                                        <form onSubmit={form.handleSubmit(loginSubmit)} className="space-y-8">
                                                            <FormField
                                                                control={form.control}
                                                                name="email"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Email</FormLabel>
                                                                        <FormControl>
                                                                            <Input placeholder="shadcn" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name="password"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Password</FormLabel>
                                                                        <FormControl>
                                                                            <Input placeholder="Adsfos34df%f" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <Button type="submit" className="bg-pri-400 hover:bg-pri-300">
                                                                {
                                                                    loading ?
                                                                        <Loader /> : <p>Login</p>
                                                                }
                                                            </Button>
                                                        </form>
                                                    </Form>
                                                </div>
                                            </DialogContent>
                                        </Dialog>




                                        <Dialog >
                                            <DialogTrigger asChild>
                                                <Button className="bg-pri-400 hover:bg-pri-300">Sign In</Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[425px] w-[30%]">
                                                <DialogHeader>
                                                    <DialogTitle>Sign Up To Your Account</DialogTitle>
                                                </DialogHeader>
                                                <div>
                                                    <Form {...signInForm}>
                                                        <form onSubmit={signInForm.handleSubmit(signInSubmit)} className="space-y-8">
                                                            <FormField
                                                                control={signInForm.control}
                                                                name="name"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Name</FormLabel>
                                                                        <FormControl>
                                                                            <Input placeholder="shadcn" {...field} />
                                                                        </FormControl>
                                                                        <FormDescription>
                                                                            This is your public display name.
                                                                        </FormDescription>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={signInForm.control}
                                                                name="email"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Email</FormLabel>
                                                                        <FormControl>
                                                                            <Input placeholder="shadcn" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={signInForm.control}
                                                                name="password"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Password</FormLabel>
                                                                        <FormControl>
                                                                            <Input placeholder="Adsfos34df%f" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <Button type="submit" className="bg-pri-400 hover:bg-pri-300">
                                                                {
                                                                    loading ?
                                                                        <Loader /> : <p>Sign in</p>
                                                                }
                                                            </Button>                                                </form>
                                                    </Form>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            )
                    }
                    <div className='md:hidden'>
                        <Sheet>
                            <SheetTrigger>
                                <div>
                                    <img src={menu} alt="open" className='w-6 h-6' />
                                </div>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>
                                        <div className='w-full h-16 flex items-center gap-5'>
                                            {
                                                isAuthenticated ?
                                                    (
                                                        <div className='flex gap-4'><Avatar>
                                                            <AvatarImage src={user.imageUrl} />
                                                        </Avatar>
                                                            <div>
                                                                <p className='text-sm text-left'>{user.name}</p>
                                                                <p className='text-sm text-gray-400'>{user.email}</p>
                                                            </div>
                                                            <div>

                                                            </div></div>
                                                    ) : (
                                                        <div className=''>

                                                            <div className='gap-2 flex '>
                                                                <Dialog >
                                                                    <DialogTrigger asChild>
                                                                        <Button className="bg-transparent  hover:bg-pri-100 text-pri-400">Login</Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="sm:max-w-[425px]">
                                                                        <DialogHeader>
                                                                            <DialogTitle><p className='text-xl font-semibold text-pri-550'>Log In To Your Account</p></DialogTitle>
                                                                        </DialogHeader>
                                                                        <div>
                                                                            <Form {...form}>
                                                                                <form onSubmit={form.handleSubmit(loginSubmit)} className="space-y-8">
                                                                                    <FormField
                                                                                        control={form.control}
                                                                                        name="email"
                                                                                        render={({ field }) => (
                                                                                            <FormItem>
                                                                                                <FormLabel>Email</FormLabel>
                                                                                                <FormControl>
                                                                                                    <Input placeholder="shadcn" {...field} />
                                                                                                </FormControl>
                                                                                                <FormMessage />
                                                                                            </FormItem>
                                                                                        )}
                                                                                    />
                                                                                    <FormField
                                                                                        control={form.control}
                                                                                        name="password"
                                                                                        render={({ field }) => (
                                                                                            <FormItem>
                                                                                                <FormLabel>Password</FormLabel>
                                                                                                <FormControl>
                                                                                                    <Input placeholder="Adsfos34df%f" {...field} />
                                                                                                </FormControl>
                                                                                                <FormMessage />
                                                                                            </FormItem>
                                                                                        )}
                                                                                    />
                                                                                    <Button type="submit" className="bg-pri-400 hover:bg-pri-300">
                                                                                        {
                                                                                            loading ?
                                                                                                <Loader /> : <p>Login</p>
                                                                                        }
                                                                                    </Button>
                                                                                </form>
                                                                            </Form>
                                                                        </div>
                                                                    </DialogContent>
                                                                </Dialog>




                                                                <Dialog >
                                                                    <DialogTrigger asChild>
                                                                        <Button className="bg-pri-400 hover:bg-pri-300">Sign In</Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="sm:max-w-[425px]">
                                                                        <DialogHeader>
                                                                            <DialogTitle>Sign Up To Your Account</DialogTitle>
                                                                        </DialogHeader>
                                                                        <div>
                                                                            <Form {...signInForm}>
                                                                                <form onSubmit={signInForm.handleSubmit(signInSubmit)} className="space-y-8">
                                                                                    <FormField
                                                                                        control={signInForm.control}
                                                                                        name="name"
                                                                                        render={({ field }) => (
                                                                                            <FormItem>
                                                                                                <FormLabel>Name</FormLabel>
                                                                                                <FormControl>
                                                                                                    <Input placeholder="shadcn" {...field} />
                                                                                                </FormControl>
                                                                                                <FormDescription>
                                                                                                    This is your public display name.
                                                                                                </FormDescription>
                                                                                                <FormMessage />
                                                                                            </FormItem>
                                                                                        )}
                                                                                    />
                                                                                    <FormField
                                                                                        control={signInForm.control}
                                                                                        name="email"
                                                                                        render={({ field }) => (
                                                                                            <FormItem>
                                                                                                <FormLabel>Email</FormLabel>
                                                                                                <FormControl>
                                                                                                    <Input placeholder="shadcn" {...field} />
                                                                                                </FormControl>
                                                                                                <FormMessage />
                                                                                            </FormItem>
                                                                                        )}
                                                                                    />
                                                                                    <FormField
                                                                                        control={signInForm.control}
                                                                                        name="password"
                                                                                        render={({ field }) => (
                                                                                            <FormItem>
                                                                                                <FormLabel>Password</FormLabel>
                                                                                                <FormControl>
                                                                                                    <Input placeholder="Adsfos34df%f" {...field} />
                                                                                                </FormControl>
                                                                                                <FormMessage />
                                                                                            </FormItem>
                                                                                        )}
                                                                                    />
                                                                                    <Button type="submit" className="bg-pri-400 hover:bg-pri-300">
                                                                                        {
                                                                                            loading ?
                                                                                                <Loader /> : <p>Sign in</p>
                                                                                        }
                                                                                    </Button>                                                </form>
                                                                            </Form>
                                                                        </div>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            </div>
                                                        </div>
                                                    )
                                            }
                                        </div>
                                        <hr className='w-full border-black' />
                                    </SheetTitle>
                                    <SheetDescription>
                                        <div className='flex gap-3 flex-col'>
                                            <p className='text-left font-semibold text-pri-300 mt-10'>Quick Links</p>
                                            <div className='flex flex-col gap-1'>
                                                {
                                                    topbarMenu.map(btn => {
                                                        let isActive = pathname === btn.route;
                                                        return <Link to={btn.route} key={btn.label}>
                                                            <div className={`${isActive ? "bg-pri-100 text-pri-400" : "text-black"} flex items-center pl-3 h-10 w-full text-left font-semibold rounded-sm`}>{btn.name}</div>
                                                        </Link>
                                                    })
                                                }
                                            </div>
                                            {
                                                isAuthenticated ?
                                                    <div className='mt-7'>
                                                        <p className='text-left font-semibold text-pri-300 mb-2'>Account</p>
                                                        <div className='flex flex-col gap-1'>
                                                            {
                                                                accountBtn.map(btn => {
                                                                    let isActive = pathname === btn.route;
                                                                    if (btn.isOpr) {
                                                                        return <button onClick={handleLogOut} key={btn.label} variant="ghost" className="w-fit text-left">
                                                                            <div className={`text-red-500 flex items-center pl-3 h-10 w-full text-left font-semibold rounded-sm`}>{btn.name}</div>
                                                                        </button>
                                                                    }
                                                                    else {
                                                                        return <Link to={btn.route} key={btn.label}>
                                                                            <div className={`${isActive ? "bg-pri-100 text-pri-400" : "text-black"} flex items-center pl-3 h-10 w-full text-left font-semibold rounded-sm`}>{btn.name}</div>
                                                                        </Link>
                                                                    }



                                                                })
                                                            }
                                                        </div>
                                                    </div> : ""
                                            }

                                        </div>
                                    </SheetDescription>
                                </SheetHeader>
                            </SheetContent>
                        </Sheet>
                    </div>

                </div>
            </div>

            {/* <hr className='w-full border-pri-550' /> */}
        </div>
    )
}

export default Topbar
