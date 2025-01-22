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
    // Fetch posts with useQuery
    const { data: posts, isLoading, isError } = useQuery<Post[]>({
        queryKey: ['posts'],
        queryFn: async (): Promise<Post[]> => {
            const response = await axios.get<Post[]>('http://localhost:3000/posts?_sort=id&_order=desc');
            return response.data;
        },
    });

    // Add a new post with useMutation
    const { mutate, isError: isMutationError, isPending, variables } = useMutation({
        mutationFn: async (newPost: Post) => {
            await axios.post('http://localhost:3000/posts', newPost, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
    });

    // Handle form submission
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const titleInput = (e.target as HTMLFormElement).elements.namedItem('title') as HTMLInputElement;
        const title = titleInput.value.trim();

        if (!title) {
            alert('Title cannot be empty!');
            return;
        }

        const post: Post = {
            id: Date.now(),
            title,
        };

        mutate(post, {
            onSuccess: () => {
                titleInput.value = ''; 
            },
        });
    };

    const handleRetry = (variables: Post) =>{
        mutate(variables)
    } 

    return (
        <div className="p-4 flex gap-12">
            <div className="flex-1">
                <form className="flex flex-col" onSubmit={handleSubmit}>
                    <Input
                        className="border mb-4 p-2"
                        type="text"
                        placeholder="Title"
                        name="title"
                    />
                    <button className="border mb-4 p-2 bg-purple-500 text-white" type="submit">
                        Submit
                    </button>
                </form>
            </div>
            <div className="flex-1">
                <h2 className="text-lg font-bold mb-4">Posts:</h2>
                <ul>
                    {/* Optimistic UI for pending mutation */}
                    {isPending && variables && (
                        <li className="border p-2 mb-4 opacity-40" key={variables.id}>
                            {variables.title}
                        </li>
                    )}

                    {isMutationError && <p className="text-red-500">Something went wrong while submitting a post</p>}
            
                    {isError && variables ? (
                        <li className="border p-2 mb-4 flex justify-between" key={variables.id}>
                            <span className="text-red-700">{variables.title}</span>
                            <Button onClick={() => handleRetry}>Retry</Button>
                        </li>
                    ) : null}
         
                    {isLoading ? (
                        <p>Loading posts...</p>
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