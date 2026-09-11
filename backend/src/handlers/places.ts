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
        image,
      } = req.body;

      if (
        !name ||
        !category ||
        typeof lat !== "number" ||
        typeof lng !== "number"
      ) {
        return res.status(400).json({
          error: "invalid_data",
          message:
            "Name, category, latitude and longitude are required",
        });
      }

      // Optional business/place photo.
      // The frontend sends a compressed image as a data URL.
      let placeImage: string | undefined;

      if (image !== undefined && image !== null && image !== "") {
        if (typeof image !== "string") {
          return res.status(400).json({
            error: "invalid_image",
            message: "Image must be a string",
          });
        }

        if (!image.startsWith("data:image/")) {
          return res.status(400).json({
            error: "invalid_image",
            message: "Invalid image format",
          });
        }

        // Prevent accidentally storing extremely large payloads.
        if (image.length > 2_500_000) {
          return res.status(413).json({
            error: "image_too_large",
            message: "Image is too large",
          });
        }

        placeImage = image;
      }

      const user = req.session.currentUser;

      const place = {
        name: String(name).trim(),
        category,
        lat,
        lng,
        description: description
          ? String(description).trim()
          : "Pi Economy place",
        username: user?.username || "anonymous",
        user_id: user?.uid || null,
        ...(placeImage ? { image: placeImage } : {}),
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

  // Delete a place
  router.delete("/places/:id", async (req, res) => {
    try {
      const placeCollection = req.app.locals.placeCollection;

      if (!placeCollection) {
        return res.status(503).json({
          error: "service_unavailable",
          message: "Database not ready",
        });
      }

      const { ObjectId } = await import("mongodb");

      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          error: "invalid_id",
          message: "Invalid place ID",
        });
      }

      const user = req.session.currentUser;

      if (!user) {
        return res.status(401).json({
          error: "unauthorized",
          message: "User needs to sign in first",
        });
      }

      const place = await placeCollection.findOne({
        _id: new ObjectId(req.params.id),
      });

      if (!place) {
        return res.status(404).json({
          error: "not_found",
          message: "Place not found",
        });
      }

      if (place.user_id !== user.uid) {
        return res.status(403).json({
          error: "forbidden",
          message: "You can only delete your own places",
        });
      }

      await placeCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });

      return res.status(200).json({
        message: "Place deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting place:", err);

      return res.status(500).json({
        error: "internal_error",
        message: "Failed to delete place",
      });
    }
  });
}
