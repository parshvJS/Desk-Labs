import LoadingPrompt from '@/myComponents/LoadingPrompt';
import { dislikePost, getFeed, likePost } from '@/utils/api';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import Masonry from 'react-masonry-css';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

import like from "../assets/heart.svg"
import liked from "../assets/hearted.svg"
import { useUserContext } from '@/context/authContext';
import { Link } from 'react-router-dom';

const Main = () => {
    const { data: homePosts, isLoading, isError } = useQuery('feed', getFeed);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [likedPosts, setLikedPosts] = useState([]);
    const { user } = useUserContext()
    const handleToggleDescription = () => {
        setShowFullDescription(!showFullDescription);
    };

    // Function to format numbers in a more user-friendly way
    const formatCount = (count) => {
        if (count >= 1e6) return (count / 1e6).toFixed(1) + "m";
        if (count >= 1e3) return (count / 1e3).toFixed(1) + "k";
        return count;
    };

    const breakpointColumnsObj = {
        default: 5,
        1100: 3,
        700: 2,
        500: 1
    };
    const handleLikePost = async (postId) => {
        try {
            if (!likedPosts.includes(postId)) {
                // Push the post ID into the array of liked posts
                setLikedPosts([...likedPosts, postId]);
                // Call the likePost function to like the post
                await likePost(postId, user.id);
            } else {
                await dislikePost(postId, user.id);
                setLikedPosts(likedPosts.filter((id) => id !== postId)); // Remove postId from likedPosts state
          
            }
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    return (
        <div className='px-4 w-full h-full'>
            {isLoading ? (
                <div className='w-full h-full flex justify-center items-center'>
                    <LoadingPrompt />
                </div>
            ) : isError || homePosts === -1 ? (
                <div>Error fetching data</div>
            ) : (
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                >
                    {homePosts.documents.map(post => (
                        <div key={post.id}>
                            {/* Replace DialogTrigger and DialogContent with Link */}
                            <Link to={`/post/${post.$id}/${post.caption.split(" ").join("+")}`} className="p-4">
                                <div className='flex flex-col gap-1 bg-none bg-transparent'>
                                    <div >
                                        <img src={post.imageUrl[0]} className="w-full max-h-full rounded-md bg-transparent" alt={post.caption} />
                                    </div>
                                    <p className='text-black text-sm sm:text-base md:text-base font-medium text-left bg-transparent'>
                                        {post.caption}
                                    </p>
                                </div>
                            </Link>
                            {/* Rest of the code */}
                        </div>
                    ))}
                </Masonry>
            )}
        </div>
    )
}

export default Main;
