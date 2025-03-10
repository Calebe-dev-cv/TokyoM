import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "../../styles/info.css";
import ReadMore from "../readmore/Readmore";
function Info() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");

  const [feed, setfeed] = useState([]);
  const [error, setError] = useState(null);

  const coverUrl = sessionStorage.getItem("coverUrl");
  const mangaDes = sessionStorage.getItem("mangaDescription");
  const mangaTitle = sessionStorage.getItem("mangaTitle");
  const mangaAuthor = sessionStorage.getItem("mangaAuthor");
  const apiUrl = `https://api.mangadex.org/manga/${id}/feed`;
  const proxyUrl = `https://tokyo-m.vercel.app/api/proxy?url=${encodeURIComponent(
    apiUrl
  )}`;
  function sendInfo(index) {
    sessionStorage.setItem("currentNumber", feed[index].attributes.chapter);
    sessionStorage.setItem("chapterTitle", mangaTitle);
    sessionStorage.setItem("feed", JSON.stringify(feed));
  }

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        let allChapters = [];
        let offset = 0;
        const limit = 100; // Pega mais capítulos por requisição
        let hasMore = true;
    
        while (hasMore) {
          const resp = await axios.get(
            `https://api.mangadex.org/manga/${id}/feed?limit=${limit}&offset=${offset}&translatedLanguage[]=pt-br`
          );
    
          allChapters = [...allChapters, ...resp.data.data];
          
          if (resp.data.total && allChapters.length >= resp.data.total) {
            hasMore = false;
          } else {
            offset += limit;
          }
        }
    
        const sortedFeed = allChapters.sort((a, b) => {
          return parseFloat(a.attributes.chapter) - parseFloat(b.attributes.chapter);
        });
    
        setfeed(sortedFeed);
      } catch (error) {
        console.error("Error fetching chapters:", error);
      }
    };
    
    fetchChapters();
  }, [id]);

  if (error) {
    return <div>{error}</div>;
  }
  return (
    <div className="info-container">
      <div
        className="info-wrapper"
        style={{
          backgroundImage: `url(${coverUrl})`,
          backgroundSize: "cover",
        }}
      >
        <img src={coverUrl} alt="" />
        <div className="manga-info">
          <h1>{mangaTitle}</h1>
          <p>{mangaAuthor}</p>
          <ReadMore text={mangaDes} maxHeight={195} />
        </div>
      </div>
      <div className="chapters-wrapper">
        <h1>Capítulos - {mangaTitle} </h1>
        <ul>
          {feed.map((chapter, index) => (
            <li key={chapter.id} onClick={() => sendInfo(index)}>
              <a href={`/reading?id=${chapter.id}`}>
                {chapter.attributes.translatedLanguage} - Capítulo:
                {chapter.attributes.chapter}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Info;
