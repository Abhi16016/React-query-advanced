import { useState } from 'react';
import { useQueries, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from './ui/button';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

const Parallel = () => {
    const [userIds, setUserIds] = useState<number[]>([1, 2]);

    // Fetch user data in parallel
    const userQueries: UseQueryResult<User>[] = useQueries({
        queries: userIds.map((id) => ({
            queryKey: ['user', id],
            queryFn: async (): Promise<User> => {
                const response = await axios.get<User>(`https://dummyjson.com/users/${id}`);
                return response.data; 
            },
        })),
    });

    const addNextUserId = () => {
        const nextId = Math.max(...userIds) + 1; 
        setUserIds((prev) => [...prev, nextId]);
    };

    return (
        <div>
            <Button onClick={addNextUserId}>Load next user</Button>

            <div>
                {userQueries.map((query, index) => {
                    const userId = userIds[index];
                    if (query.isLoading) {
                        return <p key={userId}>Loading user {userId}...</p>;
                    }
                    if (query.isError) {
                        return <p key={userId}>Error loading user {userId}: {query.error.message}</p>;
                    }
                    if (query.data) {
                        return (
                            <div key={userId}>
                                <h1>User ID: {query.data.id}</h1>
                                <p>Name: {query.data.firstName} {query.data.lastName}</p>
                                <p>Email: {query.data.email}</p>
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

export default Parallel;