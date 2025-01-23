import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../main'; 
import axios from 'axios';
import { Button } from './ui/button'; 
import { Input } from './ui/input'; 

interface Post {
    id: number;
    title: string;
}

const Optimistic = () => {

    const queryKey = ['posts'];

    // Fetch posts with useQuery
    const { data: posts, isLoading, isError } = useQuery<Post[]>({
        queryKey,
        queryFn: async (): Promise<Post[]> => {
            const response = await axios.get<Post[]>('http://localhost:3000/posts?_sort=id&_order=desc');
            return response.data;
        },
    });

    // Add a new post with useMutation
    const { mutate, isError: isMutationError } = useMutation({
        mutationFn: async (newPost: Post) => {
            await axios.post('http://localhost:3000/posts', newPost, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        },
        onMutate: async (newPost) => {
            // Cancel any outgoing refetches for the query
            await queryClient.cancelQueries({ queryKey });

            // Snapshot the previous value
            const previousPosts = queryClient.getQueryData<Post[]>(queryKey);

            // Optimistically update the query data
            queryClient.setQueryData<Post[]>(queryKey, (old) => [
                { ...newPost },
                ...(old || []),
            ]);

            // Return context with the previous data for rollback
            return { previousPosts };
        },
        onError: (_error, _variables, context) => {
            // Rollback the query data if there's an error
            if (context?.previousPosts) {
                queryClient.setQueryData(queryKey, context.previousPosts);
            }
        },
        onSettled: () => {
            // Refetch the data to synchronize with the server
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const [title, setTitle] = useState('');

    // Form submit handler
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Stop the form from refreshing the page when submitted

        // Validate the input to ensure the title is not empty
        if (!title.trim()) {
            alert('Please enter a title.');
            return;
        }

        // Create a new post object
        const newPost: Post = {
            id: Date.now(), 
            title: title.trim(),
        };

        // Trigger the mutation to add the new post
        mutate(newPost);

        // Clear the input value after submission
        setTitle('');
    };

    return (
        <div className="p-4 flex gap-12">
            {/* Form Section */}
            <div className="flex-1">
                <form className="flex flex-col" onSubmit={handleSubmit}>
                    {/* Controlled Input */}
                    <Input
                        className="border mb-4 p-2"
                        type="text"
                        placeholder="Title"
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)} 
                    />
                    <Button className="border mb-4 p-2 bg-purple-500 text-white" type="submit">
                        Submit
                    </Button>
                </form>
            </div>

            {/* Posts Display Section */}
            <div className="flex-1">
                <h2 className="text-lg font-bold mb-4">Posts:</h2>
                <ul>
                    {isMutationError && (
                        <p className="text-red-500">Something went wrong while submitting a post</p>
                    )}
                    {isLoading ? (
                        <p>Loading posts...</p>
                    ) : isError ? (
                        <p className="text-red-500">Failed to load posts.</p>
                    ) : posts && posts.length > 0 ? (
                        posts.map((post) => (
                            <li className="border p-2 mb-4" key={post.id}>
                                {post.title}
                            </li>
                        ))
                    ) : (
                        <p>No posts available</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Optimistic;
