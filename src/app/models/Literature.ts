// models/Literature.ts
export interface Literature {
    id: string; // Unique identifier
    title: string;
    author?: string;
    date?: string;
    url: string;
}
