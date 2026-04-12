interface GalleryViewProps {
    data: any[];
}

export function GalleryView({ data }: GalleryViewProps) {
    if (!data || data.length === 0) {
        return <div className="p-4 text-gray-500">データがありません</div>;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
            {data.map((item, idx) => (
                <div key={idx} className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-yellow-500 transition-all cursor-pointer group">
                    {/* Placeholder for Image */}
                    <div className="aspect-[3/4] bg-gray-700 flex items-center justify-center relative">
                        {/* Try to use image if available, else placeholder */}
                        <div className="text-4xl">👤</div>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                            <p className="text-white text-sm line-clamp-2">{item.description}</p>
                        </div>
                    </div>

                    <div className="p-3">
                        <h3 className="font-bold text-gray-200 truncate">{item.name || item.id}</h3>
                        <p className="text-xs text-gray-500 mt-1 uppercase">{item.id}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
