import { useToast } from '@/components/ui/use-toast';
import { createRepost, dislikePost, getPostComments, getPostDetails, getUserDetails, likePost, makePostComment, userWantToFollow, userWantToUnfollow } from '@/utils/api.js';
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import Loader from './Loader';
import LoadingPrompt from './LoadingPrompt';
import { useUserContext } from '@/context/authContext';
import { Button } from "@/components/ui/button"

import { useQuery } from 'react-query';
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
import { commentSchema, repostSchema } from '@/utils/zodFormSchema';
import arrow from "../assets/backArrow.svg"
import repost from "../assets/repost.svg"
import { formatNumber } from '@/constants';
import like from '../assets/like.svg'
import liked from '../assets/liked.svg'
const PostDetail = () => {
    const { user } = useUserContext()
    const { id, caption } = useParams()
    const [postDetails, setPostDetails] = useState({})
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [content, setContent] = useState("")
    const [isUserAvail, setIsUserAvail] = useState(false)
    const [postUserData, setPostUserData] = useState({})
    const [isLiked, setIsLiked] = useState(false)

    const form = useForm({
        resolver: zodResolver(commentSchema),
        defaultValues: {
            comments: ""
        }
    })
    const [btnLoading, setBtnLoading] = useState(false)

    const { data: comments, isLoading: commentsLoading, refetch: refetchComments } = useQuery(['postComments', id], () => getPostComments(id), {
        refetchInterval: 10000,
    });


    const repostForm = useForm({
        resolver: zodResolver(repostSchema),
    })


    async function handleRepostForm(values) {
        try {
            setIsLoading(true)
            const makeRepost = await createRepost(id, values.caption);
            if (!makeRepost.success) {
                toast({
                    title: "Error While Reposting !",
                    description: makeRepost.message,
                    variant: "destructive"

                })
            }
            else {
                toast({
                    title: "Successfully Reposted !",
                    variant: "success"

                })
            }
        } catch (error) {
            toast({
                title: "Error While Reposting !",
                description: error.message,
                variant: "destructive"

            })
        } finally {
            setIsLoading(false)
        }
    }
    const handleToggleDescription = () => {
        setShowFullDescription(!showFullDescription);
    };




    useEffect(() => {
        async function fetchData(id) {
            try {
                const postData = await getPostDetails(id);
                if (postData.success === false) {
                    toast({
                        title: "Error Fetching Post Details",
                        message: postData.message
                    });
                } else {
                    setPostDetails(postData.data);
                    await getPostUser(postData.data.userId);
                }
            } catch (error) {
                toast({
                    title: "Error Fetching Post Details",
                    description: error.message,
                    variant: "destructive"
                });
                throw new Error(error.message);
            }
            finally {
                setIsLoading(false);
            }
        }

        fetchData(id);
    }, []);

    async function getPostUser(userId) {
        try {
            console.log("callerd");
            const user = await getUserDetails(userId);
            console.log("callerd 1 ", user);
            if (user === -1) {
                setIsUserAvail(false);
            } else {
                setIsUserAvail(true)
                setPostUserData(user);
            }
            console.log(user, "is here");
        } catch (error) {
            // Handle error fetching user details
            console.error("Error fetching user details:", error);
        }
    }
    async function handleFollow() {
        try {
            // Immediately update UI state
            const updatedFollowers = [...postUserData.followers];
            const isAlreadyFollowed = updatedFollowers.includes(user.id);
            if (isAlreadyFollowed) {
                updatedFollowers.splice(updatedFollowers.indexOf(user.id), 1); // Unfollow
            } else {
                updatedFollowers.push(user.id); // Follow
            }
            setPostUserData(prevState => ({ ...prevState, followers: updatedFollowers }));

            // Perform API call in the background
            let followResult;
            if (isAlreadyFollowed) {
                followResult = await userWantToUnfollow(user.id, postUserData.$id);
            } else {
                followResult = await userWantToFollow(user.id, postUserData.$id);
            }

            if (!followResult.success) {
                // Revert UI state if API call fails
                setPostUserData(prevState => ({ ...prevState, followers: postUserData.followers }));
                toast({
                    title: "Error Following User",
                    description: followResult.message,
                    variant: "destructive"
                });
            }
        } catch (error) {
            // Handle errors
            console.error("Error following user:", error);
            toast({
                title: "Error Following User",
                description: error.message,
                variant: "destructive"
            });
        }
    }

    async function handleComment(values) {
        try {
            setBtnLoading(true);
            const comment = await makePostComment(id, user.id, values.comment);
            if (!comment.success) {
                toast({
                    title: "Can't Post Your Comment !",
                    description: comment.message,
                    variant: "destructive"
                });
            } else {
                await refetchComments();
            }

        } catch (error) {
            toast({
                title: "Can't Post Your Comment !",
                description: error.message,
                variant: "destructive"
            });
            throw new Error(error.message);
        }
        finally {
            setBtnLoading(false);
            form.reset()
        }
        console.log(values);
    }

    return (
        <div className='w-full h-full flex justify-center gap-10 flex-col md:flex-row items-center'>
            <Link to={"/"}>
                <img src={arrow} className='left-5 md:left-10 top-[72px] absolute  w-10 h-10 p-2 rounded-full bg-gray-200 hover:bg-pri-100' alt="" />
            </Link>
            {
                isLoading ? <div className=' w-full h-full  flex justify-center items-center'>
                    <LoadingPrompt />
                </div> : <Card className="w-[90%] md:w-[60%] pt-4 shadow-lg">
                    <CardContent>
                        <div className='flex gap-4 md:flex-row flex-col '>
                            <div className='w-full md:w-1/2 h-full  flex flex-col md:flex-row'>
                                {isLoading ? (
                                    <div className=' w-full h-full  flex justify-center items-center'>
                                        <LoadingPrompt />
                                    </div>
                                ) : postDetails.imageUrl.length === 1 ? (
                                    <div className=''>
                                        <img src={postDetails.imageUrl[0]} className='rounded-md' alt="" />
                                    </div>
                                ) : (
                                    <Carousel className="rounded-md">
                                        <CarouselContent >
                                            {postDetails.imageUrl.map((image, index) => (
                                                <CarouselItem key={index}>
                                                    <div className='flex justify-center items-center'>
                                                        <img src={image} className="rounded-md" alt="" />
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious className="absolute left-1 " />
                                        <CarouselNext className="absolute right-1" />
                                    </Carousel>
                                )}
                            </div>
                            <div className='w-full md:w-1/2 flex flex-col gap-4'>
                                <p className='text-3xl font-semibold max-w-[90%]'>{postDetails.caption}</p>
                                <div>
                                    <p className='text-gray-600 sm:text-base md:text-base text-base font-thin max-w-[90%]'>
                                        {showFullDescription ? postDetails.desc : postDetails.desc.slice(0, 100)}
                                        {postDetails.desc.length > 100 && (
                                            <button className="text-pri-600 hover:underline" onClick={handleToggleDescription}>
                                                {showFullDescription ? "   Less" : "   More"}
                                            </button>
                                        )}
                                    </p>
                                </div>
                                {/* user */}
                                {
                                    isUserAvail ? <div className='flex gap-4 items-center justify-between'>
                                        <div className='flex gap-4'>
                                            <img src={postUserData.imageUrl} className='w-8 h-8 rounded-full' alt="userImage" />
                                            <p className='text-gray-700 font-semibold '>{postUserData.name}</p>
                                            {postUserData.followers.length > 1001 ? <p>{formatNumber(postUserData.followers.length < 1001)} Followers</p> : ""

                                            }
                                        </div>
                                        <div>

                                            <Button
                                                onClick={handleFollow}
                                                variant={postUserData.followers.includes(user.id) ? "followed" : "follow"}>
                                                {postUserData.followers.includes(user.id) ? "Followed" : "Follow"}
                                            </Button>
                                        </div>
                                    </div> : ""
                                }
                                {/* interaction */}
                                <div className='flex gap-4 items-center'>
                                    <div>

                                        <Dialog>
                                            <DialogTrigger>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <div className='flex gap-2 w-24 h-fit p-2 justify-center items-center rounded-md hover:bg-pri-100'>
                                                                <img src={repost} className="w-5 h-5" alt="repost" />
                                                                <p className='text-base font-semibold'>Repost</p>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Repost</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <div className='w-full h-full'>
                                                    <div className='w-full h-fit flex flex-col justify-center items-center'>
                                                        <Carousel className="rounded-md">
                                                            <CarouselContent >
                                                                {postDetails.imageUrl.map((image, index) => (
                                                                    <CarouselItem key={index}>
                                                                        <div className='flex justify-center items-center'>
                                                                            <img src={image} className=' max-h-[40%] md:max-h-[360px] w-fit' alt="" />
                                                                        </div>
                                                                    </CarouselItem>
                                                                ))}
                                                            </CarouselContent>
                                                            <CarouselPrevious className="absolute left-0 " />
                                                            <CarouselNext className="absolute right-0" />
                                                        </Carousel>                                                    </div>
                                                    <div>
                                                        <Form {...repostForm}>
                                                            <form onSubmit={repostForm.handleSubmit(handleRepostForm)} className="space-y-8">
                                                                <FormField
                                                                    control={repostForm.control}
                                                                    name="caption"
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>Caption</FormLabel>
                                                                            <FormControl>
                                                                                <input className='w-full border-2 border-gray-600 p-2 rounded-md' placeholder="shadcn" {...field} />
                                                                            </FormControl>
                                                                            <FormDescription>
                                                                                Enter your quotes for this post !
                                                                            </FormDescription>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                                <Button type="submit">   {
                                                                    btnLoading ?
                                                                        <Loader /> : <p>Repost</p>
                                                                }</Button>
                                                            </form>
                                                        </Form>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>

                                    </div>
                                    {
                                        console.log(postDetails)
                                    }
                                    <button onClick={isLiked || postDetails.likes.includes(user.id) ?()=>{setIsLiked(false);dislikePost(id,user.id) }: ()=>{setIsLiked(true);likePost(id,user.id)}} className='flex gap-2 w-24 h-fit p-2 justify-center items-center '>
                                        <img src={isLiked || postDetails.likes.includes(user.id) ? liked : like } className="w-5 h-5" alt="repost" />
                                        <p className='text-base font-semibold'>{isLiked || postDetails.likes.includes(user.id)? "liked" : "like" }</p>
                                    </button>
                                    <div></div>
                                </div>
                                <div className='flex gap-4 justify-center flex-col '>
                                    <div className='flex gap-4'>
                                        <img src={user.imageUrl} className='w-5 h-5 rounded-full' alt="" />
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(handleComment)} className="space-y-8">
                                                <div className='flex gap-2 justify-between'>
                                                    <FormField
                                                        control={form.control}
                                                        name="comment"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <input className="outline-none border-b-2 border-pri-300 " placeholder="Enter comment" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <Button type="submit" className="w-24 h-6" variant="commentBtn" size="commentBtn">
                                                        {
                                                            btnLoading ?
                                                                <Loader /> : <p>Comment</p>
                                                        }
                                                    </Button>
                                                </div>
                                            </form>
                                        </Form>
                                    </div>
                                    <div className='flex gap-4 flex-col'>

                                        <p className='text-sm font-medium text-black'>Comments</p>

                                        {
                                            comments ?
                                                comments.map(comment => (
                                                    <div className='flex gap-2 items-center'>
                                                        <img src={comment.imageUrl} className='w-6 h-6 rounded-full' alt="" />
                                                        <div className='leading-4'>
                                                            <p className='font-medium text-black'>{comment.name}</p>
                                                            <p>{comment.content}</p>

                                                        </div>
                                                    </div>
                                                ))
                                                : ""

                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            }

        </div>
    )

}

export default PostDetail