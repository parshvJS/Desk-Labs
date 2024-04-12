import { useToast } from '@/components/ui/use-toast';
import { getPostComments, getPostDetails, makePostComment } from '@/utils/api.js';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import Loader from './Loader';
import LoadingPrompt from './LoadingPrompt';
import { useUserContext } from '@/context/authContext';
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useQuery } from 'react-query';

import { Input } from "@/components/ui/input"
import { commentSchema } from '@/utils/zodFormSchema';

const PostDetail = () => {
    const { user } = useUserContext()
    const { id, caption } = useParams()
    console.log(id, caption, "dasdas");
    const [postDetails, setPostDetails] = useState({})
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [content, setContent] = useState("")
    const form = useForm({
         resolver: zodResolver(commentSchema),
         defaultValues:{
            comments:""
         }
        })
    const [btnLoading, setBtnLoading] = useState(false)

    const { data: comments, isLoading: commentsLoading, refetch: refetchComments } = useQuery(['postComments', id], () => getPostComments(id), {
        refetchInterval: 10000,
    });



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
                }

                console.log(postDetails);
            } catch (error) {
                toast({
                    title: "Error Fetching Post Details",
                    description: error.message,
                    variant: "destructive"
                });
                throw new Error(error.message);
            }
            finally {
                setIsLoading(false)
            }
        }
        fetchData(id);
    }, []); // Add dependencies here

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
        <div className='w-full h-full flex justify-center items-center flex-col'>

            {
                isLoading ? <div className=' w-full h-full  flex justify-center items-center'>
                    <LoadingPrompt />
                </div> : <Card className="w-[90%] md:w-[60%] pt-4">
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
                                                                    <input className="outline-none border-b-2 border-pri-300 " placeholder="shadcn" {...field} />
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
                                            console.log(comments)
                                        }
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