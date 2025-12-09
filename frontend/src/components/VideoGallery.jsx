import { useState } from 'react';
import { Play, X } from 'lucide-react';

const VideoGallery = ({ videos }) => {
    const [selectedVideo, setSelectedVideo] = useState(null);

    if (!videos || videos.length === 0) {
        return null;
    }

    const getEmbedUrl = (url) => {
        // Convert YouTube/Vimeo URLs to embed format
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
            return `https://www.youtube.com/embed/${videoId}`;
        } else if (url.includes('vimeo.com')) {
            const videoId = url.split('/').pop();
            return `https://player.vimeo.com/video/${videoId}`;
        }
        return url;
    };

    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Product Videos</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {videos.map((video) => (
                    <div
                        key={video.id}
                        className="relative cursor-pointer group"
                        onClick={() => setSelectedVideo(video)}
                    >
                        <img
                            src={video.thumbnail || '/video-placeholder.png'}
                            alt={video.title || 'Product video'}
                            className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg group-hover:bg-opacity-50 transition">
                            <Play className="w-12 h-12 text-white" fill="white" />
                        </div>
                        {video.title && (
                            <p className="mt-1 text-sm text-gray-600 truncate">{video.title}</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Video Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="relative bg-white rounded-lg max-w-4xl w-full">
                        <button
                            onClick={() => setSelectedVideo(null)}
                            className="absolute -top-10 right-0 text-white hover:text-gray-300"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <div className="aspect-video">
                            {selectedVideo.video_file ? (
                                <video
                                    src={selectedVideo.video_source}
                                    controls
                                    autoPlay
                                    className="w-full h-full rounded-lg"
                                />
                            ) : (
                                <iframe
                                    src={getEmbedUrl(selectedVideo.video_url)}
                                    className="w-full h-full rounded-lg"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            )}
                        </div>

                        {selectedVideo.title && (
                            <div className="p-4">
                                <h3 className="font-semibold">{selectedVideo.title}</h3>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoGallery;
