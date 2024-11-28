import {Literature} from "@/app/models/Literature";

export interface Category {
    id: string;
    name: string;
    description: string;
    literature?: Literature[];
    parentCategoryId?: string | null;
    children?: Category[];
    color?: string;
}
