import React from 'react';
import { useQuery } from 'react-query';
import { getRepostFeed } from '@/utils/api';

const Reposts = () => {
  // Fetching data using React Query
  const { data: feedData, isLoading, isError } = useQuery('repostFeed', getRepostFeed);
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching repost feed.</div>;
  }

  return (
    <div className='px-4 w-full'>
      <div className='w-full'>
        {/* Render feedData here */}
        <div className='w-[70%]'>
          {feedData?.success ? (
            <ul>
              {
                console.log(feedData)
              }
              {feedData.message.documents.map((document) => (
                <li key={document.$id}>
                  
                </li>
              ))}
            </ul>
          ) : (
            <div>No reposts found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reposts;
