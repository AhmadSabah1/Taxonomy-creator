import { doc, setDoc, getDoc, DocumentReference } from 'firebase/firestore';
import { Category } from '@/app/models/Category';
import {db} from "../../firebaseConfig";

// Define the type for the document data
interface CategoriesDoc {
    categories: Category[];
}

// Utility function to remove undefined fields
const removeUndefinedFields = (obj: any) => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {} as Record<string, any>);
};

// Function to save categories to Firestore
export const saveCategories = async (categories: Category[]): Promise<void> => {
    try {
        // Sanitize each category object
        const sanitizedCategories = categories.map((category) =>
            removeUndefinedFields({
                ...category,
                parentCategoryId: category.parentCategoryId ?? null, // Replace undefined with null
            })
        );

        console.log('Sanitized categories:', sanitizedCategories);

        const docRef: DocumentReference<CategoriesDoc> = doc(db, 'trees', 'categories') as DocumentReference<CategoriesDoc>;

        // Save sanitized data to Firestore
        await setDoc(docRef, { categories: sanitizedCategories });
        console.log('Categories saved successfully');
    } catch (error) {
        console.error('Error saving categories:', error instanceof Error ? error.message : error);
        throw new Error('Failed to save categories.');
    }
};

// Function to retrieve categories from Firestore
export const getCategories = async (): Promise<Category[]> => {
    try {
        const docRef: DocumentReference<CategoriesDoc> = doc(db, 'trees', 'categories') as DocumentReference<CategoriesDoc>;
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return data.categories;
        } else {
            console.log('No categories found');
            return [];
        }
    } catch (error) {
        console.error('Error fetching categories:', error instanceof Error ? error.message : error);
        return [];
    }
};
