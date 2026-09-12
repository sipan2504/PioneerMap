import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import Toast from "../components/Toast";
import "leaflet/dist/leaflet.css";
import Favorites from "../components/Favorites";
import PlaceDetails from "../components/PlaceDetails";
import PlaceList from "../components/PlaceList";
import AddPlaceForm from "../components/AddPlaceForm";
type Category =
  | "All"
  | "Stays"
  | "Shops"
  | "Food"
  | "Services"
  | "Jobs";

type Place = {
  _id?: string;
  name: string;
  category: Exclude<Category, "All">;
  lat: number;
  lng: number;
  description: string;
  username?: string;
  user_id?: string | null;
  language?: string;
  country?: string;
  image?: string;
};

type AppLanguage =
  | "Turkish"
  | "English"
  | "Arabic"
  | "Spanish"
  | "French"
