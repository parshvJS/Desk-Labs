import React, { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getPeopleList, getRepostFeed, userWantToFollow, userWantToUnfollow } from '@/utils/api';
import LoadingPrompt from '@/myComponents/LoadingPrompt';
import { CalendarIcon } from "@radix-ui/react-icons"
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { formatTimestamp } from '@/constants';
import { Link } from 'react-router-dom';
import { useUserContext } from '@/context/authContext';
import { useToast } from '@/components/ui/use-toast';
import Loader from '@/myComponents/Loader';

const Reposts = () => {
  const { user } = useUserContext()
  const { toast } = useToast()
  const [postUserData, setPostUserData] = useState(null);
  const queryClient = useQueryClient();
  const [isFollowLoading, setIsFollowLoading] = useState(-1)
  const followMutation = useMutation(userWantToFollow);
  const unfollowMutation = useMutation(userWantToUnfollow);

  const { data: feedData, isLoading, isError } = useQuery('repostFeed', getRepostFeed);
  const { data: peopleData } = useQuery('peopleFeed', getPeopleList);

  if (isLoading) {
    return <div className='w-full h-screen flex justify-center '><LoadingPrompt /></div>;
  }

  if (isError) {
    return <div>Error fetching repost feed.</div>;
  }

  async function handleFollow(interstingUser, index) {
    try {
      setIsFollowLoading(index)
      const documentId = interstingUser.$id;
      const userId = user.id;

      // Update UI state
      setPostUserData(prevState => ({
        ...prevState,
        followers: interstingUser.followers.includes(user.id)
          ? interstingUser.followers.filter(id => id !== user.id)
          : [...interstingUser.followers, user.id]
      }));

      // Determine which function to call based on follow status
      const followFunction = interstingUser.followers.includes(user.id)
        ? userWantToUnfollow
        : userWantToFollow;

      // Call the appropriate function
      const followResult = await followFunction(userId, documentId);

      if (!followResult.success) {
        // Handle error
        toast({
          title: "Error Following User",
          description: followResult.message,
          variant: "destructive"
        });
        // Revert UI state
        setPostUserData(prevState => ({
          ...prevState,
          followers: interstingUser.followers
        }));
      } else {
        // Invalidate relevant queries upon success
        queryClient.invalidateQueries('peopleFeed');
        queryClient.invalidateQueries('repostFeed');
      }
    } catch (error) {
      // Handle error
      toast({
        title: "Error Following User",
        description: error.message,
        variant: "destructive"
      });
      // Revert UI state
      setPostUserData(prevState => ({
        ...prevState,
        followers: interstingUser.followers
      }));
    } finally {
      setIsFollowLoading(-1)
    }
  }


  return (
    <div className='px-4 md:px-20 w-full'>
      <div className='w-full flex justify-evenly'>
        <div className='w-full md:w-[60%]'>
          {feedData?.success ? (
            <ul className='flex flex-col gap-3'>
              {feedData.message.map((document) => (
                <Card className="p-4 border-2 border-gray-200 shadow-md rounded-lg">
                  <CardContent className="flex flex-col gap-4">
                    <div className='flex gap-4 items-center'>
                      <Link to={`/profile/${document.reposterId}`}>
                        <img className='w-10 h-10 rounded-full' src={document.reposter.imageUrl} alt="" />
                      </Link>
                      <div>
                        <div className='flex gap-2 items-center'>
                          <Link to={`/profile/${document.reposterId}`}>
                            <p className="text-black font-medium hover:underline">{document.reposter.name}</p>
                          </Link>
                          <p className='font-light text-sm'> • {formatTimestamp(document.$createdAt)}</p>
                        </div>
                        <p>{document.caption}</p>
                      </div>
                    </div>
                    <div>
                      <Card className=" md:w-full">
                        <CardContent className="p-4 flex justify-center items-center">
                          {
                            document.originalPost.imageUrl.length == 1 ?
                              <div className='flex justify-center items-center '>
                                <img src={document.originalPost.imageUrl[0]} className='max-w-auto rounded-md max-h-[500px]' alt="" />
                              </div> : <Carousel>
                                <CarouselContent>
                                  {document.originalPost.imageUrl.map((image, index) => (
                                    <CarouselItem key={index}>
                                      <img className='max-w-auto rounded-md max-h-[500px]' src={image} alt={`Image ${index}`} />
                                    </CarouselItem>
                                  ))}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                              </Carousel>

                          }
                        </CardContent>
                      </Card>
                      <div className='flex items-center gap-1'>
                        <p className='font-medium text-sm'>From</p>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Link to={`/profile/${document.reposter.$id}`}>
                              <p className='font-medium text-sm hover:underline'>@{document.owner.name}</p>
                            </Link>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-60">
                            <div className="flex space-x-1">
                              <Avatar>
                                <AvatarImage src={document.owner.imageUrl} />
                                <AvatarFallback>VC</AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                <div className=" flex gap-4 items-center text-sm font-semibold ">@{document.owner.name}
                                  <span className="text-xs text-muted-foreground">
                                    • Joined {formatTimestamp(document.owner.$createdAt)}
                                  </span>
                                </div>
                                <p>{document.owner.followers.length} Followers</p>


                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              ))}
            </ul>
          ) : (
            <div>No reposts found.</div>
          )}
        </div>
        <Card className='sticky w-full md:w-[30%] flex flex-col gap-2 h-fit shadow-md'>
          <CardContent>
            <div className='p-4'>
              <p className='text-2xl font-bold mb-3'>Who to follow</p>
              <div className='flex gap-2 flex-col'>
                {peopleData.message.map((people, index) => (
                  <div key={index} className='flex gap-2 items-center justify-between'>
                    <div className='flex gap-2'>
                      <Avatar>
                        <AvatarImage src={people.imageUrl} />
                        <AvatarFallback>VC</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className='text-md font-medium'>{people.name.length > 15 ? people.name.slice(0, 12) + "..." : people.name}</p>
                        <p className='text-sm'>{people.followers.length} Followers</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleFollow(people, index)}
                      className="h-8 w-fit"
                      variant={people.followers.includes(user.id) ? "followed" : "follow"}>
                      <Button
                        className="h-8 w-fit"
                        onClick={() => handleFollow(people, index)}
                        variant={people.followers.includes(user.id) ? "followed" : "follow"}>
                        {isFollowLoading === index ? (
                          <Loader />
                        ) : (
                          people.followers.includes(user.id) ? "Followed" : "Follow" // Show follow status text
                        )}
                      </Button>

                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reposts;
