import { TagIcon, FolderIcon } from '@heroicons/react/24/outline';

interface CategoriesTagsProps {
    categories: { id: number; name: string; slug: string }[];
    tags: { id: number; name: string }[];
}

export default function CategoriesTags({ categories, tags }: CategoriesTagsProps) {
    if (!categories.length && !tags.length) return null;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="space-y-4">
                {/* Categories */}
                {categories.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <FolderIcon className="h-5 w-5 text-indigo-600" />
                            <h3 className="font-semibold text-gray-900">Categories</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <a
                                    key={category.id}
                                    href={`/tools?category=${category.slug}`}
                                    className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-sm rounded-lg hover:bg-indigo-200 transition-colors font-medium"
                                >
                                    {category.name}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <TagIcon className="h-5 w-5 text-indigo-600" />
                            <h3 className="font-semibold text-gray-900">Tags</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <a
                                    key={tag.id}
                                    href={`/tools?tags=${tag.name}`}
                                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    #{tag.name}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
