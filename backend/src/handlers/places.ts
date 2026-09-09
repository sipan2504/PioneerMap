import { Router } from "express";

export default function mountPlaceEndpoints(router: Router) {
  // Get all places
  router.get("/places", async (req, res) => {
    try {
      const placeCollection = req.app.locals.placeCollection;

      if (!placeCollection) {
        return res.status(503).json({
          error: "service_unavailable",
          message: "Database not ready",
        });
      }

      const places = await placeCollection
        .find({})
        .sort({ created_at: -1 })
        .toArray();

      return res.status(200).json(places);
    } catch (err) {
      console.error("Error getting places:", err);

      return res.status(500).json({
        error: "internal_error",
        message: "Failed to get places",
      });
    }
  });

  // Add a new place
  router.post("/places", async (req, res) => {
    try {
      const placeCollection = req.app.locals.placeCollection;

      if (!placeCollection) {
        return res.status(503).json({
          error: "service_unavailable",
          message: "Database not ready",
        });
      }

      const {
        name,
        category,
        lat,
        lng,
        description,
      } = req.body;

      if (
        !name ||
        !category ||
        typeof lat !== "number" ||
        typeof lng !== "number"
      ) {
        return res.status(400).json({
          error: "invalid_data",
          message: "Name, category, latitude and longitude are required",
        });
      }

      const place = {
        name: String(name).trim(),
        category,
        lat,
        lng,
        description: description
          ? String(description).trim()
          : "Pi Economy place",
        created_at: new Date(),
      };

      const result =
        await placeCollection.insertOne(place);

      return res.status(201).json({
        ...place,
        _id: result.insertedId,
      });
    } catch (err) {
      console.error("Error adding place:", err);

      return res.status(500).json({
        error: "internal_error",
        message: "Failed to add place",
      });
    }
  });
}
