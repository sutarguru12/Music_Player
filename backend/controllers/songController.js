import axios from "axios";

// Get Songs from jamedo api
const getSongs = async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.jamendo.com/v3.0/tracks/?client_id=363c18ee&format=jsonpretty&limit=15`,
    );
    const data = response.data;
    res.status(200).json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get Songs By Playlist
const getPlaylistByTag = async (req, res) => {
  try {
    const tag = (req.params.tag || req.query.tag || "").toString().trim();
    if (!tag) {
      return res.status(400).json({ message: "Missing Tag Parameters" });
    }

    const limit = parseInt(req.query.limit ?? "10", 10) || 10;
    const clientId = "363c18ee";
    const params = {
      client_id: clientId,
      format: "jsonpretty",
      tags: tag,
      limit,
    };

    const response = await axios.get("https://api.jamendo.com/v3.0/tracks/", {
      params,
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Get Playlist Error",
      error?.response?.data ?? error.message ?? error,
    );

    return res.status(400).json({ message: "Failed To Fetch" });
  }
};

// Add or Remove Favourites
const toggeFavourite = async (req, res) => {
  try {
    const user = req.user;
    const song = req.body.song;

    const exists = user.favourites.find((fav) => fav.id === song.id);

    if (exists) {
      user.favourites = user.favourites.filter((fav) => fav.id !== song.id);
    } else {
      user.favourites.push(song);
    }

    await user.save();

    return res.status(200).json(user.favourites);
  } catch (error) {
    console.error(error.message);
    return res
      .status(400)
      .json({ message: "Favourites Not Added, Something Went Wrong" });
  }
};

export { getSongs, getPlaylistByTag, toggeFavourite };
