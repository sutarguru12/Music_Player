import React, { useEffect, useState } from "react";
import { useRef } from "react";

import useAudioPlayer from "../hooks/useAudioPlayer";
import Footer from "../components/layout/Footer";
import SideMenu from "../components/layout/SideMenu";
import MainArea from "../components/layout/MainArea";

import "../css/pages/HomePage.css";
import { useSelector } from "react-redux";
import axios from "axios";
import Modal from "../components/common/Modal";
import EditProfile from "../components/auth/EditProfile";

const Homepage = () => {
  const [view, setView] = useState("home");
  const [songs, setSongs] = useState([]);
  const [searchSongs, setSearchSongs] = useState([]);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const auth = useSelector((state) => state.auth);

  // const audioRef = useRef();

  const songsToDisplay = view === "search" ? searchSongs : songs;

  const {
    audioRef,
    currentIndex,
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isMuted,
    loopEnabled,
    shuffleEnabled,
    playbackSpeed,
    volume,
    playSongAtIndex,
    handleTogglePlay,
    handleNext,
    handlePrevious,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleEnded,
    handletoggleMute,
    handleToggleLoop,
    handleToggleShuffle,
    handleChangeSpeed,
    handleSeek,
    handleChangeVolume,
  } = useAudioPlayer(songsToDisplay);

  const playerState = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isMuted,
    loopEnabled,
    shuffleEnabled,
    playbackSpeed,
    volume,
  };

  const playerControl = {
    playSongAtIndex,
    handleTogglePlay,
    handleNext,
    handlePrevious,
    handleSeek,
  };

  const playerFeatures = {
    onToggleMute: handletoggleMute,
    onToggleLoop: handleToggleLoop,
    onToggleShuffle: handleToggleShuffle,
    onChangeSpeed: handleChangeSpeed,
    onChangeVolume: handleChangeVolume,
  };

  useEffect(() => {
    const fetchInitialSongs = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/songs`,
        );
        setSongs(res.data.results || []);
      } catch (error) {
        console.error("error while fetching the data", error);
        setSongs([]);
      }
    };
    fetchInitialSongs();
  }, []);

  const loadPlaylist = async (tag) => {
    if (!tag) {
      console.warn("No tag is provided");
      return;
    }
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/songs/playlistByTag/${tag}`,
      );
      console.log("Playlist response", res.data);
      setSongs(res.data.results || []);
    } catch (error) {
      console.error("Failed to load playlist ", error);
      setSongs([]);
    }
  };

  // When user clicks on a song at table
  const handleSelectSong = (index) => {
    playSongAtIndex(index);
  };

  const handlePlayFavourite = (song) => {
    const favourites = auth.user?.favourites || [];
    if (!favourites.length) return;

    const index = auth.user.favourites.findIndex((fav) => fav.id === song.id);
    setSongs(auth.user.favourites);
    setView("home");

    setTimeout(() => {
      if (index !== -1) {
        playSongAtIndex(index);
      }
    }, 0);
  };

  return (
    <div className="homepage-root">
      <audio
        ref={audioRef}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="homepage-main-wrapper">
        {/* Sidebar */}
        <div className="homepage-sidebar">
          <SideMenu
            setView={setView}
            view={view}
            onOpenEditProfile={() => setOpenEditProfile(true)}
          />
        </div>
        {/* Main Content */}
        <div className="homepage-content">
          <MainArea
            view={view}
            currentIndex={currentIndex}
            onselectSong={handleSelectSong}
            onSelectFavourite={handlePlayFavourite}
            onSelectTag={loadPlaylist}
            songsToDisplay={songsToDisplay}
            setSearchSongs={setSearchSongs}
          />
        </div>
      </div>
      {/* Footer Player */}
      <Footer
        playerState={playerState}
        playerControl={playerControl}
        playerFeatures={playerFeatures}
      />

      {openEditProfile && (
        <Modal onClose={() => setOpenEditProfile(false)}>
          <EditProfile onClose={() => setOpenEditProfile(false)} />
        </Modal>
      )}
    </div>
  );
};

export default Homepage;
