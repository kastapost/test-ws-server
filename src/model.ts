export interface User {
    id: string;
    email: string;
}

export interface Place {
    id: string;
    title: string;
    description: string;
    lat: number;
    lon: number;
    owner: User;
    created: Date;
    updated: Date;
}
