import orderSchema from "../../orders/schema/order.schema.js";
import featuresSchema from "../schema/features.schema.js";
import restaurantsSchema from "../schema/restaurants.schema.js";

export const getFeatured = async (req, res) => {
  try {
    // Get all featured collections with populated restaurant data
    const features = await featuresSchema
      .find()
      .populate({
        path: "restaurants",
        select:
          "name image description address stars reviews categories dishes latitude longitude",
        model: restaurantsSchema,
      })
      .lean(); // Convert to plain JavaScript objects

    if (!features || features.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No featured collections found",
      });
    }

    // Transform the data for better client-side consumption
    const transformedFeatures = features.map((feature) => ({
      _id: feature._id,
      title: feature.title,
      description: feature.description,
      restaurants: feature.restaurants.map((restaurant) => ({
        _id: restaurant._id,
        name: restaurant.name,
        image: restaurant.image,
        description: restaurant.description,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        address: restaurant.address,
        rating: {
          stars: restaurant.stars,
          reviews: restaurant.reviews,
        },
        category: restaurant.categories,
        dishes: restaurant.dishes,
      })),
    }));

    res.status(200).json({
      success: true,
      count: transformedFeatures.length,
      data: transformedFeatures,
    });
  } catch (error) {
    console.error("[Featured Controller Error]", error);

    // Handle specific error types
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid data format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while fetching featured collections",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Add a new restaurant
export const addRestaurant = async (req, res) => {
  try {
    const {
      name,
      description,
      latitude,
      longitude,
      address,
      stars,
      reviews,
      categories,
      featuredId,
    } = req.body;

    const image = req.file ? `/uploads/${req.file.filename}` : null;
    req.user;
    const restaurant = await restaurantsSchema.create({
      name,
      image:image || "",
      description,
      latitude,
      longitude,
      address,
      stars,
      reviews,
      categories,
      owner: req.user._id || "",
      dishes: [],
    });

    if (featuredId) {
      await featuresSchema.findByIdAndUpdate(
        featuredId,
        { $push: { restaurants: restaurant._id } },
        { new: true }
      );
    }

    res
      .status(201)
      .json({ success: true, message: "Restaurant added", restaurant });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Add dish to restaurant
export const addDish = async (req, res) => {
  try {
    const restaurantId = req.user._id;
    const { name, description, price } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const restaurant = await restaurantsSchema.findOneAndUpdate(
      { owner: restaurantId },
      {
        $push: {
          dishes: {
            name,
            description,
            price,
            image,
          },
        },
      },
      { new: true }
    );

    if (!restaurant) {
      return res
        .status(404)
        .json({ message: "Restaurant not found for this owner." });
    }

    res.status(200).json({ message: "Dish added", restaurant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Update dish
export const updateDish = async (req, res) => {
  try {
    const { dishId } = req.query;
    const restaurantId = req.user._id;
    const updates = req.body;
    const restaurant = await restaurantsSchema.findOne({ owner: restaurantId });
    const dish = restaurant.dishes.id(dishId);

    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }
    dish;
    Object.assign(dish, updates);
    await restaurant.save();

    res.status(200).json({ message: "Dish updated", dish });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete dish
export const deleteDish = async (req, res) => {
  try {
    const { dishId } = req.query;
    const restaurantId = req.user._id;

    const updatedRestaurant = await restaurantsSchema.findOneAndUpdate(
      { owner: restaurantId },
      {
        $pull: {
          dishes: { _id: dishId },
        },
      },
      { new: true }
    );

    res.status(200).json({ message: "Dish deleted", updatedRestaurant });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const my = async (req, res) => {
  try {
    const userId = req.user._id;
    const restaurant = await restaurantsSchema.findOne({ owner: userId });
    restaurant;
    res.status(200).json({ restaurant });
  } catch (error) {
    console.error("Error fetching restaurant profile:", error);
    res.status(500).json({ error: "Failed to fetch restaurant profile" });
  }
};
export const getRestaurantDishes = async (req, res) => {
  try {
    const restaurant = await restaurantsSchema.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    return res.json({
      dishes: restaurant.dishes.map((dish) => ({
        _id: dish._id,
        name: dish.name,
        description: dish.description,
        price: dish.price,
        image: dish.image || "https://via.placeholder.com/150",
      })),
    });
  } catch (error) {
    console.error("Error fetching dishes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all orders for the logged-in restaurant owner
export const getRestaurantOrders = async (req, res) => {
  try {
    const restaurant = await restaurantsSchema.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const orders = await orderSchema
      .find({ restaurantId: restaurant._id })
      .populate("userId", "name email") // fetch customer name
      .sort({ createdAt: -1 });

    return res.json({
      orders: orders.map((order) => ({
        _id: order._id,
        customerName: order.userId?.name || "N/A",
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        deliveryAddress: order.deliveryAddress,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.query;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["preparing", "on-the-way", "delivered"];
    if (!validStatuses.includes(status)) {
      status;
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updatedOrder = await orderSchema.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res
      .status(200)
      .json({ message: "Order status updated", order: updatedOrder });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
