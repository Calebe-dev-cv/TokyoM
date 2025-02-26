import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/reading.css";

function Reading() {
  const proxyUrl = `https://tokyo-m.vercel.app/api/proxy?url=`;

  const [chapterData, setChapterData] = useState([]);
  const [chapterHash, setChapterHash] = useState("");
  const [error, setError] = useState(null);
  const [feed, setFeed] = useState([]); // Adicione um estado para o feed
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0); // Inicialize o índice do capítulo

  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");

  const title = sessionStorage.getItem("chapterTitle");
  const chapterNumber = sessionStorage.getItem("currentNumber");

  const handleChange = (event) => {
    const selectedChapterId = event.target.value;
    const selectedChapter = feed.find((chapter) => chapter.id === selectedChapterId);
  
    if (selectedChapter) {
      sessionStorage.setItem("currentNumber", selectedChapter.attributes.chapter);
      navigate(`?id=${selectedChapterId}`);
      setCurrentChapterIndex(feed.findIndex((ch) => ch.id === selectedChapterId)); // Atualiza o índice do capítulo atual
    }
  };

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const resp = await axios({
          method: "GET",
          url: `${proxyUrl}${encodeURIComponent(
            `https://api.mangadex.org/at-home/server/${id}`
          )}`,
        });
        setChapterData(resp.data.chapter.data);
        setChapterHash(resp.data.chapter.hash);
        // Atualize o feed aqui, se necessário
        const fetchedFeed = JSON.parse(sessionStorage.getItem("feed"));
        setFeed(fetchedFeed);
        const currentIndex = fetchedFeed.findIndex((ch) => ch.id === id);
        setCurrentChapterIndex(currentIndex);
      } catch (error) {
        setError("Error fetching chapters.");
        console.error("Error fetching manga:", error);
      }
    };
    fetchChapters();
  }, [id]);

  if (error) {
    return <div>{error}</div>;
  }

  const goToNextChapter = () => {
    if (currentChapterIndex < feed.length - 1) {
      const nextChapter = feed[currentChapterIndex + 1];
      sessionStorage.setItem("currentNumber", nextChapter.attributes.chapter);
      navigate(`?id=${nextChapter.id}`);
      setCurrentChapterIndex(currentChapterIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPreviousChapter = () => {
    if (currentChapterIndex > 0) {
      const previousChapter = feed[currentChapterIndex - 1];
      sessionStorage.setItem("currentNumber", previousChapter.attributes.chapter);
      navigate(`?id=${previousChapter.id}`);
      setCurrentChapterIndex(currentChapterIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="reading-container">
      <h1>
        {title} Capítulo: {chapterNumber}
      </h1>
      <select value={id} onChange={handleChange} id="">
        {feed.map((chapter) => {
          const url = chapter.id;
          return (
            <option key={chapter.id} value={url}>
              {chapter.attributes.translatedLanguage} - Capítulo:
              {chapter.attributes.chapter}
            </option>
          );
        })}
      </select>
      
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {chapterData.map((url, index) => (
          <img
            className="img-page"
            src={`https://uploads.mangadex.org/data/${chapterHash}/${url}`}
            alt={`Page ${index + 1}`}
            loading="lazy"
          />
        ))}
      </div>
      <div style={{flexDirection: "row", marginTop: "10px"}}>
        <button onClick={goToPreviousChapter} disabled={currentChapterIndex === 0} style={{marginRight: "10px"}}>
          Anterior
        </button>
        <button onClick={goToNextChapter} disabled={currentChapterIndex === feed.length - 1}>
          Próximo
        </button>
      </div>
    </div>
  );
}

export default Reading;