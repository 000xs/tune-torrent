"use client";

import { useState } from "react";
import { Search, Download } from "lucide-react";
import axios from "axios";

export default function SpotifyTrackInfo() {
  const [url, setUrl] = useState("");
  const [trackInfo, setTrackInfo] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setTrackInfo(null);

    try {
      const response = await axios.post("/api/track", {
        key: "free", // Your API key
        url: "https://open.spotify.com/track/2eAvDnpXP5W0cVtiI0PUxV?si=99a1f203f9f046cf", // Your track URL
      });

      console.log(response.data);
      setTrackInfo(response.data);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to fetch track info. Please check the URL and try again."
      );
    } finally {
      setLoading(false);
    }
  };
  const  handlerDownload = async()=> {
    try {

      const response = await axios.get('/api/download', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'yourfile.pdf'); // Specify the name for the downloaded file
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
    }
  }

  return (
    <div className="min-h-screen bg-spotify-black text-spotify-white p-8">
      <h1 className="text-3xl font-bold mb-6">Spotify Track Info</h1>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter Spotify track URL..."
          className="flex-grow bg-spotify-grey text-spotify-white placeholder-spotify-lightgrey focus:ring-spotify-green"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-spotify-green hover:bg-spotify-brightgreen text-spotify-black"
        >
          {loading ? "Searching..." : "Search"}
          {!loading && <Search className="ml-2" size={16} />}
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {trackInfo && (
        <div className="bg-spotify-darkgrey">
          <div className="p-6">
            <div className="flex items-center gap-6">
              <img
                src={trackInfo.img_url}
                alt={trackInfo.name}
                className="w-32 h-32 object-cover rounded-md"
              />
              <div>
                <h2 className="text-2xl font-bold">{trackInfo.name}</h2>
                <p className="text-spotify-lightgrey">{trackInfo.artist}</p>
                <p className="text-spotify-lightgrey">{trackInfo.album}</p>
                <button
                  onClick={handlerDownload}
                  className="mt-4 bg-spotify-green hover:bg-spotify-brightgreen text-spotify-black"
                >
                  Download
                  <Download className="ml-2" size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
