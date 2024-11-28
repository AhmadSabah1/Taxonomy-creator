import {Literature} from "@/app/models/Literature";

export interface Category {
    id: string;
    name: string;
    description?: string;
    parentCategoryId?: string;
    children?: Category[];
    literature?: Literature[];
}